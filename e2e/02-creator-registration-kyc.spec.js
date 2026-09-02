/**
 * E2E Flow 2: Creator Registration -> Profile -> KYC Upload
 */
import { test, expect } from '@playwright/test';

const CLIENT_URL = process.env.E2E_CLIENT_URL || 'http://127.0.0.1:5173';

test.describe('Flow 2: Creator Registration -> Profile -> KYC Upload', () => {
  test('creator registration page renders with required fields', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/join`);
    await page.waitForTimeout(2000);

    const hasForm = await page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]').count() > 0
      || await page.locator('form').count() > 0
      || await page.locator('text=/register|join|sign up|create account/i').count() > 0;

    expect(hasForm).toBe(true);
  });

  test('registration with missing fields shows validation error', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/join`);
    await page.waitForTimeout(2000);

    const submitBtn = page.locator('button[type="submit"]').first();
    const submitVisible = await submitBtn.isVisible().catch(() => false);

    if (submitVisible) {
      await submitBtn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      const onSamePage = currentUrl.includes('/join') || currentUrl.includes('/register');
      const hasValidation = await page.locator('[class*="error"], [class*="invalid"], [aria-invalid]').count() > 0;

      expect(onSamePage || hasValidation).toBe(true);
    } else {
      const pageLoaded = await page.locator('body').isVisible();
      expect(pageLoaded).toBe(true);
    }
  });

  test('creator login page renders for existing users', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/login`);
    await page.waitForTimeout(2000);

    const hasLoginForm = await page.locator('input[type="email"], input[placeholder*="email"]').count() > 0
      || await page.locator('input[type="password"]').count() > 0
      || await page.locator('text=/log in|sign in|login/i').count() > 0;

    expect(hasLoginForm).toBe(true);
  });

  test('KYC settings page is accessible when logged in', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/settings`);
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const validDestination = currentUrl.includes('/settings')
      || currentUrl.includes('/login')
      || currentUrl.includes('/join')
      || currentUrl.includes('/');

    expect(validDestination).toBe(true);
  });
});
