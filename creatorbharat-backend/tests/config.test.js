// 🇮🇳 CreatorBharat SaaS Configuration Unit Tests
import { describe, it, expect } from 'vitest';
import { validateConfig, ConfigurationError, config } from '../src/config/index.js';

describe('Centralized Configuration Layer Tests', () => {
  const validProdConfig = {
    app: {
      env: 'production',
      isProduction: true,
      isTest: false,
      isDevelopment: false,
      port: 4000,
      frontendUrl: 'https://creatorbharat.com',
      backendUrl: 'https://api.creatorbharat.com',
      allowedOrigins: ['https://creatorbharat.com'],
      sentryDsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      disableDripCron: false,
      adminEmail: 'admin@creatorbharat.com',
      adminPassword: 'secure-prod-password'
    },
    auth: {
      jwtSecret: 'a_very_long_secure_production_jwt_secret_64_bytes_minimum_length_12345',
      jwtRefreshSecret: 'a_very_long_secure_production_refresh_secret_64_bytes_minimum_length_12345',
      jwtExpiresIn: '15m',
      jwtRefreshExpiresIn: '7d',
      bcryptSaltRounds: 10,
      google: {
        clientId: 'mock_client_id.apps.googleusercontent.com',
        clientSecret: 'mock_client_secret',
        redirectUri: 'https://api.creatorbharat.com/api/auth/google/callback'
      }
    },
    database: {
      url: 'postgresql://prod_user:prod_pass@neon.tech:5432/creatorbharat_prod?sslmode=require'
    },
    payment: {
      razorpay: {
        keyId: 'rzp_live_1234567890abcdef',
        keySecret: 'secret_live_9876543210fedcba',
        webhookSecret: 'whsec_abcdef123456'
      }
    },
    mail: {
      resendApiKey: 're_123456789_abcdef',
      emailFrom: 'CreatorBharat <onboarding@creatorbharat.com>',
      sms: {
        fast2smsKey: '',
        twilioSid: '',
        twilioToken: '',
        twilioPhone: ''
      }
    },
    storage: {
      cloudinary: {
        cloudName: 'creatorbharat-cloud',
        apiKey: '123456789012345',
        apiSecret: 'abcdef123456789'
      },
      maxImageSize: 5242880,
      maxVideoSize: 52428800,
      localUploadsDir: 'public/uploads'
    },
    ai: {
      geminiApiKey: 'AIzaSyMockKeyForGeminiGeneration'
    }
  };

  // ─── 1. Valid Production Config ───────────────────────────────────────────
  it('1. Valid production configuration validates successfully without errors', () => {
    const result = validateConfig({ env: 'production', configObj: validProdConfig });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.missingKeys).toHaveLength(0);
  });

  // ─── 2. Missing JWT_SECRET Fails Closed in Production ──────────────────────
  it('2. Missing JWT_SECRET fails closed with ConfigurationError in production', () => {
    const invalidConfig = JSON.parse(JSON.stringify(validProdConfig));
    invalidConfig.auth.jwtSecret = '';

    expect(() => {
      validateConfig({ env: 'production', configObj: invalidConfig });
    }).toThrow(ConfigurationError);

    try {
      validateConfig({ env: 'production', configObj: invalidConfig });
    } catch (err) {
      expect(err.missingKeys).toContain('JWT_SECRET');
      expect(err.message).toContain('JWT_SECRET');
    }
  });

  // ─── 3. Missing JWT_REFRESH_SECRET Fails Closed in Production ──────────────
  it('3. Missing JWT_REFRESH_SECRET fails closed with ConfigurationError in production', () => {
    const invalidConfig = JSON.parse(JSON.stringify(validProdConfig));
    invalidConfig.auth.jwtRefreshSecret = '';

    expect(() => {
      validateConfig({ env: 'production', configObj: invalidConfig });
    }).toThrow(ConfigurationError);

    try {
      validateConfig({ env: 'production', configObj: invalidConfig });
    } catch (err) {
      expect(err.missingKeys).toContain('JWT_REFRESH_SECRET');
      expect(err.message).toContain('JWT_REFRESH_SECRET');
    }
  });

  // ─── 4. Missing DATABASE_URL Fails Closed ──────────────────────────────────
  it('4. Missing DATABASE_URL fails validation across all environments', () => {
    const invalidConfig = JSON.parse(JSON.stringify(validProdConfig));
    invalidConfig.database.url = '';

    expect(() => {
      validateConfig({ env: 'production', configObj: invalidConfig });
    }).toThrow(ConfigurationError);

    const devResult = validateConfig({ env: 'development', configObj: invalidConfig });
    expect(devResult.valid).toBe(false);
    expect(devResult.missingKeys).toContain('DATABASE_URL');
  });

  // ─── 5. Missing Payment Configuration Fails in Production ──────────────────
  it('5. Missing required Razorpay credentials fails closed in production', () => {
    const invalidConfig = JSON.parse(JSON.stringify(validProdConfig));
    invalidConfig.payment.razorpay.keyId = '';
    invalidConfig.payment.razorpay.keySecret = '';

    expect(() => {
      validateConfig({ env: 'production', configObj: invalidConfig });
    }).toThrow(ConfigurationError);

    try {
      validateConfig({ env: 'production', configObj: invalidConfig });
    } catch (err) {
      expect(err.missingKeys).toContain('RAZORPAY_KEY_ID');
      expect(err.missingKeys).toContain('RAZORPAY_SECRET');
    }
  });

  // ─── 6. Test Environment Remains Usable ───────────────────────────────────
  it('6. Test environment remains usable without throwing fatal production errors', () => {
    const testConfig = {
      ...validProdConfig,
      auth: { ...validProdConfig.auth, jwtSecret: 'test-secret', jwtRefreshSecret: 'test-refresh-secret' },
      payment: { razorpay: { keyId: '', keySecret: '', webhookSecret: '' } }
    };

    const result = validateConfig({ env: 'test', configObj: testConfig });
    expect(result.valid).toBe(true);
  });

  // ─── 7. Secrets Are Never Leaked in Error Messages ─────────────────────────
  it('7. Thrown error messages never include actual secret values or passwords', () => {
    const secretValue = 'super_secret_cleartext_credential_value_98765';
    const invalidConfig = JSON.parse(JSON.stringify(validProdConfig));
    invalidConfig.auth.jwtSecret = 'short'; // Too short (< 32 chars)
    invalidConfig.auth.jwtRefreshSecret = secretValue; // Valid length, but another param missing
    invalidConfig.database.url = ''; // Missing

    try {
      validateConfig({ env: 'production', configObj: invalidConfig });
    } catch (err) {
      expect(err.message).not.toContain(secretValue);
      expect(err.message).not.toContain('prod_pass');
    }
  });

  // ─── 8. Immutable Config Object ───────────────────────────────────────────
  it('8. Root config export and nested modules are frozen and immutable at runtime', () => {
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.app)).toBe(true);
    expect(Object.isFrozen(config.auth)).toBe(true);
    expect(Object.isFrozen(config.database)).toBe(true);
    expect(Object.isFrozen(config.payment)).toBe(true);
    expect(Object.isFrozen(config.mail)).toBe(true);
    expect(Object.isFrozen(config.storage)).toBe(true);
    expect(Object.isFrozen(config.ai)).toBe(true);

    // Attempting to mutate in strict mode should throw
    expect(() => {
      'use strict';
      config.app.port = 9999;
    }).toThrow();
  });
});
