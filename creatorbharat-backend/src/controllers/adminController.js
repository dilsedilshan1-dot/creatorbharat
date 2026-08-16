// 🛡️ CreatorBharat SaaS Admin Controller
import { AdminService } from '../services/adminService.js';

export class AdminController {
  /**
   * GET /api/admin/audit-logs — Retrieves paginated audit trail logs
   */
  static async getAuditLogs(req, res) {
    try {
      const { page, limit, category, action, actorId, targetId, status } = req.query;
      const result = await AdminService.getAuditLogs({
        page,
        limit,
        category,
        action,
        actorId,
        targetId,
        status
      });
      return res.json(result);
    } catch (err) {
      console.error('[AdminController.getAuditLogs] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to retrieve audit logs.';
      return res.status(status).json({ error: message });
    }
  }

  /**
   * POST /api/admin/kyc/review/:creatorId — Moderates creator KYC
   */
  static async reviewKyc(req, res) {
    try {
      const { creatorId } = req.params;
      const { decision, reason } = req.body;
      const updated = await AdminService.reviewKyc(req.user, creatorId, { decision, reason });
      return res.json({ success: true, creator: updated });
    } catch (err) {
      console.error('[AdminController.reviewKyc] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to review KYC submission.';
      return res.status(status).json({ error: message });
    }
  }

  /**
   * POST /api/admin/users/suspend/:userId — Toggles user suspension
   */
  static async toggleUserSuspension(req, res) {
    try {
      const { userId } = req.params;
      const result = await AdminService.toggleUserSuspension(req.user, userId);
      return res.json(result);
    } catch (err) {
      console.error('[AdminController.toggleUserSuspension] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to update user suspension status.';
      return res.status(status).json({ error: message });
    }
  }

  /**
   * GET /api/admin/system/diagnostics — Returns sanitized operational diagnostics
   */
  static async getSystemDiagnostics(req, res) {
    try {
      const diagnostics = await AdminService.getSystemDiagnostics(req.user);
      return res.json(diagnostics);
    } catch (err) {
      console.error('[AdminController.getSystemDiagnostics] Error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve system diagnostics.' });
    }
  }
}
