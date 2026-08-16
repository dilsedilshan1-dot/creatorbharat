// 🇮🇳 CreatorBharat SaaS Ecosystem Gigs Router
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { GigController } from '../controllers/gigController.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/gigs/me — fetch active campaign gigs for logged-in creator or brand
router.get('/me', GigController.getMyGigs);

// POST /api/gigs/:id/milestones/:mId/submit — submit proof of work for a milestone (Creator only)
router.post('/:id/milestones/:mId/submit', GigController.submitMilestoneProof);

// POST /api/gigs/:id/milestones/:mId/approve — approve milestone and release payment (Brand only)
router.post('/:id/milestones/:mId/approve', GigController.approveMilestone);

export default router;
