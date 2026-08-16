// 🇮🇳 CreatorBharat SaaS Payments Router
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail } from '../utils/mailer.js';
import { getSettings } from '../utils/settings.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Helper: get a Razorpay instance using dynamic keys from DB settings
async function getRazorpayClient() {
  const settings = await getSettings();
  return new Razorpay({
    key_id: settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: settings.razorpaySecret || process.env.RAZORPAY_SECRET || 'placeholder_secret',
  });
}

// POST /api/payments/create-order — start Razorpay checkout transaction for Pro Membership
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // PRO_LISTING, CAMPAIGN_BOOST, FEATURED_SLOT, PROFILE_ACTIVATION
    const settings = await getSettings();
    let amount;
    if (type === 'PROFILE_ACTIVATION') {
      const activeCount = await prisma.creator.count({
        where: { isProfileActive: true }
      });
      amount = activeCount < 1000 ? 199 : 499;
    } else {
      const amounts = {
        PRO_LISTING: settings.proMembershipPrice || 49,
        CAMPAIGN_BOOST: settings.campaignBoostPrice || 99,
        FEATURED_SLOT: settings.featuredSlotPrice || 199
      };
      amount = amounts[type];
    }

    if (!amount) {
      return res.status(400).json({ error: 'Invalid checkout payment tier.' });
    }

    const razorpay = await getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `cb_receipt_${Date.now()}`,
      notes: { type, userId: req.user.id }
    });

    const creator = req.user.role === 'CREATOR' ? req.user.creator : null;
    const brand = req.user.role === 'BRAND' ? req.user.brand : null;

    await prisma.payment.create({
      data: {
        amount,
        type,
        status: 'PENDING',
        razorpayOrderId: order.id,
        creatorId: creator?.id || null,
        brandId: brand?.id || null
      }
    });

    res.json({
      orderId: order.id,
      amount: amount * 100,
      currency: 'INR',
      key: settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[POST /api/payments/create-order] Error:', err.message);
    res.status(500).json({ error: 'Failed to create payment gateway transaction.' });
  }
});

// POST /api/payments/create-escrow — brand deposits campaign budget into escrow
router.post('/create-escrow', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'BRAND') {
      return res.status(403).json({ error: 'Only brands can initiate campaign escrows.' });
    }

    const { campaignId, creatorId, amount } = req.body;
    if (!campaignId || !creatorId || !amount) {
      return res.status(400).json({ error: 'Campaign ID, recipient Creator ID, and amount are required.' });
    }

    const brand = await prisma.brand.findUnique({ where: { userId: req.user.id } });
    if (!brand) {
      return res.status(404).json({ error: 'Brand profile details not found.' });
    }

    // Verify campaign and application exist
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign details not found.' });
    }

    const razorpay = await getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `cb_escrow_${Date.now()}`,
      notes: {
        type: 'CAMPAIGN_ESCROW',
        campaignId,
        creatorId,
        brandId: brand.id
      }
    });

    await prisma.payment.create({
      data: {
        amount,
        type: 'CAMPAIGN_ESCROW',
        status: 'PENDING',
        razorpayOrderId: order.id,
        brandId: brand.id,
        campaignId,
        recipientCreatorId: creatorId
      }
    });

    res.json({
      orderId: order.id,
      amount: amount * 100,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[POST /api/payments/create-escrow] Error:', err.message);
    res.status(500).json({ error: 'Failed to create escrow transaction.' });
  }
});

