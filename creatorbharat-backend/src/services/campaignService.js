// 🇮🇳 CreatorBharat SaaS Campaign Service
import prisma from '../prisma.js';

export class CampaignService {
  /**
   * Creates a new campaign published by a brand.
   */
  static async createCampaign(user, { title, description, budget, niche, platform }) {
    if (user.role !== 'BRAND') {
      const error = new Error('Access restricted to brands only.');
      error.statusCode = 403;
      throw error;
    }

    if (!title || !description) {
      const error = new Error('Title and description are required.');
      error.statusCode = 400;
      throw error;
    }

    const brand = await prisma.brand.findUnique({
      where: { userId: user.id }
    });

    if (!brand) {
      const error = new Error('Brand profile details not found.');
      error.statusCode = 404;
      throw error;
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

    return campaign;
  }

  /**
   * Lists campaigns created by the authenticated brand.
   */
  static async getMyCampaigns(user) {
    if (user.role !== 'BRAND') {
      const error = new Error('Access restricted to brands only.');
      error.statusCode = 403;
      throw error;
    }

    const brand = await prisma.brand.findUnique({
      where: { userId: user.id }
    });

    if (!brand) {
      const error = new Error('Brand profile details not found.');
      error.statusCode = 404;
      throw error;
    }

    const campaigns = await prisma.campaign.findMany({
      where: { brandId: brand.id },
      include: {
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return campaigns;
  }

  /**
   * Lists public active campaigns with optional filtering.
   */
  static async getPublicCampaigns({ platform, niche }) {
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

    return campaigns;
  }

  /**
   * Submits a creator's application pitch to a campaign.
   */
  static async applyToCampaign(user, campaignId, { pitch }) {
    if (user.role !== 'CREATOR') {
      const error = new Error('Access restricted to creators only.');
      error.statusCode = 403;
      throw error;
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: user.id }
    });

    if (!creator) {
      const error = new Error('Creator profile details not found.');
      error.statusCode = 404;
      throw error;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      const error = new Error('Campaign deal not found.');
      error.statusCode = 404;
      throw error;
    }

    if (campaign.status !== 'ACTIVE') {
      const error = new Error(`Cannot apply to this campaign. Campaign status is ${campaign.status || 'inactive'}.`);
      error.statusCode = 400;
      throw error;
    }

    const exists = await prisma.application.findUnique({
      where: {
        campaignId_creatorId: {
          campaignId,
          creatorId: creator.id
        }
      }
    });

    if (exists) {
      const error = new Error('You have already applied to this campaign.');
      error.statusCode = 400;
      throw error;
    }

    const application = await prisma.application.create({
      data: {
        campaignId,
        creatorId: creator.id,
        pitch
      }
    });

    return application;
  }
}
