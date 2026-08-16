// 🆔 CreatorBharat SaaS Request Correlation Middleware
import crypto from 'crypto';

const REQUEST_ID_REGEX = /^[a-zA-Z0-9\-_.:]{1,64}$/;

/**
 * Validates and attaches a standard X-Request-ID to incoming HTTP requests.
 */
export function requestIdMiddleware(req, res, next) {
  const incomingId = req.headers['x-request-id'];

  let validId = null;
  if (typeof incomingId === 'string' && incomingId.trim().length > 0) {
    const trimmed = incomingId.trim();
    if (REQUEST_ID_REGEX.test(trimmed)) {
      validId = trimmed;
    }
  }

  const requestId = validId || crypto.randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}
