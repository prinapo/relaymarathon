const { test } = require("@playwright/test");

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";

async function login(page, email, password) {
  await page.goto("/#login");
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

test.describe("Timeline Icons Debug", () => {
  test("debug timeline DOM structure", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    // Check timeline structure
    const timeline = page.locator(".q-timeline");
    const timelineExists = await timeline.count();
    console.log("Timeline exists:", timelineExists);

    // Check timeline entries
    const entries = page.locator(".q-timeline__entry");
    const entryCount = await entries.count();
    console.log("Timeline entries:", entryCount);

    // Check timeline dots (Quasar's internal structure)
    const dots = page.locator(".q-timeline__dot");
    const dotCount = await dots.count();
    console.log("Timeline dots:", dotCount);

    // Get all elements with timeline-related classes
    const allTimelineElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="timeline"]');
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        class: el.className,
        html: el.innerHTML.substring(0, 200)
      }));
    });
    console.log("Timeline elements:", JSON.stringify(allTimelineElements, null, 2));

    await page.screenshot({ path: "timeline-debug.png", fullPage: true });
  });

  test("check icon rendering", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    // Look for q-icon elements in timeline
    const qIcons = page.locator(".q-timeline__entry .q-icon");
    const iconCount = await qIcons.count();
    console.log("Q-icons in timeline entries:", iconCount);

    // Check all icons with specific names
    const allIcons = await page.evaluate(() => {
      const icons = document.querySelectorAll('.q-timeline .q-icon, .q-timeline [class*="material-icons"]');
      return Array.from(icons).map(el => ({
        class: el.className,
        text: el.textContent,
        html: el.outerHTML
      }));
    });
    console.log("Icons in timeline:", JSON.stringify(allIcons, null, 2));

    await page.screenshot({ path: "timeline-icons-debug.png", fullPage: true });
  });
});
