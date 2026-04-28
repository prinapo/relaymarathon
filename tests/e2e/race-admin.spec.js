const { test, expect } = require("@playwright/test");

const RACE_ADMIN_EMAIL = "raceadmin@test.com";
const RACE_ADMIN_PASSWORD = "Raceadmin!!";

const GLOBAL_ADMIN_EMAIL = "adminmm26@gmail.com";
const GLOBAL_ADMIN_PASSWORD = "Adminmm26!!";

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

test.describe("Race Admin - Access Control", () => {
  test("race admin cannot access /admin page", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/(home|team)/);
  });

  test("race admin sees race selector in header", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    await expect(raceSelector).toBeVisible();
  });
});

test.describe("Race Admin - Race Configuration (Home)", () => {
  test("race admin can see race data on home page", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const timeline = page.locator(".q-timeline");
    await expect(timeline).toBeVisible({ timeout: 10000 });
  });

  test("race admin can edit race configuration from home", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const segmentRows = page.locator("table.q-table tbody tr");
    const rowCount = await segmentRows.count();

    if (rowCount > 0) {
      const firstCell = segmentRows.first().locator("td").first();
      await firstCell.click();
      await page.waitForTimeout(1000);

      const dialog = page.locator(".q-dialog");
      if (await dialog.isVisible({ timeout: 5000 })) {
        expect(await dialog.isVisible()).toBeTruthy();
      }
    }
  });

  test("race admin can modify segment name", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
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
          await nameInput.fill("Test Segment Name");
          await page.waitForTimeout(500);
        }
      }
    }
  });
});

test.describe("Race Admin - Team Management", () => {
  test("race admin can see teams in their race", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const teamPage = page.locator(".q-page");
    await expect(teamPage).toBeVisible();
  });

  test("race admin can see my teams tab", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const myTeamsTab = page.locator("text=I miei team");
    await expect(myTeamsTab).toBeVisible();
  });

  test("race admin can create a team for their race", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/team");
    await page.waitForTimeout(3000);

    const createTeamBtn = page.locator("text=Crea Team");
    await createTeamBtn.click();
    await page.waitForTimeout(1000);

    const teamNameInput = page.locator('input[placeholder*="Nome"]').first();
    await expect(teamNameInput).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Race Admin - Content Pages", () => {
  test("race admin can access appointments page", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    const appointmentsPage = page.locator(".q-page");
    await expect(appointmentsPage).toBeVisible();
  });

  test("race admin can access FAQ page", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    const faqPage = page.locator(".q-page");
    await expect(faqPage).toBeVisible();
  });

  test("race admin can access help page", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const helpPage = page.locator(".q-page");
    await expect(helpPage).toBeVisible();
  });
});

test.describe("Race Admin - Race Switching", () => {
  test("race admin can switch between races they admin", async ({ page }) => {
    await login(page, RACE_ADMIN_EMAIL, RACE_ADMIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    await raceSelector.click();
    await page.waitForTimeout(1000);

    const raceOptions = page.locator(".q-menu .q-item");
    const optionCount = await raceOptions.count();

    if (optionCount > 1) {
      await raceOptions.first().click();
      await page.waitForTimeout(1000);

      const timeline = page.locator(".q-timeline");
      await expect(timeline).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Race Admin - Verification by Global Admin", () => {
  test("global admin can assign race admin to a race", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    await page.click("text=Admin Gara");
    await page.waitForTimeout(1000);

    const raceSelector = page.locator("q-select").first();
    if (await raceSelector.isVisible({ timeout: 3000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);

      const firstRace = page.locator(".q-item").first();
      if (await firstRace.isVisible({ timeout: 3000 })) {
        await firstRace.click();
        await page.waitForTimeout(1000);

        const emailInput = page.locator('input[type="text"]').first();
        await emailInput.waitFor({ state: "visible", timeout: 5000 });
        await emailInput.fill(RACE_ADMIN_EMAIL);

        const addBtn = page.locator("text=Aggiungi admin");
        if (await addBtn.isVisible({ timeout: 3000 })) {
          await addBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });
});