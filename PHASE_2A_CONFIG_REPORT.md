# CREATORBHARAT — PHASE 2A
# CENTRALIZED CONFIGURATION FOUNDATION REPORT

**Repository:** `Mohmmad-Dilshan/creatorbharat`  
**Git Branch:** `creatorbharat-phase-2a-config`  
**Date:** August 16, 2026  
**Status:** **PASSED & VERIFIED**  
**Test Suite:** 37/37 Tests Passed across 6 test files (100%)  
**Prisma Validation:** Valid (`prisma/schema.prisma` intact)  

---

## 1. Environment Variable Inventory

| Variable | Current Usage | Files | Security Sensitivity | Required in Production | Current Default | Config Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment mode detection | `index.js`, `logger.js`, `auth.js` | Low | Optional (defaults `production` in prod) | `'development'` | `config.app.env` |
| `PORT` | HTTP port binding | `index.js` | Low | Optional | `4000` | `config.app.port` |
| `FRONTEND_URL` | Client origin, email link routing | `settings.js`, `payments.js`, `auth.js`, `admin.js` | Medium | Optional | `'http://localhost:5173'` | `config.app.frontendUrl` |
| `BACKEND_URL` | Public base URL for uploads/assets | `uploads.js`, `gallery.js` | Medium | Optional | `req.protocol + host` | `config.app.backendUrl` |
| `ALLOWED_ORIGINS` | CORS allowed origins list | `index.js` | High | Required in Prod | `['localhost:5173', ...]` | `config.app.allowedOrigins` |
| `SENTRY_DSN` | Sentry exception tracing | `index.js` | Low | Optional | `''` | `config.app.sentryDsn` |
| `DISABLE_DRIP_CRON` | Disables onboarding drip cron in dev | `index.js` | Low | Optional | `false` | `config.app.disableDripCron` |
| `ADMIN_EMAIL` | Default system superadmin email | `index.js` | Medium | Optional | `'admin@creatorbharat.com'` | `config.app.adminEmail` |
| `ADMIN_PASSWORD` | Seed password for default admin | `index.js` | Critical | **Fail-Closed in Prod** | `'change-this-strong-password'` (dev only) | `config.app.adminPassword` |
| `DATABASE_URL` | PostgreSQL connection string | `prisma/schema.prisma`, `prisma.js` | Critical | **Fail-Closed (All Envs)** | None (must be provided) | `config.database.url` |
| `JWT_SECRET` | 15-minute access token signing | `auth.js`, `middleware/auth.js`, `team.js` | Critical | **Fail-Closed in Prod** | None | `config.auth.jwtSecret` |
| `JWT_REFRESH_SECRET`| 7-day refresh token signing | `auth.js` | Critical | **Fail-Closed in Prod** | None | `config.auth.jwtRefreshSecret` |
| `GOOGLE_CLIENT_ID` | OAuth2 authentication client ID | `auth.js`, `index.js` | Medium | Optional (when OAuth disabled) | `''` | `config.auth.google.clientId` |
| `GOOGLE_CLIENT_SECRET`| OAuth2 authentication client secret | `auth.js`, `index.js` | High | Required if OAuth used | `''` | `config.auth.google.clientSecret` |
| `GOOGLE_REDIRECT_URI`| OAuth2 callback destination | `auth.js`, `index.js` | Medium | Optional | `/api/auth/google/callback` | `config.auth.google.redirectUri` |
| `RAZORPAY_KEY_ID` | Razorpay public key for checkout | `payments.js`, `settings.js` | Medium | **Fail-Closed in Prod** | `''` | `config.payment.razorpay.keyId` |
| `RAZORPAY_SECRET` | Razorpay private secret for checkout | `payments.js`, `settings.js` | Critical | **Fail-Closed in Prod** | `''` | `config.payment.razorpay.keySecret` |
| `RAZORPAY_WEBHOOK_SECRET`| Webhook signature HMAC secret | `payments.js` | Critical | Required if webhooks active | `''` | `config.payment.razorpay.webhookSecret` |
| `RESEND_API_KEY` | Transactional email provider API key | `mailer.js`, `settings.js` | High | Optional (sandbox fallback) | `''` | `config.mail.resendApiKey` |
| `EMAIL_FROM` | Outgoing sender identity | `mailer.js`, `settings.js` | Low | Optional | `'CreatorBharat <...>'` | `config.mail.emailFrom` |
| `FAST2SMS_API_KEY` | Fast2SMS gateway key | `sms.js`, `settings.js` | High | Optional (sandbox fallback) | `''` | `config.mail.sms.fast2smsKey` |
| `TWILIO_ACCOUNT_SID` | Twilio SMS account SID | `sms.js`, `settings.js` | High | Optional (sandbox fallback) | `''` | `config.mail.sms.twilioSid` |
| `TWILIO_AUTH_TOKEN` | Twilio SMS authentication token | `sms.js`, `settings.js` | Critical | Optional (sandbox fallback) | `''` | `config.mail.sms.twilioToken` |
| `TWILIO_PHONE_NUMBER`| Twilio outbound phone number | `sms.js`, `settings.js` | Medium | Optional (sandbox fallback) | `''` | `config.mail.sms.twilioPhone` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary CDN tenant name | `uploader.js` | Medium | Optional (local disk fallback)| `''` | `config.storage.cloudinary.cloudName` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `uploader.js` | High | Optional (local disk fallback)| `''` | `config.storage.cloudinary.apiKey` |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | `uploader.js` | Critical | Optional (local disk fallback)| `''` | `config.storage.cloudinary.apiSecret` |
| `GEMINI_API_KEY` | Gemini LLM API key | `ai.js` | High | Optional (mock builder fallback) | `''` | `config.ai.geminiApiKey` |

