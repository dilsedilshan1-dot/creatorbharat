// 🇮🇳 CreatorBharat SaaS Gig Service
import prisma from '../prisma.js';
import { OutboxService } from './outboxService.js';

export class GigService {
  /**
   * Retrieves active gigs for a creator or brand.
   */
  static async getMyGigs(user) {
    if (user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({
        where: { userId: user.id }
      });
      if (!creator) {
        const error = new Error('Creator profile details not found.');
        error.statusCode = 404;
        throw error;
      }

      const gigs = await prisma.campaignGig.findMany({
        where: { creatorId: creator.id },
        include: {
          campaign: {
            include: {
              brand: true
            }
          },
          milestones: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return gigs;
    } else if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({
        where: { userId: user.id }
      });
      if (!brand) {
        const error = new Error('Brand profile details not found.');
        error.statusCode = 404;
        throw error;
      }

      const gigs = await prisma.campaignGig.findMany({
        where: {
          campaign: { brandId: brand.id }
        },
        include: {
          creator: true,
          campaign: true,
          milestones: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return gigs;
    } else {
      const error = new Error('Unauthorized role access.');
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * Submits proof of work for a gig milestone (Creator only).
   */
  static async submitMilestoneProof(user, gigId, milestoneId, { proofText, proofUrl }) {
    if (user.role !== 'CREATOR') {
      const error = new Error('Only creators can submit milestone proof of work.');
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

    const gig = await prisma.campaignGig.findUnique({
      where: { id: gigId },
      include: {
        milestones: true,
        campaign: {
          include: { brand: { include: { user: true } } }
        }
      }
    });

    if (!gig) {
      const error = new Error('Gig not found.');
      error.statusCode = 404;
      throw error;
    }

    if (gig.creatorId !== creator.id) {
      const error = new Error('Unauthorized to access this gig.');
      error.statusCode = 403;
      throw error;
    }

    const milestone = gig.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      const error = new Error('Milestone not found.');
      error.statusCode = 404;
      throw error;
    }

    if (milestone.status === 'APPROVED') {
      const error = new Error('Milestone has already been approved.');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const updatedMilestone = await tx.gigMilestone.update({
        where: { id: milestoneId },
        data: {
          status: 'SUBMITTED',
          proofText: proofText || null,
          proofUrl: proofUrl || null,
          updatedAt: new Date()
        }
      });

      await OutboxService.publish(tx, {
        eventType: 'MILESTONE_PROOF_SUBMITTED',
        aggregateType: 'GigMilestone',
        aggregateId: milestoneId,
        payload: {
          gigId,
          milestoneId,
          creatorName: creator.name,
          brandUserId: gig.campaign?.brand?.user?.id || null,
          milestoneTitle: milestone.title
        }
      });

      return { success: true, milestone: updatedMilestone };
    });
  }

  /**
   * Approves a milestone and releases escrow payment (Brand only).
   */
  static async approveMilestone(user, gigId, milestoneId) {
    if (user.role !== 'BRAND') {
      const error = new Error('Only brands can approve milestones.');
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

    const gig = await prisma.campaignGig.findUnique({
      where: { id: gigId },
      include: {
        campaign: true,
        milestones: true,
        creator: { include: { user: true } }
      }
    });

    if (!gig) {
      const error = new Error('Gig not found.');
      error.statusCode = 404;
      throw error;
    }

    if (gig.campaign.brandId !== brand.id) {
      const error = new Error('Unauthorized to manage this gig.');
      error.statusCode = 403;
      throw error;
    }

    const milestone = gig.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      const error = new Error('Milestone not found.');
      error.statusCode = 404;
      throw error;
    }

    if (milestone.status === 'APPROVED') {
      const error = new Error('Milestone is already approved.');
      error.statusCode = 400;
      throw error;
    }

    // Atomic transaction for milestone approval, wallet transaction, gig completion, and outbox event
    return prisma.$transaction(async (tx) => {
      const updatedMilestone = await tx.gigMilestone.update({
        where: { id: milestoneId },
        data: {
          status: 'APPROVED',
          updatedAt: new Date()
        }
      });

      const amountInInr = Math.round(milestone.amount);
      await tx.walletTransaction.create({
        data: {
          creatorId: gig.creatorId,
          amount: amountInInr,
          type: 'CAMPAIGN_PAYOUT',
          status: 'SUCCESS',
          description: `Escrow payout released for milestone: ${milestone.title}`,
          referenceId: `gig-ms-${milestoneId}`
        }
      });

      const allMilestones = await tx.gigMilestone.findMany({
        where: { gigId }
      });

      const allApproved = allMilestones.every(m => m.status === 'APPROVED');
      let updatedGig = gig;
      if (allApproved) {
        updatedGig = await tx.campaignGig.update({
          where: { id: gigId },
          data: { status: 'COMPLETED' },
          include: { milestones: true }
        });
      }

      await OutboxService.publish(tx, {
        eventType: 'MILESTONE_APPROVED',
        aggregateType: 'GigMilestone',
        aggregateId: milestoneId,
        payload: {
          gigId,
          milestoneId,
          creatorUserId: gig.creator?.user?.id || null,
          milestoneTitle: milestone.title,
          amountPaise: (BigInt(amountInInr) * BigInt(100)).toString()
        }
      });

      return {
        success: true,
        milestone: updatedMilestone,
        gigStatus: updatedGig.status
      };
    });
  }
}

