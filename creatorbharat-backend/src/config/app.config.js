// 🇮🇳 CreatorBharat SaaS App Configuration
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isTest = env === 'test' || process.env.VITEST === 'true';
const isDevelopment = !isProduction && !isTest;

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:4000'
];

export const appConfig = Object.freeze({
  env,
  isProduction,
  isTest,
  isDevelopment,
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || (isProduction ? 'https://creatorbharat.com' : 'http://localhost:5173'),
  backendUrl: process.env.BACKEND_URL || (isProduction ? 'https://api.creatorbharat.com' : 'http://localhost:4000'),
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : defaultAllowedOrigins,
  sentryDsn: process.env.SENTRY_DSN || '',
  disableDripCron: process.env.DISABLE_DRIP_CRON === 'true',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@creatorbharat.com',
  adminPassword: process.env.ADMIN_PASSWORD || (isProduction ? '' : 'change-this-strong-password')
});
