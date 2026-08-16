import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import prisma from '../src/prisma.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

vi.mock('../src/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn().mockResolvedValue(10)
    },
    creator: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn().mockResolvedValue(5),
      aggregate: vi.fn().mockResolvedValue({ _sum: { followers: 1000 } }),
      groupBy: vi.fn().mockResolvedValue([])
    },
    brand: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn().mockResolvedValue(2)
    },
    campaign: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn().mockResolvedValue(3)
    },
    application: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn().mockResolvedValue(4)
    },
    payment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn().mockResolvedValue(4)
    },
    campaignGig: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0)
    },
    review: {
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _avg: { rating: 5.0 } }),
      count: vi.fn().mockResolvedValue(0)
    },
    teamMember: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
      upsert: vi.fn()
    },
    platformSettings: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn()
    },
    otpVerification: {
      upsert: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
      delete: vi.fn(),
      count: vi.fn().mockResolvedValue(0)
    },
    systemSetting: {
      findUnique: vi.fn().mockResolvedValue({ id: 'singleton' }),
      create: vi.fn().mockResolvedValue({ id: 'singleton' }),
      update: vi.fn().mockResolvedValue({ id: 'singleton' }),
      upsert: vi.fn().mockResolvedValue({ id: 'singleton' })
    },
    refreshToken: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 })
    },
    passwordReset: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 })
    },
    message: {
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 })
    },
    newsletter: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 5 })
    },
    blog: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 2 })
    }
  };
  return {
    default: mockPrisma
  };
});