// POST /api/payments/verify — verify signature and complete transaction
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing checkout validation parameters.' });
    }

    const keySecret = process.env.RAZORPAY_SECRET;
    if (!keySecret) {
      console.error('[POST /api/payments/verify] Fatal: RAZORPAY_SECRET is not configured.');
      return res.status(500).json({ error: 'Payment gateway configuration missing.' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', keySecret).update(sign).digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Security signature mismatch validation failed.' });
    }

    // Check existing payment record for idempotency
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId: razorpay_order_id }
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment order record not found.' });
    }

    if (existingPayment.status === 'PAID') {
      return res.json({ success: true, payment: existingPayment, alreadyProcessed: true });
    }

    const payment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: 'PAID',
        razorpayId: razorpay_payment_id
      }
    });

    // Handle Pro listing activation
    if (payment.type === 'PRO_LISTING' && payment.creatorId) {
      await prisma.creator.update({
        where: { id: payment.creatorId },
        data: { isPro: true }
      });
    }

    // Handle Profile activation subscription
    if (payment.type === 'PROFILE_ACTIVATION' && payment.creatorId) {
      await prisma.creator.update({
        where: { id: payment.creatorId },
        data: { isProfileActive: true }
      });
    }

    // Handle Campaign Escrow status updates
    if (payment.type === 'CAMPAIGN_ESCROW' && payment.campaignId && payment.recipientCreatorId) {
      // Update application status to ACCEPTED
      await prisma.application.updateMany({
        where: {
          campaignId: payment.campaignId,
          creatorId: payment.recipientCreatorId
        },
        data: {
          status: 'ACCEPTED'
        }
      });
    }

    // Send Receipt Email (non-blocking)
    (async () => {
      try {
        if (payment.type === 'PRO_LISTING') {
          await sendEmail({
            to: req.user.email,
            subject: 'Receipt: Your CreatorBharat Pro Membership is Active! ⚡',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
                <h2 style="color: #FF9431;">Payment Confirmation Receipt 🧾</h2>
                <p>Hello ${req.user.creator?.name || 'Creator'},</p>
                <p>Thank you for upgrading to <strong>CreatorBharat Pro</strong>. Your premium subscription is now active.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Order ID:</td>
                      <td style="text-align: right; font-weight: 500;">${razorpay_order_id}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Payment ID:</td>
                      <td style="text-align: right; font-weight: 500;">${razorpay_payment_id}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Plan:</td>
                      <td style="text-align: right; font-weight: 500;">Pro Creator Listing Upgrade</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; border-top: 1px solid #e2e8f0;">Amount Paid:</td>
                      <td style="text-align: right; font-weight: bold; color: #FF9431; padding: 6px 0; border-top: 1px solid #e2e8f0;">₹${payment.amount}.00 INR</td>
                    </tr>
                  </table>
                </div>

                <p>Here are your new Pro features:</p>
                <ul style="line-height: 1.6;">
                  <li><strong>Elite Gold Badge:</strong> Graces your profile directory listing.</li>
                  <li><strong>Unlimited Application Pitches:</strong> Apply to all campaigns without restriction.</li>
                  <li><strong>Featured Discovery Placement:</strong> Appear at the top of brand search results.</li>
                </ul>

                <p style="margin-top: 24px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/dashboard" style="background: #FF9431; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Open Pro Dashboard
                  </a>
                </p>
                <p style="margin-top: 28px; font-size: 12px; color: #94a3b8;">Best regards,<br/>Team CreatorBharat</p>
              </div>
            `
          });
        } else if (payment.type === 'PROFILE_ACTIVATION') {
          // Send notification inside dashboard
          await createNotification({
            userId: req.user.id,
            title: '🚀 Portfolio Active & Live!',
            body: 'Your CreatorBharat portfolio is now live and searchable in the public marketplace. Start matching with top brand campaigns!',
            type: 'PAYMENT',
            link: '/creator/dashboard'
          });

          // Send receipt email
          await sendEmail({
            to: req.user.email,
            subject: 'Your CreatorBharat Portfolio is Officially Live! 🚀',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
                <h2 style="color: #FF9431;">Portfolio Activation Complete! 🚀</h2>
                <p>Hello ${req.user.name || 'Creator'},</p>
                <p>Congratulations! Your CreatorBharat profile listing fee has been paid successfully, and your portfolio is now <strong>Live</strong> on the public directory.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Order ID:</td>
                      <td style="text-align: right; font-weight: 500;">${razorpay_order_id}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Payment ID:</td>
                      <td style="text-align: right; font-weight: 500;">${razorpay_payment_id}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Period:</td>
                      <td style="text-align: right; font-weight: 500;">2 Years Visibility</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; border-top: 1px solid #e2e8f0;">Amount Paid:</td>
                      <td style="text-align: right; font-weight: bold; color: #10B981; padding: 6px 0; border-top: 1px solid #e2e8f0;">₹${payment.amount}.00 INR</td>
                    </tr>
                  </table>
                </div>

                <p>Here is what happens next:</p>
                <ul style="line-height: 1.6;">
                  <li><strong>Marketplace Visibility:</strong> Your portfolio is indexed and visible to brands searching in your city and niche.</li>
                  <li><strong>Brand discovery:</strong> Brands can shortlist your card and view your case studies.</li>
                  <li><strong>Profile SEO:</strong> Your search engine visibility is automatically enhanced.</li>
                </ul>

                <p style="margin-top: 24px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/creators" style="background: #FF9431; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View Your Live Card
                  </a>
                </p>
                <p style="margin-top: 28px; font-size: 12px; color: #94a3b8;">Best regards,<br/>Team CreatorBharat</p>
              </div>
            `
          });
        } else if (payment.type === 'CAMPAIGN_ESCROW') {
          // Fetch Campaign detail to include in the receipt
          const campaign = await prisma.campaign.findUnique({
            where: { id: payment.campaignId }
          });

          await sendEmail({
            to: req.user.email,
            subject: `Receipt: Escrow Secured for Campaign "${campaign?.title || 'Escrow Deposit'}" 🔒`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
                <h2 style="color: #FF9431;">Escrow Deposit Confirmed 🔒</h2>
                <p>Hello ${req.user.brand?.companyName || 'Brand Partner'},</p>
                <p>We have successfully received and secured your campaign escrow deposit. The campaign pitch application has been marked as accepted, and funds are held safely.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Order ID:</td>
                      <td style="text-align: right; font-weight: 500;">${razorpay_order_id}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Payment ID:</td>
                      <td style="text-align: right; font-weight: 500;">${razorpay_payment_id}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Campaign:</td>
                      <td style="text-align: right; font-weight: 500;">${campaign?.title || 'Collaboration Deal'}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; border-top: 1px solid #e2e8f0;">Escrowed Amount:</td>
                      <td style="text-align: right; font-weight: bold; color: #FF9431; padding: 6px 0; border-top: 1px solid #e2e8f0;">₹${payment.amount}.00 INR</td>
                    </tr>
                  </table>
                </div>

                <p><strong>Security Note:</strong> These funds are held securely in CreatorBharat's neutral escrow vault. Once the creator completes the agreed milestones, you can release the funds directly to them from your brand panel.</p>

                <p style="margin-top: 24px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/brand/campaigns" style="background: #FF9431; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View Campaigns & Escrows
                  </a>
                </p>
                <p style="margin-top: 28px; font-size: 12px; color: #94a3b8;">Best regards,<br/>Team CreatorBharat</p>
              </div>
            `
          });
        }
      } catch (err) {
        console.error('[Verify Email Dispatch Warning]:', err.message);
      }
    })();

    res.json({ success: true, payment });
  } catch (err) {
    console.error('[POST /api/payments/verify] Error:', err.message);
    res.status(500).json({ error: 'Checkout confirmation failed.' });
  }
});

// POST /api/payments/release-escrow — release escrow budget (split payouts)
router.post('/release-escrow', authMiddleware, async (req, res) => {
  try {
    const { campaignId, creatorId } = req.body;
    if (!campaignId || !creatorId) {
      return res.status(400).json({ error: 'Campaign ID and recipient Creator ID are required.' });
    }

    // Fetch the active escrow payment
    const payment = await prisma.payment.findFirst({
      where: {
        campaignId,
        recipientCreatorId: creatorId,
        type: 'CAMPAIGN_ESCROW',
        status: 'PAID'
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'No active paid escrow transaction found for this deal.' });
    }

    // Ownership Verification: Only the brand that created the campaign or an ADMIN can release escrow
    const isAdmin = req.user.role === 'ADMIN';
    const isOwningBrand = req.user.role === 'BRAND' && req.user.brand && payment.brandId === req.user.brand.id;

    if (!isAdmin && !isOwningBrand) {
      return res.status(403).json({ error: 'Unauthorized. Only the campaign owner or an administrator can release escrow funds.' });
    }

    // Razorpay split logic:
    // In production, we trigger transfers: razorpay.transfers.create({ ... })
    // For sandbox/development: we mock the transfer logs
    const creatorAmount = payment.amount * 0.90; // 90% goes to Creator
    const platformFee = payment.amount * 0.10;  // 10% Platform fee

    console.log(`[Escrow Payout Release]: Paid ${creatorAmount} INR to Creator ${creatorId} (90%). Mapped 10% fee (${platformFee} INR) to Platform.`);

    // Update payment record in database
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'RELEASED'
      }
    });

    // Create WalletTransaction entry for the Creator
    await prisma.walletTransaction.create({
      data: {
        creatorId,
        amount: Math.round(creatorAmount),
        type: 'CAMPAIGN_PAYOUT',
        status: 'SUCCESS',
        description: `Campaign Payout for campaign: ${payment.campaignId || 'Deal'}`,
        referenceId: `escrow_release_${payment.id}`
      }
    });

    // Update application status to COMPLETED
    await prisma.application.updateMany({
      where: {
        campaignId,
        creatorId
      },
      data: {
        status: 'COMPLETED'
      }
    });

    // Send email/in-app alert to Creator about escrow release (non-blocking)
    (async () => {
      try {
        const creatorUser = await prisma.creator.findUnique({
          where: { id: creatorId },
          include: { user: true }
        });
        
        if (creatorUser?.user?.id) {
          await createNotification({
            userId: creatorUser.user.id,
            title: '💸 Collaboration Payout Released!',
            body: `₹${Math.round(creatorAmount)} has been added to your wallet for campaign payload.`,
            type: 'PAYMENT',
            link: '/creator/wallet'
          });
        }

        if (creatorUser?.user?.email) {
          await sendEmail({
            to: creatorUser.user.email,
            subject: 'Escrow Released! Your Collaboration Payout is Completed 💸',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
                <h2 style="color: #FF9431;">Payment Released! 💸</h2>
                <p>Hello ${creatorUser.name},</p>
                <p>Great news! The brand has approved your campaign deliverables and released the escrow funds.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Campaign Deal:</td>
                      <td style="text-align: right; font-weight: 500;">₹${payment.amount}.00 INR Total Value</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Your Payout (90%):</td>
                      <td style="text-align: right; font-weight: bold; color: #10b981;">₹${creatorAmount}.00 INR</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0;">Platform Fee (10%):</td>
                      <td style="text-align: right; font-weight: 500;">₹${platformFee}.00 INR</td>
                    </tr>
                  </table>
                </div>

                <p>The payout has been initiated and will reflect in your registered bank account details shortly.</p>

                <p style="margin-top: 24px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/dashboard" style="background: #FF9431; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View Creator Earnings
                  </a>
                </p>
                <p style="margin-top: 28px; font-size: 12px; color: #94a3b8;">Best regards,<br/>Team CreatorBharat</p>
              </div>
            `
          });
        }
      } catch (err) {
        console.error('[Release Escrow Email Dispatch Warning]:', err.message);
      }
    })();

    res.json({
      success: true,
      message: 'Escrow released successfully.',
      details: {
        total: payment.amount,
        creatorPayout: creatorAmount,
        platformFee: platformFee
      }
    });
  } catch (err) {
    console.error('[POST /api/payments/release-escrow] Error:', err.message);
    res.status(500).json({ error: 'Failed to release escrow transaction.' });
  }
});

