// 🇮🇳 CreatorBharat SaaS Application Service
import prisma from '../prisma.js';
import { sendEmail } from '../utils/mailer.js';
import { createNotification } from './notificationService.js';

export class ApplicationService {
  /**
   * Submits a pitch application to a campaign.
   */
  static async apply(user, { campaignId, message, proposedRate }) {
    if (user.role !== 'CREATOR') {
      const error = new Error('Access restricted to creators only.');
      error.statusCode = 403;
      throw error;
    }

    if (!campaignId) {
      const error = new Error('Campaign ID is required.');
      error.statusCode = 400;
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
      const error = new Error('Campaign not found.');
      error.statusCode = 404;
      throw error;
    }

    if (campaign.status !== 'ACTIVE') {
      const error = new Error(`Cannot apply to this campaign. Campaign status is ${campaign.status || 'inactive'}.`);
      error.statusCode = 400;
      throw error;
    }

    const existing = await prisma.application.findUnique({
      where: {
        campaignId_creatorId: {
          campaignId,
          creatorId: creator.id
        }
      }
    });

    if (existing) {
      const error = new Error('You have already applied to this campaign.');
      error.statusCode = 400;
      throw error;
    }

    const application = await prisma.application.create({
      data: {
        campaignId,
        creatorId: creator.id,
        pitch: message,
        status: 'PENDING'
      }
    });

    // Background notifications to brand (non-blocking)
    (async () => {
      try {
        const campaignDetail = await prisma.campaign.findUnique({
          where: { id: campaignId },
          include: {
            brand: {
              include: {
                user: true
              }
            }
          }
        });

        if (campaignDetail?.brand?.user?.id) {
          await createNotification({
            userId: campaignDetail.brand.user.id,
            title: '🚀 New Pitch Received',
            body: `Creator ${creator.name} has applied to your campaign "${campaignDetail.title}".`,
            type: 'CAMPAIGN',
            link: '/brand-applications'
          });
        }

        if (campaignDetail?.brand?.user?.email) {
          await sendEmail({
            to: campaignDetail.brand.user.email,
            subject: `New Pitch Received: ${campaignDetail.title}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
                <h2 style="color: #FF9431;">New Pitch Received! 🚀</h2>
                <p>A creator has pitched to your campaign: <strong>${campaignDetail.title}</strong>.</p>
                <p><strong>Creator Name:</strong> ${creator.name}</p>
                <p><strong>Pitch Message:</strong> "${message}"</p>
                <p style="margin-top: 24px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/brand/applications" style="background: #FF9431; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Review Applications
                  </a>
                </p>
                <p style="margin-top: 28px; font-size: 12px; color: #94a3b8;">Best regards,<br/>Team CreatorBharat</p>
              </div>
            `
          });
        }
      } catch (err) {
        console.error('Pitch email notification warning:', err.message);
      }
    })();

    return application;
  }

