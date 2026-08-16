// 🇮🇳 CreatorBharat SaaS Campaigns Router
import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/campaigns/create — brands publish new campaign deals
router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'BRAND') {
      return res.status(403).json({ error: 'Access restricted to brands only.' });
    }

    const { title, description, budget, niche, platform } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id }
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand profile details not found.' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        brandId: brand.id,
        title,
        description,
        budget: budget !== undefined ? parseInt(budget) : 0,
        niche: Array.isArray(niche) ? niche : [],
        platform: Array.isArray(platform) ? platform : []
      }
    });

    res.status(201).json(campaign);
  } catch (err) {
    console.error('[POST /api/campaigns/create] Error:', err.message);
    res.status(500).json({ error: 'Failed to create campaign deal.' });
  }
});

// GET /api/campaigns/me — list campaigns of the authenticated brand
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'BRAND') {
      return res.status(403).json({ error: 'Access restricted to brands only.' });
    }
    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id }
    });
    if (!brand) {
      return res.status(404).json({ error: 'Brand profile details not found.' });
    }
    const campaigns = await prisma.campaign.findMany({
      where: { brandId: brand.id },
      include: {
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (err) {
    console.error('[GET /api/campaigns/me] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve campaigns.' });
  }
});

// GET /api/campaigns — list all active campaigns

router.get('/', async (req, res) => {
  try {
    const { platform, niche } = req.query;

    const where = { status: 'ACTIVE' };
    if (platform) where.platform = { has: platform };
    if (niche) where.niche = { has: niche };

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        brand: {
          select: { companyName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(campaigns);
  } catch (err) {
    console.error('[GET /api/campaigns] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve campaigns.' });
  }
});

// POST /api/campaigns/:id/apply — creators submit pitches to campaign
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'CREATOR') {
      return res.status(403).json({ error: 'Access restricted to creators only.' });
    }

    const { id } = req.params;
    const { pitch } = req.body;

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator profile details not found.' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign deal not found.' });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Cannot apply to this campaign. Campaign status is ${campaign.status || 'inactive'}.` });
    }

    const exists = await prisma.application.findUnique({
      where: {
        campaignId_creatorId: {
          campaignId: id,
          creatorId: creator.id
        }
      }
    });

    if (exists) {
      return res.status(400).json({ error: 'You have already applied to this campaign.' });
    }

    const application = await prisma.application.create({
      data: {
        campaignId: id,
        creatorId: creator.id,
        pitch
      }
    });

    res.status(201).json(application);
  } catch (err) {
    console.error('[POST /api/campaigns/:id/apply] Error:', err.message);
    res.status(500).json({ error: 'Failed to submit application pitch.' });
  }
});

export default router;
