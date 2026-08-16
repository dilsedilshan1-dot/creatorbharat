// 🔔 CreatorBharat SaaS Notification Controller
import { NotificationService } from '../services/notificationService.js';

export class NotificationController {
  static async getNotifications(req, res) {
    try {
      const data = await NotificationService.getNotifications(req.user);
      return res.json(data);
    } catch (err) {
      console.error('[GET /api/notifications] Error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve notifications.' });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const result = await NotificationService.markAsRead(req.user, id);
      return res.json(result);
    } catch (err) {
      console.error('[PUT /api/notifications/:id/read] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to mark notification.';
      return res.status(status).json({ error: message });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const result = await NotificationService.markAllAsRead(req.user);
      return res.json(result);
    } catch (err) {
      console.error('[PUT /api/notifications/read-all] Error:', err.message);
      return res.status(500).json({ error: 'Failed to mark all notifications.' });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const result = await NotificationService.deleteNotification(req.user, id);
      return res.json(result);
    } catch (err) {
      console.error('[DELETE /api/notifications/:id] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to delete notification.';
      return res.status(status).json({ error: message });
    }
  }

  static async clearAllNotifications(req, res) {
    try {
      const result = await NotificationService.clearAllNotifications(req.user);
      return res.json(result);
    } catch (err) {
      console.error('[DELETE /api/notifications] Error:', err.message);
      return res.status(500).json({ error: 'Failed to clear notifications.' });
    }
  }
}
