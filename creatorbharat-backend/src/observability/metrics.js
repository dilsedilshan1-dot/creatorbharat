// 📈 CreatorBharat SaaS Lightweight Bounded Metrics Engine
import { logger } from './logger.js';

// Route normalizer to avoid unbounded cardinality from parameterized paths
const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const CUID_REGEX = /c[a-z0-9]{24}/gi;
const NUMERIC_ID_REGEX = /\/[0-9]+(?=\/|$)/g;

export function normalizeRoutePattern(route) {
  if (!route || typeof route !== 'string') return 'UNKNOWN_ROUTE';
  
  // Strip query strings
  const pathOnly = route.split('?')[0];

  return pathOnly
    .replace(UUID_REGEX, ':id')
    .replace(CUID_REGEX, ':id')
    .replace(NUMERIC_ID_REGEX, '/:id')
    .slice(0, 100);
}

class MetricsRegistry {
  constructor() {
    this.reset();
  }

  reset() {
    this.httpRequestsTotal = 0;
    this.httpErrorsTotal = 0;
    this.slowRequestsTotal = 0;
    this.authFailuresTotal = 0;
    this.authzFailuresTotal = 0;
    this.databaseErrorsTotal = 0;
    
    // Bounded map by status class (2xx, 3xx, 4xx, 5xx)
    this.statusClassCounts = {
      '2xx': 0,
      '3xx': 0,
      '4xx': 0,
      '5xx': 0
    };

    // Bounded route histogram (max 100 entries)
    this.routeCounts = new Map();
    
    // Outbox metrics
    this.outboxProcessedTotal = 0;
    this.outboxFailedTotal = 0;
    this.outboxRetriedTotal = 0;

    this.startedAt = new Date();
  }

  /**
   * Records an HTTP request execution.
   */
  recordHttpRequest(method, route, statusCode, durationMs) {
    this.httpRequestsTotal++;
    
    const statusClass = `${Math.floor(statusCode / 100)}xx`;
    if (this.statusClassCounts[statusClass] !== undefined) {
      this.statusClassCounts[statusClass]++;
    }

    if (statusCode >= 400) {
      this.httpErrorsTotal++;
    }

    const slowThreshold = parseInt(process.env.SLOW_REQUEST_MS, 10) || 1000;
    if (durationMs > slowThreshold) {
      this.slowRequestsTotal++;
    }

    // Bounded route pattern key (e.g. "GET /api/creators/:id")
    const routePattern = `${method.toUpperCase()} ${normalizeRoutePattern(route)}`;
    if (this.routeCounts.size < 100 || this.routeCounts.has(routePattern)) {
      const current = this.routeCounts.get(routePattern) || 0;
      this.routeCounts.set(routePattern, current + 1);
    }
  }

  recordAuthFailure() {
    this.authFailuresTotal++;
  }

  recordAuthzFailure() {
    this.authzFailuresTotal++;
  }

  recordDatabaseError() {
    this.databaseErrorsTotal++;
  }

  recordOutboxProcessing(status) {
    if (status === 'PROCESSED') {
      this.outboxProcessedTotal++;
    } else if (status === 'FAILED') {
      this.outboxFailedTotal++;
    } else if (status === 'RETRY') {
      this.outboxRetriedTotal++;
    }
  }

  /**
   * Returns a sanitized summary of platform operational metrics.
   */
  getMetricsSummary() {
    const topRoutes = Array.from(this.routeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([route, count]) => ({ route, count }));

    return {
      uptimeSeconds: Math.floor((Date.now() - this.startedAt.getTime()) / 1000),
      http: {
        totalRequests: this.httpRequestsTotal,
        totalErrors: this.httpErrorsTotal,
        slowRequests: this.slowRequestsTotal,
        statusClasses: { ...this.statusClassCounts },
        topRoutes
      },
      security: {
        authFailures: this.authFailuresTotal,
        authzFailures: this.authzFailuresTotal
      },
      outbox: {
        processedTotal: this.outboxProcessedTotal,
        failedTotal: this.outboxFailedTotal,
        retriedTotal: this.outboxRetriedTotal
      },
      database: {
        errorsTotal: this.databaseErrorsTotal
      }
    };
  }
}

export const metrics = new MetricsRegistry();
