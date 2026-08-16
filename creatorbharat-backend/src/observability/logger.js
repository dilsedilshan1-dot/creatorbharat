// 📊 CreatorBharat SaaS Centralized Structured Logging & Redaction Engine
import config from '../config/index.js';

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LEVEL_NAMES = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR'
};

// Sensitive property keys that must always be redacted
const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'pass',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'jwt',
  'secret',
  'apikey',
  'api_key',
  'key',
  'razorpay_secret',
  'razorpaysecret',
  'razorpay_key_id',
  'razorpaykeyid',
  'database_url',
  'databaseurl',
  'cloudinary_url',
  'cloudinaryurl',
  'sentry_dsn',
  'sentrydsn',
  'gemini_api_key',
  'geminiapikey',
  'aadhaar',
  'aadhaarurl',
  'pan',
  'panurl',
  'cvv',
  'cardnumber',
  'otp'
]);

/**
 * Deeply sanitizes an object or string to remove sensitive information.
 */
export function sanitizeLogData(data, seen = new WeakSet()) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return scrubSensitiveString(data);
  }

  if (typeof data !== 'object') return data;

  // Prevent circular references
  if (seen.has(data)) return '[CIRCULAR]';
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item, seen));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value, seen);
    } else if (typeof value === 'string') {
      sanitized[key] = scrubSensitiveString(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Scrubs tokens, passwords, database URLs, and file paths from raw strings.
 */
function scrubSensitiveString(str) {
  if (!str || typeof str !== 'string') return str;

  return str
    .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED]')
    .replace(/(postgres|postgresql|mysql|mongodb):\/\/[^@\s]+@/gi, '$1://[REDACTED_USER_PASS]@')
    .replace(/key=[A-Za-z0-9\-_.]+/gi, 'key=[REDACTED]')
    .replace(/secret=[A-Za-z0-9\-_.]+/gi, 'secret=[REDACTED]')
    .replace(/password=[^&\s]+/gi, 'password=[REDACTED]')
    .replace(/otp=[0-9]{4,6}/gi, 'otp=[REDACTED]')
    .replace(/([0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4})/g, '[REDACTED_AADHAAR]')
    .replace(/([A-Z]{5}[0-9]{4}[A-Z]{1})/g, '[REDACTED_PAN]');
}

class Logger {
  constructor() {
    this.service = 'creatorbharat-backend';
    this.env = process.env.NODE_ENV || 'development';
    this.isProduction = this.env === 'production';
    
    // Determine active log level from env
    const configuredLevel = (process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug')).toUpperCase();
    this.minLevel = LOG_LEVELS[configuredLevel] !== undefined ? LOG_LEVELS[configuredLevel] : LOG_LEVELS.INFO;
  }

  /**
   * Sets minimum logging level dynamically.
   */
  setLevel(levelName) {
    const upper = (levelName || '').toUpperCase();
    if (LOG_LEVELS[upper] !== undefined) {
      this.minLevel = LOG_LEVELS[upper];
    }
  }

  debug(message, meta = {}) {
    this._log(LOG_LEVELS.DEBUG, message, meta);
  }

  info(message, meta = {}) {
    this._log(LOG_LEVELS.INFO, message, meta);
  }

  warn(message, meta = {}) {
    this._log(LOG_LEVELS.WARN, message, meta);
  }

  error(message, err = null, meta = {}) {
    let errorMeta = { ...meta };
    if (err instanceof Error) {
      errorMeta.errorMessage = err.message;
      if (!this.isProduction) {
        errorMeta.errorStack = err.stack;
      }
    } else if (err && typeof err === 'object') {
      errorMeta = { ...errorMeta, ...err };
    }
    this._log(LOG_LEVELS.ERROR, message, errorMeta);
  }

  _log(level, message, meta = {}) {
    if (level < this.minLevel) return;

    const levelName = LEVEL_NAMES[level] || 'INFO';
    const timestamp = new Date().toISOString();
    const sanitizedMeta = sanitizeLogData(meta);
    const sanitizedMessage = scrubSensitiveString(message);

    const logObject = {
      timestamp,
      level: levelName,
      service: this.service,
      environment: this.env,
      message: sanitizedMessage,
      ...(sanitizedMeta.requestId ? { requestId: sanitizedMeta.requestId } : {}),
      ...(sanitizedMeta.event ? { event: sanitizedMeta.event } : {}),
      ...(sanitizedMeta.durationMs !== undefined ? { durationMs: sanitizedMeta.durationMs } : {}),
      ...(sanitizedMeta.statusCode !== undefined ? { statusCode: sanitizedMeta.statusCode } : {}),
      ...(sanitizedMeta.route ? { route: sanitizedMeta.route } : {}),
      ...(sanitizedMeta.method ? { method: sanitizedMeta.method } : {}),
      ...(sanitizedMeta.userId ? { userId: sanitizedMeta.userId } : {}),
      ...(sanitizedMeta.actorId ? { actorId: sanitizedMeta.actorId } : {}),
      ...(sanitizedMeta.jobId ? { jobId: sanitizedMeta.jobId } : {}),
      ...(sanitizedMeta.outboxEventId ? { outboxEventId: sanitizedMeta.outboxEventId } : {}),
      ...sanitizedMeta
    };

    if (this.isProduction) {
      console.log(JSON.stringify(logObject));
    } else {
      const color = level === LOG_LEVELS.ERROR ? '\x1b[31m' : level === LOG_LEVELS.WARN ? '\x1b[33m' : level === LOG_LEVELS.DEBUG ? '\x1b[90m' : '\x1b[36m';
      const reset = '\x1b[0m';
      const reqTag = logObject.requestId ? ` [${logObject.requestId.slice(0, 8)}]` : '';
      const extraMeta = { ...logObject };
      delete extraMeta.timestamp;
      delete extraMeta.level;
      delete extraMeta.service;
      delete extraMeta.environment;
      delete extraMeta.message;
      delete extraMeta.requestId;

      const metaStr = Object.keys(extraMeta).length ? ` | ${JSON.stringify(extraMeta)}` : '';
      console.log(`${color}[${timestamp}] [${levelName}]${reset}${reqTag} ${sanitizedMessage}${metaStr}`);
    }
  }
}

export const logger = new Logger();
