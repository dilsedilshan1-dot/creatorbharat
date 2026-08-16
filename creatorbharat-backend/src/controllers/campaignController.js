// 🇮🇳 CreatorBharat SaaS Campaign Controller
import { CampaignService } from '../services/campaignService.js';

export class CampaignController {
  static async createCampaign(req, res) {
    try {
      const { title, description, budget, niche, platform } = req.body;
      const campaign = await CampaignService.createCampaign(req.user, {
        title,
        description,
        budget,
        niche,
        platform
      });
      return res.status(201).json(campaign);
    } catch (err) {
      console.error('[POST /api/campaigns/create] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to create campaign deal.';
      return res.status(status).json({ error: message });
    }
  }

  static async getMyCampaigns(req, res) {
    try {
      const campaigns = await CampaignService.getMyCampaigns(req.user);
      return res.json(campaigns);
    } catch (err) {
      console.error('[GET /api/campaigns/me] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to retrieve campaigns.';
      return res.status(status).json({ error: message });
    }
  }

  static async getPublicCampaigns(req, res) {
    try {
      const { platform, niche } = req.query;
      const campaigns = await CampaignService.getPublicCampaigns({ platform, niche });
      return res.json(campaigns);
    } catch (err) {
      console.error('[GET /api/campaigns] Error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve campaigns.' });
    }
  }

  static async applyToCampaign(req, res) {
    try {
      const { id } = req.params;
      const { pitch } = req.body;
      const application = await CampaignService.applyToCampaign(req.user, id, { pitch });
      return res.status(201).json(application);
    } catch (err) {
      console.error('[POST /api/campaigns/:id/apply] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to submit application pitch.';
      return res.status(status).json({ error: message });
    }
  }
}
