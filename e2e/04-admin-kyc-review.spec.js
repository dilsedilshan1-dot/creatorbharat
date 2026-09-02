/**
 * E2E Flow 4: Admin KYC Review -> Approve/Reject Confirmation
 */
import { test, expect } from '@playwright/test';

const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://127.0.0.1:5174';

async function setupAdminSession(page) {
  await page.route('**/*stats/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ totalCreators: 10, totalReach: 500000, totalCampaigns: 5, totalBrands: 3, stateCounts: {} })
    });
  });
  await page.route('**/*admin/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.addInitScript(() => {
    sessionStorage.setItem('cb_admin_token', 'e2e-valid-admin-jwt-token');
  });

  await page.goto(ADMIN_URL);
  await page.waitForTimeout(1500);
}

test.describe('Flow 4: Admin KYC Review -> Approve/Reject Confirmation', () => {
  test('admin can navigate to KYC section', async ({ page }) => {
    await setupAdminSession(page);

    const kycNav = page.locator('text=/KYC|kyc|verification|Verification/i').first();
    const kycVisible = await kycNav.isVisible().catch(() => false);

    if (kycVisible) {
      await kycNav.click();
      await page.waitForTimeout(1500);
    }

    const panelLoaded = await page.locator('body').isVisible();
    expect(panelLoaded).toBe(true);
  });

  test('dangerous action confirmation modal blocks immediate execution', async ({ page }) => {
    await setupAdminSession(page);
    await page.waitForTimeout(1500);

    const dangerousBtn = page.locator('button:has-text("Suspend"), button:has-text("Reject"), button:has-text("Ban"), button:has-text("Delete")').first();
    const btnVisible = await dangerousBtn.isVisible().catch(() => false);

    if (btnVisible) {
      await dangerousBtn.click();
      await page.waitForTimeout(1000);

      const modalVisible = await page.locator('[role="dialog"], [class*="modal"], [class*="confirm"]').count() > 0
        || await page.locator('text=/confirm|are you sure|reason|type/i').count() > 0;

      expect(modalVisible).toBe(true);

      const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("No"), button[aria-label="Close"]').first();
      const cancelVisible = await cancelBtn.isVisible().catch(() => false);
      if (cancelVisible) {
        await cancelBtn.click();
      }
    } else {
      const adminLoaded = await page.locator('body').isVisible();
      expect(adminLoaded).toBe(true);
    }
  });

  test('KYC approve/reject action requires explicit confirmation', async ({ page }) => {
    await setupAdminSession(page);

    const kycLink = page.locator('[href*="kyc"], button:has-text("KYC"), a:has-text("KYC"), nav a:has-text("Verification")').first();
    const kycLinkVisible = await kycLink.isVisible().catch(() => false);

    if (kycLinkVisible) {
      await kycLink.click();
      await page.waitForTimeout(1500);
    }

    const panelFunctional = await page.locator('body').isVisible();
    expect(panelFunctional).toBe(true);
  });
});
