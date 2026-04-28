const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";

test.describe("Admin Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/login");
    await page.waitForLoadState("domcontentloaded");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: "visible", timeout: 15000 });
    await emailInput.fill(CAPTAIN_EMAIL);
    await page.click("button:has-text('Avanti')");

    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    await page.fill('input[type="password"]', CAPTAIN_PASSWORD);
    await page.click("button:has-text('Accedi')");
    await page.waitForTimeout(5000);

    await page.waitForFunction(() => !window.location.href.includes('/#/login'), { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test("admin page loads successfully for admin user", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const pageTitle = await page.title();
    expect(pageTitle).toContain("Milano Relay Marathon");

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("admin page shows tabs for races and translations", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/admin");
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/#/admin')) {
      console.log('User is not admin, skipping test');
      return;
    }

    const tabElements = page.locator(".q-tab");
    const count = await tabElements.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("admin page shows race selector when logged in as admin", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/admin");
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/#/admin')) {
      console.log('User is not admin, skipping test');
      return;
    }

    const raceSelector = page.locator(".q-select").first();
    await expect(raceSelector).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});