  /**
   * Retrieves active applications for the logged in user (creator or brand).
   */
  static async getMyApplications(user) {
    if (user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({
        where: { userId: user.id }
      });
      if (!creator) {
        const error = new Error('Creator details not found.');
        error.statusCode = 404;
        throw error;
      }

      const apps = await prisma.application.findMany({
        where: { creatorId: creator.id },
        include: { campaign: true }
      });
      return apps;
    } else if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({
        where: { userId: user.id }
      });
      if (!brand) {
        const error = new Error('Brand details not found.');
        error.statusCode = 404;
        throw error;
      }

      const apps = await prisma.application.findMany({
        where: {
          campaign: { brandId: brand.id }
        },
        include: {
          creator: true,
          campaign: true
        }
      });
      return apps;
    } else {
      const error = new Error('Unauthorized role access.');
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * Updates application status and triggers collaboration gig if accepted.
   */
  static async updateStatus(user, applicationId, status) {
    if (!status) {
      const error = new Error('Status is required.');
      error.statusCode = 400;
      throw error;
    }

    if (user.role !== 'BRAND') {
      const error = new Error('Only brands can update application statuses.');
      error.statusCode = 403;
      throw error;
    }

    const brand = await prisma.brand.findUnique({ where: { userId: user.id } });
    if (!brand) {
      const error = new Error('Brand profile details not found.');
      error.statusCode = 404;
      throw error;
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { campaign: true }
    });

    if (!application) {
      const error = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    if (application.campaign.brandId !== brand.id) {
      const error = new Error('Unauthorized to modify this application.');
      error.statusCode = 403;
      throw error;
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      try {
        const existingGig = await prisma.campaignGig.findFirst({
          where: {
            campaignId: application.campaignId,
            creatorId: application.creatorId
          }
        });

        if (!existingGig) {
          const totalBudget = application.campaign.budget || 5000;
          const milestone1Amount = Math.round(totalBudget * 0.4);
          const milestone2Amount = totalBudget - milestone1Amount;

          await prisma.campaignGig.create({
            data: {
              campaignId: application.campaignId,
              creatorId: application.creatorId,
              status: 'ACTIVE',
              milestones: {
                create: [
                  {
                    title: 'Content Draft Submission',
                    description: 'Create and submit the draft of the video or post for brand review and feedback.',
                    status: 'PENDING',
                    amount: milestone1Amount
                  },
                  {
                    title: 'Go-Live and Release',
                    description: 'Publish the approved content live on specified social media channels and submit the live link.',
                    status: 'PENDING',
                    amount: milestone2Amount
                  }
                ]
              }
            }
          });
        }
      } catch (err) {
        console.error('[applicationService.js] Failed to create CampaignGig:', err.message);
      }
    }

    // Notify creator of status update (non-blocking)
    (async () => {
      try {
        const appDetails = await prisma.application.findUnique({
          where: { id: applicationId },
          include: {
            campaign: {
              include: {
                brand: true
              }
            },
            creator: {
              include: {
                user: true
              }
            }
          }
        });

        if (appDetails?.creator?.user?.id) {
          await createNotification({
            userId: appDetails.creator.user.id,
            title: status === 'ACCEPTED' ? '🎉 Application Accepted!' : status === 'REJECTED' ? '⚠️ Application Update' : '📋 Application Shortlisted',
            body: status === 'ACCEPTED'
              ? `Your application for campaign "${appDetails.campaign.title}" has been accepted! A collaboration gig is now active.`
              : status === 'REJECTED'
                ? `Your application for campaign "${appDetails.campaign.title}" was not selected.`
                : `Your application for campaign "${appDetails.campaign.title}" has been shortlisted.`,
            type: 'CAMPAIGN',
            link: '/creator/opportunities'
          });
        }

        if (appDetails?.creator?.user?.email) {
          await sendEmail({
            to: appDetails.creator.user.email,
            subject: `Campaign Application Update: ${appDetails.campaign.title}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
                <h2 style="color: #FF9431;">Application Status Update!</h2>
                <p>Hi ${appDetails.creator.name},</p>
                <p>The brand <strong>${appDetails.campaign.brand.companyName}</strong> has updated the status of your pitch for the campaign: <strong>${appDetails.campaign.title}</strong>.</p>
                <p><strong>New Status:</strong> <span style="font-weight: bold; color: ${status === 'ACCEPTED' ? '#10b981' : status === 'REJECTED' ? '#ef4444' : '#f59e0b'}">${status}</span></p>
                ${status === 'ACCEPTED' ? '<p>Congratulations! Since your pitch was accepted, a collaboration gig has been created for you. You can now submit your content draft for approval.</p>' : ''}
                <p style="margin-top: 24px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/opportunities" style="background: #FF9431; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View My Opportunities
                  </a>
                </p>
                <p style="margin-top: 28px; font-size: 12px; color: #94a3b8;">Best regards,<br/>Team CreatorBharat</p>
              </div>
            `
          });
        }
      } catch (err) {
        console.error('Application status update notification warning:', err.message);
      }
    })();

    return updated;
  }
}
