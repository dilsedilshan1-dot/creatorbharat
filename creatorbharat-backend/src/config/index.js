// 🇮🇳 CreatorBharat SaaS Centralized Configuration Layer
import dotenv from 'dotenv';
import { appConfig } from './app.config.js';
import { authConfig } from './auth.config.js';
import { dbConfig } from './db.config.js';
import { paymentConfig } from './payment.config.js';
import { mailConfig } from './mail.config.js';
import { storageConfig } from './storage.config.js';
import { aiConfig } from './ai.config.js';

// Ensure dotenv is initialized if not already loaded
dotenv.config();

export class ConfigurationError extends Error {
  constructor(message, missingKeys = []) {
    super(message);
    this.name = 'ConfigurationError';
    this.missingKeys = missingKeys;
  }
}

/**
 * Validates critical environment configuration.
 * Fails closed in production when required secrets or parameters are missing.
 * Never leaks secret values in error messages or logs.
 *
 * @param {Object} [options]
 * @param {string} [options.env] - Target environment (production, development, test)
 * @param {Object} [options.configObj] - Optional configuration override for testing
 * @returns {{ valid: boolean, errors: string[], missingKeys: string[] }}
 */
export function validateConfig(options = {}) {
  const targetEnv = options.env || process.env.NODE_ENV || 'development';
  const isProd = targetEnv === 'production';
  const isTestEnv = targetEnv === 'test' || process.env.VITEST === 'true';
  const activeConfig = options.configObj || {
    app: appConfig,
    auth: authConfig,
    database: dbConfig,
    payment: paymentConfig,
    mail: mailConfig,
    storage: storageConfig,
    ai: aiConfig
  };

  const missingKeys = [];
  const errors = [];

  // 1. Mandatory in ALL environments (including test/dev when connecting to DB)
  if (!activeConfig.database.url || activeConfig.database.url.trim() === '') {
    missingKeys.push('DATABASE_URL');
    errors.push('DATABASE_URL is required for database connectivity.');
  }

  // 2. Critical Production Security Requirements (Fail-Closed)
  if (isProd) {
    if (!activeConfig.auth.jwtSecret || activeConfig.auth.jwtSecret.trim() === '') {
      missingKeys.push('JWT_SECRET');
      errors.push('JWT_SECRET is required in production.');
    } else if (activeConfig.auth.jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production.');
    }

    if (!activeConfig.auth.jwtRefreshSecret || activeConfig.auth.jwtRefreshSecret.trim() === '') {
      missingKeys.push('JWT_REFRESH_SECRET');
      errors.push('JWT_REFRESH_SECRET is required in production.');
    } else if (activeConfig.auth.jwtRefreshSecret.length < 32) {
      errors.push('JWT_REFRESH_SECRET must be at least 32 characters in production.');
    }

    if (!activeConfig.payment.razorpay.keyId || activeConfig.payment.razorpay.keyId.trim() === '') {
      missingKeys.push('RAZORPAY_KEY_ID');
      errors.push('RAZORPAY_KEY_ID is required for production payments.');
    }

    if (!activeConfig.payment.razorpay.keySecret || activeConfig.payment.razorpay.keySecret.trim() === '') {
      missingKeys.push('RAZORPAY_SECRET');
      errors.push('RAZORPAY_SECRET is required for production payments.');
    }
  } else if (!isTestEnv) {
    // Development Warnings
    if (!activeConfig.auth.jwtSecret) {
      console.warn('[Config Warning]: JWT_SECRET is not set in development. Using runtime fallback.');
    }
  }

  if (missingKeys.length > 0 && isProd) {
    throw new ConfigurationError(
      `Fatal Configuration Failure: Missing required environment variables: [${missingKeys.join(', ')}]. Server refusing to start.`,
      missingKeys
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    missingKeys
  };
}

// Perform boot validation
if (process.env.NODE_ENV === 'production') {
  validateConfig({ env: 'production' });
}

// Unified immutable configuration export
export const config = Object.freeze({
  app: appConfig,
  auth: authConfig,
  database: dbConfig,
  payment: paymentConfig,
  mail: mailConfig,
  storage: storageConfig,
  ai: aiConfig
});

export default config;