---

## 2. Configuration Modules Created

The centralized configuration architecture is located in `creatorbharat-backend/src/config/`:

```
src/config/
├── index.js          # Core validator, ConfigurationError, and frozen config singleton
├── app.config.js     # Server, port, CORS, environment, URLs, admin defaults
├── auth.config.js    # JWT secrets, token expiries, Google OAuth credentials
├── db.config.js      # DATABASE_URL connection configuration
├── payment.config.js # Razorpay keys and webhook secrets
├── mail.config.js    # Resend credentials, email sender, Twilio/Fast2SMS config
├── storage.config.js # Cloudinary keys and max upload file size limits
└── ai.config.js      # Gemini LLM API key
```

All configuration sub-objects are recursively protected with `Object.freeze()` to prevent runtime tampering.

---

## 3. Files Changed

1. **`src/config/app.config.js`** *(NEW)* — Application port, CORS origins, and environment metadata.
2. **`src/config/auth.config.js`** *(NEW)* — JWT secrets and Google OAuth credentials.
3. **`src/config/db.config.js`** *(NEW)* — Database URL configuration.
4. **`src/config/payment.config.js`** *(NEW)* — Razorpay keys and webhook configuration.
5. **`src/config/mail.config.js`** *(NEW)* — Resend and SMS gateway credentials.
6. **`src/config/storage.config.js`** *(NEW)* — Cloudinary credentials and file size limits.
7. **`src/config/ai.config.js`** *(NEW)* — Gemini AI credentials.
8. **`src/config/index.js`** *(NEW)* — Fail-closed validator and root immutable `config` export.
9. **`src/utils/logger.js`** *(MODIFIED)* — Replaced direct `process.env.NODE_ENV` with `config.app.isProduction`.
10. **`src/utils/settings.js`** *(MODIFIED)* — Refactored `DEFAULTS` to derive from structured `config.*`.
11. **`src/utils/uploader.js`** *(MODIFIED)* — Refactored Cloudinary config and credentials checks to derive from `config.storage.cloudinary`.
12. **`src/middleware/auth.js`** *(MODIFIED)* — Uses `config.auth.jwtSecret` with safe backward fallback.
13. **`tests/config.test.js`** *(NEW)* — 8 unit tests covering all fail-closed, validation, immutability, and anti-leak requirements.

