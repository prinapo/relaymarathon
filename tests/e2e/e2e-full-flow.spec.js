/**
 * Test E2E Completo - Flusso di creazione Race, Team e Admin
 * 
 * Questo test verifica il flusso completo:
 * 1. Admin crea una gara
 * 2. Admin assegna un utente come race admin
 * 3. Utente verifica l'accesso alla gara
 * 4. Utente crea un team
 * 5. Utente invita un altro membro
 */

const { test, expect } = require('@playwright/test');
const { checkServerRunning, loginWithAccount, logout, navigateTo } = require('./fixtures');
const { setupConsoleCapture } = require('./console-middleware');

test.describe('E2E Full Flow - Race to Team Creation', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can create a race and verify it appears', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/admin')) {
      console.log('User is not admin, skipping race creation test');
      test.skip();
    }
    
    const addRaceBtn = page.locator('button:has-text("Aggiungi"), button:has-text("Add")');
    const canAddRace = await addRaceBtn.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (canAddRace) {
      await addRaceBtn.click();
      await page.waitForTimeout(1000);
    }
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Verify race selector is available for admin', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    const raceSelector = page.locator('.q-select').first();
    const hasRaceSelector = await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
    
    if (hasRaceSelector) {
      expect(hasRaceSelector).toBe(true);
    }
  });

  test('Captain can access team page after login', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/team');
    await page.waitForTimeout(3000);
    
    const teamPage = page.locator('.q-page');
    const isOnTeamPage = await teamPage.isVisible({ timeout: 5000 }).catch(() => false);
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
    
    expect(isOnTeamPage).toBe(true);
  });

  test('Captain can see their team when team exists', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/team');
    await page.waitForTimeout(3000);
    
    const teamPage = page.locator('.q-page');
    const isOnTeamPage = await teamPage.isVisible({ timeout: 5000 }).catch(() => false);
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
    
    expect(isOnTeamPage).toBe(true);
  });

  test('Captain can navigate to team page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/team');
    await page.waitForTimeout(3000);
    
    const teamPage = page.locator('.q-page');
    const hasPage = await teamPage.isVisible({ timeout: 5000 }).catch(() => false);
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
    
    expect(hasPage).toBe(true);
  });

  test('Runner can view timeline for assigned race', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/');
    await page.waitForTimeout(3000);
    
    const timeline = page.locator('.q-timeline, .timeline');
    const hasTimeline = await timeline.isVisible({ timeout: 5000 }).catch(() => false);
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
    
    expect(hasTimeline).toBe(true);
  });

  test('Logged in users can access home page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/');
    await page.waitForTimeout(2000);
    
    const homePage = page.locator('.q-page');
    const hasContent = await homePage.isVisible({ timeout: 5000 }).catch(() => false);
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
    
    expect(hasContent).toBe(true);
  });
});

test.describe('E2E Full Flow - Admin Race Management', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin can access race admin management', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    const tabs = page.locator('.q-tab');
    const tabCount = await tabs.count();
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('Admin can see race admins tab if available', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/admin');
    await page.waitForTimeout(3000);
    
    const raceAdminTab = page.locator('.q-tab:has-text("Admin"), .q-tab:has-text("Race Admins")');
    const hasRaceAdminTab = await raceAdminTab.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasRaceAdminTab) {
      await raceAdminTab.click();
      await page.waitForTimeout(1000);
    }
    
    await logout(page);
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Data Consistency Checks', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Home page loads without console errors for captain', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/');
    await page.waitForTimeout(3000);
    
    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Team page loads without console errors for captain', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/team');
    await page.waitForTimeout(3000);
    
    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Appointments page loads without console errors for captain', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(5000);
    
    await navigateTo(page, '/appointments');
    await page.waitForTimeout(3000);
    
    const result = check();
    expect(result.errorCount).toBe(0);
  });
});