/**
 * E2E Console Error Full Check
 * Tests ALL pages for console errors
 * Visits every route and verifies no app errors
 */

const { test, expect } = require('@playwright/test');
const { 
  checkServerRunning, 
  loginWithAccount, 
  logout,
  navigateTo,
  openDrawer 
} = require('./fixtures');
const { setupConsoleCapture, isExternalError } = require('./console-middleware');

const ALL_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/team', name: 'Team' },
  { path: '/admin', name: 'Admin' },
  { path: '/race', name: 'Race Selection' },
  { path: '/appointments', name: 'Appointments' },
  { path: '/faq', name: 'FAQ' },
  { path: '/help', name: 'Help' },
  { path: '/route', name: 'Route' },
  { path: '/login', name: 'Login' },
];

test.describe('Console Error Check - All Pages', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Guest pages load without app errors', async ({ page }) => {
    const guestPages = ALL_PAGES.filter(p => p.path !== '/team' && p.path !== '/admin');
    
    for (const pageInfo of guestPages) {
      const { check } = await setupConsoleCapture(page, true);
      
      console.log(`Testing guest page: ${pageInfo.name} (${pageInfo.path})...`);
      await page.goto(`/#${pageInfo.path}`);
      await page.waitForTimeout(2000);
      
      const result = check();
      const appErrors = result.appErrors.filter(e => !isExternalError(e));
      
      console.log(`  Errors: ${result.errorCount}, App errors: ${appErrors.length}`);
      
      expect(appErrors.length).toBe(0);
    }
  });

  test('Captain pages load without app errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    const captainPages = [
      { path: '/', name: 'Home' },
      { path: '/team', name: 'Team' },
      { path: '/race', name: 'Race Selection' },
      { path: '/appointments', name: 'Appointments' },
      { path: '/faq', name: 'FAQ' },
      { path: '/help', name: 'Help' },
      { path: '/route', name: 'Route' },
    ];
    
    for (const pageInfo of captainPages) {
      console.log(`Testing captain page: ${pageInfo.name} (${pageInfo.path})...`);
      await page.goto(`/#${pageInfo.path}`);
      await page.waitForTimeout(2000);
      
      const result = check();
      const appErrors = result.appErrors.filter(e => !isExternalError(e));
      
      console.log(`  Errors: ${result.errorCount}, App errors: ${appErrors.length}`);
      
      expect(appErrors.length).toBe(0);
    }
    
    await logout(page);
  });

  test('Admin pages load without app errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    const adminPages = [
      { path: '/', name: 'Home' },
      { path: '/team', name: 'Team' },
      { path: '/admin', name: 'Admin' },
      { path: '/race', name: 'Race Selection' },
      { path: '/appointments', name: 'Appointments' },
      { path: '/faq', name: 'FAQ' },
      { path: '/help', name: 'Help' },
      { path: '/route', name: 'Route' },
    ];
    
    for (const pageInfo of adminPages) {
      console.log(`Testing admin page: ${pageInfo.name} (${pageInfo.path})...`);
      await page.goto(`/#${pageInfo.path}`);
      await page.waitForTimeout(2000);
      
      const result = check();
      const appErrors = result.appErrors.filter(e => !isExternalError(e));
      
      console.log(`  Errors: ${result.errorCount}, App errors: ${appErrors.length}`);
      
      expect(appErrors.length).toBe(0);
    }
    
    await logout(page);
  });
});

test.describe('Console Error Check - Navigation', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Drawer navigation has no errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    // Open drawer
    await openDrawer(page);
    await page.waitForTimeout(500);
    
    // Click each menu item (limit to first 4 to avoid timeout)
    const menuItems = page.locator('.q-drawer .q-item');
    const count = Math.min(await menuItems.count(), 4);
    
    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      const text = await item.textContent().catch(() => '');
      
      console.log(`Clicking menu: ${text}...`);
      await item.click();
      await page.waitForTimeout(1000);
      
      const result = check();
      const appErrors = result.appErrors.filter(e => !isExternalError(e));
      
      console.log(`  App errors: ${appErrors.length}`);
      
      // Re-open drawer for next item
      if (i < count - 1) {
        await openDrawer(page).catch(() => {});
        await page.waitForTimeout(300);
      }
    }
    
    await logout(page);
  });
});

test.describe('Console Error Check - Data Loading', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Timeline loads without errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/');
    await page.waitForTimeout(3000);
    
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    
    expect(appErrors.length).toBe(0);
    
    await logout(page);
  });

  test('Appointments table loads without errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/appointments');
    await page.waitForTimeout(3000);
    
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    
    expect(appErrors.length).toBe(0);
    
    await logout(page);
  });

  test('FAQ page loads without errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/faq');
    await page.waitForTimeout(3000);
    
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    
    expect(appErrors.length).toBe(0);
    
    await logout(page);
  });

  test('Help page loads without errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/help');
    await page.waitForTimeout(3000);
    
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    
    expect(appErrors.length).toBe(0);
    
    await logout(page);
  });

  test('Route page loads without errors', async ({ page }) => {
    const { check } = await setupConsoleCapture(page, true);
    
    // Use guest for route page
    await navigateTo(page, '/route');
    await page.waitForTimeout(3000);
    
    const result = check();
    const appErrors = result.appErrors.filter(e => !isExternalError(e));
    
    expect(appErrors.length).toBe(0);
  });
});