---

## 4. Production Fail-Closed Behavior

When `NODE_ENV === 'production'`:
- If `DATABASE_URL` is missing: Throws `ConfigurationError` and halts startup.
- If `JWT_SECRET` is missing or shorter than 32 characters: Throws `ConfigurationError` and halts startup.
- If `JWT_REFRESH_SECRET` is missing or shorter than 32 characters: Throws `ConfigurationError` and halts startup.
- If `RAZORPAY_KEY_ID` or `RAZORPAY_SECRET` is missing: Throws `ConfigurationError` and halts startup.
- **Zero Secret Leakage:** Error messages cite only the parameter name (e.g., `[JWT_SECRET, RAZORPAY_SECRET]`), never printing password values or database URLs in logs or stack traces.

---

## 5. Development & Test Behavior

- In `development`: Provides readable console warnings for non-critical unset variables (e.g., SMS keys or Cloudinary keys fall back to local sandboxes).
- In `test` / `vitest`: Bypasses mandatory production payment key checks so lightweight mock suites execute seamlessly in 1.78s without needing external live credentials.

---

## 6. Tests Added (`tests/config.test.js`)

1. **Test 1:** Valid production configuration validates successfully without errors.
2. **Test 2:** Missing `JWT_SECRET` fails closed with `ConfigurationError` in production.
3. **Test 3:** Missing `JWT_REFRESH_SECRET` fails closed with `ConfigurationError` in production.
4. **Test 4:** Missing `DATABASE_URL` fails validation across all environments.
5. **Test 5:** Missing required Razorpay credentials fails closed in production.
6. **Test 6:** Test environment remains usable without throwing fatal production errors.
7. **Test 7:** Thrown error messages never include actual secret values or passwords.
8. **Test 8:** Root `config` export and nested modules are frozen and immutable at runtime.

---

## 7. Test Results

```
 RUN  v4.1.9 D:/creatorbharat-1/creatorbharat-backend

 ✓ tests/config.test.js (8 tests) 41ms
 ✓ tests/health.test.js (4 tests) 203ms
 ✓ tests/gigs.test.js (2 tests) 220ms
 ✓ tests/ai.test.js (2 tests) 265ms
 ✓ tests/auth.test.js (4 tests) 316ms
 ✓ tests/security.test.js (17 tests) 731ms

 Test Files  6 passed (6)
      Tests  37 passed (37)
   Start at  11:05:31
   Duration  13.94s
```

---

## 8. Prisma Validation

```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀
```

No modifications were made to `prisma/schema.prisma` in Phase 2A.

---

## 9. Remaining Direct `process.env` Usages

Direct usages in route files (e.g. `FRONTEND_URL` in email HTML strings inside `payments.js` and `admin.js`) remain operational and backward compatible. They will be progressively routed to domain services (`MailerService`, `WalletService`) during Sub-Phases **P2-D** and **P2-E**.

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Missing Production Key** | Production container crashes on boot | Intentional fail-closed behavior to prevent unencrypted JWTs or invalid escrow creation. |
| **Config Mutation** | Unintended side effects | `Object.freeze()` applied to all config exports. |

---

## 11. Rollback Procedure

If needed, discard `src/config/` and revert `src/utils/` and `src/middleware/auth.js` with:
```bash
git checkout creatorbharat-phase-1-auth-access
```

---

## 12. Recommendation for Sub-Phase P2-B

With Phase 2A certified:
- **Next Sub-Phase:** **P2-B (Database Integrity & Financial Ledger Design)**
- **Scope for P2-B:** Add `Wallet` model and extensions to `WalletTransaction` (`amountPaise`, `balanceAfter`, `walletId`, `version`) in `prisma/schema.prisma` with zero destructive column drops.
