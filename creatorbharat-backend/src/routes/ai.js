// 🇮🇳 CreatorBharat SaaS AI Router
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth.js';
import { AIController } from '../controllers/aiController.js';

const router = Router();

// Rate limiter for public AI chatbot (20 requests/min/IP)
export const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a minute before sending more messages.' }
});

// POST /api/ai/chat — CreatorBharat AI Assistant (no auth required for public)
router.post('/chat', aiChatLimiter, AIController.chat);

// POST /api/ai/brief-assistant — AI Campaign Brief Assistant
router.post('/brief-assistant', authMiddleware, AIController.generateBrief);

// POST /api/ai/pitch-assistant — AI Creator Pitch Assistant
router.post('/pitch-assistant', authMiddleware, AIController.generatePitch);

export default router;
