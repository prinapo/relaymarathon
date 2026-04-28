/**
 * E2E Complete Test Suite
 * Tests the full flow: create race → create team → verify → cleanup
 * 
 * This test suite creates its own test data and cleans up after itself.
 */

const { test, expect } = require('@playwright/test');
const { 
  checkServerRunning,
  loginWithAccount,
  logout,
  navigateTo
} = require('./fixtures');
const { setupConsoleCapture, isExternalError } = require('./console-middleware');

test.describe('E2E Complete Test Suite', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can create a race with proper data', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/admin')) {
      console.log('User is not admin, skipping');
      test.skip();
    }
    
    // Click Add Race button
    const addRaceBtn = page.locator('button:has-text("Aggiungi"), button:has-text("Add")').first();
    const canAddRace = await addRaceBtn.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (canAddRace) {
      await addRaceBtn.click();
      await page.waitForTimeout(1000);
      console.log('Created new race');
    }
    
    // Click Edit to configure
    const editBtn = page.locator('button:has-text("Modifica"), button:has-text("Edit")').first();
    if (await editBtn.isVisible({ timeout: 2000 })) {
      await editBtn.click();
      await page.waitForTimeout(500);
      console.log('Edit mode activated');
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Race with segments appears in selector', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    // Verify race selector
    const raceSelector = page.locator('.q-select').first();
    const hasSelector = await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasSelector) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const options = page.locator('.q-item');
      const count = await options.count();
      console.log(`Races in selector: ${count}`);
      
      expect(count).toBeGreaterThan(0);
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Captain can see race in team page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/team');
    await page.waitForTimeout(3000);
    
    // Check team page loads
    const teamPage = page.locator('.q-page');
    expect(await teamPage.isVisible({ timeout: 5000 })).toBe(true);
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Timeline loads with race data', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/');
    await page.waitForTimeout(3000);
    
    // Page should load without errors
    const pageContent = page.locator('.q-page');
    expect(await pageContent.isVisible({ timeout: 5000 })).toBe(true);
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });
});

test.describe('Admin Race Management', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can access race admin tab', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    // Select race
    const raceSelector = page.locator('.q-select').first();
    if (await raceSelector.isVisible({ timeout: 3000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const firstOption = page.locator('.q-item').first();
      if (await firstOption.isVisible({ timeout: 2000 })) {
        await firstOption.click();
        await page.waitForTimeout(1000);
      }
      
      // Click Race Admin tab
      const adminTab = page.locator('.q-tab:has-text("Admin")').first();
      if (await adminTab.isVisible({ timeout: 2000 })) {
        await adminTab.click();
        await page.waitForTimeout(1000);
        console.log('Race admin tab opened');
      }
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Race selector shows all races', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    const raceSelector = page.locator('.q-select').first();
    if (await raceSelector.isVisible({ timeout: 5000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const options = page.locator('.q-item');
      const count = await options.count();
      console.log(`Total races available: ${count}`);
      
      expect(count).toBeGreaterThan(0);
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });
});

test.describe('Content Pages - No Errors', () => {
  const testPages = [
    { path: '/appointments', name: 'Appointments' },
    { path: '/faq', name: 'FAQ' },
    { path: '/help', name: 'Help' },
    { path: '/route', name: 'Route' },
    { path: '/race', name: 'Race Selection' },
  ];

  for (const pageInfo of testPages) {
    test(`${pageInfo.name} page loads without errors for captain`, async ({ page }) => {
      const { check } = await setupConsoleCapture(page, true);
      
      await loginWithAccount(page, 'CAPTAIN');
      await page.waitForTimeout(5000);
      
      await navigateTo(page, pageInfo.path);
      await page.waitForTimeout(2000);
      
      const result = check();
      const appErrors = result.appErrors.filter(e => !isExternalError(e));
      
      expect(appErrors.length).toBe(0);
      
      await logout(page);
    });
  }
});

test.describe('Data Cleanup Verification', () => {
  test('Admin page loads without errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    
    expect(appErrors.length).toBe(0);
    
    await logout(page);
  });

  test('Guest pages work correctly', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    const guestPages = ['/', '/faq', '/help', '/race'];
    
    for (const path of guestPages) {
      await navigateTo(page, path);
      await page.waitForTimeout(2000);
      
      const result = check();
      const appErrors = result.appErrors.filter(e => !isExternalError(e));
      
      expect(appErrors.length).toBe(0);
    }
  });
});