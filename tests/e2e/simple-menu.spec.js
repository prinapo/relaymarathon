const { test, expect } = require("@playwright/test");
const { setupConsoleCapture } = require("./console-middleware");

test("Basic menu test", async ({ page }) => {
  const { errors } = await setupConsoleCapture(page);

  await page.goto("/");
  await page.waitForTimeout(3000);

  // Try to find and click menu button
  const menuBtn = page.locator("button[aria-label='Menu']");
  const isVisible = await menuBtn.isVisible().catch(() => false);
  console.log("Menu button visible:", isVisible);
  
  if (isVisible) {
    await menuBtn.click();
    await page.waitForTimeout(1000);
  }

  // Get all menu items
  const items = page.locator(".q-drawer .q-item");
  const count = await items.count();
  console.log("Menu items count:", count);
  
  for (let i = 0; i < count; i++) {
    const text = await items.nth(i).textContent();
    console.log(`  ${i}: ${text}`);
  }

  console.log("Errors:", errors.length);
  expect(errors.length).toBe(0);
});