describe('Phase 1 Authentication, Authorization & IDOR Hardening Test Suite', () => {
  const TEST_JWT_SECRET = 'test_secret_for_vitest_runner_only_64_bytes_secure_value_1234567890';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = TEST_JWT_SECRET + '_refresh';
    process.env.RAZORPAY_SECRET = 'test_razorpay_secret_key_12345';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret_key_12345';
  });

  const generateToken = (userId, role = 'CREATOR', expiresIn = '1h') => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn });
  };

  // ─── 1. Unauthenticated user -> protected endpoint rejected (401) ───────────
  it('1. Unauthenticated user request to protected endpoint is rejected with 401', async () => {
    const res = await request(app)
      .get('/api/uploads')
      .expect(401);

    expect(res.body.error).toContain('Access denied');
  });

  // ─── 2. Creator -> admin endpoint rejected (403) ────────────────────────────
  it('2. Creator role cannot access admin verification queue (returns 403)', async () => {
    const token = generateToken('creator-user-id', 'CREATOR');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'creator-user-id',
      email: 'creator@creatorbharat.com',
      role: 'CREATOR'
    });

    const res = await request(app)
      .get('/api/admin/verifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.error).toContain('Forbidden');
  });

  // ─── 3. Brand -> admin endpoint rejected (403) ──────────────────────────────
  it('3. Brand role cannot access admin platform settings (returns 403)', async () => {
    const token = generateToken('brand-user-id', 'BRAND');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'brand-user-id',
      email: 'brand@creatorbharat.com',
      role: 'BRAND'
    });

    const res = await request(app)
      .get('/api/admin/platform-settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.error).toContain('Forbidden');
  });

  // ─── 4. Creator A -> Creator B KYC privacy leak prevention (Aadhaar/PAN hidden) ──
  it('4. Public directory and third-party queries sanitize Aadhaar and PAN KYC URLs', async () => {
    prisma.creator.findMany.mockResolvedValueOnce([
      {
        id: 'creator-b',
        userId: 'user-b',
        name: 'Pooja Verma',
        handle: 'poojaverma',
        score: 85,
        followers: 12000,
        aadhaarUrl: 'https://cdn.creatorbharat.com/kyc/secret_aadhaar_b.pdf',
        panUrl: 'https://cdn.creatorbharat.com/kyc/secret_pan_b.pdf',
        status: 'APPROVED',
        isProfileActive: true
      }
    ]);
    prisma.creator.count.mockResolvedValueOnce(1);

    const res = await request(app)
      .get('/api/creators')
      .expect(200);

    expect(res.body.creators[0]).not.toHaveProperty('aadhaarUrl');
    expect(res.body.creators[0]).not.toHaveProperty('panUrl');
    expect(res.body.creators[0].name).toBe('Pooja Verma');
  });

  // ─── 5. Brand A -> Brand B resource / Escrow IDOR protection (403) ──────────
  it('5. Brand A cannot release escrow payout for Brand B campaign (returns 403)', async () => {
    const token = generateToken('brand-a-user-id', 'BRAND');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'brand-a-user-id',
      email: 'brand-a@cb.com',
      role: 'BRAND',
      brand: { id: 'brand-a-entity-id' }
    });

    // Payment belongs to Brand B (brand-b-entity-id)
    prisma.payment.findFirst.mockResolvedValueOnce({
      id: 'payment-b-1',
      campaignId: 'campaign-b-1',
      brandId: 'brand-b-entity-id',
      recipientCreatorId: 'creator-c-1',
      amount: 15000,
      type: 'CAMPAIGN_ESCROW',
      status: 'PAID'
    });

    const res = await request(app)
      .post('/api/payments/release-escrow')
      .set('Authorization', `Bearer ${token}`)
      .send({ campaignId: 'campaign-b-1', creatorId: 'creator-c-1' })
      .expect(403);

    expect(res.body.error).toContain('Unauthorized. Only the campaign owner or an administrator');
  });

  // ─── 6. Creator -> Brand private resource rejected (403) ────────────────────
  it('6. Creator cannot create a brand campaign via /api/campaigns/create (returns 403)', async () => {
    const token = generateToken('creator-user-id', 'CREATOR');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'creator-user-id',
      email: 'creator@cb.com',
      role: 'CREATOR'
    });

    const res = await request(app)
      .post('/api/campaigns/create')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Unauthorized Creator Campaign', budget: 5000 })
      .expect(403);

    expect(res.body.error).toContain('Access restricted to brands only');
  });

  // ─── 7. Support role -> Superadmin endpoint rejected (403) ──────────────────
  it('7. SUPPORT team member cannot execute superadmin payment override (returns 403)', async () => {
    const token = generateToken('support-admin-id', 'ADMIN');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'support-admin-id',
      email: 'support@creatorbharat.com',
      role: 'ADMIN'
    });

    prisma.teamMember.findUnique.mockResolvedValueOnce({
      id: 'team-member-1',
      userId: 'support-admin-id',
      role: 'SUPPORT',
      status: 'ACTIVE'
    });

    const res = await request(app)
      .post('/api/admin/payments/override')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentId: 'payment-123', action: 'RELEASE' })
      .expect(403);

    expect(res.body.error).toContain('Forbidden');
  });

  // ─── 8. Finance role -> Danger zone endpoint rejected (403) ─────────────────
  it('8. FINANCE team member cannot execute Danger Zone clear-newsletters (returns 403)', async () => {
    const token = generateToken('finance-admin-id', 'ADMIN');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'finance-admin-id',
      email: 'finance@creatorbharat.com',
      role: 'ADMIN'
    });

    prisma.teamMember.findUnique.mockResolvedValueOnce({
      id: 'tm-finance',
      userId: 'finance-admin-id',
      role: 'FINANCE',
      status: 'ACTIVE'
    });

    const res = await request(app)
      .post('/api/admin/danger/clear-newsletters')
      .set('Authorization', `Bearer ${token}`)
      .send({ confirm: 'DELETE' })
      .expect(403);

    expect(res.body.error).toContain('Forbidden. Insufficient permissions');
  });

  // ─── 9. Manager role -> Superadmin-only danger action rejected (403) ────────
  it('9. MANAGER team member cannot execute superadmin-only delete-draft-blogs (returns 403)', async () => {
    const token = generateToken('manager-admin-id', 'ADMIN');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'manager-admin-id',
      email: 'manager@creatorbharat.com',
      role: 'ADMIN'
    });

    prisma.teamMember.findUnique.mockResolvedValueOnce({
      id: 'tm-manager',
      userId: 'manager-admin-id',
      role: 'MANAGER',
      status: 'ACTIVE'
    });

    const res = await request(app)
      .post('/api/admin/danger/delete-draft-blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ confirm: 'DELETE' })
      .expect(403);

    expect(res.body.error).toContain('Forbidden. Insufficient permissions');
  });

  // ─── 10. Expired access token -> rejected (401) ─────────────────────────────
  it('10. Expired access token is rejected with 401', async () => {
    const expiredToken = generateToken('user-1', 'CREATOR', '-1s');

    const res = await request(app)
      .get('/api/uploads')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body.error).toContain('Invalid or expired');
  });

  // ─── 11. Suspended user -> privileged & regular access rejected (403) ───────
  it('11. Suspended user accounts fail-closed with 403 Forbidden', async () => {
    const token = generateToken('suspended-user-id', 'CREATOR');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'suspended-user-id',
      email: 'badactor@creatorbharat.com',
      role: 'CREATOR',
      isSuspended: true
    });

    const res = await request(app)
      .get('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.error).toContain('Account is suspended');
  });

  // ─── 12. User cannot change own role or score (privilege escalation) ────────
  it('12. User cannot elevate privileges or modify score via profile update', async () => {
    const token = generateToken('creator-user-id', 'CREATOR');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'creator-user-id',
      email: 'creator@creatorbharat.com',
      role: 'CREATOR'
    });

    prisma.creator.update.mockResolvedValueOnce({
      id: 'creator-1',
      userId: 'creator-user-id',
      name: 'Amit Sharma',
      score: 70
    });

    await request(app)
      .put('/api/creators/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Amit Sharma Updated',
        score: 999,
        role: 'ADMIN' // Malicious privilege escalation attempt
      })
      .expect(200);

    expect(prisma.creator.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'creator-user-id' },
        data: expect.not.objectContaining({ score: 999, role: 'ADMIN' })
      })
    );
  });

  // ─── 13. User cannot access another user's wallet / payments (403) ──────────
  it('13. Creator cannot access Brand payment escrow orders directly', async () => {
    const token = generateToken('creator-user-id', 'CREATOR');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'creator-user-id',
      email: 'creator@cb.com',
      role: 'CREATOR'
    });

    const res = await request(app)
      .post('/api/payments/create-escrow')
      .set('Authorization', `Bearer ${token}`)
      .send({ campaignId: 'c1', creatorId: 'cr1', amount: 5000 })
      .expect(403);

    expect(res.body.error).toContain('Only brands can initiate campaign escrows');
  });

  // ─── 14. Path Traversal & Unauthorized Upload Deletion ──────────────────────
  it('14. Path traversal and unauthorized deletion attempts are rejected', async () => {
    const token = generateToken('creator-user-id', 'CREATOR');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'creator-user-id',
      role: 'CREATOR'
    });

    const res = await request(app)
      .delete('/api/uploads/..%2F..%2Fetc%2Fpasswd')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.error).toContain('Invalid or prohibited');
  });

  // ─── 15. Role guard on conversation messaging (403) ─────────────────────────
  it('15. Admin or unpermitted role without creator/brand profile is rejected from messaging', async () => {
    const token = generateToken('admin-id', 'ADMIN');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'admin-id',
      email: 'admin@cb.com',
      role: 'ADMIN'
    });

    const res = await request(app)
      .get('/api/messages/conversations')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.error).toContain('available for registered creators and brands only');
  });

  // ─── 16. Password Reset revokes all active refresh tokens ───────────────────
  it('16. Password reset invalidates all existing refresh tokens for the user', async () => {
    const validResetToken = 'valid-reset-token-12345';
    const futureExpiry = new Date(Date.now() + 15 * 60 * 1000);

    prisma.passwordReset.findUnique.mockResolvedValueOnce({
      id: 'pr-1',
      token: validResetToken,
      userId: 'target-user-id',
      expiresAt: futureExpiry
    });

    prisma.user.update.mockResolvedValueOnce({ id: 'target-user-id' });
    prisma.passwordReset.delete.mockResolvedValueOnce({});
    prisma.refreshToken.deleteMany.mockResolvedValueOnce({ count: 3 });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: validResetToken, newPassword: 'NewSecurePassword123!' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'target-user-id' }
    });
  });

  // ─── 17. Team member revocation invalidates active refresh tokens ───────────
  it('17. Revoking an admin team member invalidates their active refresh tokens', async () => {
    const token = generateToken('superadmin-id', 'ADMIN');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'superadmin-id',
      email: 'superadmin@creatorbharat.com',
      role: 'ADMIN'
    });

    prisma.teamMember.findUnique.mockResolvedValueOnce({
      id: 'tm-super',
      userId: 'superadmin-id',
      role: 'SUPERADMIN',
      status: 'ACTIVE'
    });

    prisma.teamMember.findUnique.mockResolvedValueOnce({
      id: 'target-member-id',
      userId: 'demoted-admin-id',
      role: 'MODERATOR',
      user: { email: 'moderator@creatorbharat.com' }
    });

    prisma.user.update.mockResolvedValueOnce({ id: 'demoted-admin-id', role: 'CREATOR' });
    prisma.refreshToken.deleteMany.mockResolvedValueOnce({ count: 2 });
    prisma.teamMember.delete.mockResolvedValueOnce({ id: 'target-member-id' });

    const res = await request(app)
      .delete('/api/admin/team/target-member-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'demoted-admin-id' }
    });
  });
});
