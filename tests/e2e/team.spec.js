const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";

test.describe("Team Page", () => {
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

  test("team page loads successfully", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const pageTitle = await page.title();
    expect(pageTitle).toContain("Milano Relay Marathon");

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("team page shows create team button", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const createTeamBtn = page.locator("text=Crea Team");
    await expect(createTeamBtn).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("team page shows my teams tab", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const myTeamsTab = page.locator("text=I miei team");
    await expect(myTeamsTab).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("team page shows join team tab", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const joinTeamTab = page.locator("text=Entra nel Team");
    await expect(joinTeamTab).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("team page shows team info tab", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const teamInfoTab = page.locator("text=Configurazione");
    await expect(teamInfoTab).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can create a team", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    await page.click("text=Crea Team");
    await page.waitForTimeout(1000);

    const nameInput = page.locator('input[placeholder*="Nome Team"]');
    await expect(nameInput).toBeVisible({ timeout: 3000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});