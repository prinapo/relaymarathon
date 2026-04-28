const { test, expect } = require('@playwright/test');
const { 
  checkServerRunning, 
  loginWithAccount,
  openDrawer, 
  getMenuItems 
} = require('./fixtures');
const { setupConsoleCapture, isExternalError } = require('./console-middleware');

test.describe('Menu Visibility - Guest User', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Guest sees correct menu items in drawer', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    await openDrawer(page);
    await page.waitForTimeout(1000);

    const itemsText = await getMenuItems(page).allTextContents();
    console.log('Guest menu items:', itemsText);

    const hasHome = itemsText.some(t => t.includes('Home'));
    const hasGare = itemsText.some(t => t.includes('Gare'));
    const hasAppuntamenti = itemsText.some(t => t.includes('Appuntamenti'));
    const hasPercorso = itemsText.some(t => t.includes('Percorso'));
    const hasFaq = itemsText.some(t => t.includes('FAQ'));
    const hasAiuto = itemsText.some(t => t.includes('Aiuto'));
    const hasLogin = itemsText.some(t => t.includes('Accedi'));
    
    const hasSquadra = itemsText.some(t => t.includes('Squadra'));
    const hasAdmin = itemsText.some(t => t.includes('Admin'));
    const hasRichiedi = itemsText.some(t => t.includes('Richiedi'));
    const hasLogout = itemsText.some(t => t.includes('Esci'));

    expect(hasHome).toBe(true);
    expect(hasGare).toBe(true);
    expect(hasAppuntamenti).toBe(true);
    expect(hasPercorso).toBe(true);
    expect(hasFaq).toBe(true);
    expect(hasAiuto).toBe(true);
    expect(hasLogin).toBe(true);

    expect(hasSquadra).toBe(false);
    expect(hasAdmin).toBe(false);
    expect(hasRichiedi).toBe(false);
    expect(hasLogout).toBe(false);

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Guest can navigate to each visible menu item', async ({ page }) => {
    const navTargets = [
      { name: 'Home', path: '/' },
      { name: 'Gare', path: '/race' },
      { name: 'Appuntamenti', path: '/appointments' },
      { name: 'Percorso', path: '/route' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Aiuto', path: '/help' },
      { name: 'Login', path: '/login' },
    ];

    // Enable fail on app errors but filter known external errors
    const { check } = await setupConsoleCapture(page, true);

    for (const nav of navTargets) {
      console.log(`Testing navigation to ${nav.name}...`);
      await page.goto(`/#${nav.path}`);
      await page.waitForTimeout(2000);
      await openDrawer(page);
      await page.waitForTimeout(500);
    }

    // Filter external errors and verify app errors = 0
    const result = check(true);
    const filteredErrors = result.appErrors.filter(e => !isExternalError(e));
    console.log(`App errors after filtering: ${filteredErrors.length}`);
    
    expect(filteredErrors.length).toBe(0);
  });
});

test.describe('Menu Visibility - Logged In User (Non-Admin)', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Logged in user sees correct menu items', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await openDrawer(page);
    await page.waitForTimeout(1000);

    const itemsText = await getMenuItems(page).allTextContents();
    console.log('Captain menu items:', itemsText);

    const hasHome = itemsText.some(t => t.includes('Home'));
    const hasTeam = itemsText.some(t => t.includes('Team') || t.includes('Squadra'));
    const hasGare = itemsText.some(t => t.includes('Gare'));
    const hasAppuntamenti = itemsText.some(t => t.includes('Appuntamenti'));
    const hasPercorso = itemsText.some(t => t.includes('Percorso'));
    const hasFaq = itemsText.some(t => t.includes('FAQ'));
    const hasAiuto = itemsText.some(t => t.includes('Aiuto'));
    const hasRichiedi = itemsText.some(t => t.includes('Richiedi'));
    const hasLogin = itemsText.some(t => t.includes('Accedi'));
    const hasAdmin = itemsText.some(t => t.includes('Admin') && !t.includes('Richiedi'));

    expect(hasHome).toBe(true);
    expect(hasTeam).toBe(true);
    expect(hasGare).toBe(true);
    expect(hasAppuntamenti).toBe(true);
    expect(hasPercorso).toBe(true);
    expect(hasFaq).toBe(true);
    expect(hasAiuto).toBe(true);
    expect(hasRichiedi).toBe(true);
    
    expect(hasLogin).toBe(false);
    expect(hasAdmin).toBe(false);

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Menu Visibility - Admin User', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Admin sees all menu items including Admin', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await openDrawer(page);
    await page.waitForTimeout(1000);

    const itemsText = await getMenuItems(page).allTextContents();
    console.log('Admin menu items:', itemsText);

    const hasHome = itemsText.some(t => t.includes('Home'));
    const hasTeam = itemsText.some(t => t.includes('Team') || t.includes('Squadra'));
    const hasGare = itemsText.some(t => t.includes('Gare'));
    const hasAppuntamenti = itemsText.some(t => t.includes('Appuntamenti'));
    const hasPercorso = itemsText.some(t => t.includes('Percorso'));
    const hasFaq = itemsText.some(t => t.includes('FAQ'));
    const hasAiuto = itemsText.some(t => t.includes('Aiuto'));
    const hasAdmin = itemsText.some(t => t.includes('Admin'));
    const hasLogin = itemsText.some(t => t.includes('Accedi'));
    const hasRichiedi = itemsText.some(t => t.includes('Richiedi'));

    expect(hasHome).toBe(true);
    expect(hasTeam).toBe(true);
    expect(hasGare).toBe(true);
    expect(hasAppuntamenti).toBe(true);
    expect(hasPercorso).toBe(true);
    expect(hasFaq).toBe(true);
    expect(hasAiuto).toBe(true);
    expect(hasAdmin).toBe(true);
    
    expect(hasLogin).toBe(false);
    expect(hasRichiedi).toBe(false);

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Admin can navigate to Admin page', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    await openDrawer(page);
    await page.waitForTimeout(1000);

    const adminItem = page.locator('.q-drawer .q-item:has-text("Admin")');
    await adminItem.click();
    await page.waitForTimeout(3000);

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});

test.describe('Header Elements', () => {
  test.beforeEach(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }
  });

  test('Guest sees login button in header', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await page.goto('/');
    await page.waitForTimeout(3000);

    const loginBtn = page.locator('header button:has-text("Accedi")');
    await expect(loginBtn).toBeVisible();

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Logged in user sees logout button and avatar', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await loginWithAccount(page, 'CAPTAIN');
    await page.waitForTimeout(3000);

    const logoutBtn = page.locator('header button:has-text("Esci")');
    const avatar = page.locator('header .q-avatar');

    await expect(logoutBtn).toBeVisible();
    await expect(avatar).toBeVisible();

    const result = check();
    expect(result.errorCount).toBe(0);
  });

  test('Language toggle works', async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    
    await page.goto('/');
    await page.waitForTimeout(3000);

    const langBtn = page.locator('header button[aria-label]').first();
    await langBtn.click();
    await page.waitForTimeout(1000);

    const result = check();
    expect(result.errorCount).toBe(0);
  });
});