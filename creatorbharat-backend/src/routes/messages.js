// 🇮🇳 CreatorBharat SaaS Messages Router
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { MessageController } from '../controllers/messageController.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/messages/conversations — fetch user chat histories grouped by conversation partner
router.get('/conversations', MessageController.getConversations);

// GET /api/messages/history/:otherId — fetch history with specific creator or brand
router.get('/history/:otherId', MessageController.getHistory);

// POST /api/messages/read/:otherId — mark messages from other participant as read
router.post('/read/:otherId', MessageController.markAsRead);

export default router;
