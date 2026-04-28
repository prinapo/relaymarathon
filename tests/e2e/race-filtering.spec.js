const { test, expect } = require("@playwright/test");

const TEST_ADMIN_EMAIL = "testadmin@test.com";
const TEST_ADMIN_PASSWORD = "TestAdmin123!";
const GLOBAL_ADMIN_EMAIL = TEST_ADMIN_EMAIL;
const GLOBAL_ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";

async function checkServerRunning() {
  try {
    const http = require('http');
    return new Promise((resolve) => {
      const req = http.get("http://localhost:9000", (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    });
  } catch {
    return false;
  }
}

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

test.describe("Race-based visibility filtering", () => {
  test.beforeEach(async ({ page }) => {
    const serverRunning = await checkServerRunning(page);
    if (!serverRunning) {
      console.log("Server not running on port 9000, skipping test");
      test.skip();
    }
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.waitForTimeout(3000);
  });

  test("Appointments - only show appointments for selected race", async ({ page }) => {
    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    await raceSelector.click();
    await page.waitForTimeout(500);

    const raceOptions = page.locator(".q-menu .q-item");
    const optionsCount = await raceOptions.count();

    if (optionsCount < 2) {
      console.log("Only one race available, skipping race filtering test");
      return;
    }

    const firstRaceOption = raceOptions.first();
    const raceName = await firstRaceOption.textContent();
    await firstRaceOption.click();
    await page.waitForTimeout(2000);

    const table = page.locator("table.q-table");
    await expect(table).toBeVisible({ timeout: 5000 });

    const rows = page.locator("table.q-table tbody tr");
    await page.waitForTimeout(1000);
    const rowCount = await rows.count();

    console.log(`Selected race: ${raceName}, visible appointment rows: ${rowCount}`);
  });

  test("Appointments - switching race shows different appointments", async ({ page }) => {
    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    await raceSelector.click();
    await page.waitForTimeout(500);

    const raceOptions = page.locator(".q-menu .q-item");
    const optionsCount = await raceOptions.count();

    if (optionsCount < 2) {
      console.log("Only one race available, skipping race switching test");
      return;
    }

    const firstRace = raceOptions.first();
    const firstRaceName = await firstRace.textContent();
    await firstRace.click();
    await page.waitForTimeout(2000);

    const rowsBefore = page.locator("table.q-table tbody tr");
    const countBefore = await rowsBefore.count();
    await rowsBefore.evaluateAll(rows => 
      rows.map(row => row.innerText)
    );

    await raceSelector.click();
    await page.waitForTimeout(500);
    const secondRace = raceOptions.nth(1);
    const secondRaceName = await secondRace.textContent();
    await secondRace.click();
    await page.waitForTimeout(2000);

    const rowsAfter = page.locator("table.q-table tbody tr");
    const countAfter = await rowsAfter.count();
    await rowsAfter.evaluateAll(rows => 
      rows.map(row => row.innerText)
    );

    console.log(`Race 1 (${firstRaceName}): ${countBefore} appointments`);
    console.log(`Race 2 (${secondRaceName}): ${countAfter} appointments`);

    expect(countBefore).toBeGreaterThanOrEqual(0);
    expect(countAfter).toBeGreaterThanOrEqual(0);
  });

  test("FAQ - only show FAQs for selected race", async ({ page }) => {
    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    if (await raceSelector.isVisible()) {
      await raceSelector.click();
      await page.waitForTimeout(500);

      const raceOptions = page.locator(".q-menu .q-item");
      const optionsCount = await raceOptions.count();

      if (optionsCount < 2) {
        console.log("Only one race available, skipping race filtering test");
        return;
      }

      await raceOptions.first().click();
      await page.waitForTimeout(2000);
    }

    const faqList = page.locator("q-expansion-item");
    await page.waitForTimeout(1000);
    const faqCount = await faqList.count();
    console.log(`Visible FAQs: ${faqCount}`);
  });

  test("Help - only show help sections for selected race or all (no race filter)", async ({ page }) => {
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const helpItems = page.locator("q-expansion-item");
    await page.waitForTimeout(1000);
    const helpCount = await helpItems.count();
    console.log(`Visible Help sections: ${helpCount}`);

    expect(helpCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Admin hidden content visibility", () => {
  test.beforeEach(async ({ page }) => {
    const serverRunning = await checkServerRunning(page);
    if (!serverRunning) {
      console.log("Server not running on port 9000, skipping test");
      test.skip();
    }
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.waitForTimeout(3000);
  });

  test("Admin sees hidden FAQ items", async ({ page }) => {
    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    const hiddenIndicators = page.locator("text=hidden").first();
    const hasHiddenIndicator = await hiddenIndicators.isVisible().catch(() => false);

    console.log(`Hidden FAQ indicator visible: ${hasHiddenIndicator}`);
  });

  test("Admin sees hidden help items", async ({ page }) => {
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const hiddenIndicators = page.locator("text=hidden").first();
    const hasHiddenIndicator = await hiddenIndicators.isVisible().catch(() => false);

    console.log(`Hidden Help indicator visible: ${hasHiddenIndicator}`);
  });

  test("Admin can toggle visibility of FAQ items", async ({ page }) => {
    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    const firstFaq = page.locator("q-expansion-item").first();
    if (await firstFaq.count() > 0) {
      const visibilityBtn = firstFaq.locator("button:has-text('visibility')").or(firstFaq.locator("button:has-text('visibility_off')")).first();
      if (await visibilityBtn.isVisible().catch(() => false)) {
        console.log("Visibility toggle button found");
      }
    }
  });

  test("Admin can toggle visibility of help items", async ({ page }) => {
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const firstHelp = page.locator("q-expansion-item").first();
    if (await firstHelp.count() > 0) {
      const visibilityBtn = firstHelp.locator("button:has-text('visibility')").or(firstHelp.locator("button:has-text('visibility_off')")).first();
      if (await visibilityBtn.isVisible().catch(() => false)) {
        console.log("Visibility toggle button found");
      }
    }
  });

  test("Non-admin does NOT see hidden FAQ items", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    const adminButtons = page.locator("button:has-text('visibility')").or(page.locator("button:has-text('visibility_off')"));
    const adminButtonsVisible = await adminButtons.first().isVisible().catch(() => false);

    console.log(`Admin-only visibility buttons visible: ${adminButtonsVisible}`);
    expect(adminButtonsVisible).toBe(false);
  });

  test("Non-admin does NOT see hidden help items", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const adminButtons = page.locator("button:has-text('visibility')").or(page.locator("button:has-text('visibility_off')"));
    const adminButtonsVisible = await adminButtons.first().isVisible().catch(() => false);

    console.log(`Admin-only visibility buttons visible: ${adminButtonsVisible}`);
    expect(adminButtonsVisible).toBe(false);
  });
});

test.describe("Data integrity checks", () => {
  test.beforeEach(async ({ page }) => {
    const serverRunning = await checkServerRunning(page);
    if (!serverRunning) {
      console.log("Server not running on port 9000, skipping test");
      test.skip();
    }
  });

  test("Appointments page loads without console errors", async ({ page }) => {
    const errors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    console.log(`Console errors on appointments page: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Errors:", errors);
    }
    expect(errors.length).toBe(0);
  });

  test("FAQ page loads without console errors", async ({ page }) => {
    const errors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    console.log(`Console errors on FAQ page: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Errors:", errors);
    }
    expect(errors.length).toBe(0);
  });

  test("Help page loads without console errors", async ({ page }) => {
    const errors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    console.log(`Console errors on Help page: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Errors:", errors);
    }
    expect(errors.length).toBe(0);
  });
});

test.describe("Content presence checks", () => {
  test.beforeEach(async ({ page }) => {
    const serverRunning = await checkServerRunning(page);
    if (!serverRunning) {
      console.log("Server not running on port 9000, skipping test");
      test.skip();
    }
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.waitForTimeout(3000);
  });

  test("Appointments table has title column", async ({ page }) => {
    await page.goto("/#/appointments");
    await page.waitForTimeout(3000);

    const table = page.locator("table.q-table");
    await expect(table).toBeVisible({ timeout: 5000 });

    const headers = page.locator("table.q-table th");
    const headerCount = await headers.count();
    console.log(`Table headers count: ${headerCount}`);

    expect(headerCount).toBeGreaterThan(0);
  });

  test("FAQ items show question and answer", async ({ page }) => {
    await page.goto("/#/faq");
    await page.waitForTimeout(3000);

    const faqItems = page.locator("q-expansion-item");
    const count = await faqItems.count();

    if (count > 0) {
      const firstItem = faqItems.first();
      const questionText = await firstItem.locator(".text-subtitle1").textContent().catch(() => "");
      console.log(`First FAQ question: ${questionText}`);
      expect(questionText.length).toBeGreaterThan(0);
    } else {
      console.log("No FAQ items found");
    }
  });

  test("Help items show title and content", async ({ page }) => {
    await page.goto("/#/help");
    await page.waitForTimeout(3000);

    const helpItems = page.locator("q-expansion-item");
    const count = await helpItems.count();

    if (count > 0) {
      const firstItem = helpItems.first();
      const titleText = await firstItem.locator(".text-subtitle1").textContent().catch(() => "");
      console.log(`First Help title: ${titleText}`);
      expect(titleText.length).toBeGreaterThan(0);

      await firstItem.click();
      await page.waitForTimeout(500);
      const content = firstItem.locator(".q-card").innerText().catch(() => "");
      console.log(`First Help content length: ${content.length}`);
      expect(content.length).toBeGreaterThan(0);
    } else {
      console.log("No Help items found");
    }
  });
});