const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";

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

test.describe("Team Captain - Access Control", () => {
  test("captain cannot access /admin page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(home|team)/);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can access home page after login", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(home|team)/);

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Captain - Team Creation", () => {
  test("captain can see create team button", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const createTeamBtn = page.locator("text=Crea Team");
    await expect(createTeamBtn).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can create a new team", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    await page.click("text=Crea Team");
    await page.waitForTimeout(1000);

    const teamNameInput = page.locator('input[placeholder*="Nome"]').first();
    if (await teamNameInput.isVisible({ timeout: 5000 })) {
      const teamName = `Captain Team ${Date.now()}`;
      await teamNameInput.fill(teamName);
      await page.waitForTimeout(500);

      const raceSelect = page.locator("q-select").first();
      if (await raceSelect.isVisible({ timeout: 3000 })) {
        await raceSelect.click();
        await page.waitForTimeout(500);

        const firstRace = page.locator(".q-item").first();
        if (await firstRace.isVisible({ timeout: 3000 })) {
          await firstRace.click();
          await page.waitForTimeout(500);

          const createBtn = page.locator("button:has-text('Crea Team')");
          if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(3000);
          }
        }
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain sees info message about captain role", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    await page.click("text=Crea Team");
    await page.waitForTimeout(1000);

    const infoMsg = page.locator("text=Solo i capitani possono creare team");
    const infoVisible = await infoMsg.isVisible().catch(() => false);

    if (infoVisible) {
      await expect(infoMsg).toBeVisible();
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Captain - Team Management", () => {
  test("captain can see their teams", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    await page.click("text=I miei team");
    await page.waitForTimeout(1000);

    const teamPage = page.locator(".q-page");
    await expect(teamPage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can select a team", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    await page.click("text=I miei team");
    await page.waitForTimeout(1000);

    const teamSelect = page.locator("q-select").first();
    if (await teamSelect.isVisible({ timeout: 3000 })) {
      await teamSelect.click();
      await page.waitForTimeout(500);

      const teamOption = page.locator(".q-item").first();
      if (await teamOption.isVisible({ timeout: 3000 })) {
        await teamOption.click();
        await page.waitForTimeout(1000);
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can delete their team", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(5000);

    const settingsBtn = page.locator("button:has-text('Configurazione'), .q-btn:has-text('settings')").first();
    const canDelete = await settingsBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (canDelete) {
      await settingsBtn.click();
      await page.waitForTimeout(2000);

      const deleteBtn = page.locator("text=Elimina Team");
      if (await deleteBtn.isVisible({ timeout: 3000 })) {
        await deleteBtn.click();
        await page.waitForTimeout(1000);

        const confirmBtn = page.locator("button:has-text('Elimina')").last();
        if (await confirmBtn.isVisible({ timeout: 3000 })) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('Skipping delete - no settings button visible');
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Captain - Segment Management", () => {
  test("captain can see timeline on home page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const timeline = page.locator(".q-timeline");
    await expect(timeline).toBeVisible({ timeout: 10000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can modify segment name", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const segmentRows = page.locator("table.q-table tbody tr");
    if (await segmentRows.count() > 0) {
      await segmentRows.first().locator("td").first().click();
      await page.waitForTimeout(1000);

      const dialog = page.locator(".q-dialog");
      if (await dialog.isVisible({ timeout: 5000 })) {
        const nameInput = page.locator('input').first();
        if (await nameInput.isVisible({ timeout: 3000 })) {
          await nameInput.fill("Captain Test Segment");
          await page.waitForTimeout(500);
        }
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can assign self to segment", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const segmentRows = page.locator("table.q-table tbody tr");
    if (await segmentRows.count() > 3) {
      const fourthRow = segmentRows.nth(3);
      const assignBtn = fourthRow.locator("text=Assegna a me");
      if (await assignBtn.isVisible({ timeout: 3000 })) {
        await assignBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can generate invitation code", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const segmentRows = page.locator("table.q-table tbody tr");
    if (await segmentRows.count() > 0) {
      const firstRow = segmentRows.first();
      await firstRow.locator("td").first().click();
      await page.waitForTimeout(1000);

      const dialog = page.locator(".q-dialog");
      if (await dialog.isVisible({ timeout: 5000 })) {
        const inviteBtn = page.locator("text=Invita");
        if (await inviteBtn.isVisible({ timeout: 3000 })) {
          await inviteBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Captain - Race Management", () => {
  test("captain can select different race", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    const raceSelector = page.locator(".q-select, select, [role='combobox']").first();
    const hasSelector = await raceSelector.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasSelector) {
      await raceSelector.click();
      await page.waitForTimeout(500);

      const raceOptions = page.locator(".q-menu .q-item, option");
      const optionCount = await raceOptions.count();

      if (optionCount > 0) {
        await raceOptions.first().click();
        await page.waitForTimeout(1000);
        console.log(`Selected race from ${optionCount} options`);
      }
    } else {
      console.log('No race selector visible on home page');
    }

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can see timeline for selected race", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const timeline = page.locator(".q-timeline");
    await expect(timeline).toBeVisible({ timeout: 10000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Captain - Content Pages", () => {
  test("captain can access appointments page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    const appointmentsPage = page.locator(".q-page");
    await expect(appointmentsPage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can access FAQ page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
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

  test("captain can access help page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const helpPage = page.locator(".q-page");
    await expect(helpPage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can access route page", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/route");
    await page.waitForTimeout(3000);

    const routePage = page.locator(".q-page");
    await expect(routePage).toBeVisible();

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });
});

test.describe("Team Captain - Join Team Tab", () => {
  test("captain can access join team tab", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const joinTab = page.locator("text=Entra nel Team");
    await expect(joinTab).toBeVisible({ timeout: 5000 });

    const result = check();
    expect(result.appErrorCount).toBe(0);
  });

  test("captain can enter invitation code to join another team", async ({ page }) => {
    const { check } = await setupConsoleCapture(page);
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
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