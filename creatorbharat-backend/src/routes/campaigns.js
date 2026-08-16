// 🇮🇳 CreatorBharat SaaS Campaigns Router
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { CampaignController } from '../controllers/campaignController.js';

const router = express.Router();

// POST /api/campaigns/create — brands publish new campaign deals
router.post('/create', authMiddleware, CampaignController.createCampaign);

// GET /api/campaigns/me — list campaigns of the authenticated brand
router.get('/me', authMiddleware, CampaignController.getMyCampaigns);

// GET /api/campaigns — list all active campaigns
router.get('/', CampaignController.getPublicCampaigns);

// POST /api/campaigns/:id/apply — creators submit pitches to campaign
router.post('/:id/apply', authMiddleware, CampaignController.applyToCampaign);

export default router;
