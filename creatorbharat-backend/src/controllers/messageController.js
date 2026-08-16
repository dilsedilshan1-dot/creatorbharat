// 🇮🇳 CreatorBharat SaaS Message Controller
import { MessageService } from '../services/messageService.js';

export class MessageController {
  static async getConversations(req, res) {
    try {
      const conversations = await MessageService.getConversations(req.user);
      return res.json(conversations);
    } catch (err) {
      console.error('[GET /api/messages/conversations] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to retrieve conversations.';
      return res.status(status).json({ error: message });
    }
  }

  static async getHistory(req, res) {
    try {
      const { otherId } = req.params;
      const history = await MessageService.getHistory(req.user, otherId);
      return res.json(history);
    } catch (err) {
      console.error('[GET /api/messages/history] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to retrieve message logs.';
      return res.status(status).json({ error: message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { otherId } = req.params;
      const result = await MessageService.markAsRead(req.user, otherId);
      return res.json(result);
    } catch (err) {
      console.error('[POST /api/messages/read] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to mark messages as read.';
      return res.status(status).json({ error: message });
    }
  }
}
