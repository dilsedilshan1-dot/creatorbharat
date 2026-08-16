// 🇮🇳 CreatorBharat SaaS Creator Controller
import { CreatorService } from '../services/creatorService.js';
import { extractAuthUser } from '../middleware/auth.js';

export class CreatorController {
  static async getCreators(req, res) {
    try {
      const { q, state, niche, platform, verified, minFollowers, sort, page = 1, limit = 20 } = req.query;
      const result = await CreatorService.getCreators({
        q,
        state,
        niche,
        platform,
        verified,
        minFollowers,
        sort,
        page,
        limit
      });
      return res.json(result);
    } catch (err) {
      console.error('[GET /api/creators] Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch creators.' });
    }
  }

  static async getActivationStatus(req, res) {
    try {
      const status = await CreatorService.getActivationStatus(req.user);
      return res.json(status);
    } catch (err) {
      console.error('[GET /api/creators/activation/status] Error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve activation status.' });
    }
  }

  static async getCreatorByIdOrHandle(req, res) {
    try {
      const { idOrHandle } = req.params;
      const authUser = extractAuthUser(req);
      const creator = await CreatorService.getCreatorByIdOrHandle(idOrHandle, authUser);
      return res.json(creator);
    } catch (err) {
      console.error('[GET /api/creators/:idOrHandle] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to fetch creator profile.';
      return res.status(status).json({ error: message });
    }
  }

  static async updateMyProfile(req, res) {
    try {
      const updated = await CreatorService.updateMyProfile(req.user, req.body);
      return res.json(updated);
    } catch (err) {
      console.error('[PUT /api/creators/me] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to update profile details.';
      return res.status(status).json({ error: message });
    }
  }
}
