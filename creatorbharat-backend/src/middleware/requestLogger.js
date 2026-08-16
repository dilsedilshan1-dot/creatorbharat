// ⏱️ CreatorBharat SaaS Safe Request Lifecycle Logging Middleware
import { logger } from '../observability/logger.js';
import { metrics, normalizeRoutePattern } from '../observability/metrics.js';

const SENSITIVE_QUERY_PARAMS = new Set([
  'token',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'password',
  'secret',
  'apikey',
  'api_key',
  'signature',
  'code',
  'otp'
]);

/**
 * Strips sensitive query parameter values from URL for safe logging.
 */
export function sanitizeUrl(originalUrl) {
  if (!originalUrl || typeof originalUrl !== 'string') return '/';
  
  const [path, queryString] = originalUrl.split('?');
  if (!queryString) return path;

  const params = new URLSearchParams(queryString);
  for (const [key] of params.entries()) {
    const lower = key.toLowerCase();
    if (SENSITIVE_QUERY_PARAMS.has(lower)) {
      params.set(key, '[REDACTED]');
    }
  }

  const cleanQuery = params.toString();
  return cleanQuery ? `${path}?${cleanQuery}` : path;
}

export function requestLoggerMiddleware(req, res, next) {
  const startTime = Date.now();
  const requestId = req.id || 'N/A';
  const method = req.method;
  const rawUrl = req.originalUrl || req.url || '/';
  const safeUrl = sanitizeUrl(rawUrl);

  // Hook into response completion
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const routePattern = normalizeRoutePattern(rawUrl);

    // Record metrics
    metrics.recordHttpRequest(method, routePattern, statusCode, durationMs);

    const logMeta = {
      requestId,
      method,
      route: safeUrl,
      statusCode,
      durationMs
    };

    const slowThreshold = parseInt(process.env.SLOW_REQUEST_MS, 10) || 1000;

    if (durationMs > slowThreshold) {
      logger.warn(`[SLOW REQUEST] ${method} ${safeUrl} completed in ${durationMs}ms with status ${statusCode}`, {
        ...logMeta,
        event: 'HTTP_SLOW_REQUEST'
      });
    } else if (statusCode >= 500) {
      logger.error(`[HTTP 5XX] ${method} ${safeUrl} failed with status ${statusCode} in ${durationMs}ms`, null, {
        ...logMeta,
        event: 'HTTP_SERVER_ERROR'
      });
    } else if (statusCode >= 400) {
      logger.warn(`[HTTP 4XX] ${method} ${safeUrl} returned status ${statusCode} in ${durationMs}ms`, {
        ...logMeta,
        event: 'HTTP_CLIENT_ERROR'
      });
    } else {
      logger.info(`[HTTP] ${method} ${safeUrl} ${statusCode} ${durationMs}ms`, {
        ...logMeta,
        event: 'HTTP_REQUEST_COMPLETED'
      });
    }
  });

  next();
}
