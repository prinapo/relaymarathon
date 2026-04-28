const { test } = require("@playwright/test");

test("Check console errors on home page", async ({ page }) => {
  const errors = [];
  const warnings = [];
  
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
    if (msg.type() === "warning") {
      warnings.push(msg.text());
    }
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on("pageerror", error => {
    errors.push(error.message);
    console.log(`[pageerror] ${error.message}`);
  });

  await page.goto("/");
  await page.waitForTimeout(5000);

  console.log("\n=== SUMMARY ===");
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log("\nErrors found:");
    errors.forEach(e => console.log(`  - ${e.substring(0, 200)}`));
  }
});