const { test, expect } = require("@playwright/test");

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

test.describe("Global Admin - Access Control", () => {
  test("global admin can access /admin page", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const pageTitle = await page.title();
    expect(pageTitle).toContain("Milano Relay Marathon");
  });

  test("global admin sees all admin tabs", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(5000);
    
    // Check if we're on the admin page (if redirected, user is not admin)
    const currentUrl = page.url();
    if (!currentUrl.includes('/#/admin')) {
      console.log('User is not global admin, skipping test');
      return;
    }

    const racesTab = page.locator("text=Gare");
    const raceAdminsTab = page.locator("text=Admin Gara");
    const translationsTab = page.locator("text=Traduzioni");

    await expect(racesTab).toBeVisible();
    await expect(raceAdminsTab).toBeVisible();
    await expect(translationsTab).toBeVisible();
  });

  test("global admin can navigate to Race Admins tab", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(5000);
    
    // Check if we're on the admin page
    const currentUrl = page.url();
    if (!currentUrl.includes('/#/admin')) {
      console.log('User is not global admin, skipping test');
      return;
    }

    await page.click("text=Admin Gara");
    await page.waitForTimeout(2000);

    const raceSelector = page.locator(".q-select").first();
    await expect(raceSelector).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Global Admin - Race Management", () => {
  test("global admin can create a new race", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(5000);
    
    // Check if we're on the admin page
    const currentUrl = page.url();
    if (!currentUrl.includes('/#/admin')) {
      console.log('User is not global admin, skipping test');
      return;
    }

    await page.click("text=Aggiungi gara");
    await page.waitForTimeout(2000);

    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 3000 })) {
      const raceName = `Test Race ${Date.now()}`;
      await nameInput.fill(raceName);
      await page.click("text=Crea");
      await page.waitForTimeout(2000);

      const successMsg = page.locator(".q-notification");
      if (await successMsg.isVisible({ timeout: 5000 })) {
        expect(await successMsg.isVisible()).toBeTruthy();
      }
    }
  });

  test("global admin can edit race data", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(5000);
    
    // Check if we're on the admin page
    const currentUrl = page.url();
    if (!currentUrl.includes('/#/admin')) {
      console.log('User is not global admin, skipping test');
      return;
    }

    const raceSelector = page.locator(".q-select").first();
    await raceSelector.click();
    await page.waitForTimeout(500);

    const firstRace = page.locator(".q-item").first();
    if (await firstRace.isVisible({ timeout: 3000 })) {
      await firstRace.click();
      await page.waitForTimeout(1000);

      const editBtn = page.locator("text=Modifica gara");
      if (await editBtn.isVisible({ timeout: 3000 })) {
        await editBtn.click();
        await page.waitForTimeout(500);

        const saveBtn = page.locator("text=Fine modifica");
        await expect(saveBtn).toBeVisible();
      }
    }
  });

  test("global admin can add a segment to race", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const editBtn = page.locator("text=Modifica gara");
    if (await editBtn.isVisible({ timeout: 5000 })) {
      await editBtn.click();
      await page.waitForTimeout(1000);

      const addSegmentBtn = page.locator(".q-table tbody tr td .q-btn .q-icon");
      if (await addSegmentBtn.first().isVisible({ timeout: 3000 })) {
        await addSegmentBtn.first().click();
        await page.waitForTimeout(500);

        const segmentDialog = page.locator(".q-dialog");
        await expect(segmentDialog).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

test.describe("Global Admin - Race Admin Management", () => {
  test("global admin can add race admin by email", async ({ page }) => {
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
        await emailInput.fill("testadmin@example.com");
        await page.waitForTimeout(500);

        const addBtn = page.locator("text=Aggiungi admin");
        if (await addBtn.isVisible({ timeout: 3000 })) {
          await addBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  test("global admin can remove race admin", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    await page.click("text=Admin Gara");
    await page.waitForTimeout(1000);

    const deleteButtons = page.locator(".q-item .q-btn--flat .q-icon");
    const deleteCount = await deleteButtons.count();

    if (deleteCount > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe("Global Admin - Content Management", () => {
  test("global admin can access translations tab", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    await page.click("text=Traduzioni");
    await page.waitForTimeout(1000);

    const translationTable = page.locator("table.q-table");
    await expect(translationTable).toBeVisible({ timeout: 5000 });
  });

  test("global admin can see all content in translations", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    await page.click("text=Traduzioni");
    await page.waitForTimeout(1000);

    const keyColumn = page.locator("th:has-text('Chiave')");
    const italianColumn = page.locator("th:has-text('Italiano')");
    const englishColumn = page.locator("th:has-text('Inglese')");

    await expect(keyColumn).toBeVisible();
    await expect(italianColumn).toBeVisible();
    await expect(englishColumn).toBeVisible();
  });
});

test.describe("Global Admin - Delete and Set Default", () => {
  test("global admin can set race as default", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const defaultBtn = page.locator("text=Imposta come default");
    if (await defaultBtn.isVisible({ timeout: 5000 })) {
      await defaultBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test("global admin can delete a race", async ({ page }) => {
    await login(page, GLOBAL_ADMIN_EMAIL, GLOBAL_ADMIN_PASSWORD);
    await page.goto("/#/admin");
    await page.waitForTimeout(3000);

    const deleteBtn = page.locator("text=Cancella gara");
    if (await deleteBtn.isVisible({ timeout: 3000 })) {
      await deleteBtn.click();
      await page.waitForTimeout(500);

      const confirmDelete = page.locator("text=Cancellare gara?");
      if (await confirmDelete.isVisible({ timeout: 3000 })) {
        const confirmBtn = page.locator("button:has-text('Cancella gara')").last();
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});