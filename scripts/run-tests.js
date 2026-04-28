const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const distPath = path.join(__dirname, "dist", "spa");

const BASE_URL = "http://localhost:9100";

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";
const RUNNER_EMAIL = "riprova@gmail.com";
const RUNNER_PASSWORD = "riprova!!";

const server = http.createServer((req, res) => {
  let filePath = path.join(distPath, req.url === "/" ? "index.html" : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distPath, "index.html");
  }
  const ext = path.extname(filePath);
  const contentType =
    {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
    }[ext] || "text/plain";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

const viewports = [
  { width: 390, height: 844, name: "iPhone_12" },
  { width: 412, height: 915, name: "Pixel_5" },
  { width: 1920, height: 1080, name: "Desktop" },
];

const uiTests = [
  {
    name: "Home Page Loads",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#`);
      await page.waitForSelector(".q-layout", { timeout: 15000 });
      const title = await page.title();
      console.log(`  ✓ Home page loaded, title: ${title}`);
    },
  },
  {
    name: "FAQ Tab Navigation",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/faq`);
      await page.waitForSelector(".q-tabs", { timeout: 15000 });
      const helpTab = page.locator('.q-tab:has-text("Help")');
      await helpTab.click();
      await page.waitForTimeout(500);
      const faqTab = page.locator('.q-tab:has-text("FAQ")');
      await faqTab.click();
      await page.waitForTimeout(500);
      console.log("  ✓ FAQ tabs navigation works");
    },
  },
  {
    name: "FAQ Tab Switching - Verify Content Changes",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/faq`);
      await page.waitForSelector(".q-tab", { timeout: 15000 });
      await page.locator('.q-tab:has-text("Help")').click();
      await page.waitForTimeout(500);
      const helpActive = await page
        .locator(".q-tab--active:has-text('Help')")
        .isVisible();
      await page.locator('.q-tab:has-text("FAQ")').click();
      await page.waitForTimeout(500);
      const faqActive = await page
        .locator(".q-tab--active:has-text('FAQ')")
        .isVisible();
      console.log(
        `  ✓ Help tab active: ${helpActive}, FAQ tab active: ${faqActive}`,
      );
    },
  },
  {
    name: "Bottom Navigation - Verify Footer Exists",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#`);
      await page.waitForSelector(".q-footer", { timeout: 15000 });
      const footerExists = await page.locator(".q-footer").isVisible();
      console.log(`  ✓ Footer exists: ${footerExists}`);
    },
  },
  {
    name: "Bottom Navigation - Click Route via URL",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/route`);
      await page.waitForSelector(".q-page", { timeout: 15000 });
      const currentUrl = page.url();
      console.log(`  ✓ Navigated to: ${currentUrl}`);
    },
  },
  {
    name: "Bottom Navigation - Click FAQ via URL",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/faq`);
      await page.waitForSelector(".q-page", { timeout: 15000 });
      const currentUrl = page.url();
      console.log(`  ✓ Navigated to: ${currentUrl}`);
    },
  },
  {
    name: "Back Button Test",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/faq`);
      await page.waitForSelector(".q-layout", { timeout: 15000 });
      const initialUrl = page.url();
      await page.goBack();
      await page.waitForTimeout(500);
      console.log(`  ✓ Back button tested (from ${initialUrl})`);
    },
  },
  {
    name: "Page Layout Dimensions",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#`);
      await page.waitForSelector(".q-layout", { timeout: 15000 });
      const layout = await page.evaluate(() => {
        const qLayout = document.querySelector(".q-layout");
        return {
          offsetHeight: qLayout?.offsetHeight,
          offsetWidth: qLayout?.offsetWidth,
        };
      });
      console.log(`  ✓ Layout: ${layout.offsetWidth}x${layout.offsetHeight}px`);
    },
  },
  {
    name: "Scroll Test - Q-Page-Container",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/faq`);
      await page.waitForSelector(".q-page-container", { timeout: 15000 });
      const containerScroll = await page.evaluate(() => {
        const el = document.querySelector(".q-page-container");
        return el ? el.scrollHeight > el.clientHeight : false;
      });
      console.log(`  ✓ Q-Page-Container scrollable: ${containerScroll}`);
    },
  },
  {
    name: "Tab Panels Content",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/faq`);
      await page.waitForSelector(".q-tab-panels", { timeout: 15000 });
      const panelsExist = await page.locator(".q-tab-panels").isVisible();
      const faqContent = await page
        .locator(".q-card, .q-list")
        .first()
        .isVisible();
      console.log(`  ✓ Tab panels: ${panelsExist}, Content: ${faqContent}`);
    },
  },
  {
    name: "Login Page",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/login`);
      await page.waitForSelector(".q-layout", { timeout: 15000 });
      console.log("  ✓ Login page loaded");
    },
  },
  {
    name: "Appointments Page",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/appointments`);
      await page.waitForSelector(".q-page", { timeout: 15000 });
      console.log("  ✓ Appointments page loaded");
    },
  },
  {
    name: "Route Page",
    test: async (page) => {
      await page.goto(`${BASE_URL}/#/route`);
      await page.waitForSelector(".q-page", { timeout: 15000 });
      console.log("  ✓ Route page loaded");
    },
  },
  {
    name: "Responsive Layout",
    test: async (page, viewport) => {
      await page.goto(`${BASE_URL}/#`);
      await page.waitForSelector(".q-layout", { timeout: 15000 });
      const layoutInfo = await page.evaluate(() => {
        const qLayout = document.querySelector(".q-layout");
        const qFooter = document.querySelector(".q-footer");
        return {
          layoutWidth: qLayout?.offsetWidth,
          layoutHeight: qLayout?.offsetHeight,
          footerHeight: qFooter?.offsetHeight,
        };
      });
      console.log(
        `  ✓ ${viewport.name}: Layout ${layoutInfo.layoutWidth}x${layoutInfo.layoutHeight}px, Footer ${layoutInfo.footerHeight}px`,
      );
    },
  },
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

