// 🇮🇳 CreatorBharat SaaS Creator Service
import prisma from '../prisma.js';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry', 'Other'
];

export class CreatorService {
  /**
   * Strips Aadhaar and PAN sensitive KYC URLs from public viewer contexts.
   */
  static sanitizeCreatorKYC(creator, requestingUser = null) {
    if (!creator) return null;
    const isOwner = requestingUser && (requestingUser.userId === creator.userId || requestingUser.id === creator.userId);
    const isAdmin = requestingUser && requestingUser.role === 'ADMIN';
    if (isOwner || isAdmin) {
      return creator;
    }
    const { aadhaarUrl, panUrl, ...sanitized } = creator;
    return sanitized;
  }

  /**
   * Calculates algorithmic reputation tier / rank for a creator.
   */
  static async getCreatorRankDetails(creator) {
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

  /**
   * Queries and filters active creator profiles.
   */
  static async getCreators({ q, state, niche, platform, verified, minFollowers, sort, page = 1, limit = 20 }) {
    const where = {
      status: 'APPROVED',
      isProfileActive: true
    };
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { handle: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (state) where.state = state;
    
    if (niche) {
      const niches = niche.split(',').map(n => n.trim()).filter(Boolean);
      if (niches.length > 0) {
        where.niche = { hasSome: niches };
      }
    }
    
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
      const rank = await this.getCreatorRankDetails(c);
      return this.sanitizeCreatorKYC({ ...c, rank });
    }));

    return {
      creators: creatorsWithRanks,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Retrieves activation pricing and profile status for authenticated user.
   */
  static async getActivationStatus(user) {
    const activeCount = await prisma.creator.count({
      where: { isProfileActive: true }
    });
    const currentPrice = activeCount < 1000 ? 199 : 499;
    
    const creator = await prisma.creator.findUnique({
      where: { userId: user.id }
    });
    
    return {
      activeCount,
      currentPrice,
      isProfileActive: creator?.isProfileActive || false,
      status: creator?.status || 'DRAFT'
    };
  }

  /**
   * Retrieves a single creator profile by ID or handle.
   */
  static async getCreatorByIdOrHandle(idOrHandle, authUser = null) {
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
      const error = new Error('Creator profile not found.');
      error.statusCode = 404;
      throw error;
    }

    if (creator.status !== 'APPROVED' || !creator.isProfileActive) {
      if (authUser && (authUser.userId === creator.userId || authUser.id === creator.userId || authUser.role === 'ADMIN')) {
        const rank = await this.getCreatorRankDetails(creator);
        return this.sanitizeCreatorKYC({ ...creator, rank, isPreview: true }, authUser);
      }
      const error = new Error('Profile is not live. Admin approval and active subscription required.');
      error.statusCode = 403;
      throw error;
    }

    const rank = await this.getCreatorRankDetails(creator);
    return this.sanitizeCreatorKYC({ ...creator, rank }, authUser);
  }

  /**
   * Updates authenticated creator's profile details.
   */
  static async updateMyProfile(user, data) {
    if (user.role !== 'CREATOR') {
      const error = new Error('Access restricted to creators only.');
      error.statusCode = 403;
      throw error;
    }

    const {
      name, bio, photo, coverImage, coverPhoto, city, state, niche, platform,
      followers, engagementRate, rateMin, rateMax,
      aadhaarUrl, panUrl, status,
      fullStory, socialLinks, milestones, services, packages, localHubs,
      regionalDialects, localVoice,
      contactPhone, contactEmail, contactTelegram, contactMethod, contactAvailability
    } = data;

    if (state && !INDIAN_STATES.includes(state)) {
      const error = new Error('Only Indian locations are allowed for creator profiles.');
      error.statusCode = 400;
      throw error;
    }

    // Prevent creators from self-approving verification status
    let finalStatus = status;
    if (status && status !== 'PENDING_APPROVAL' && status !== 'DRAFT') {
      finalStatus = undefined;
    }

    const updated = await prisma.creator.update({
      where: { userId: user.id },
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

    return updated;
  }
}
