// ⚙️ CreatorBharat — Dynamic Settings Loader
// Reads SystemSetting from DB, caches in memory (60s TTL) for performance.
// Admin panel changes → DB updated → next request gets fresh settings.

import prisma from '../prisma.js';
import config from '../config/index.js';

let cachedSettings = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const DEFAULTS = {
  id: 'singleton',
  siteName: 'CreatorBharat',
  supportEmail: 'support@creatorbharat.com',
  frontendUrl: config.app.frontendUrl,
  logoUrl: '',
  footerEmail: 'hello@creatorbharat.com',
  proMembershipPrice: 49,
  campaignBoostPrice: 99,
  featuredSlotPrice: 199,
  platformFee: 10,
  enableAIAssistant: true,
  enableEscrowSystem: true,
  maintenanceMode: false,
  enableEmail: true,
  enableSMS: true,
  razorpayKeyId: config.payment.razorpay.keyId,
  razorpaySecret: config.payment.razorpay.keySecret,
  razorpayMode: 'test',
  resendApiKey: config.mail.resendApiKey,
  emailFrom: config.mail.emailFrom,
  smsProvider: 'fast2sms',
  fast2smsKey: config.mail.sms.fast2smsKey,
  twilioSid: config.mail.sms.twilioSid,
  twilioToken: config.mail.sms.twilioToken,
  twilioPhone: config.mail.sms.twilioPhone,
};

/**
 * Get current platform settings. Uses memory cache (60s TTL).
 * Falls back to DEFAULTS if DB fetch fails.
 * @returns {Promise<Object>} settings object
 */
export async function getSettings() {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiry) {
    return cachedSettings;
  }

  try {
    let row = await prisma.systemSetting.findUnique({ where: { id: 'singleton' } });
    if (!row) {
      // First time: create the singleton row with defaults
      row = await prisma.systemSetting.create({
        data: { id: 'singleton' }
      });
    }

    // Merge: prefer DB values, fallback to env/defaults for empty strings
    const merged = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS)) {
      const dbVal = row[key];
      if (dbVal !== undefined && dbVal !== null) {
        // For strings: use DB value only if non-empty, else keep env/default
        if (typeof dbVal === 'string' && dbVal.trim() === '') {
          // keep merged[key] (env/default)
        } else {
          merged[key] = dbVal;
        }
      }
    }

    cachedSettings = merged;
    cacheExpiry = now + CACHE_TTL_MS;
    return merged;
  } catch (err) {
    console.error('[Settings] Failed to load from DB, using defaults:', err.message);
    return DEFAULTS;
  }
}

/**
 * Invalidate settings cache (call after admin updates settings).
 */
export function invalidateSettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}