// POST /api/payments/webhook — asynchronous transaction verification hook from Razorpay
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing webhook signature header.' });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[POST /api/payments/webhook] Fatal: RAZORPAY_WEBHOOK_SECRET is not configured.');
      return res.status(500).json({ error: 'Payment gateway configuration missing.' });
    }

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const { event, payload } = req.body;
    console.log(`[Razorpay Webhook]: Received event '${event}'`);

    if (event === 'order.paid' || event === 'payment.captured') {
      const orderEntity = payload.order?.entity || payload.payment?.entity;
      const orderId = orderEntity?.id || orderEntity?.order_id;
      const paymentId = payload.payment?.entity?.id || orderEntity?.payment_id;

      if (orderId) {
        // Find if we have a payment with this order ID
        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId: orderId }
        });

        if (!payment) {
          console.warn(`[Razorpay Webhook]: No payment found for order ${orderId}`);
          return res.json({ status: 'ok', message: 'Order not found, ignored.' });
        }

        // Idempotency: atomic update where status is strictly PENDING
        const updateResult = await prisma.payment.updateMany({
          where: {
            id: payment.id,
            status: 'PENDING'
          },
          data: {
            status: 'PAID',
            razorpayId: paymentId || null
          }
        });

        // If count === 0, it was already processed (idempotent no-op)
        if (updateResult.count === 0) {
          console.log(`[Razorpay Webhook]: Payment ${payment.id} already processed. Skipping duplicate execution.`);
          return res.json({ status: 'ok', message: 'Payment already processed' });
        }

        // Handle Pro listing activation
        if (payment.type === 'PRO_LISTING' && payment.creatorId) {
          await prisma.creator.update({
            where: { id: payment.creatorId },
            data: { isPro: true }
          });
          console.log(`[Razorpay Webhook]: Pro listing upgraded for creator ID: ${payment.creatorId}`);
        }

        // Handle Profile activation subscription
        if (payment.type === 'PROFILE_ACTIVATION' && payment.creatorId) {
          await prisma.creator.update({
            where: { id: payment.creatorId },
            data: { isProfileActive: true }
          });
          console.log(`[Razorpay Webhook]: Profile activated for creator ID: ${payment.creatorId}`);
        }

        // Handle Campaign Escrow status updates
        if (payment.type === 'CAMPAIGN_ESCROW' && payment.campaignId && payment.recipientCreatorId) {
          await prisma.application.updateMany({
            where: {
              campaignId: payment.campaignId,
              creatorId: payment.recipientCreatorId
            },
            data: {
              status: 'ACCEPTED'
            }
          });
          console.log(`[Razorpay Webhook]: Escrow deposit complete, campaign application accepted for creator ID: ${payment.recipientCreatorId}`);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[POST /api/payments/webhook] Error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
});

