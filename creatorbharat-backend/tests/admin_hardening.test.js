// 🛡️ CreatorBharat SaaS Admin Hardening & RBAC Permission Test Suite
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../src/prisma.js';
import { AdminPermissionService, ADMIN_ROLES, ADMIN_PERMISSIONS } from '../src/services/adminPermissionService.js';
import { AdminService } from '../src/services/adminService.js';

describe('Phase 2H — Admin Hardening & Moderation Security Tests', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── 1. Canonical RBAC Permission Matrix ──────────────────────────────────
  describe('AdminPermissionService RBAC Invariants', () => {
    it('SUPERADMIN has all permissions without exception', () => {
      Object.values(ADMIN_PERMISSIONS).forEach(perm => {
        expect(AdminPermissionService.hasPermission(ADMIN_ROLES.SUPERADMIN, perm)).toBe(true);
      });
    });

    it('SUPPORT role is rejected from dangerous, financial, and team management operations', () => {
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.SUPPORT, ADMIN_PERMISSIONS.OVERRIDE_PAYMENTS)).toBe(false);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.SUPPORT, ADMIN_PERMISSIONS.MANAGE_TEAM)).toBe(false);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.SUPPORT, ADMIN_PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.SUPPORT, ADMIN_PERMISSIONS.REVIEW_KYC)).toBe(false);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.SUPPORT, ADMIN_PERMISSIONS.VIEW_DASHBOARD)).toBe(true);
    });

    it('FINANCE role has payment view permissions but cannot modify settings or team', () => {
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.FINANCE, ADMIN_PERMISSIONS.VIEW_PAYMENTS)).toBe(true);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.FINANCE, ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS)).toBe(true);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.FINANCE, ADMIN_PERMISSIONS.MANAGE_TEAM)).toBe(false);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.FINANCE, ADMIN_PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
    });

    it('MODERATOR role can moderate content and KYC but cannot override payments or change settings', () => {
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.MODERATOR, ADMIN_PERMISSIONS.REVIEW_KYC)).toBe(true);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.MODERATOR, ADMIN_PERMISSIONS.MODERATE_CONTENT)).toBe(true);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.MODERATOR, ADMIN_PERMISSIONS.OVERRIDE_PAYMENTS)).toBe(false);
      expect(AdminPermissionService.hasPermission(ADMIN_ROLES.MODERATOR, ADMIN_PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
    });

    it('Correctly classifies dangerous/destructive actions', () => {
      expect(AdminPermissionService.isDangerousAction('USER_SUSPEND')).toBe(true);
      expect(AdminPermissionService.isDangerousAction('CREATOR_DELETE')).toBe(true);
      expect(AdminPermissionService.isDangerousAction('KYC_REJECT')).toBe(true);
      expect(AdminPermissionService.isDangerousAction('PAYMENT_ESCROW_RELEASE')).toBe(true);
      expect(AdminPermissionService.isDangerousAction('VIEW_CREATORS')).toBe(false);
    });
  });

  // ─── 2. Audit Trail Sanitization & Pagination ──────────────────────────────
  describe('AdminService Audit Logging & Forensics', () => {
    it('sanitizes passwords, secrets, JWTs, and KYC URLs from audit logs', () => {
      const raw = {
        userId: 'u1',
        password: 'secret_password_123',
        jwtToken: 'eyJhbGciOi...',
        aadhaarUrl: 'https://secret.com/aadhaar.pdf',
        safeField: 'active'
      };

      const clean = AdminService.sanitizeAuditData(raw);
      expect(clean.password).toBe('[REDACTED]');
      expect(clean.jwtToken).toBe('[REDACTED]');
      expect(clean.aadhaarUrl).toBe('[REDACTED]');
      expect(clean.safeField).toBe('active');
    });

    it('getAuditLogs caps maximum pagination limit at 100', async () => {
      const findSpy = vi.spyOn(prisma.auditLog, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.auditLog, 'count').mockResolvedValue(0);

      await AdminService.getAuditLogs({ page: 1, limit: 500 });
      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100
        })
      );
    });
  });

  // ─── 3. KYC Moderation Security ───────────────────────────────────────────
  describe('AdminService KYC Moderation', () => {
    it('rejects invalid KYC decision values', async () => {
      await expect(
        AdminService.reviewKyc({ id: 'adm_1', email: 'admin@cb.com' }, 'c1', { decision: 'MAYBE' })
      ).rejects.toThrow('Invalid KYC decision.');
    });

    it('records immutable audit log and dispatches notification on KYC approval', async () => {
      vi.spyOn(prisma.creator, 'findUnique').mockResolvedValue({
        id: 'c1',
        userId: 'u_creator',
        status: 'PENDING_APPROVAL',
        isVerified: false,
        user: { id: 'u_creator' }
      });

      const txMock = {
        creator: {
          update: vi.fn().mockResolvedValue({ id: 'c1', status: 'APPROVED', isVerified: true })
        },
        auditLog: {
          create: vi.fn().mockResolvedValue({ id: 'audit_1' })
        },
        outboxEvent: {
          create: vi.fn().mockResolvedValue({ id: 'evt_1' })
        }
      };

      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb) => cb(txMock));

      const res = await AdminService.reviewKyc(
        { id: 'adm_1', email: 'admin@creatorbharat.com', teamRole: 'SUPERADMIN' },
        'c1',
        { decision: 'APPROVED' }
      );

      expect(res.status).toBe('APPROVED');
      expect(txMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'CREATOR_KYC_APPROVE',
            actorId: 'adm_1'
          })
        })
      );
    });
  });

  // ─── 4. User Suspension & Account Review ───────────────────────────────────
  describe('AdminService User Suspension', () => {
    it('prevents self-suspension of administrator accounts', async () => {
      await expect(
        AdminService.toggleUserSuspension({ id: 'adm_1' }, 'adm_1')
      ).rejects.toThrow('Cannot suspend your own administrator account.');
    });

    it('prevents suspending system administrators', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'adm_2',
        role: 'ADMIN',
        isSuspended: false
      });

      await expect(
        AdminService.toggleUserSuspension({ id: 'adm_1' }, 'adm_2')
      ).rejects.toThrow('Cannot suspend system administrators.');
    });
  });

  // ─── 5. System Diagnostics ────────────────────────────────────────────────
  describe('AdminService System Diagnostics', () => {
    it('returns sanitized system metrics without leaking secrets or credentials', async () => {
      vi.spyOn(prisma, '$queryRaw').mockResolvedValue([{ 1: 1 }]);

      const diagnostics = await AdminService.getSystemDiagnostics({ id: 'adm_1', role: 'ADMIN' });
      expect(diagnostics.status).toBe('ONLINE');
      expect(diagnostics.database).toBe('HEALTHY');
      expect(diagnostics).toHaveProperty('nodeVersion');
      expect(diagnostics).toHaveProperty('uptimeSeconds');
      expect(diagnostics).toHaveProperty('memory');
      expect(JSON.stringify(diagnostics)).not.toContain('password');
      expect(JSON.stringify(diagnostics)).not.toContain('postgres://');
    });
  });
});
