// 📬 CreatorBharat SaaS Transactional Outbox Worker
import prisma from '../prisma.js';
import { eventHandlers } from './eventHandlers.js';
import { logger } from '../utils/logger.js';

export class OutboxWorker {
  constructor(options = {}) {
    this.pollIntervalMs = options.pollIntervalMs || 2000;
    this.batchSize = options.batchSize || 10;
    this.maxRetries = options.maxRetries || 5;
    this.initialBackoffMs = options.initialBackoffMs || 5000; // 5 seconds
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.maxBackoffMs = options.maxBackoffMs || 3600000; // 1 hour
    this.staleTimeoutMs = options.staleTimeoutMs || 300000; // 5 minutes
    this.maxConcurrency = options.maxConcurrency || 5;

    this.isRunning = false;
    this.pollTimer = null;
    this.inFlightCount = 0;
    this.lastProcessedAt = null;
    this.startedAt = null;
  }

  /**
   * Sanitizes error message to guarantee zero secret or credential leakage.
   */
  static sanitizeError(err) {
    if (!err) return 'UNKNOWN_ERROR';

    const rawMessage = typeof err === 'string' ? err : (err.message || 'HANDLER_EXECUTION_FAILED');
    
    // Scrub potential sensitive substrings
    let clean = rawMessage
      .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED]')
      .replace(/key=[A-Za-z0-9\-_.]+/gi, 'key=[REDACTED]')
      .replace(/password=[^&\s]+/gi, 'password=[REDACTED]')
      .replace(/secret=[^&\s]+/gi, 'secret=[REDACTED]')
      .replace(/https?:\/\/[^\s]+/gi, '[URL_REDACTED]');

    // Strip internal filesystem paths
    clean = clean.replace(/[A-Z]:\\[^\n]+/gi, '[PATH_REDACTED]');
    clean = clean.replace(/\/[a-zA-Z0-9_\-./]+/gi, '[PATH_REDACTED]');

