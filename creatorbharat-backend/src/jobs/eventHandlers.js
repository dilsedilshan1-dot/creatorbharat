// 📬 CreatorBharat SaaS Outbox Event Handler Registry
import prisma from '../prisma.js';
import { sendEmail } from '../utils/mailer.js';
import { createNotification } from '../services/notificationService.js';

export const eventHandlers = new Map();

/**
 * Registers an event handler for a specific eventType.
 */
export function registerHandler(eventType, handler) {
  eventHandlers.set(eventType, handler);
}

// ─── 1. APPLICATION_SUBMITTED Handler ─────────────────────────────────────────
registerHandler('APPLICATION_SUBMITTED', async (event) => {
  const { campaignId, creatorName, message, brandUserId, brandEmail, campaignTitle } = event.payload;

  if (brandUserId) {
    await createNotification({
      userId: brandUserId,
      title: '🚀 New Pitch Received',
      body: `Creator ${creatorName || 'A creator'} has applied to your campaign "${campaignTitle || 'Campaign'}".`,
      type: 'CAMPAIGN',
      link: '/brand-applications'
    });
  }

  if (brandEmail) {
    await sendEmail({
      to: brandEmail,
      subject: `New Pitch Received: ${campaignTitle || 'Campaign'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #FF9431;">New Pitch Received! 🚀</h2>
          <p>A creator has pitched to your campaign: <strong>${campaignTitle || 'Campaign'}</strong>.</p>
          <p><strong>Creator Name:</strong> ${creatorName || 'Creator'}</p>
          <p><strong>Pitch Message:</strong> "${message || ''}"</p>
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

  return { success: true, processed: true };
});

// ─── 2. APPLICATION_STATUS_UPDATED Handler ───────────────────────────────────
registerHandler('APPLICATION_STATUS_UPDATED', async (event) => {
  const { creatorUserId, creatorEmail, creatorName, brandCompanyName, campaignTitle, status } = event.payload;

  if (creatorUserId) {
    await createNotification({
      userId: creatorUserId,
      title: status === 'ACCEPTED' ? '🎉 Application Accepted!' : status === 'REJECTED' ? '⚠️ Application Update' : '📋 Application Shortlisted',
      body: status === 'ACCEPTED'
        ? `Your application for campaign "${campaignTitle || 'Campaign'}" has been accepted! A collaboration gig is now active.`
        : status === 'REJECTED'
          ? `Your application for campaign "${campaignTitle || 'Campaign'}" was not selected.`
          : `Your application for campaign "${campaignTitle || 'Campaign'}" has been shortlisted.`,
      type: 'CAMPAIGN',
      link: '/creator/opportunities'
    });
  }

  if (creatorEmail) {
    await sendEmail({
      to: creatorEmail,
      subject: `Campaign Application Update: ${campaignTitle || 'Campaign'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #FF9431;">Application Status Update!</h2>
          <p>Hi ${creatorName || 'Creator'},</p>
          <p>The brand <strong>${brandCompanyName || 'Brand Partner'}</strong> has updated the status of your pitch for the campaign: <strong>${campaignTitle || 'Campaign'}</strong>.</p>
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

  return { success: true, processed: true };
});

// ─── 3. MILESTONE_PROOF_SUBMITTED Handler ────────────────────────────────────
registerHandler('MILESTONE_PROOF_SUBMITTED', async (event) => {
  const { brandUserId, creatorName, milestoneTitle, gigId } = event.payload;

  if (brandUserId) {
    await createNotification({
      userId: brandUserId,
      title: '📸 Milestone Proof Submitted',
      body: `Creator ${creatorName || 'A creator'} submitted proof for milestone: "${milestoneTitle || 'Milestone'}".`,
      type: 'CAMPAIGN',
      link: `/brand-gigs/${gigId || ''}`
    });
  }

  return { success: true, processed: true };
});

// ─── 4. MILESTONE_APPROVED Handler ───────────────────────────────────────────
registerHandler('MILESTONE_APPROVED', async (event) => {
  const { creatorUserId, milestoneTitle, gigId } = event.payload;

  if (creatorUserId) {
    await createNotification({
      userId: creatorUserId,
      title: '🎉 Milestone Approved & Escrow Released!',
      body: `Your milestone "${milestoneTitle || 'Milestone'}" was approved and payout released to your wallet.`,
      type: 'PAYMENT',
      link: `/creator-gigs/${gigId || ''}`
    });
  }

  return { success: true, processed: true };
});

// ─── 5. USER_NOTIFICATION_REQUESTED Handler ──────────────────────────────────
registerHandler('USER_NOTIFICATION_REQUESTED', async (event) => {
  const { userId, title, body, type, link } = event.payload;
  if (!userId || !title) {
    throw new Error('USER_NOTIFICATION_REQUESTED: userId and title are required.');
  }

  await createNotification({ userId, title, body, type, link });
  return { success: true, processed: true };
});

// ─── 6. EMAIL_NOTIFICATION_REQUESTED Handler ─────────────────────────────────
registerHandler('EMAIL_NOTIFICATION_REQUESTED', async (event) => {
  const { to, subject, html, text } = event.payload;
  if (!to || !subject) {
    throw new Error('EMAIL_NOTIFICATION_REQUESTED: to and subject are required.');
  }

  await sendEmail({ to, subject, html, text });
  return { success: true, processed: true };
});
