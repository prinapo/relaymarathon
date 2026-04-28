const { test } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

test("Layout screenshot", async ({ page }) => {
  await setupConsoleCapture(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await page.waitForTimeout(2000);
  
  // Open drawer
  const menuBtn = page.locator("button[aria-label='Menu']");
  await menuBtn.click();
  await page.waitForTimeout(1000);
  
  // Screenshot
  await page.screenshot({ path: "test-screenshots/final-layout.png", fullPage: false });
  
  // Get positions
  const header = await page.locator("header.q-header").boundingBox();
  const drawer = await page.locator(".q-drawer").boundingBox();
  const pageContainer = await page.locator(".q-page-container").boundingBox();
  
  console.log("=== Positions ===");
  console.log("Header:", header);
  console.log("Drawer:", drawer);
  console.log("Page container:", pageContainer);
  
  // Check if they're separate
  if (drawer && header) {
    console.log("\nDrawer starts at y:", drawer.y);
    console.log("Header ends at y:", header.y + header.height);
    console.log("Overlap:", drawer.y < header.y + header.height);
  }
});