    // Truncate to reasonable length for database column
    return clean.slice(0, 500);
  }

  /**
   * Calculates exponential backoff delay with jitter.
   */
  calculateBackoffDelay(attempts) {
    const exponent = Math.max(0, attempts - 1);
    const delay = Math.min(
      this.initialBackoffMs * Math.pow(this.backoffMultiplier, exponent),
      this.maxBackoffMs
    );
    // Add 10% jitter to prevent thundering herd
    const jitter = delay * (0.9 + Math.random() * 0.2);
    return Math.round(jitter);
  }

  /**
   * Recovers events stuck in PROCESSING state due to node/process crashes.
   */
  async recoverStaleEvents() {
    try {
      const staleThreshold = new Date(Date.now() - this.staleTimeoutMs);
      const staleEvents = await prisma.outboxEvent.findMany({
        where: {
          status: 'PROCESSING',
          updatedAt: { lte: staleThreshold }
        },
        take: 20
      });

      for (const event of staleEvents) {
        const recovered = await prisma.outboxEvent.updateMany({
          where: {
            id: event.id,
            status: 'PROCESSING',
            updatedAt: { lte: staleThreshold }
          },
          data: {
            status: 'PENDING',
            availableAt: new Date(),
            updatedAt: new Date()
          }
        });

        if (recovered.count > 0) {
          logger.warn(`[OutboxWorker] Recovered stale event ${event.id} (${event.eventType}) back to PENDING.`);
        }
      }
    } catch (err) {
      logger.error('[OutboxWorker.recoverStaleEvents] Error recovering stale events:', err.message);
    }
  }

  /**
   * Atomically claims eligible PENDING events for processing.
   */
  async claimEvents() {
    const now = new Date();

    const candidates = await prisma.outboxEvent.findMany({
      where: {
        status: 'PENDING',
        availableAt: { lte: now }
      },
      take: this.batchSize,
      orderBy: { createdAt: 'asc' }
    });

    const claimedEvents = [];

    for (const candidate of candidates) {
      const claimResult = await prisma.outboxEvent.updateMany({
        where: {
          id: candidate.id,
          status: 'PENDING',
          availableAt: { lte: now }
        },
        data: {
          status: 'PROCESSING',
          attempts: { increment: 1 },
          updatedAt: new Date()
        }
      });

      if (claimResult.count > 0) {
        // Fetch fresh copy with incremented attempts
        const claimed = await prisma.outboxEvent.findUnique({ where: { id: candidate.id } });
        if (claimed) {
          claimedEvents.push(claimed);
        }
      }
    }

    return claimedEvents;
  }

  /**
   * Processes a single claimed outbox event.
   */
  async processEvent(event) {
    const startTime = Date.now();
    const handler = eventHandlers.get(event.eventType);

    if (!handler) {
      const errorMsg = `UNKNOWN_EVENT_TYPE: No handler registered for "${event.eventType}".`;
      logger.warn(`[OutboxWorker] ${errorMsg} (Event ID: ${event.id})`);

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'FAILED',
          lastError: errorMsg,
          updatedAt: new Date()
        }
      });
      return { success: false, error: errorMsg };
    }

    try {
      // Execute the idempotent event handler
      await handler(event);

      // Atomically mark PROCESSED
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
          updatedAt: new Date()
        }
      });

      this.lastProcessedAt = new Date();
      const durationMs = Date.now() - startTime;
      logger.info(`[OutboxWorker] Event ${event.id} (${event.eventType}) processed in ${durationMs}ms.`);

      return { success: true, durationMs };
    } catch (err) {
      const sanitized = OutboxWorker.sanitizeError(err);
      const isExhausted = event.attempts >= this.maxRetries;

      if (isExhausted) {
        logger.error(`[OutboxWorker] Event ${event.id} (${event.eventType}) failed after ${event.attempts} attempts: ${sanitized}`);
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'FAILED',
            lastError: sanitized,
            updatedAt: new Date()
          }
        });
      } else {
        const delayMs = this.calculateBackoffDelay(event.attempts);
        const nextAvailableAt = new Date(Date.now() + delayMs);
        logger.warn(`[OutboxWorker] Event ${event.id} (${event.eventType}) failed (Attempt ${event.attempts}/${this.maxRetries}). Retrying in ${delayMs}ms. Error: ${sanitized}`);

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'PENDING',
            availableAt: nextAvailableAt,
            lastError: sanitized,
            updatedAt: new Date()
          }
        });
      }

      return { success: false, error: sanitized, isExhausted };
    }
  }

  /**
   * Executes a single polling and processing cycle.
   */
  async processBatch() {
    if (!this.isRunning) return;

    try {
      // 1. Stale event recovery check
      await this.recoverStaleEvents();

      // 2. Claim available events
      const events = await this.claimEvents();
      if (events.length === 0) return;

      // 3. Process events with concurrency bound
      const chunks = [];
      for (let i = 0; i < events.length; i += this.maxConcurrency) {
        chunks.push(events.slice(i, i + this.maxConcurrency));
      }

      for (const chunk of chunks) {
        if (!this.isRunning) break;
        this.inFlightCount += chunk.length;
        try {
          await Promise.all(chunk.map(e => this.processEvent(e)));
        } finally {
          this.inFlightCount -= chunk.length;
        }
      }
    } catch (err) {
      logger.error('[OutboxWorker.processBatch] Polling cycle error:', err.message);
    }
  }

  /**
   * Starts the polling worker loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startedAt = new Date();
    logger.info('[OutboxWorker] Outbox event worker started.');

    const poll = async () => {
      if (!this.isRunning) return;
      await this.processBatch();
      if (this.isRunning) {
        this.pollTimer = setTimeout(poll, this.pollIntervalMs);
      }
    };

    poll();
  }

  /**
   * Stops the worker gracefully.
   */
  async stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }

    // Wait for in-flight handlers to drain (up to 5 seconds)
    const drainTimeout = Date.now() + 5000;
    while (this.inFlightCount > 0 && Date.now() < drainTimeout) {
      await new Promise(r => setTimeout(r, 100));
    }

    logger.info('[OutboxWorker] Outbox event worker stopped gracefully.');
  }

  /**
   * Exposes operational health metrics.
   */
  async getStatus() {
    try {
      const [pendingCount, processingCount, processedCount, failedCount] = await Promise.all([
        prisma.outboxEvent.count({ where: { status: 'PENDING' } }),
        prisma.outboxEvent.count({ where: { status: 'PROCESSING' } }),
        prisma.outboxEvent.count({ where: { status: 'PROCESSED' } }),
        prisma.outboxEvent.count({ where: { status: 'FAILED' } })
      ]);

      const uptimeSeconds = this.startedAt ? Math.floor((Date.now() - this.startedAt.getTime()) / 1000) : 0;

      return {
        isRunning: this.isRunning,
        inFlightCount: this.inFlightCount,
        pendingCount,
        processingCount,
        processedCount,
        failedCount,
        lastProcessedAt: this.lastProcessedAt,
        uptimeSeconds
      };
    } catch (err) {
      return {
        isRunning: this.isRunning,
        error: err.message
      };
    }
  }
}

// Export default singleton instance
export const outboxWorker = new OutboxWorker();
