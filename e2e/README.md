# CreatorBharat E2E Tests (Playwright)

Added as part of **P2.5 Blocker F-03 remediation**.

## Requirements

- Node.js with `@playwright/test` installed (root workspace)
- Playwright Chromium browser installed
- Both dev servers running locally

## Setup

### 1. Install Playwright browser
```bash
npx playwright install chromium
```

### 2. Start dev servers (3 terminals)
```bash
# Terminal 1 - Backend
cd creatorbharat-backend && npm run dev

# Terminal 2 - Admin (must be on port 5174)
cd creatorbharat-admin && npm run dev -- --port 5174

# Terminal 3 - Client
cd creator-bharat-v3 && npm run dev
```

### 3. Configure test credentials
Create a `.env.test` or export:
```bash
export E2E_ADMIN_URL=http://localhost:5174
export E2E_CLIENT_URL=http://localhost:5173
export E2E_ADMIN_EMAIL=admin@creatorbharat.com
export E2E_ADMIN_PASSWORD=your-test-admin-password
```

### 4. Run tests
```bash
# From root directory
npm run test:e2e

# Or directly
npx playwright test
```

## Test Flows

| File | Flow | Critical Coverage |
|------|------|-------------------|
| `01-admin-login-rbac.spec.js` | Admin Login -> Dashboard -> RBAC | F-02 JWT sessionStorage verification |
| `02-creator-registration-kyc.spec.js` | Creator Registration -> Profile -> KYC | Auth flow, KYC page access |
| `03-brand-campaign-application.spec.js` | Brand Campaign -> Application -> Status | Campaign listing, application routing |
| `04-admin-kyc-review.spec.js` | Admin KYC Review -> Approve/Reject | Confirmation modal, dangerous action guard |
| `05-audit-log-viewer.spec.js` | Audit Log Viewer | Read-only, no secrets exposed, no delete buttons |

## Safety Constraints

- Tests run against **localhost only** — never production
- No real Razorpay transactions are executed
- No real KYC documents are uploaded
- No production database is touched
- Test credentials must use a **staging/test admin account**

## CI Integration

Set these secrets in your CI environment:
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`
- `E2E_ADMIN_URL` (staging URL)
- `E2E_CLIENT_URL` (staging URL)
