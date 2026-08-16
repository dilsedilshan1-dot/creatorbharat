// 🛡️ CreatorBharat SaaS Admin Service
import prisma from '../prisma.js';
import { OutboxService } from './outboxService.js';
import { OutboxMonitor } from '../observability/outboxMonitor.js';
import { StorageMonitor } from '../observability/storageMonitor.js';
import { FinancialMonitor } from '../observability/financialMonitor.js';
import { metrics } from '../observability/metrics.js';

export class AdminService {
  /**
   * Sanitizes audit log metadata and values.
   */
  static sanitizeAuditData(data) {
    if (!data || typeof data !== 'object') return data;
    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    const SENSITIVE = ['password', 'token', 'jwt', 'secret', 'key', 'aadhaarurl', 'panurl', 'cookie', 'authorization'];

    for (const key of Object.keys(sanitized)) {
      if (SENSITIVE.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeAuditData(sanitized[key]);
      }
    }
    return sanitized;
  }

  /**
   * Records an immutable audit log entry.
   */
  static async recordAuditLog({
    actorId = null,
    actorEmail = null,
    actorRole = null,
    action,
    category = 'ADMIN',
    targetType = null,
    targetId = null,
    previousValue = null,
    newValue = null,
    ipAddress = null,
    userAgent = null,
    status = 'SUCCESS',
    metadata = {}
  }, client = null) {
    const db = client || prisma;
    try {
      return await db.auditLog.create({
        data: {
          actorId,
          actorEmail,
          actorRole,
          action,
          category,
          targetType,
          targetId,
          previousValue: previousValue ? this.sanitizeAuditData(previousValue) : null,
          newValue: newValue ? this.sanitizeAuditData(newValue) : null,
          ipAddress,
          userAgent,
          status,
          metadata: metadata ? this.sanitizeAuditData(metadata) : {}
        }
      });
    } catch (err) {
      console.error('[AdminService.recordAuditLog] Warning: Failed to record audit log:', err.message);
      return null;
    }
  }

  /**
   * Retrieves paginated, filterable audit logs (read-only).
   */
  static async getAuditLogs({ page = 1, limit = 50, category, action, actorId, targetId, status }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (category) where.category = category;
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;
    if (targetId) where.targetId = targetId;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Reviews and moderates creator KYC submission.
   */
  static async reviewKyc(adminUser, creatorId, { decision, reason = '' }) {
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      const error = new Error('Invalid KYC decision. Must be APPROVED or REJECTED.');
      error.statusCode = 400;
      throw error;
    }

    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: { user: true }
    });

    if (!creator) {
      const error = new Error('Creator profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const isApproved = decision === 'APPROVED';
    const newStatus = isApproved ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.$transaction(async (tx) => {
      const updatedCreator = await tx.creator.update({
        where: { id: creatorId },
        data: {
          status: newStatus,
          isVerified: isApproved,
          updatedAt: new Date()
        }
      });

      await this.recordAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        actorRole: adminUser.teamRole || 'ADMIN',
        action: isApproved ? 'CREATOR_KYC_APPROVE' : 'CREATOR_KYC_REJECT',
        category: 'USER_MANAGEMENT',
        targetType: 'CREATOR',
        targetId: creatorId,
        previousValue: { status: creator.status, isVerified: creator.isVerified },
        newValue: { status: newStatus, isVerified: isApproved },
        metadata: { reason }
      }, tx);

      await OutboxService.publish(tx, {
        eventType: 'USER_NOTIFICATION_REQUESTED',
        aggregateType: 'Creator',
        aggregateId: creatorId,
        payload: {
          userId: creator.userId,
          title: isApproved ? '✅ KYC Verified!' : '⚠️ KYC Verification Update',
          body: isApproved
            ? 'Congratulations! Your creator profile KYC has been approved and verified.'
            : `Your KYC submission was not approved. Reason: ${reason || 'Incomplete details'}`,
          type: 'SYSTEM',
          link: '/creator/profile'
        }
      });

      return updatedCreator;
    });

    return updated;
  }

  /**
   * Toggles account suspension status safely.
   */
  static async toggleUserSuspension(adminUser, targetUserId) {
    if (adminUser.id === targetUserId) {
      const error = new Error('Cannot suspend your own administrator account.');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'ADMIN') {
      const error = new Error('Cannot suspend system administrators.');
      error.statusCode = 400;
      throw error;
    }

    const nextState = !user.isSuspended;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: { isSuspended: nextState }
      });

      await this.recordAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        actorRole: adminUser.teamRole || 'ADMIN',
        action: nextState ? 'USER_SUSPEND' : 'USER_UNSUSPEND',
        category: 'USER_MANAGEMENT',
        targetType: 'USER',
        targetId: targetUserId,
        previousValue: { isSuspended: user.isSuspended },
        newValue: { isSuspended: nextState }
      }, tx);

      return updatedUser;
    });

    return {
      message: `User account successfully ${nextState ? 'suspended' : 'unsuspended'}.`,
      user: updated
    };
  }

  /**
   * Retrieves safe system operational diagnostics.
   */
  static async getSystemDiagnostics(adminUser) {
    let dbStatus = 'HEALTHY';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'DISCONNECTED';
    }

    const memory = process.memoryUsage();
    const [outboxDiag, storageDiag, financialDiag] = await Promise.all([
      OutboxMonitor.getOutboxDiagnostics().catch(() => ({ status: 'UNKNOWN' })),
      StorageMonitor.getStorageDiagnostics().catch(() => ({ status: 'UNKNOWN' })),
      FinancialMonitor.getFinancialDiagnostics().catch(() => ({ status: 'UNKNOWN' }))
    ]);

    return {
      status: dbStatus === 'HEALTHY' ? 'ONLINE' : 'DEGRADED',
      database: dbStatus,
      outbox: outboxDiag,
      storage: storageDiag,
      financial: financialDiag,
      metrics: metrics.getMetricsSummary(),
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
      },
      timestamp: new Date().toISOString()
    };
  }
}
