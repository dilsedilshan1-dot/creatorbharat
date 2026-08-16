// 🇮🇳 CreatorBharat SaaS Creators Router
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { CreatorController } from '../controllers/creatorController.js';

const router = express.Router();

// GET /api/creators — query and filter active creators
router.get('/', CreatorController.getCreators);

// GET /api/creators/activation/status — check activation price & count
router.get('/activation/status', authMiddleware, CreatorController.getActivationStatus);

// GET /api/creators/:idOrHandle — fetch single profile
router.get('/:idOrHandle', CreatorController.getCreatorByIdOrHandle);

// PUT /api/creators/me — update authenticated creator's profile details
router.put('/me', authMiddleware, CreatorController.updateMyProfile);

export default router;
