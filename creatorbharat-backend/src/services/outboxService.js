// 📬 CreatorBharat SaaS Transactional Outbox Service
import prisma from '../prisma.js';

export class OutboxService {
  /**
   * Sanitizes event payload to prevent storing credentials, tokens, or raw KYC documents.
   */
  static sanitizePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return payload || {};
    }

    const sanitized = Array.isArray(payload) ? [...payload] : { ...payload };
    const SENSITIVE_PATTERNS = [
      'password', 'token', 'jwt', 'secret',
      'key', 'aadhaar', 'pan', 'authorization', 'cookie'
    ];

    for (const key of Object.keys(sanitized)) {
      const lower = key.toLowerCase();
      const isSensitive = SENSITIVE_PATTERNS.some(pat => lower.includes(pat));
      if (isSensitive) {
        delete sanitized[key];
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizePayload(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Publishes an event to the OutboxEvent table atomically within a transaction.
   *
   * @param {Object} client - Prisma client or transaction instance ($transaction tx)
   * @param {Object} eventData
   * @param {string} eventData.eventType - The type of the domain event
   * @param {string} eventData.aggregateType - The aggregate model name (e.g. 'Application', 'GigMilestone')
   * @param {string} eventData.aggregateId - The primary key of the target entity
   * @param {Object} eventData.payload - Event payload data
   * @param {string} [eventData.idempotencyKey] - Unique deduplication key
   * @param {Date} [eventData.availableAt] - Immediate or delayed delivery time
   */
  static async publish(client, { eventType, aggregateType, aggregateId, payload = {}, idempotencyKey = null, availableAt = null }) {
    const db = client || prisma;

    if (!eventType || typeof eventType !== 'string') {
      throw new Error('OutboxService: eventType is required.');
    }
    if (!aggregateType || typeof aggregateType !== 'string') {
      throw new Error('OutboxService: aggregateType is required.');
    }
    if (!aggregateId || typeof aggregateId !== 'string') {
      throw new Error('OutboxService: aggregateId is required.');
    }

    const cleanPayload = this.sanitizePayload(payload);

    return db.outboxEvent.create({
      data: {
        eventType,
        aggregateType,
        aggregateId,
        idempotencyKey: idempotencyKey || null,
        payload: cleanPayload,
        status: 'PENDING',
        attempts: 0,
        availableAt: availableAt || new Date()
      }
    });
  }
}
