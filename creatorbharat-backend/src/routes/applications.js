// 🇮🇳 CreatorBharat SaaS Applications Router
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { ApplicationController } from '../controllers/applicationController.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/applications — submit pitch to campaign
router.post('/', ApplicationController.apply);

// GET /api/applications/me — fetch active applications for logged-in user
router.get('/me', ApplicationController.getMyApplications);

// PUT /api/applications/:id — update application status (SHORTLISTED, REJECTED, etc.)
router.put('/:id', ApplicationController.updateStatus);

export default router;
