// 🇮🇳 CreatorBharat SaaS Application Controller
import { ApplicationService } from '../services/applicationService.js';

export class ApplicationController {
  static async apply(req, res) {
    try {
      const { campaignId, message, proposedRate } = req.body;
      const application = await ApplicationService.apply(req.user, {
        campaignId,
        message,
        proposedRate
      });
      return res.status(201).json(application);
    } catch (err) {
      console.error('[POST /api/applications] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to submit application.';
      return res.status(status).json({ error: message });
    }
  }

  static async getMyApplications(req, res) {
    try {
      const applications = await ApplicationService.getMyApplications(req.user);
      return res.json(applications);
    } catch (err) {
      console.error('[GET /api/applications/me] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to fetch user applications.';
      return res.status(status).json({ error: message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await ApplicationService.updateStatus(req.user, id, status);
      return res.json(updated);
    } catch (err) {
      console.error('[PUT /api/applications/:id] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to update application status.';
      return res.status(status).json({ error: message });
    }
  }
}
