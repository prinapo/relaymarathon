/**
 * Test Fixtures and Utilities
 * Shared accounts and helper functions for all E2E tests
 */

const http = require('http');

/**
 * Test Data Prefix
 * All test data created during tests will have this prefix
 * This allows for easy cleanup by deleting all documents starting with this prefix
 */
const TEST_DATA_PREFIX = 'e2e_';

/**
 * Test Accounts Configuration
 * All accounts used in tests with their roles and properties
 */
const TEST_ACCOUNTS = {
  /**
   * Super Admin - has full access to all admin features
   * @type {{email: string, password: string, role: 'admin'}}
   */
  ADMIN: {
    email: 'testadmin@test.com',
    password: 'TestAdmin123!',
    role: 'admin'
  },

  /**
   * Captain - team leader with team management capabilities
   * @type {{email: string, password: string, role: 'captain'}}
   */
  CAPTAIN: {
    email: 'prova@gmail.com',
    password: 'prova_prova',
    role: 'captain'
  },

  /**
   * Runner - regular team member
   * @type {{email: string, password: string, role: 'runner'}}
   */
  RUNNER: {
    email: 'prova@gmail.com',
    password: 'prova_prova',
    role: 'runner'
  },

  /**
   * Guest - unauthenticated user
   * @type {null}
   */
  GUEST: null
};

/**
 * Test Data Templates
 * Templates for creating test data with consistent naming
 */
const TEST_DATA_TEMPLATES = {
  race: {
    name: `${TEST_DATA_PREFIX}Gara Test`,
    location: 'Milano, Italia',
    date: '2026-06-15',
    startTime: '08:00',
    defaultStartDelay: 300,
    isDefault: false,
    segments: [
      { id: 'seg1', name: 'Tratta 1 - Centro', type: 'solo', distance: 5 },
      { id: 'seg2', name: 'Tratta 2 - Nord', type: 'solo', distance: 5 },
      { id: 'seg3', name: 'Tratta 3 - Est', type: 'solo', distance: 5 },
      { id: 'seg4', name: 'Tratta 4 - Gruppo', type: 'group', distance: 10 },
    ],
    routeEmbedCode: '',
    adminUids: []
  },
  
  team: {
    name: `${TEST_DATA_PREFIX}Team Test`,
    raceId: '',
    runners: [],
    captainEmail: '',
    invitationCode: ''
  },
  
  appointment: {
    title: `${TEST_DATA_PREFIX}Appuntamento Test`,
    description: 'Appuntamento per test E2E',
    date: '2026-06-14',
    time: '18:00',
    location: 'Milano',
    type: 'briefing',
    raceId: ''
  },
  
  faq: {
    question: `${TEST_DATA_PREFIX}Domanda Test FAQ`,
    answer: 'Risposta test per E2E',
    category: 'test',
    isHidden: false,
    raceId: 'all'
  },
  
  help: {
    title: `${TEST_DATA_PREFIX}Sezione Help Test`,
    content: 'Contenuto test per E2E',
    category: 'test',
    isHidden: false,
    raceId: 'all'
  }
};

/**
 * Check if the development server is running
 * @returns {Promise<boolean>} - true if server is accessible
 */
async function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:9000', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

/**
 * Login with email/password credentials
 * @param {object} page - Playwright page object
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 */
async function login(page, email, password) {
  await page.goto('/#/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(email);
  await page.click('button:has-text("Avanti")');

  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Accedi")');
  await page.waitForTimeout(3000);
}

/**
 * Login using TEST_ACCOUNTS configuration
 * @param {object} page - Playwright page object
 * @param {'ADMIN'|'CAPTAIN'|'RUNNER'|'GUEST'} accountType - Account type to login with
 * @returns {Promise<void>}
 */
async function loginWithAccount(page, accountType) {
  const account = TEST_ACCOUNTS[accountType];
  if (!account) {
    throw new Error(`Unknown account type: ${accountType}`);
  }
  await login(page, account.email, account.password);
}

/**
 * Logout current user
 * @param {object} page - Playwright page object
 * @returns {Promise<void>}
 */
async function logout(page) {
  const logoutBtn = page.locator('header button:has-text("Esci")');
  if (await logoutBtn.isVisible({ timeout: 3000 })) {
    await logoutBtn.click();
    await page.waitForTimeout(2000);
  }
}

/**
 * Open the drawer (sidebar menu)
 * @param {object} page - Playwright page object
 * @returns {Promise<void>}
 */
async function openDrawer(page) {
  const menuBtn = page.locator('button[aria-label="Menu"]');
  if (await menuBtn.isVisible({ timeout: 3000 })) {
    await menuBtn.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Get all menu items from drawer
 * @param {object} page - Playwright page object
 * @returns {Promise<Locator>} - Playwright locator for menu items
 */
function getMenuItems(page) {
  return page.locator('.q-drawer .q-item');
}

/**
 * Get menu item texts
 * @param {object} page - Playwright page object
 * @returns {Promise<string[]>} - Array of menu item text contents
 */
async function getMenuItemTexts(page) {
  const items = getMenuItems(page);
  const count = await items.count();
  return Promise.all(Array.from({ length: count }, (_, i) => items.nth(i).textContent()));
}

/**
 * Navigate to a specific route
 * @param {object} page - Playwright page object
 * @param {string} path - Route path (e.g., '/admin', '/team')
 * @returns {Promise<void>}
 */
async function navigateTo(page, path) {
  await page.goto(`/#${path}`);
  await page.waitForTimeout(2000);
}

/**
 * Check if element is visible with timeout
 * @param {object} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>}
 */
async function isVisible(page, selector, timeout = 3000) {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for an element to be hidden/removed
 * @param {object} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>}
 */
async function waitForHidden(page, selector, timeout = 3000) {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'hidden', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Click with retry logic
 * @param {object} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {number} retries - Number of retries
 * @returns {Promise<void>}
 */
async function clickWithRetry(page, selector, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const element = page.locator(selector);
      await element.click({ timeout: 5000 });
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(500);
    }
  }
}

module.exports = {
  TEST_DATA_PREFIX,
  TEST_ACCOUNTS,
  TEST_DATA_TEMPLATES,
  checkServerRunning,
  login,
  loginWithAccount,
  logout,
  openDrawer,
  getMenuItems,
  getMenuItemTexts,
  navigateTo,
  isVisible,
  waitForHidden,
  clickWithRetry
};