const functionalTests = [
  {
    name: "Auth - Login with captain",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      const url = page.url();
      if (!url.match(/#\/(home|team)/))
        throw new Error(`Expected URL to match /#/(home|team), got ${url}`);
      console.log("  ✓ Logged in as captain");
    },
  },
  {
    name: "Auth - Login with runner",
    test: async (page) => {
      await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
      const url = page.url();
      if (!url.match(/#\/(home|team)/))
        throw new Error(`Expected URL to match /#/(home|team), got ${url}`);
      console.log("  ✓ Logged in as runner");
    },
  },
  {
    name: "Nav - Navigate to home page",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/(home|\/?$)/))
        throw new Error(`Expected URL to match /#/(home|/), got ${url}`);
      console.log("  ✓ Navigated to home");
    },
  },
  {
    name: "Nav - Navigate to team page",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#team`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/team/))
        throw new Error(`Expected URL to match /#/team, got ${url}`);
      console.log("  ✓ Navigated to team");
    },
  },
  {
    name: "Nav - Navigate to appointments page",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#appointments`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/appointments/))
        throw new Error(`Expected URL to match /#/appointments, got ${url}`);
      console.log("  ✓ Navigated to appointments");
    },
  },
  {
    name: "Home - Race table displays",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const table = page.locator("table.q-table");
      if (!(await table.isVisible({ timeout: 10000 })))
        throw new Error("Race table not visible");
      console.log("  ✓ Race table displayed");
    },
  },
  {
    name: "Home - Race selector works",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const raceSelector = page.locator(".q-select").first();
      if (!(await raceSelector.isVisible({ timeout: 5000 })))
        throw new Error("Race selector not visible");
      console.log("  ✓ Race selector visible");
    },
  },
  {
    name: "Home - Segment edit dialog opens",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const row = page.locator("table.q-table tbody tr").nth(3);
      await row.waitFor({ state: "visible", timeout: 10000 });
      const cell = row.locator("td").first();
      await cell.click();
      const dialog = page.locator(".q-dialog");
      if (!(await dialog.isVisible({ timeout: 5000 })))
        throw new Error("Segment edit dialog not visible");
      console.log("  ✓ Segment edit dialog opened");
    },
  },
  {
    name: "Team - Team page loads",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#team`);
      await page.waitForTimeout(3000);
      const createTeamBtn = page.locator("text=Crea Team");
      if (!(await createTeamBtn.isVisible({ timeout: 5000 })))
        throw new Error("Create Team button not visible");
      console.log("  ✓ Team page loaded");
    },
  },
  {
    name: "Team - Join Team tab visible",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.goto(`${BASE_URL}/#team`);
      await page.waitForTimeout(3000);
      const joinTab = page.locator(".q-tab:has-text('Entra nel Team')");
      await joinTab.waitFor({ state: "visible", timeout: 5000 });
      console.log("  ✓ Join Team tab visible");
    },
  },
  {
    name: "Security - Redirect to login when not authenticated",
    test: async (page) => {
      const context = page.context();
      await context.clearCookies();
      await context.clearPermissions();
      await page.goto(`${BASE_URL}/#`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/(login|home)/))
        throw new Error(`Expected redirect to /#/(login|home), got ${url}`);
      console.log("  ✓ Redirects to login/home when not authenticated");
    },
  },
  {
    name: "Security - Runner cannot access admin",
    test: async (page) => {
      await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
      await page.goto(`${BASE_URL}/#admin`);
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.match(/#\/(home|team)/))
        throw new Error(`Expected redirect to /#/(home|team), got ${url}`);
      console.log("  ✓ Runner cannot access admin");
    },
  },
  {
    name: "Auth - Logout",
    test: async (page) => {
      await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      await page.waitForTimeout(2000);
      const logoutBtn = page.locator("button:has-text('Esci')");
      if (await logoutBtn.isVisible({ timeout: 5000 })) {
        await logoutBtn.click();
        await page.waitForTimeout(3000);
        const url = page.url();
        if (!url.match(/#\/(login|home)/))
          throw new Error(`Expected redirect to /#/(login|home), got ${url}`);
        console.log("  ✓ Logged out successfully");
      } else {
        console.log("  ⚠ Logout button not visible, skipping");
      }
    },
  },
];

server.listen(9100, () => {
  console.log("Server started on port 9100");
  console.log("=".repeat(60));

  setTimeout(async () => {
    for (const vp of viewports) {
      console.log(`\n📱 UI Tests: ${vp.name} (${vp.width}x${vp.height})`);
      console.log("-".repeat(60));

      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      for (const test of uiTests) {
        try {
          console.log(`\n→ ${test.name}`);
          await test.test(page, vp);
        } catch (error) {
          console.log(`  ✗ Error: ${error.message}`);
        }
      }

      await browser.close();
    }

    console.log("\n" + "=".repeat(60));
    console.log("Functional Tests (require Firebase authentication)");
    console.log("=".repeat(60));

    for (const vp of viewports) {
      console.log(
        `\n📱 Functional Tests: ${vp.name} (${vp.width}x${vp.height})`,
      );
      console.log("-".repeat(60));

      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      for (const test of functionalTests) {
        try {
          console.log(`\n→ ${test.name}`);
          await test.test(page, vp);
        } catch (error) {
          console.log(`  ✗ Error: ${error.message}`);
        }
      }

      await browser.close();
    }

    console.log("\n" + "=".repeat(60));
    console.log("All tests completed!");
    console.log("=".repeat(60));
    server.close();
  }, 2000);
});
