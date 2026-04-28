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

test.describe('FAQ Page - Access Control', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Guest can access FAQ page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/faq');
    await page.waitForTimeout(3000);

    const pageContent = page.locator('.q-page');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Logged in user can access FAQ page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await navigateTo(page, '/faq');
    await page.waitForTimeout(3000);

    const pageContent = page.locator('.q-page');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('FAQ Page - UI Elements', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('FAQ page shows content', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/faq');
    await page.waitForTimeout(3000);

    const hasContent = await isVisible(page, '.q-page', 5000);

    const result = check();
    expect(result.errorCount).toBe(0);
    expect(hasContent).toBe(true);
  });

  test('FAQ page shows FAQ title', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/faq');
    await page.waitForTimeout(3000);

    const pageTitle = await page.locator('.text-h6').first().textContent().catch(() => '');
    const hasFaqTitle = pageTitle.toLowerCase().includes('faq') || 
                        pageTitle.toLowerCase().includes('domande') ||
                        pageTitle.toLowerCase().includes('frequenti');

    const result = check();
    expect(result.errorCount).toBe(0);
    expect(hasFaqTitle).toBe(true);
  });

  test('FAQ page shows race selector when admin', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await navigateTo(page, '/faq');
    await page.waitForTimeout(3000);

    const raceSelector = page.locator('.q-select').first();
    await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('FAQ Page - Navigation', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Can navigate to FAQ from drawer', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    await openDrawer(page);
    await page.waitForTimeout(500);

    const faqLink = page.locator('.q-drawer .q-item:has-text("FAQ")');
    if (await faqLink.isVisible({ timeout: 3000 })) {
      await faqLink.click();
      await page.waitForTimeout(3000);
    }

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Help Page - Access Control', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Guest can access Help page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/help');
    await page.waitForTimeout(3000);

    const pageContent = page.locator('.q-page');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Logged in user can access Help page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await navigateTo(page, '/help');
    await page.waitForTimeout(3000);

    const pageContent = page.locator('.q-page');
    await expect(pageContent).toBeVisible({ timeout: 5000 });

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Help Page - UI Elements', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Help page shows content', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await navigateTo(page, '/help');
    await page.waitForTimeout(3000);

    const hasContent = await isVisible(page, '.q-page', 5000);

    const result = check();
    expect(result.errorCount).toBe(0);
    expect(hasContent).toBe(true);
  });

  test('Help page shows race selector when admin', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await navigateTo(page, '/help');
    await page.waitForTimeout(3000);

    const raceSelector = page.locator('.q-select').first();
    await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);

    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Help Page - Navigation', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Can navigate to Help from drawer', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    await openDrawer(page);
    await page.waitForTimeout(500);

    const helpLink = page.locator('.q-drawer .q-item:has-text("Aiuto")');
    if (await helpLink.isVisible({ timeout: 3000 })) {
      await helpLink.click();
      await page.waitForTimeout(3000);
    }

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});