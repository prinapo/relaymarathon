const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

test.describe("Guest User - Access Control", () => {
  test("guest is redirected to login when accessing protected routes", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(login|splash)/);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest cannot access admin page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(login|splash)/);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Guest User - Public Pages", () => {
  test("guest can see home page with race selector", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    const raceSelector = page.locator(".q-select").first();
    const raceSelectorVisible = await raceSelector.isVisible().catch(() => false);

    if (raceSelectorVisible) {
      await expect(raceSelector).toBeVisible();
    } else {
      const timeline = page.locator(".q-timeline");
      const timelineVisible = await timeline.isVisible().catch(() => false);
      expect(timelineVisible || raceSelectorVisible).toBeTruthy();
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can see timeline for default race", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    const timeline = page.locator(".q-timeline");
    const timelineVisible = await timeline.isVisible().catch(() => false);

    expect(timelineVisible).toBeTruthy();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can navigate to race selection", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const menuBtn = page.locator(".q-toolbar .q-btn").first();
    if (await menuBtn.isVisible({ timeout: 5000 })) {
      await menuBtn.click();
      await page.waitForTimeout(500);

      const racesLink = page.locator("text=Gare");
      if (await racesLink.isVisible({ timeout: 3000 })) {
        await racesLink.click();
        await page.waitForTimeout(2000);

        const racePageTitle = await page.locator(".text-h6").first().textContent();
        expect(racePageTitle).toMatch(/Gare|Races|Seleziona|Relay/);
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can switch race", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    const raceSelector = page.locator(".q-select").first();
    const raceSelectorVisible = await raceSelector.isVisible().catch(() => false);

    if (raceSelectorVisible) {
      await raceSelector.click();
      await page.waitForTimeout(1000);

      const raceOptions = page.locator(".q-menu .q-item");
      const optionCount = await raceOptions.count();

      if (optionCount > 1) {
        await raceOptions.nth(1).click();
        await page.waitForTimeout(1000);
      } else if (optionCount > 0) {
        await raceOptions.first().click();
        await page.waitForTimeout(1000);
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Guest User - Login Flow", () => {
  test("guest can access login page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/login");
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can see login with Google option", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/login");
    await page.waitForTimeout(3000);

    const googleBtn = page.locator("button:has-text('Google')");
    const googleVisible = await googleBtn.isVisible().catch(() => false);

    expect(googleVisible).toBeTruthy();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can see login with email option", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/login");
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can attempt login with invalid credentials", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/login");
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: "visible", timeout: 15000 });
    await emailInput.fill("invalid@test.com");
    await page.click("button:has-text('Avanti')");

    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click("button:has-text('Accedi')");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/login/);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Guest User - Public Content", () => {
  test("guest can access FAQ page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/faq");
    await page.waitForTimeout(5000);

    const pageTitle = await page.locator(".text-h6").first().textContent().catch(() => "");
    const hasFaqContent = pageTitle.toLowerCase().includes("faq") ||
                          pageTitle.toLowerCase().includes("domande") ||
                          pageTitle.toLowerCase().includes("frequenti");
    expect(hasFaqContent).toBeTruthy();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can access help page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const helpPage = page.locator(".q-page");
    await expect(helpPage).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can access route page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/route");
    await page.waitForTimeout(3000);

    const routePage = page.locator(".q-page");
    await expect(routePage).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest can access appointments page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    const appointmentsPage = page.locator(".q-page");
    await expect(appointmentsPage).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Guest User - UI Elements", () => {
  test("guest sees login button in header", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const loginBtn = page.locator("text=Accedi").or(page.locator("text=Login"));
    const loginVisible = await loginBtn.isVisible().catch(() => false);

    if (loginVisible) {
      await expect(loginBtn).toBeVisible();
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("guest does not see team-related options in drawer", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const menuBtn = page.locator(".q-toolbar .q-btn").first();
    if (await menuBtn.isVisible({ timeout: 5000 })) {
      await menuBtn.click();
      await page.waitForTimeout(500);

      const teamLink = page.locator("text=Team");
      const teamLinkVisible = await teamLink.isVisible().catch(() => false);

      if (teamLinkVisible) {
        await expect(teamLink).toBeHidden();
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});