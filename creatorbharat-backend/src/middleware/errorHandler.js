// 🚨 CreatorBharat SaaS Centralized Error Normalization Middleware
import { logger } from '../observability/logger.js';

export function errorHandlerMiddleware(err, req, res, next) {
  const requestId = req.id || 'N/A';
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // Determine user-facing error message
  let clientMessage = err.message || 'An unexpected server error occurred.';
  
  if (statusCode === 500 && isProduction) {
    clientMessage = 'An internal server error occurred. Our engineering team has been notified.';
  }

  // Log detailed error internally
  logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl || req.url}: ${err.message}`, err, {
    requestId,
    method: req.method,
    route: req.originalUrl || req.url,
    statusCode,
    event: 'UNHANDLED_EXCEPTION'
  });

  return res.status(statusCode).json({
    error: clientMessage,
    requestId,
    statusCode
  });
}
