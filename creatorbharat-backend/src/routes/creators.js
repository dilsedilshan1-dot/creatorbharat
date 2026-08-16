// 🇮🇳 CreatorBharat SaaS Creators Router
import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

async function getCreatorRankDetails(creator) {
  if (!creator) return 'Bronze';
  
  const followers = creator.followers || 0;
  
  // Calculate completed campaigns (gigs)
  const completedGigs = await prisma.campaignGig.count({
    where: { creatorId: creator.id, status: 'COMPLETED' }
  });

  // Calculate average rating
  const reviewAgg = await prisma.review.aggregate({
    where: { creatorId: creator.id },
    _avg: { rating: true }
  });
  const avgRating = reviewAgg._avg.rating || 5.0;

  // Calculate leaderboard percent (top 1% by followers)
  const countHigher = await prisma.creator.count({
    where: { followers: { gt: followers } }
  });
  const totalCreators = await prisma.creator.count();
  const topPercent = totalCreators > 0 ? (countHigher / totalCreators) * 100 : 100;

  // Determine Rank
  if (topPercent <= 1 && followers >= 500000) {
    return 'Platinum';
  } else if (followers >= 250000 && avgRating >= 4.8) {
    return 'Gold';
  } else if (followers >= 50000 && completedGigs >= 2) {
    return 'Silver';
  } else {
    return 'Bronze';
  }
}

// GET /api/creators — query and filter active creators
router.get('/', async (req, res) => {
  try {
    const { q, state, niche, platform, verified, minFollowers, sort, page = 1, limit = 20 } = req.query;

    const where = {
      status: 'APPROVED',
      isProfileActive: true
    };
    
    // Text search (name, bio, handle)
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { handle: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (state) where.state = state;
    
    // Support multiple niches (comma-separated or single)
    if (niche) {
      const niches = niche.split(',').map(n => n.trim()).filter(Boolean);
      if (niches.length > 0) {
        where.niche = { hasSome: niches };
      }
    }
    
    // Support multiple platforms (comma-separated or single)
    if (platform) {
      const platforms = platform.split(',').map(p => p.trim()).filter(Boolean);
      if (platforms.length > 0) {
        where.platform = { hasSome: platforms };
      }
    }
    
    if (verified === 'true') {
      where.isVerified = true;
    }
    
    if (minFollowers) {
      where.followers = { gte: parseInt(minFollowers) };
    }

    const orderBy = sort === 'followers' ? { followers: 'desc' } : { createdAt: 'desc' };

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        where,
        orderBy,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.creator.count({ where })
    ]);

    const creatorsWithRanks = await Promise.all(creators.map(async (c) => {
      const rank = await getCreatorRankDetails(c);
      return { ...c, rank };
    }));

    res.json({
      creators: creatorsWithRanks,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('[GET /api/creators] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch creators.' });
  }
});

// GET /api/creators/activation/status — check activation price & count
router.get('/activation/status', authMiddleware, async (req, res) => {
  try {
    const activeCount = await prisma.creator.count({
      where: { isProfileActive: true }
    });
    const currentPrice = activeCount < 1000 ? 199 : 499;
    
    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id }
    });
    
    res.json({
      activeCount,
      currentPrice,
      isProfileActive: creator?.isProfileActive || false,
      status: creator?.status || 'DRAFT'
    });
  } catch (err) {
    console.error('[GET /api/creators/activation/status] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve activation status.' });
  }
});

// GET /api/creators/:idOrHandle — fetch single profile
router.get('/:idOrHandle', async (req, res) => {
  try {
    const { idOrHandle } = req.params;

    const creator = await prisma.creator.findFirst({
      where: {
        OR: [
          { id: idOrHandle },
          { handle: idOrHandle.toLowerCase() }
        ]
      },
      include: {
        podcasts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' }
        },
        reviews: {
          orderBy: { createdAt: 'desc' }
        },
        gallery: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator profile not found.' });
    }

    if (creator.status !== 'APPROVED' || !creator.isProfileActive) {
      try {
        if (req.headers.authorization) {
          const token = req.headers.authorization.split(' ')[1];
          const jwt = await import('jsonwebtoken');
          const jwtSecret = process.env.JWT_SECRET;
          if (jwtSecret) {
            const decoded = jwt.default.verify(token, jwtSecret);
            const tokenUserId = decoded.userId || decoded.id;
            if (tokenUserId === creator.userId || decoded.role === 'ADMIN') {
              const rank = await getCreatorRankDetails(creator);
              return res.json({ ...creator, rank, isPreview: true });
            }
          }
        }
      } catch (jwtErr) {
        // failed decode, fall through to restrict
      }
      return res.status(403).json({ error: 'Profile is not live. Admin approval and active subscription required.' });
    }

    const rank = await getCreatorRankDetails(creator);
    res.json({ ...creator, rank });
  } catch (err) {
    console.error('[GET /api/creators/:idOrHandle] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch creator profile.' });
  }
});

// PUT /api/creators/me — update authenticated creator's profile details
router.put('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'CREATOR') {
      return res.status(403).json({ error: 'Access restricted to creators only.' });
    }

    const {
      name, bio, photo, coverImage, coverPhoto, city, state, niche, platform,
      followers, engagementRate, rateMin, rateMax,
      aadhaarUrl, panUrl, status,
      fullStory, socialLinks, milestones, services, packages, localHubs,
      regionalDialects, localVoice,
      contactPhone, contactEmail, contactTelegram, contactMethod, contactAvailability
    } = req.body;

    const INDIAN_STATES = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry', 'Other'
    ];

    if (state && !INDIAN_STATES.includes(state)) {
      return res.status(400).json({ error: 'Only Indian locations are allowed for creator profiles.' });
    }

    // Prevent creators from self-approving verification status
    let finalStatus = status;
    if (status && status !== 'PENDING_APPROVAL' && status !== 'DRAFT') {
      finalStatus = undefined;
    }

    const updated = await prisma.creator.update({
      where: { userId: req.user.id },
      data: {
        name,
        bio,
        photo,
        coverImage: coverImage || coverPhoto || undefined,
        city,
        state,
        niche: Array.isArray(niche) ? niche : undefined,
        platform: Array.isArray(platform) ? platform : undefined,
        followers: followers !== undefined ? parseInt(followers) : undefined,
        engagementRate: engagementRate !== undefined ? parseFloat(engagementRate) : undefined,
        rateMin: rateMin !== undefined ? parseInt(rateMin) : undefined,
        rateMax: rateMax !== undefined ? parseInt(rateMax) : undefined,
        aadhaarUrl,
        panUrl,
        status: finalStatus,
        fullStory: fullStory !== undefined ? fullStory : undefined,
        socialLinks: socialLinks !== undefined ? socialLinks : undefined,
        milestones: milestones !== undefined ? milestones : undefined,
        services: services !== undefined ? services : undefined,
        packages: packages !== undefined ? packages : undefined,
        localHubs: localHubs !== undefined ? localHubs : undefined,
        regionalDialects: Array.isArray(regionalDialects) ? regionalDialects : undefined,
        localVoice: localVoice !== undefined ? localVoice : undefined,
        contactPhone,
        contactEmail,
        contactTelegram,
        contactMethod,
        contactAvailability
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('[PUT /api/creators/me] Error:', err.message);
    res.status(500).json({ error: 'Failed to update profile details.' });
  }
});

export default router;
