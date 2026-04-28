const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleCapture(page);
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

  test("home page loads successfully", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/");
    await page.waitForTimeout(3000);

    const pageTitle = await page.title();
    expect(pageTitle).toContain("Milano Relay Marathon");

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("home page shows race selector", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    await expect(raceSelector).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("home page shows timeline when team is selected", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/");
    await page.waitForTimeout(3000);

    const startSection = page.locator(".timeline-start");
    await expect(startSection).toBeVisible();

    const endSection = page.locator(".timeline-end");
    await expect(endSection).toBeVisible();

    const timeline = page.locator(".q-timeline");
    await expect(timeline).toBeVisible({ timeout: 10000 });

    const timelineEntries = page.locator(".q-timeline__entry");
    const entryCount = await timelineEntries.count();
    expect(entryCount).toBeGreaterThan(0);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("home page race selector works", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    await expect(raceSelector).toBeVisible({ timeout: 5000 });

    await raceSelector.click();
    await page.waitForTimeout(500);

    const raceOptions = page.locator(".q-item");
    await expect(raceOptions.first()).toBeVisible({ timeout: 3000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});