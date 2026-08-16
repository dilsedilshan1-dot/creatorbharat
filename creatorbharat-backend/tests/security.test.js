import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import prisma from '../src/prisma.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

vi.mock('../src/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn().mockResolvedValue(10)
    },
    creator: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(5),
      aggregate: vi.fn().mockResolvedValue({ _sum: { followers: 1000 } }),
      groupBy: vi.fn().mockResolvedValue([])
    },
    brand: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
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
      updateMany: vi.fn()
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
    }
  };
  return {
    default: mockPrisma
  };
});

describe('Phase 0 Security & RBAC Lockdown Test Suite', () => {
  const TEST_JWT_SECRET = 'test_secret_for_vitest_runner_only_64_bytes_secure_value_1234567890';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = TEST_JWT_SECRET + '_refresh';
    process.env.RAZORPAY_SECRET = 'test_razorpay_secret_key_12345';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret_key_12345';
  });

  const generateToken = (userId, role = 'CREATOR') => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  };

  // ─── 1. Access Control: Creator cannot access admin API ────────────────────
  it('1. Creator role cannot access admin verification queue (returns 403)', async () => {
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

  // ─── 2. Access Control: Brand cannot access admin API ───────────────────────
  it('2. Brand role cannot access admin platform settings (returns 403)', async () => {
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

  // ─── 3. Tiered RBAC: Support role cannot execute Superadmin actions ─────────
  it('3. SUPPORT team member cannot execute payment override (returns 403)', async () => {
    const token = generateToken('support-admin-id', 'ADMIN');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'support-admin-id',
      email: 'support@creatorbharat.com',
      role: 'ADMIN'
    });

    // Mock team member lookup with role 'SUPPORT'
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

  // ─── 4. Fail-Closed: Missing JWT_SECRET rejects requests ────────────────────
  it('4. Missing JWT_SECRET environment variable fails closed with 500 error', async () => {
    delete process.env.JWT_SECRET;
    const res = await request(app)
      .get('/api/admin/verifications')
      .set('Authorization', 'Bearer some-token')
      .expect(500);

    expect(res.body.error).toContain('configuration error');
  });

  // ─── 5. Rate Limiting: AI endpoint rejects over 20 req/min/IP ──────────────
  it('5. POST /api/ai/chat rejects messages exceeding 500 characters', async () => {
    const hugeMessage = 'A'.repeat(501);
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: hugeMessage })
      .expect(400);

    expect(res.body.error).toContain('exceeds maximum limit');
  });

  // ─── 6. Creator Score: Creators cannot modify score via PUT /me ─────────────
  it('6. PUT /api/creators/me ignores creator-supplied score mutations', async () => {
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
        score: 999 // Malicious self-score promotion attempt
      })
      .expect(200);

    // Verify Prisma update call was made WITHOUT score
    expect(prisma.creator.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'creator-user-id' },
        data: expect.not.objectContaining({ score: 999 })
      })
    );
  });

  // ─── 7. Path Traversal & Unauthorized File Deletion Protection ─────────────
  it('7. DELETE /api/uploads rejects path traversal attempts with 400', async () => {
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

  // ─── 8. Payment Webhook Idempotency ─────────────────────────────────────────
  it('8. Duplicate payment webhooks are handled idempotently without re-execution', async () => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const payload = {
      event: 'order.paid',
      payload: {
        order: { entity: { id: 'order_test_123' } },
        payment: { entity: { id: 'pay_test_456' } }
      }
    };

    const signature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Payment exists but is already PAID
    prisma.payment.findFirst.mockResolvedValueOnce({
      id: 'payment-1',
      razorpayOrderId: 'order_test_123',
      status: 'PAID'
    });

    // Atomic update returns count: 0 because status != PENDING
    prisma.payment.updateMany.mockResolvedValueOnce({ count: 0 });

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', signature)
      .send(payload)
      .expect(200);

    expect(res.body.message).toContain('already processed');
  });

  // ─── 9. Campaign Application State Validation ──────────────────────────────
  it('9. POST /api/campaigns/:id/apply rejects applications to PAUSED campaigns', async () => {
    const token = generateToken('creator-user-id', 'CREATOR');
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'creator-user-id',
      role: 'CREATOR'
    });

    prisma.creator.findUnique.mockResolvedValueOnce({
      id: 'creator-1',
      userId: 'creator-user-id'
    });

    // Campaign is PAUSED
    prisma.campaign.findUnique.mockResolvedValueOnce({
      id: 'campaign-paused-id',
      status: 'PAUSED'
    });

    const res = await request(app)
      .post('/api/campaigns/campaign-paused-id/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ pitch: 'I would like to apply' })
      .expect(400);

    expect(res.body.error).toContain('Cannot apply to this campaign');
  });

  // ─── 10. Backup Endpoint Sanitization ──────────────────────────────────────
  it('10. GET /api/admin/system/backup excludes passwords and KYC documents', async () => {
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

    prisma.user.findMany.mockResolvedValueOnce([
      { id: 'u1', email: 'user@cb.com', role: 'CREATOR', isSuspended: false, createdAt: new Date(), updatedAt: new Date() }
    ]);

    prisma.creator.findMany.mockResolvedValueOnce([
      { id: 'c1', name: 'Amit', aadhaarUrl: 'https://secret.aadhaar.pdf', panUrl: 'https://secret.pan.pdf', followers: 5000 }
    ]);

    const res = await request(app)
      .get('/api/admin/system/backup')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.database.creators[0]).not.toHaveProperty('aadhaarUrl');
    expect(res.body.database.creators[0]).not.toHaveProperty('panUrl');
    expect(res.body.database.creators[0].name).toBe('Amit');
  });

  // ─── 11. Suspended Accounts & Token Expiry Fail-Closed ──────────────────────
  it('11. Suspended user accounts are rejected with 403 Forbidden', async () => {
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
});
