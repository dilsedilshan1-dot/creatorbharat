// 🇮🇳 CreatorBharat SaaS Applications Router
import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail } from '../utils/mailer.js';
import { createNotification } from './notifications.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/applications — submit pitch to campaign
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'CREATOR') {
      return res.status(403).json({ error: 'Access restricted to creators only.' });
    }

    const { campaignId, message, proposedRate } = req.body;

    if (!campaignId) {
      return res.status(400).json({ error: 'Campaign ID is required.' });
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator profile details not found.' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Cannot apply to this campaign. Campaign status is ${campaign.status || 'inactive'}.` });
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
      return res.status(400).json({ error: 'You have already applied to this campaign.' });
    }

    const application = await prisma.application.create({
      data: {
        campaignId,
        creatorId: creator.id,
        pitch: message,
        status: 'PENDING'
      }
    });

    res.status(201).json(application);

    // Look up brand details for email alert
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
  } catch (err) {
    console.error('[POST /api/applications] Error:', err.message);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// GET /api/applications/me — fetch active applications for logged-in user
router.get('/me', async (req, res) => {
  try {
    if (req.user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({
        where: { userId: req.user.id }
      });
      if (!creator) return res.status(404).json({ error: 'Creator details not found.' });

      const apps = await prisma.application.findMany({
        where: { creatorId: creator.id },
        include: { campaign: true }
      });
      res.json(apps);
    } else if (req.user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({
        where: { userId: req.user.id }
      });
      if (!brand) return res.status(404).json({ error: 'Brand details not found.' });

      const apps = await prisma.application.findMany({
        where: {
          campaign: { brandId: brand.id }
        },
        include: {
          creator: true,
          campaign: true
        }
      });
      res.json(apps);
    } else {
      res.status(403).json({ error: 'Unauthorized role access.' });
    }
  } catch (err) {
    console.error('[GET /api/applications/me] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user applications.' });
  }
});

// PUT /api/applications/:id — update application status (SHORTLISTED, REJECTED, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const isBrand = req.user.role === 'BRAND';
    if (!isBrand) {
      return res.status(403).json({ error: 'Only brands can update application statuses.' });
    }

    const brand = await prisma.brand.findUnique({ where: { userId: req.user.id } });
    if (!brand) return res.status(404).json({ error: 'Brand profile details not found.' });

    // Find the application and verify it belongs to one of this brand's campaigns
    const application = await prisma.application.findUnique({
      where: { id },
      include: { campaign: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.campaign.brandId !== brand.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this application.' });
    }

    const updated = await prisma.application.update({
      where: { id },
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
        console.error('[applications.js] Failed to create CampaignGig:', err.message);
      }
    }

    // Notify creator of status update (non-blocking)
    (async () => {
      try {
        const appDetails = await prisma.application.findUnique({
          where: { id },
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
                \${status === 'ACCEPTED' ? '<p>Congratulations! Since your pitch was accepted, a collaboration gig has been created for you. You can now submit your content draft for approval.</p>' : ''}
                <p style="margin-top: 24px;">
                  <a href="\${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/opportunities" style="background: #FF9431; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
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

    res.json(updated);
  } catch (err) {
    console.error('[PUT /api/applications/:id] Error:', err.message);
    res.status(500).json({ error: 'Failed to update application status.' });
  }
});

export default router;
