// 📊 CreatorBharat SaaS Observability, Health Monitoring & Reliability Test Suite
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import prisma from '../src/prisma.js';
import { sanitizeLogData, logger } from '../src/observability/logger.js';
import { requestIdMiddleware } from '../src/middleware/requestId.js';
import { sanitizeUrl } from '../src/middleware/requestLogger.js';
import { metrics, normalizeRoutePattern } from '../src/observability/metrics.js';
import { HealthChecker } from '../src/observability/healthChecker.js';
import { OutboxMonitor } from '../src/observability/outboxMonitor.js';
import { StorageMonitor } from '../src/observability/storageMonitor.js';
import { FinancialMonitor } from '../src/observability/financialMonitor.js';

describe('Phase 2I — Observability, Health & Reliability Suite', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
    metrics.reset();
  });

  // ─── 1. Request ID Generation, Validation & Propagation ───────────────────
  describe('Request Correlation (X-Request-ID)', () => {
    it('1. Generates a crypto UUID if no X-Request-ID is provided', () => {
      const req = { headers: {} };
      const res = { setHeader: vi.fn() };
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(req.id.length).toBeGreaterThan(20);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.id);
      expect(next).toHaveBeenCalled();
    });

    it('2. Validates and preserves safe incoming X-Request-ID', () => {
      const customId = 'req-trace-prod-12345';
      const req = { headers: { 'x-request-id': customId } };
      const res = { setHeader: vi.fn() };
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBe(customId);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', customId);
    });

    it('3. Replaces oversized or malicious incoming request IDs with clean UUID', () => {
      const maliciousId = 'a'.repeat(100) + '<script>alert(1)</script>';
      const req = { headers: { 'x-request-id': maliciousId } };
      const res = { setHeader: vi.fn() };
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).not.toBe(maliciousId);
      expect(req.id.length).toBeLessThan(40);
    });

    it('4. Propagates X-Request-ID through HTTP response header', async () => {
      const res = await request(app).get('/health/live');
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.status).toBe(200);
    });
  });

  // ─── 2. Sensitive Data Redaction in Logging ────────────────────────────────
  describe('Structured Logging Redaction Engine', () => {
    it('5. Redacts passwords, tokens, API keys, and secrets from nested objects', () => {
      const sensitivePayload = {
        email: 'admin@creatorbharat.com',
        password: 'SuperSecretPassword!',
        token: 'eyJhbGciOi...',
        apiKey: 'AIzaSy...',
        razorpay_secret: 'rzp_secret_live_999',
        nested: {
          refreshToken: 'refresh_tok_123',
          aadhaarUrl: 'https://storage.com/aadhaar.pdf',
          pan: 'ABCDE1234F'
        }
      };

      const sanitized = sanitizeLogData(sensitivePayload);
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.razorpay_secret).toBe('[REDACTED]');
      expect(sanitized.nested.refreshToken).toBe('[REDACTED]');
      expect(sanitized.nested.aadhaarUrl).toBe('[REDACTED]');
    });

    it('6. Redacts sensitive query parameters from logged URLs', () => {
      const rawUrl = '/api/auth/verify?token=secret123&otp=4567&ref=google&apiKey=abc';
      const cleanUrl = sanitizeUrl(rawUrl);

      expect(cleanUrl).toContain('token=%5BREDACTED%5D');
      expect(cleanUrl).toContain('otp=%5BREDACTED%5D');
      expect(cleanUrl).toContain('apiKey=%5BREDACTED%5D');
      expect(cleanUrl).toContain('ref=google');
    });

    it('7. Redacts database credentials and bearer tokens from raw error strings', () => {
      const rawErr = 'Failed connecting to postgres://admin:superSecret123@neon.db.io/main with Bearer eyJhbGciOi...';
      const sanitized = sanitizeLogData(rawErr);

      expect(sanitized).not.toContain('superSecret123');
      expect(sanitized).toContain('postgres://[REDACTED_USER_PASS]@neon.db.io/main');
      expect(sanitized).toContain('Bearer [REDACTED]');
    });
  });

  // ─── 3. Health & Readiness Probes ──────────────────────────────────────────
  describe('Health Probes (Liveness vs Readiness)', () => {
    it('8. GET /health/live returns 200 without requiring database connectivity', async () => {
      const liveness = HealthChecker.getLiveness();
      expect(liveness.status).toBe('ok');
      expect(liveness).toHaveProperty('uptimeSeconds');

      const res = await request(app).get('/health/live').expect(200);
      expect(res.body.status).toBe('ok');
    });

    it('9. GET /health/ready returns 200 when database probe succeeds', async () => {
      vi.spyOn(prisma, '$queryRaw').mockResolvedValue([{ 1: 1 }]);

      const res = await request(app).get('/health/ready').expect(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.checks.database).toBe('ok');
    });

    it('10. GET /health/ready returns 503 when database is disconnected or hangs', async () => {
      vi.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('Connection terminated'));

      const res = await request(app).get('/health/ready').expect(503);
      expect(res.body.status).toBe('unready');
      expect(res.body.checks.database).toBe('failed');
    });

    it('11. Database probe respects timeout without hanging indefinitely', async () => {
      vi.spyOn(prisma, '$queryRaw').mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      );

      const readiness = await HealthChecker.getReadiness(50); // 50ms test timeout
      expect(readiness.isReady).toBe(false);
      expect(readiness.checks.database).toBe('failed');
    });
  });

  // ─── 4. Metrics & Cardinality Protection ──────────────────────────────────
  describe('Application Metrics & Cardinality Guard', () => {
    it('12. Normalizes dynamic route patterns to prevent unbounded label explosion', () => {
      const url1 = '/api/creators/cm3abcdef1234567890123456/profile';
      const url2 = '/api/campaigns/12345/pitch';
      const url3 = '/api/uploads/7b1a2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d.png';

      expect(normalizeRoutePattern(url1)).toBe('/api/creators/:id/profile');
      expect(normalizeRoutePattern(url2)).toBe('/api/campaigns/:id/pitch');
      expect(normalizeRoutePattern(url3)).toBe('/api/uploads/:id.png');
    });

    it('13. Increments request counts, status class histograms, and error counters', () => {
      metrics.recordHttpRequest('GET', '/api/creators', 200, 45);
      metrics.recordHttpRequest('POST', '/api/auth/login', 401, 120);
      metrics.recordHttpRequest('GET', '/api/analytics', 500, 1500);

      const summary = metrics.getMetricsSummary();
      expect(summary.http.totalRequests).toBe(3);
      expect(summary.http.totalErrors).toBe(2);
      expect(summary.http.statusClasses['2xx']).toBe(1);
      expect(summary.http.statusClasses['4xx']).toBe(1);
      expect(summary.http.statusClasses['5xx']).toBe(1);
      expect(summary.http.slowRequests).toBe(1);
    });
  });

  // ─── 5. Subsystem Telemetry Monitors ──────────────────────────────────────
  describe('Subsystem Observability Monitors', () => {
    it('14. OutboxMonitor detects stale processing events and backlog alerts', async () => {
      vi.spyOn(prisma.outboxEvent, 'groupBy').mockResolvedValue([
        { status: 'PENDING', _count: { status: 80 } },
        { status: 'PROCESSING', _count: { status: 5 } }
      ]);
      vi.spyOn(prisma.outboxEvent, 'count').mockResolvedValue(3); // 3 stale events
      vi.spyOn(prisma.outboxEvent, 'findFirst').mockResolvedValue({ createdAt: new Date(Date.now() - 60000) });

      const diag = await OutboxMonitor.getOutboxDiagnostics({ backlogWarningThreshold: 50 });
      expect(diag.status).toBe('DEGRADED');
      expect(diag.staleProcessingCount).toBe(3);
      expect(diag.alerts.backlogWarning).toBe(true);
      expect(diag.alerts.staleEventsDetected).toBe(true);
    });

    it('15. StorageMonitor verifies local writability and aggregates media counts', async () => {
      vi.spyOn(prisma.mediaAsset, 'groupBy').mockResolvedValue([
        { resourceType: 'IMAGE', _count: { resourceType: 15 } }
      ]);
      vi.spyOn(prisma.mediaAsset, 'count').mockResolvedValue(15);

      const diag = await StorageMonitor.getStorageDiagnostics();
      expect(diag.status).toBe('HEALTHY');
      expect(diag.mediaAssets.images).toBe(15);
      expect(diag.mediaAssets.total).toBe(15);
    });

    it('16. FinancialMonitor performs strictly READ-ONLY telemetry without mutations', async () => {
      vi.spyOn(prisma.wallet, 'count').mockResolvedValue(42);
      vi.spyOn(prisma.walletTransaction, 'count').mockResolvedValue(128);
      vi.spyOn(prisma.payment, 'count').mockResolvedValue(5);

      const diag = await FinancialMonitor.getFinancialDiagnostics();
      expect(diag.status).toBe('HEALTHY');
      expect(diag.telemetry.totalWallets).toBe(42);
      expect(diag.telemetry.totalTransactions).toBe(128);
      expect(diag.mode).toBe('READ_ONLY_OBSERVABILITY');
    });
  });
});
