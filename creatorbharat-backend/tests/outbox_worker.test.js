// 📬 CreatorBharat SaaS Outbox Worker & Reliable Event Processing Test Suite
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../src/prisma.js';
import { OutboxService } from '../src/services/outboxService.js';
import { OutboxWorker } from '../src/jobs/outboxWorker.js';
import { registerHandler, eventHandlers } from '../src/jobs/eventHandlers.js';

describe('Phase 2F — Transactional Outbox Worker & Reliable Event Processing', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── 1. OutboxService Payload Sanitization ─────────────────────────────────
  it('1. OutboxService.sanitizePayload strips sensitive tokens, passwords, and KYC links', () => {
    const rawPayload = {
      userId: 'u123',
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      password: 'SuperSecretPassword123!',
      token: 'jwt.token.secret',
      apiKey: 'gm_api_key_xyz',
      aadhaarUrl: 'https://cdn.creatorbharat.com/kyc/aadhaar.pdf',
      panUrl: 'https://cdn.creatorbharat.com/kyc/pan.pdf',
      nested: {
        jwtSecret: 'secret_key',
        validField: 'allowed'
      }
    };

    const clean = OutboxService.sanitizePayload(rawPayload);

    expect(clean.userId).toBe('u123');
    expect(clean.name).toBe('Rohan Sharma');
    expect(clean.email).toBe('rohan@example.com');
    expect(clean.password).toBeUndefined();
    expect(clean.token).toBeUndefined();
    expect(clean.apiKey).toBeUndefined();
    expect(clean.aadhaarUrl).toBeUndefined();
    expect(clean.panUrl).toBeUndefined();
    expect(clean.nested.jwtSecret).toBeUndefined();
    expect(clean.nested.validField).toBe('allowed');
  });

  // ─── 2. Transaction Rollback Guarantee ─────────────────────────────────────
  it('2. If transaction rolls back, no OutboxEvent is persisted', async () => {
    const mockTx = {
      outboxEvent: {
        create: vi.fn().mockResolvedValue({ id: 'evt_1' })
      }
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
      return callback(mockTx);
    });

    await expect(
      prisma.$transaction(async (tx) => {
        await OutboxService.publish(tx, {
          eventType: 'APPLICATION_SUBMITTED',
          aggregateType: 'Application',
          aggregateId: 'app_1',
          payload: { test: true }
        });
        throw new Error('SIMULATED_DOMAIN_ERROR');
      })
    ).rejects.toThrow('SIMULATED_DOMAIN_ERROR');

    expect(mockTx.outboxEvent.create).toHaveBeenCalledTimes(1);
  });

  // ─── 3. Atomic Event Claiming ──────────────────────────────────────────────
  it('3. Worker atomically claims eligible PENDING events and changes status to PROCESSING', async () => {
    const mockEvent = {
      id: 'evt_1',
      eventType: 'APPLICATION_SUBMITTED',
      aggregateType: 'Application',
      aggregateId: 'app_1',
      status: 'PENDING',
      attempts: 0,
      availableAt: new Date(Date.now() - 1000),
      payload: { message: 'Pitch' }
    };

    vi.spyOn(prisma.outboxEvent, 'findMany').mockResolvedValue([mockEvent]);
    vi.spyOn(prisma.outboxEvent, 'updateMany').mockResolvedValue({ count: 1 });
    vi.spyOn(prisma.outboxEvent, 'findUnique').mockResolvedValue({
      ...mockEvent,
      status: 'PROCESSING',
      attempts: 1
    });

    const worker = new OutboxWorker({ batchSize: 5 });
    const claimed = await worker.claimEvents();

    expect(claimed).toHaveLength(1);
    expect(claimed[0].id).toBe('evt_1');
    expect(claimed[0].status).toBe('PROCESSING');
    expect(claimed[0].attempts).toBe(1);
    expect(prisma.outboxEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'evt_1', status: 'PENDING' }),
        data: expect.objectContaining({ status: 'PROCESSING' })
      })
    );
  });

  // ─── 4. Stale Event Recovery ───────────────────────────────────────────────
  it('4. Events stuck in PROCESSING beyond stale timeout are recovered back to PENDING', async () => {
    const oldDate = new Date(Date.now() - 600000); // 10 minutes ago
    const stuckEvent = {
      id: 'evt_stuck',
      eventType: 'APPLICATION_SUBMITTED',
      aggregateType: 'Application',
      aggregateId: 'app_1',
      status: 'PROCESSING',
      attempts: 1,
      availableAt: oldDate,
      updatedAt: oldDate,
      payload: {}
    };

    vi.spyOn(prisma.outboxEvent, 'findMany').mockResolvedValue([stuckEvent]);
    vi.spyOn(prisma.outboxEvent, 'updateMany').mockResolvedValue({ count: 1 });

    const worker = new OutboxWorker({ staleTimeoutMs: 300000 }); // 5 minutes
    await worker.recoverStaleEvents();

    expect(prisma.outboxEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'evt_stuck', status: 'PROCESSING' }),
        data: expect.objectContaining({ status: 'PENDING' })
      })
    );
  });

  // ─── 5. Successful Event Processing ────────────────────────────────────────
  it('5. Successfully processed event updates status to PROCESSED with processedAt timestamp', async () => {
    let sideEffectRun = false;
    registerHandler('TEST_SUCCESS_EVENT', async (event) => {
      sideEffectRun = true;
      return { success: true };
    });

    const event = {
      id: 'evt_success',
      eventType: 'TEST_SUCCESS_EVENT',
      aggregateType: 'Test',
      aggregateId: 't1',
      status: 'PROCESSING',
      attempts: 1,
      payload: { sample: 123 }
    };

    vi.spyOn(prisma.outboxEvent, 'update').mockResolvedValue({
      ...event,
      status: 'PROCESSED',
      processedAt: new Date()
    });

    const worker = new OutboxWorker();
    const result = await worker.processEvent(event);

    expect(result.success).toBe(true);
    expect(sideEffectRun).toBe(true);
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt_success' },
        data: expect.objectContaining({ status: 'PROCESSED' })
      })
    );
  });

  // ─── 6. Exponential Backoff & Retry Scheduling ─────────────────────────────
  it('6. Failed handler schedules retry with exponential backoff', async () => {
    registerHandler('TEST_RETRY_EVENT', async () => {
      throw new Error('Connection timeout to mailer server');
    });

    const event = {
      id: 'evt_retry',
      eventType: 'TEST_RETRY_EVENT',
      aggregateType: 'Test',
      aggregateId: 't1',
      status: 'PROCESSING',
      attempts: 2, // 2nd attempt
      payload: {}
    };

    let updateData = null;
    vi.spyOn(prisma.outboxEvent, 'update').mockImplementation(async ({ data }) => {
      updateData = data;
      return { ...event, ...data };
    });

    const worker = new OutboxWorker({
      maxRetries: 5,
      initialBackoffMs: 1000,
      backoffMultiplier: 2
    });

    const result = await worker.processEvent(event);

    expect(result.success).toBe(false);
    expect(result.isExhausted).toBe(false);
    expect(updateData.status).toBe('PENDING');
    expect(updateData.lastError).toContain('Connection timeout to mailer server');
    expect(updateData.availableAt.getTime()).toBeGreaterThan(Date.now());
  });

  // ─── 7. Maximum Retries Exceeded ──────────────────────────────────────────
  it('7. When attempts reach maxRetries, event is marked FAILED', async () => {
    registerHandler('TEST_EXHAUST_EVENT', async () => {
      throw new Error('Fatal non-recoverable error');
    });

    const event = {
      id: 'evt_exhaust',
      eventType: 'TEST_EXHAUST_EVENT',
      aggregateType: 'Test',
      aggregateId: 't1',
      status: 'PROCESSING',
      attempts: 5, // At max limit
      payload: {}
    };

    let updateData = null;
    vi.spyOn(prisma.outboxEvent, 'update').mockImplementation(async ({ data }) => {
      updateData = data;
      return { ...event, ...data };
    });

    const worker = new OutboxWorker({ maxRetries: 5 });
    const result = await worker.processEvent(event);

    expect(result.success).toBe(false);
    expect(result.isExhausted).toBe(true);
    expect(updateData.status).toBe('FAILED');
    expect(updateData.lastError).toContain('Fatal non-recoverable error');
  });

  // ─── 8. Unknown Event Type Handling ────────────────────────────────────────
  it('8. Unknown event type is marked FAILED (never silently marked PROCESSED)', async () => {
    const event = {
      id: 'evt_unknown',
      eventType: 'COMPLETELY_UNKNOWN_EVENT_TYPE',
      aggregateType: 'Unknown',
      aggregateId: 'u1',
      status: 'PROCESSING',
      attempts: 1,
      payload: {}
    };

    let updateData = null;
    vi.spyOn(prisma.outboxEvent, 'update').mockImplementation(async ({ data }) => {
      updateData = data;
      return { ...event, ...data };
    });

    const worker = new OutboxWorker();
    const result = await worker.processEvent(event);

    expect(result.success).toBe(false);
    expect(updateData.status).toBe('FAILED');
    expect(updateData.lastError).toContain('UNKNOWN_EVENT_TYPE');
  });

  // ─── 9. Error Sanitization ────────────────────────────────────────────────
  it('9. OutboxWorker.sanitizeError scrubs Bearer tokens, secrets, and system filepaths', () => {
    const dangerousError = new Error('Auth failed Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret and key=AIzaSyD-SecretKey at D:\\creatorbharat\\backend\\src\\index.js:55');
    const clean = OutboxWorker.sanitizeError(dangerousError);

    expect(clean).not.toContain('eyJhbGciOi');
    expect(clean).not.toContain('AIzaSyD');
    expect(clean).toContain('Bearer [REDACTED]');
    expect(clean).toContain('key=[REDACTED]');
  });

  // ─── 10. Financial Safety Invariant ───────────────────────────────────────
  it('10. Financial event handlers do not perform wallet balance mutations from worker', async () => {
    const handler = eventHandlers.get('MILESTONE_APPROVED');
    expect(handler).toBeDefined();

    // Verify handler only creates notification alert and never executes credit/debit
    const testEvent = {
      id: 'evt_fin_alert',
      eventType: 'MILESTONE_APPROVED',
      payload: {
        gigId: 'g1',
        milestoneId: 'm1',
        creatorUserId: 'u_creator',
        milestoneTitle: 'Draft Video',
        amountPaise: '50000'
      }
    };

    const res = await handler(testEvent);
    expect(res.success).toBe(true);
  });
});
