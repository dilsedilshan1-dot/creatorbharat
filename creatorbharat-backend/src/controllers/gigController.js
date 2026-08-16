// 🇮🇳 CreatorBharat SaaS Gig Controller
import { GigService } from '../services/gigService.js';

export class GigController {
  static async getMyGigs(req, res) {
    try {
      const gigs = await GigService.getMyGigs(req.user);
      return res.json(gigs);
    } catch (err) {
      console.error('[GET /api/gigs/me] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to fetch gigs.';
      return res.status(status).json({ error: message });
    }
  }

  static async submitMilestoneProof(req, res) {
    try {
      const { id, mId } = req.params;
      const { proofText, proofUrl } = req.body;

      const result = await GigService.submitMilestoneProof(req.user, id, mId, { proofText, proofUrl });
      return res.json(result);
    } catch (err) {
      console.error('[POST /api/gigs/:id/milestones/:mId/submit] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to submit milestone proof.';
      return res.status(status).json({ error: message });
    }
  }

  static async approveMilestone(req, res) {
    try {
      const { id, mId } = req.params;

      const result = await GigService.approveMilestone(req.user, id, mId);
      return res.json(result);
    } catch (err) {
      console.error('[POST /api/gigs/:id/milestones/:mId/approve] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to approve milestone.';
      return res.status(status).json({ error: message });
    }
  }
}
