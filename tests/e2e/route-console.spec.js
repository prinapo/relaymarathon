/**
 * Test specifico per verificare errori console sulla pagina route
 * NOTA: Gli errori da script esterni (es. komoot.com) vengono ignorati
 */

const { test, expect } = require('@playwright/test');
const { checkServerRunning, loginWithAccount, navigateTo } = require('./fixtures');

const isExternalError = (text) => {
  return text.includes('komoot.com') || text.includes('Minified React error');
};

test.describe('Route Page - Console Errors', () => {
  test('Route page should load without console errors for admin', async ({ page }) => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isExternalError(text)) {
          errors.push(text);
          console.log(`[CONSOLE ERROR]: ${text}`);
        }
      }
    });
    
    page.on('pageerror', error => {
      if (!isExternalError(error.message)) {
        errors.push(error.message);
        console.log(`[PAGE ERROR]: ${error.message}`);
      }
    });

    await loginWithAccount(page, 'ADMIN');
    await page.waitForTimeout(4000);
    
    await navigateTo(page, '/route');
    await page.waitForTimeout(5000);

    console.log(`\n===Route Page Test Results (Admin)==`);
    console.log(`Total app errors found: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach(e => console.log(`  - ${e.substring(0, 100)}`));
    }

    expect(errors.length).toBe(0);
  });

  test('Route page should load without console errors for guest', async ({ page }) => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      test.skip();
    }

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isExternalError(text)) {
          errors.push(text);
          console.log(`[CONSOLE ERROR]: ${text}`);
        }
      }
    });

    await navigateTo(page, '/route');
    await page.waitForTimeout(5000);

    console.log(`\n===Route Page Test Results (Guest)==`);
    console.log(`Total app errors found: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach(e => console.log(`  - ${e.substring(0, 100)}`));
    }

    expect(errors.length).toBe(0);
  });
});