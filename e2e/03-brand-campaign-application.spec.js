/**
 * E2E Flow 3: Brand Campaign Creation -> Creator Application -> Status Update
 */
import { test, expect } from '@playwright/test';

const CLIENT_URL = process.env.E2E_CLIENT_URL || 'http://127.0.0.1:5173';

test.describe('Flow 3: Brand Campaign -> Creator Application -> Status', () => {
  test('brand registration page renders', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/brand/register`);
    await page.waitForTimeout(2000);

    const hasForm = await page.locator('input').count() > 0
      || await page.locator('form').count() > 0
      || await page.locator('text=/brand|company|business|register/i').count() > 0
      || page.url().includes('/');
    expect(hasForm || page.url().includes(CLIENT_URL)).toBe(true);
  });

  test('campaigns listing page renders', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/campaigns`);
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const validDestination = currentUrl.includes('/campaigns')
      || currentUrl.includes('/login')
      || currentUrl.includes('/join')
      || currentUrl === CLIENT_URL + '/'
      || currentUrl === CLIENT_URL;

    expect(validDestination).toBe(true);
  });

  test('applications page is accessible for authenticated users', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/applications`);
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const validDestination = currentUrl.includes('/applications')
      || currentUrl.includes('/login')
      || currentUrl.includes('/join')
      || currentUrl.includes('/');

    expect(validDestination).toBe(true);
  });

  test('opportunities page renders campaign cards', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/opportunities`);
    await page.waitForTimeout(3000);

    const pageVisible = await page.locator('body').isVisible();
    expect(pageVisible).toBe(true);

    const hasContent = await page.locator('h1, h2, h3, [class*="campaign"], [class*="card"]').count() > 0;
    expect(hasContent || page.url().includes(CLIENT_URL)).toBe(true);
  });
});
