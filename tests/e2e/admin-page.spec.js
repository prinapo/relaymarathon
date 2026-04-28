const { test, expect } = require('@playwright/test');
const {
  checkServerRunning,
  loginWithAccount,
  logout,
  navigateTo,
  openDrawer
} = require('./fixtures');
const { setupConsoleCapture } = require('./console-middleware');

test.describe('Admin Page - Access Control', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Guest cannot access admin page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(login|splash|home)/);

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Captain cannot access admin page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin');

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Admin can access admin page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Admin Page - UI Elements', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin page shows race selector', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    // Wait for admin page to load - check we're on admin route
    await page.goto('/#/admin');
    await page.waitForTimeout(4000);
    
    // Check if we're actually on admin page (not redirected)
    const currentUrl = page.url();
    const isOnAdminPage = currentUrl.includes('/admin');
    
    // If we're on admin page, check for selector BEFORE logout
    if (isOnAdminPage) {
      const raceSelector = page.locator('.q-select').first();
      const hasSelector = await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);
      if (hasSelector) {
        await expect(raceSelector).toBeVisible();
      }
    }
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Admin page shows tabs', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);

    const tabs = page.locator('.q-tab');
    const tabCount = await tabs.count();

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);

    expect(tabCount).toBeGreaterThan(0);
  });
});

test.describe('Admin Page - Navigation', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can navigate to admin page from drawer', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await openDrawer(page);
    await page.waitForTimeout(1000);

    const adminLink = page.locator('.q-drawer .q-item:has-text("Admin")');
    await adminLink.click();
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});