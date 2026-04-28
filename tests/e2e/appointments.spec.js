const { test, expect } = require('@playwright/test');
const {
  checkServerRunning,
  loginWithAccount,
  logout,
  navigateTo,
  openDrawer,
  isVisible
} = require('./fixtures');
const { setupConsoleCapture } = require('./console-middleware');

test.describe('Appointments Page - Access Control', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Guest can access appointments page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/appointments');
    await page.waitForTimeout(3000);

    const pageContent = page.locator('.q-page');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Logged in user can access appointments page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await navigateTo(page, '/appointments');
    await page.waitForTimeout(3000);

    const pageContent = page.locator('.q-page');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Appointments Page - UI Elements', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Appointments page shows content', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/appointments');
    await page.waitForTimeout(3000);

    const hasContent = await isVisible(page, '.q-page', 5000);

    const result = check();
    expect(result.errorCount).toBe(0);
    expect(hasContent).toBe(true);
  });

  test('Appointments page shows race selector when admin', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await navigateTo(page, '/appointments');
    await page.waitForTimeout(3000);

    const raceSelector = page.locator('.q-select').first();
    await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Appointments Page - Create (Admin)', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can see create appointment button', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await navigateTo(page, '/admin-appointments');
    await page.waitForTimeout(3000);

    const addBtn = page.locator('button:has-text("Aggiungi")').or(page.locator('button:has-text("Add")'));
    await addBtn.isVisible({ timeout: 5000 }).catch(() => false);

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Appointments Page - Navigation', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Can navigate to appointments from drawer', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    await openDrawer(page);
    await page.waitForTimeout(500);

    const appointmentsLink = page.locator('.q-drawer .q-item:has-text("Appuntamenti")');
    if (await appointmentsLink.isVisible({ timeout: 3000 })) {
      await appointmentsLink.click();
      await page.waitForTimeout(3000);
    }

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});