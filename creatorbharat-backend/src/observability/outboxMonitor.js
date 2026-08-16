// 📬 CreatorBharat SaaS Outbox & Worker Health Monitor
import prisma from '../prisma.js';

export class OutboxMonitor {
  /**
   * Retrieves sanitized outbox health, backlog, and worker diagnostic metrics.
   *
   * @param {Object} [options]
   * @param {number} [options.staleTimeoutMs=300000]
   * @param {number} [options.backlogWarningThreshold=50]
   */
  static async getOutboxDiagnostics(options = {}) {
    const staleTimeoutMs = options.staleTimeoutMs || 300000; // 5 minutes
    const backlogWarningThreshold = options.backlogWarningThreshold || 50;

    try {
      const statusCounts = await prisma.outboxEvent.groupBy({
        by: ['status'],
        _count: { status: true }
      });

      const counts = {
        PENDING: 0,
        PROCESSING: 0,
        PROCESSED: 0,
        FAILED: 0
      };

      statusCounts.forEach(c => {
        if (counts[c.status] !== undefined) {
          counts[c.status] = c._count.status;
        }
      });

      // Check for stale events stuck in PROCESSING
      const staleThreshold = new Date(Date.now() - staleTimeoutMs);
      const staleCount = await prisma.outboxEvent.count({
        where: {
          status: 'PROCESSING',
          updatedAt: { lte: staleThreshold }
        }
      });

      // Find oldest pending event timestamp
      const oldestPending = await prisma.outboxEvent.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      });

      const oldestPendingAgeMs = oldestPending
        ? Date.now() - new Date(oldestPending.createdAt).getTime()
        : 0;

      const isBacklogHigh = counts.PENDING > backlogWarningThreshold;
      const isDegraded = staleCount > 0 || counts.FAILED > 10 || isBacklogHigh;

      return {
        status: isDegraded ? 'DEGRADED' : 'HEALTHY',
        counts,
        staleProcessingCount: staleCount,
        oldestPendingAgeSeconds: Math.floor(oldestPendingAgeMs / 1000),
        alerts: {
          backlogWarning: isBacklogHigh,
          staleEventsDetected: staleCount > 0,
          elevatedFailures: counts.FAILED > 10
        },
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        status: 'UNKNOWN',
        error: 'Failed to retrieve outbox telemetry',
        timestamp: new Date().toISOString()
      };
    }
  }
}
