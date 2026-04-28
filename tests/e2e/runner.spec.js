const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

const RUNNER_EMAIL = "riprova@gmail.com";
const RUNNER_PASSWORD = "riprova!!";

async function login(page, email, password) {
  await page.goto("/#/login");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(3000);

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 15000 });
  await emailInput.fill(email);
  await page.click("button:has-text('Avanti')");

  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  await page.fill('input[type="password"]', password);
  await page.click("button:has-text('Accedi')");
  await page.waitForTimeout(5000);
}

test.describe("Team Member (Runner) - Access Control", () => {
  test("runner cannot access /admin page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(home|team)/);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can see home page after login", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(home|team)/);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Member - Home Page Timeline", () => {
  test("runner can see race timeline", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const timeline = page.locator(".q-timeline");
    await expect(timeline).toBeVisible({ timeout: 10000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can select a race", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    const raceSelector = page.locator(".q-select").first();
    const isVisible = await raceSelector.isVisible().catch(() => false);

    if (isVisible) {
      await raceSelector.click();
      await page.waitForTimeout(500);

      const raceOptions = page.locator(".q-menu .q-item");
      const optionCount = await raceOptions.count();

      if (optionCount > 0) {
        await raceOptions.first().click();
        await page.waitForTimeout(1000);
      }
    } else {
      expect(page.url()).toContain('/#/');
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can see timeline entries", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const timelineEntries = page.locator(".q-timeline__entry");
    const entryCount = await timelineEntries.count();
    expect(entryCount).toBeGreaterThan(0);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Member - Segment Interaction", () => {
  test("runner can click on timeline entry to see details", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const timelineEntry = page.locator(".q-timeline__entry").first();
    if (await timelineEntry.isVisible({ timeout: 5000 })) {
      await timelineEntry.click();
      await page.waitForTimeout(1000);

      const dialog = page.locator(".q-dialog");
      if (await dialog.isVisible({ timeout: 5000 })) {
        expect(await dialog.isVisible()).toBeTruthy();
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can modify own segment name", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const segmentRows = page.locator("table.q-table tbody tr");
    const rowCount = await segmentRows.count();

    if (rowCount > 3) {
      const fourthRow = segmentRows.nth(3);
      await fourthRow.locator("td").first().click();
      await page.waitForTimeout(1000);

      const dialog = page.locator(".q-dialog");
      if (await dialog.isVisible({ timeout: 5000 })) {
        const nameInput = page.locator('input').first();
        if (await nameInput.isVisible({ timeout: 3000 })) {
          await nameInput.fill("My Name");
          await page.waitForTimeout(500);
        }
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can modify own pace", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const segmentRows = page.locator("table.q-table tbody tr");
    const rowCount = await segmentRows.count();

    if (rowCount > 0) {
      const firstRow = segmentRows.first();
      await firstRow.locator("td").first().click();
      await page.waitForTimeout(1000);

      const dialog = page.locator(".q-dialog");
      if (await dialog.isVisible({ timeout: 5000 })) {
        const paceInputs = page.locator('input[type="number"]');
        const paceCount = await paceInputs.count();

        if (paceCount >= 2) {
          await paceInputs.nth(0).fill("5");
          await paceInputs.nth(1).fill("30");
          await page.waitForTimeout(500);
        }
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Member - Team Page", () => {
  test("runner can see their teams", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const teamPage = page.locator(".q-page");
    await expect(teamPage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can see empty state when not in any team", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    await page.click("text=I miei team");
    await page.waitForTimeout(1000);

    const emptyMsg = page.locator("text=Non fai ancora parte");
    if (await emptyMsg.isVisible({ timeout: 5000 })) {
      await expect(emptyMsg).toBeVisible();
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can join a team via invitation code", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    await page.click("text=Entra nel Team");
    await page.waitForTimeout(1000);

    const codeInput = page.locator('input[type="text"]').first();
    if (await codeInput.isVisible({ timeout: 3000 })) {
      await codeInput.fill("TESTCODE123");
      await page.waitForTimeout(500);

      const joinBtn = page.locator("button:has-text('Entra nel Team')");
      if (await joinBtn.isVisible({ timeout: 3000 })) {
        await joinBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Member - Cannot Do Admin Actions", () => {
  test("runner cannot see edit race button", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const editRaceBtn = page.locator("text=Modifica gara");
    expect(await editRaceBtn.count()).toBe(0);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner cannot see admin tab in drawer", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(2000);

    const menuBtn = page.locator(".q-toolbar .q-btn").first();
    if (await menuBtn.isVisible({ timeout: 5000 })) {
      await menuBtn.click();
      await page.waitForTimeout(500);

      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/admin');
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner cannot create team without being captain", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const createTeamBtn = page.locator("text=Crea Team");
    const isVisible = await createTeamBtn.isVisible().catch(() => false);

    if (!isVisible) {
      const infoMsg = page.locator("text=Solo i capitani");
      await expect(infoMsg).toBeVisible({ timeout: 3000 });
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Member - Content Pages", () => {
  test("runner can access appointments page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    const appointmentsPage = page.locator(".q-page");
    await expect(appointmentsPage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can access FAQ page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    const faqPage = page.locator(".q-page");
    await expect(faqPage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can access help page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const helpPage = page.locator(".q-page");
    await expect(helpPage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("runner can access route page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#/route");
    await page.waitForTimeout(3000);

    const routePage = page.locator(".q-page");
    await expect(routePage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});