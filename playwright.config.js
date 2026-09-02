// playwright.config.js - CreatorBharat E2E Test Configuration (F-03 remediation)
// Tests run against local preview servers only (port 5174 for admin, port 5173 for client).

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30000,
  reporter: [
    ['list'],
    ['json', { outputFile: 'e2e-results/results.json' }],
  ],
  use: {
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    baseURL: process.env.E2E_ADMIN_URL || 'http://127.0.0.1:5174',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
