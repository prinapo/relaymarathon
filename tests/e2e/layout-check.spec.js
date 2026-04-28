const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

test("Check menu layout position", async ({ page }) => {
  await setupConsoleCapture(page);
  await page.goto("/");
  await page.waitForTimeout(3000);

  // Take screenshot of home page
  await page.screenshot({ path: "test-screenshots/home.png" });
  console.log("Screenshot: home.png");

  // Open drawer and take screenshot
  const menuBtn = page.locator("button[aria-label='Menu']");
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-screenshots/drawer-open.png" });
    console.log("Screenshot: drawer-open.png");
  }

  // Check header position
  const header = page.locator("header.q-header");
  const headerBox = await header.boundingBox();
  console.log("Header position:", headerBox);

  // Check if drawer is on the left
  const drawer = page.locator(".q-drawer");
  const drawerBox = await drawer.boundingBox();
  console.log("Drawer position:", drawerBox);

  expect(headerBox).not.toBeNull();
  expect(drawerBox).not.toBeNull();
});