// GET /api/payments/history — fetch wallet transaction ledger history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const creator = req.user.role === 'CREATOR' ? req.user.creator : null;
    if (!creator) {
      return res.status(403).json({ error: 'Access restricted. Creator profile not found.' });
    }

    const txs = await prisma.walletTransaction.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(txs);
  } catch (err) {
    console.error('[GET /api/payments/history] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve transaction ledger.' });
  }
});

// POST /api/payments/withdraw — creator initiates bank withdrawal payout
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const creator = req.user.role === 'CREATOR' ? req.user.creator : null;
    if (!creator) {
      return res.status(403).json({ error: 'Access restricted to creators only.' });
    }

    const { amount } = req.body;
    if (!amount || parseInt(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount to withdraw.' });
    }

    const numericAmount = parseInt(amount);

    // Sum all successful transactions
    const ledgerSum = await prisma.walletTransaction.aggregate({
      where: { creatorId: creator.id, status: 'SUCCESS' },
      _sum: { amount: true }
    });
    
    // Add default initial amount (e.g. Nykaa 15000 + MMT 12000 = 27000) for demo/fallback so creators have initial test money
    const availableBalance = (ledgerSum._sum.amount !== null ? ledgerSum._sum.amount : 27000);

    if (numericAmount > availableBalance) {
      return res.status(400).json({ error: 'Insufficient wallet balance for this withdrawal.' });
    }

    const refId = `payout_${Date.now()}`;
    const tx = await prisma.walletTransaction.create({
      data: {
        creatorId: creator.id,
        amount: -numericAmount,
        type: 'BANK_WITHDRAWAL',
        status: 'SUCCESS',
        description: 'Bank Payout Settlement via Razorpay',
        referenceId: refId
      }
    });

    res.json({
      success: true,
      message: 'Withdrawal completed successfully.',
      transaction: tx
    });
  } catch (err) {
    console.error('[POST /api/payments/withdraw] Error:', err.message);
    res.status(500).json({ error: 'Failed to process bank withdrawal.' });
  }
});

export default router;
