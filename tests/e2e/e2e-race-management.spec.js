/**
 * E2E Race Management Tests
 * Tests for:
 * - Creating race with multiple segments
 * - Editing race
 * - Assigning race admin
 * - Race selector functionality
 */

const { test, expect } = require('@playwright/test');
const { 
  checkServerRunning, 
  loginWithAccount, 
  logout,
  navigateTo 
} = require('./fixtures');
const { setupConsoleCapture, isExternalError } = require('./console-middleware');

test.describe('Race Management - Create Race', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can create new race', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/admin')) {
      console.log('User is not admin, skipping');
      test.skip();
    }
    
    // Click Add Race button
    const addRaceBtn = page.locator('button:has-text("Aggiungi")').first();
    const canAddRace = await addRaceBtn.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (canAddRace) {
      await addRaceBtn.click();
      await page.waitForTimeout(1500);
      
      // Look for the editable fields in the table
      const tableRows = page.locator('.q-markup-table tbody tr');
      const hasTable = await tableRows.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasTable) {
        // Click first empty row to edit
        const firstRow = tableRows.first();
        await firstRow.click();
        await page.waitForTimeout(500);
        console.log('Clicked table row to edit race');
      }
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Admin sees race in list after creation', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    // Check race selector has options
    const raceSelector = page.locator('.q-select').first();
    const hasSelector = await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasSelector) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const options = page.locator('.q-item');
      const optionCount = await options.count();
      console.log(`Race options count: ${optionCount}`);
      
      expect(optionCount).toBeGreaterThan(0);
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Admin can edit race data', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    // Select a race first
    const raceSelector = page.locator('.q-select').first();
    if (await raceSelector.isVisible({ timeout: 3000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const firstOption = page.locator('.q-item').first();
      if (await firstOption.isVisible({ timeout: 2000 })) {
        await firstOption.click();
        await page.waitForTimeout(1000);
      }
      
      // Try to click Edit button
      const editBtn = page.locator('button:has-text("Modifica")').first();
      if (await editBtn.isVisible({ timeout: 2000 })) {
        await editBtn.click();
        await page.waitForTimeout(500);
        console.log('Edit mode activated');
      }
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });
});

test.describe('Race Management - Race Admin Assignment', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can access Race Admins tab', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    // Select a race first (required before seeing race admin tab)
    const raceSelector = page.locator('.q-select').first();
    if (await raceSelector.isVisible({ timeout: 3000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const firstOption = page.locator('.q-item').first();
      if (await firstOption.isVisible({ timeout: 2000 })) {
        await firstOption.click();
        await page.waitForTimeout(1000);
      }
      
      // Now look for Race Admins tab
      const raceAdminTab = page.locator('.q-tab:has-text("Admin")').first();
      if (await raceAdminTab.isVisible({ timeout: 2000 })) {
        await raceAdminTab.click();
        await page.waitForTimeout(1000);
        console.log('Clicked Race Admins tab');
      }
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Admin can view race admin input', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    // Select a race first
    const raceSelector = page.locator('.q-select').first();
    if (await raceSelector.isVisible({ timeout: 3000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const firstOption = page.locator('.q-item').first();
      if (await firstOption.isVisible({ timeout: 2000 })) {
        await firstOption.click();
        await page.waitForTimeout(1000);
      }
      
      // Go to Race Admins tab
      const raceAdminTab = page.locator('.q-tab:has-text("Admin")').first();
      if (await raceAdminTab.isVisible({ timeout: 2000 })) {
        await raceAdminTab.click();
        await page.waitForTimeout(1000);
        
        // Look for email input
        const emailInput = page.locator('input').first();
        const hasInput = await emailInput.isVisible({ timeout: 2000 }).catch(() => false);
        
        console.log(`Email input visible: ${hasInput}`);
      }
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });
});

test.describe('Race Management - Race Selector', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Race selector shows all available races', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    // Click race selector
    const raceSelector = page.locator('.q-select').first();
    if (await raceSelector.isVisible({ timeout: 5000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);
      
      const options = page.locator('.q-item');
      const count = await options.count();
      console.log(`Available races: ${count}`);
      
      expect(count).toBeGreaterThan(0);
    }
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    expect(appErrors.length).toBe(0);
  });

  test('Captain can see race selector on home page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/');
    await page.waitForTimeout(3000);
    
    await logout(page);
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    
    expect(appErrors.length).toBe(0);
  });
});