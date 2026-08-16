// 🇮🇳 CreatorBharat SaaS AI Controller
import { AIService } from '../services/aiService.js';

export class AIController {
  static async chat(req, res) {
    try {
      const { message, history = [] } = req.body;
      const result = await AIService.handleChat({ message, history });
      return res.json(result);
    } catch (err) {
      console.error('[POST /api/ai/chat] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'AI chat request failed.';
      return res.status(status).json({ error: message });
    }
  }

  static async generateBrief(req, res) {
    try {
      const { brandName, productName, niche, targetAudience, goal } = req.body;
      const result = await AIService.generateBrief({
        brandName,
        productName,
        niche,
        targetAudience,
        goal
      });
      return res.json(result);
    } catch (err) {
      console.error('[POST /api/ai/brief-assistant] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to generate campaign brief.';
      return res.status(status).json({ error: message });
    }
  }

  static async generatePitch(req, res) {
    try {
      const { creatorName, creatorNiches, brandName, campaignTitle, campaignBrief, dialect } = req.body;
      const result = await AIService.generatePitch({
        creatorName,
        creatorNiches,
        brandName,
        campaignTitle,
        campaignBrief,
        dialect
      });
      return res.json(result);
    } catch (err) {
      console.error('[POST /api/ai/pitch-assistant] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to generate pitch proposal.';
      return res.status(status).json({ error: message });
    }
  }
}
