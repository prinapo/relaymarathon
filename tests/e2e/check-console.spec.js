const { test } = require("@playwright/test");

test("Check console errors on home page", async ({ page }) => {
  const errors = [];
  const warnings = [];
  
  page.on("console", msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
    if (msg.type() === "warning") {
      warnings.push(msg.text());
    }
  });
  
  page.on("pageerror", error => {
    console.log(`[pageerror] ${error.message}`);
    errors.push(error.message);
  });

  await page.goto("/");
  await page.waitForTimeout(5000);

  console.log("\n=== SUMMARY ===");
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach(e => console.log(`  - ${e}`));
  }
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach(w => console.log(`  - ${w}`));
  }
});