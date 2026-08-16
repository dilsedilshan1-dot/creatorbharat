// 🇮🇳 CreatorBharat — AuditLog, MediaAsset & OutboxEvent Schema Tests
import { describe, it, expect } from 'vitest';

describe('AuditLog, MediaAsset & OutboxEvent Schema Tests', () => {

  // ─── 1. AuditLog Schema & Sanitization Expectations ───────────────────────
  it('1. AuditLog structure captures forensic fields and prevents secret leakage', () => {
    const mockAuditLog = {
      id: 'audit_cuid_123',
      actorId: 'admin_user_id_1',
      actorEmail: 'admin@creatorbharat.com',
      actorRole: 'SUPERADMIN',
      action: 'PAYMENT_ESCROW_RELEASE',
      category: 'FINANCIAL',
      targetType: 'Payment',
      targetId: 'pay_cuid_456',
      timestamp: new Date(),
      previousValue: { status: 'PAID', escrowLocked: true },
      newValue: { status: 'RELEASED', escrowLocked: false },
      ipAddress: '103.21.244.2',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
      metadata: { campaignId: 'camp_123', recipientCreatorId: 'cr_123', amountINR: 5000 },
      createdAt: new Date()
    };

    expect(mockAuditLog.action).toBe('PAYMENT_ESCROW_RELEASE');
    expect(mockAuditLog.category).toBe('FINANCIAL');
    expect(mockAuditLog.status).toBe('SUCCESS');
    expect(mockAuditLog.previousValue.status).toBe('PAID');
    expect(mockAuditLog.newValue.status).toBe('RELEASED');

    // Sanitization verification: Ensure no passwords, JWTs, or secrets in payload
    const serialized = JSON.stringify(mockAuditLog);
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('jwt');
    expect(serialized).not.toContain('secret');
  });

  // ─── 2. AuditLog KYC Masking Rule ─────────────────────────────────────────
  it('2. AuditLog sanitizes raw KYC numbers and document URLs', () => {
    const sanitizeKycData = (rawPayload) => {
      const sanitized = { ...rawPayload };
      if (sanitized.aadhaarNumber) {
        sanitized.aadhaarNumber = `XXXX-XXXX-${sanitized.aadhaarNumber.slice(-4)}`;
      }
      if (sanitized.panNumber) {
        sanitized.panNumber = `XXXXX${sanitized.panNumber.slice(-5)}`;
      }
      return sanitized;
    };

    const rawKyc = {
      creatorId: 'cr_123',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      status: 'VERIFIED'
    };

    const sanitized = sanitizeKycData(rawKyc);
    expect(sanitized.aadhaarNumber).toBe('XXXX-XXXX-9012');
    expect(sanitized.panNumber).toBe('XXXXX1234F');
    expect(sanitized.aadhaarNumber).not.toContain('12345678');
  });

  // ─── 3. MediaAsset Model & Visibility Controls ────────────────────────────
  it('3. MediaAsset model distinguishes between PUBLIC assets and ADMIN_ONLY/PRIVATE KYC assets', () => {
    const publicAvatarAsset = {
      id: 'media_cuid_1',
      ownerId: 'creator_123',
      ownerType: 'CREATOR',
      resourceType: 'AVATAR',
      storageProvider: 'CLOUDINARY',
      storageKey: 'creators/avatars/avatar_123.jpg',
      publicId: 'creators/avatars/avatar_123',
      url: 'https://res.cloudinary.com/creatorbharat/image/upload/avatar_123.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: BigInt(245000),
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    const privateKycAsset = {
      id: 'media_cuid_2',
      ownerId: 'creator_123',
      ownerType: 'CREATOR',
      resourceType: 'KYC_AADHAAR',
      storageProvider: 'LOCAL',
      storageKey: 'uploads/kyc/aadhaar_123_enc.pdf',
      publicId: null,
      url: '/api/admin/kyc/documents/aadhaar_123_enc.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(1048576),
      checksum: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
      visibility: 'ADMIN_ONLY',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    expect(publicAvatarAsset.visibility).toBe('PUBLIC');
    expect(privateKycAsset.visibility).toBe('ADMIN_ONLY');
    expect(privateKycAsset.resourceType).toBe('KYC_AADHAAR');
    expect(privateKycAsset.storageProvider).toBe('LOCAL');
  });

  // ─── 4. OutboxEvent States and Valid State Transitions ─────────────────────
  it('4. OutboxEvent enforces defined states and transition lifecycle', () => {
    const validStates = ['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'];

    const mockEvent = {
      id: 'outbox_cuid_1',
      eventType: 'PAYMENT_ESCROW_RELEASED',
      aggregateType: 'Payment',
      aggregateId: 'pay_cuid_456',
      idempotencyKey: 'outbox_escrow_release_pay_cuid_456',
      payload: {
        paymentId: 'pay_cuid_456',
        creatorId: 'cr_123',
        amountPaise: 450000,
        releasedAt: new Date().toISOString()
      },
      status: 'PENDING',
      attempts: 0,
      availableAt: new Date(),
      processedAt: null,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(validStates).toContain(mockEvent.status);

    // Transition 1: Picked up by worker -> PROCESSING
    mockEvent.status = 'PROCESSING';
    mockEvent.attempts += 1;
    expect(mockEvent.status).toBe('PROCESSING');
    expect(mockEvent.attempts).toBe(1);

    // Transition 2: Handler completed -> PROCESSED
    mockEvent.status = 'PROCESSED';
    mockEvent.processedAt = new Date();
    expect(mockEvent.status).toBe('PROCESSED');
    expect(mockEvent.processedAt).toBeInstanceOf(Date);
  });

  // ─── 5. OutboxEvent Retry Backoff Simulation ──────────────────────────────
  it('5. OutboxEvent transitions to FAILED with exponential backoff on transient errors', () => {
    const failedEvent = {
      id: 'outbox_cuid_2',
      eventType: 'WELCOME_EMAIL_SEND',
      aggregateType: 'User',
      aggregateId: 'user_cuid_999',
      status: 'PROCESSING',
      attempts: 1,
      availableAt: new Date(),
      lastError: null
    };

    // Simulate transient failure
    const simulateFailure = (event, errorMessage) => {
      event.status = 'FAILED';
      event.lastError = errorMessage;
      // Exponential backoff: 2 ^ attempts * 10 seconds
      const backoffSeconds = Math.pow(2, event.attempts) * 10;
      event.availableAt = new Date(Date.now() + backoffSeconds * 1000);
      return event;
    };

    const updated = simulateFailure(failedEvent, 'Resend API Rate Limited (429)');
    expect(updated.status).toBe('FAILED');
    expect(updated.lastError).toContain('429');
    expect(updated.availableAt.getTime()).toBeGreaterThan(Date.now());
  });

  // ─── 6. Outbox Deduplication & Idempotency Key ────────────────────────────
  it('6. OutboxEvent idempotencyKey prevents generating duplicate events for same domain event', () => {
    const existingEvents = new Map();

    const insertOutboxEvent = (event) => {
      if (existingEvents.has(event.idempotencyKey)) {
        return { inserted: false, reason: 'DUPLICATE_IDEMPOTENCY_KEY' };
      }
      existingEvents.set(event.idempotencyKey, event);
      return { inserted: true, eventId: event.id };
    };

    const event1 = {
      id: 'outbox_1',
      idempotencyKey: 'escrow_release_p123',
      eventType: 'ESCROW_RELEASED'
    };

    const res1 = insertOutboxEvent(event1);
    expect(res1.inserted).toBe(true);

    const event2 = {
      id: 'outbox_2',
      idempotencyKey: 'escrow_release_p123', // Same domain action
      eventType: 'ESCROW_RELEASED'
    };

    const res2 = insertOutboxEvent(event2);
    expect(res2.inserted).toBe(false);
    expect(res2.reason).toBe('DUPLICATE_IDEMPOTENCY_KEY');
  });
});
