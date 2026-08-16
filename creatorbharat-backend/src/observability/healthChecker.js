// 🩺 CreatorBharat SaaS Health & Readiness Probe Engine
import prisma from '../prisma.js';
import { validateConfig } from '../config/index.js';
import { logger } from './logger.js';
import { metrics } from './metrics.js';

export class HealthChecker {
  /**
   * Liveness Probe: Verifies whether the process is alive and accepting events.
   * Does NOT query database or external dependencies.
   */
  static getLiveness() {
    return {
      status: 'ok',
      service: 'creatorbharat-backend',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Readiness Probe: Verifies whether all critical systems (Database, Config) can serve traffic.
   * Fails with status 'unready' if database is unreachable or hung.
   *
   * @param {number} [timeoutMs=3000] - Maximum allowable response time for DB probe
   * @returns {Promise<{ isReady: boolean, status: string, checks: Object, timestamp: string }>}
   */
  static async getReadiness(timeoutMs = 3000) {
    const checks = {
      database: 'unknown',
      config: 'unknown'
    };

    let isReady = true;

    // 1. Config Validation
    try {
      const configValidation = validateConfig({ env: process.env.NODE_ENV });
      if (configValidation.valid) {
        checks.config = 'ok';
      } else {
        checks.config = 'degraded';
      }
    } catch (err) {
      checks.config = 'failed';
      isReady = false;
    }

    // 2. Database Connectivity with Strict Timeout
    try {
      const dbPromise = prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DATABASE_PROBE_TIMEOUT')), timeoutMs)
      );

      await Promise.race([dbPromise, timeoutPromise]);
      checks.database = 'ok';
    } catch (err) {
      checks.database = 'failed';
      isReady = false;
      metrics.recordDatabaseError();
      logger.warn('[HealthChecker.getReadiness] Database health probe failed:', { error: err.message });
    }

    return {
      isReady,
      status: isReady ? 'ok' : 'unready',
      checks,
      timestamp: new Date().toISOString()
    };
  }
}
