const { chromium } = require("@playwright/test");

const BASE_URL = process.env.TEST_URL || "http://localhost:9000";

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";
const RUNNER_EMAIL = "riprova@gmail.com";
const RUNNER_PASSWORD = "riprova!!";

const viewports = [
  { width: 390, height: 844, name: "iPhone 12" },
  { width: 412, height: 915, name: "Pixel 5" },
  { width: 1920, height: 1080, name: "Desktop" },
];

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/#/login`);
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

async function runTest(testName, testFn) {
  console.log(`\n→ ${testName}`);
  try {
    await testFn();
    console.log(`  ✓ PASSED`);
  } catch (error) {
    console.log(`  ✗ FAILED: ${error.message}`);
  }
}

async function runTests() {
  console.log("========================================");
  console.log("E2E Functional Tests - Milano Relay Marathon");
  console.log("========================================");

  for (const vp of viewports) {
    console.log(`\n📱 Testing on: ${vp.name} (${vp.width}x${vp.height})`);
    console.log("-".repeat(50));

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await runTest("Authentication - Login with captain", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      // Wait for potential redirect from splash screen
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/(home|team|splash)/)) {
        throw new Error(`Expected URL to match /#/(home|team|splash), got ${url}`);
      }
      // If we're on splash, wait for redirect to home/team
      if (url.includes('/#/splash')) {
        await page.waitForFunction(() => !window.location.href.includes('/#/splash'), { timeout: 10000 });
      }
      const finalUrl = page.url();
      if (!finalUrl.match(/#\/(home|team)/)) {
        throw new Error(`Expected final URL to match /#/(home|team), got ${finalUrl}`);
      }
    });

    await runTest("Navigation - Navigate to home page", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/(home|\/?$)/)) {
        throw new Error(`Expected URL to match /#/(home|/), got ${url}`);
      }
    });

    await runTest("Navigation - Navigate to team page", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#team`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/team/)) {
        throw new Error(`Expected URL to match /#/team, got ${url}`);
      }
    });

    await runTest("Navigation - Navigate to appointments page", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#appointments`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/appointments/)) {
        throw new Error(`Expected URL to match /#/appointments, got ${url}`);
      }
    });

    await runTest("Navigation - Navigate to FAQ page", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#faq`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/faq/)) {
        throw new Error(`Expected URL to match /#/faq, got ${url}`);
      }
    });

    await runTest("Home - Race table displays", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const table = page.locator("table.q-table");
      if (!(await table.isVisible({ timeout: 10000 }))) {
        throw new Error("Race table not visible");
      }
    });

    await runTest("Home - Race selector works", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const raceSelector = page.locator(".q-select").first();
      if (!(await raceSelector.isVisible({ timeout: 5000 }))) {
        throw new Error("Race selector not visible");
      }
    });

    await runTest("Home - Segment edit dialog opens", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const row = page.locator("table.q-table tbody tr").nth(3);
      await row.waitFor({ state: "visible", timeout: 10000 });
      const cell = row.locator("td").first();
      await cell.click();
      const dialog = page.locator(".q-dialog");
      if (!(await dialog.isVisible({ timeout: 5000 }))) {
        throw new Error("Segment edit dialog not visible");
      }
    });

    await runTest("Home - Segment edit dialog closes on cancel", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const row = page.locator("table.q-table tbody tr").nth(3);
      await row.waitFor({ state: "visible", timeout: 10000 });
      const cell = row.locator("td").first();
      await cell.click();
      const cancelBtn = page.locator("button:has-text('Annulla')");
      if (await cancelBtn.isVisible({ timeout: 3000 })) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
        const dialog = page.locator(".q-dialog");
        if (await dialog.isVisible({ timeout: 3000 })) {
          throw new Error("Dialog should be closed");
        }
      }
    });

    await runTest("Team - Team page loads", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#team`);
      await page.waitForTimeout(3000);
      const createTeamBtn = page.locator("text=Crea Team");
      if (!(await createTeamBtn.isVisible({ timeout: 5000 }))) {
        throw new Error("Create Team button not visible");
      }
    });

    await runTest("Team - Join Team tab visible", async () => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#team`);
      await page.waitForTimeout(3000);
      const joinTab = page.locator(".q-tab:has-text('Entra nel Team')");
      await joinTab.waitFor({ state: "visible", timeout: 5000 });
    });

    await runTest("Security - Redirect to login when not authenticated", async () => {
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/login/)) {
        throw new Error(`Expected redirect to /#/login, got ${url}`);
      }
    });

    await runTest("Security - Runner cannot access admin", async () => {
      await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
      await page.goto(`${BASE_URL}/#admin`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/(home|team)/)) {
        throw new Error(`Expected redirect to /#/(home|team), got ${url}`);
      }
    });

    await browser.close();
  }

  console.log("\n========================================");
  console.log("All tests completed!");
  console.log("========================================");
}

runTests().catch(console.error);
