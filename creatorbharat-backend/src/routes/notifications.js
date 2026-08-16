// 🔔 CreatorBharat SaaS — Notifications Router
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { NotificationController } from '../controllers/notificationController.js';
import { NotificationService } from '../services/notificationService.js';

const router = express.Router();

// GET /api/notifications — get logged-in user's notifications
router.get('/', authMiddleware, NotificationController.getNotifications);

// PUT /api/notifications/:id/read — mark single notification as read
router.put('/:id/read', authMiddleware, NotificationController.markAsRead);

// PUT /api/notifications/read-all — mark all notifications as read
router.put('/read-all', authMiddleware, NotificationController.markAllAsRead);

// DELETE /api/notifications/:id — delete a notification
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);

// DELETE /api/notifications — clear all notifications
router.delete('/', authMiddleware, NotificationController.clearAllNotifications);

export default router;

// Export createNotification helper for backward compatibility
export const createNotification = NotificationService.createNotification;
