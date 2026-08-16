// 🔔 CreatorBharat SaaS Notification Service
import prisma from '../prisma.js';

export class NotificationService {
  /**
   * Retrieves notifications for the authenticated user.
   */
  static async getNotifications(user) {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
  }

  /**
   * Marks a single notification as read.
   */
  static async markAsRead(user, id) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      const error = new Error('Notification not found.');
      error.statusCode = 404;
      throw error;
    }
    if (notification.userId !== user.id) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return { message: 'Notification marked as read.' };
  }

  /**
   * Marks all notifications for a user as read.
   */
  static async markAllAsRead(user) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    });
    return { message: 'All notifications marked as read.' };
  }

  /**
   * Deletes a single notification.
   */
  static async deleteNotification(user, id) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      const error = new Error('Notification not found.');
      error.statusCode = 404;
      throw error;
    }
    if (notification.userId !== user.id) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }

    await prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted.' };
  }

  /**
   * Clears all notifications for a user.
   */
  static async clearAllNotifications(user) {
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    return { message: 'All notifications cleared.' };
  }

  /**
   * Creates an in-app notification for a user.
   */
  static async createNotification({ userId, title, body, type = 'INFO', link = null }) {
    try {
      return await prisma.notification.create({
        data: { userId, title, body, type, link }
      });
    } catch (err) {
      console.error('[NotificationService.createNotification] Error:', err.message);
      return null;
    }
  }
}

// Export named helper for backward compatibility
export const createNotification = NotificationService.createNotification;
