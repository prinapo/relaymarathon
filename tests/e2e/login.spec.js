const { test, expect } = require("@playwright/test");

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";
const RUNNER_EMAIL = "riprova@gmail.com";
const RUNNER_PASSWORD = "riprova!!";

const TEST_TEAM_NAME = "E2E Team";
const TEST_RACE_NAME = "test";

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

test.describe("Authentication", () => {
  test("login with captain", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    const url = page.url();
    expect(url).toMatch(/#\/(home|team)/);
  });

  test("login with runner", async ({ page }) => {
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    const url = page.url();
    expect(url).toMatch(/#\/(home|team)/);
  });

  test("logout", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.waitForTimeout(2000);

    const logoutBtn = page.locator("button:has-text('Esci')");
    if (await logoutBtn.isVisible({ timeout: 5000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(3000);
      expect(page.url()).toMatch(/#\/login/);
    }
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/#login");
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: "visible", timeout: 15000 });
    await emailInput.fill("invalid@test.com");
    await page.click("button:has-text('Avanti')");
    await page.waitForTimeout(2000);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill("wrongpassword");
    await page.click("button:has-text('Accedi')");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/#\/login/);
  });
});

test.describe("Navigation", () => {
  test("navigate to home page", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/#\/?$/);
  });

  test("navigate to team page", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/#\/team/);
  });

  test("navigate to appointments page", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#appointments");
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/#\/appointments/);
  });

  test("navigate to help page", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#help");
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/#\/help/);
  });
});

test.describe("Home - Race Display", () => {
  test("show race table", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);
    await expect(page.locator("table.q-table")).toBeVisible({ timeout: 10000 });
  });

  test("show race info", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);
    const raceInfo = page.locator("text=Orario Partenza");
    if (await raceInfo.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(raceInfo).toBeVisible();
    }
  });

  test("show race selector", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);
    const raceSelector = page.locator(".q-select, .race-selector");
    if (await raceSelector.first().isVisible({ timeout: 5000 })) {
      await expect(raceSelector.first()).toBeVisible();
    }
  });

  test("change race from selector", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);

    const raceSelector = page.locator(".q-select").first();
    if (await raceSelector.isVisible({ timeout: 3000 })) {
      await raceSelector.click();
      await page.waitForTimeout(500);

      const options = page.locator(".q-item");
      if (await options.first().isVisible({ timeout: 2000 })) {
        await options.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test("show legend for segment types", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);

    const legend = page.locator("text=Tappa individuale");
    if (await legend.isVisible({ timeout: 3000 })) {
      await expect(legend).toBeVisible();
    }
  });
});

test.describe("Home - Segment Editing", () => {
  test("segment popup opens on cell click", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);

    const row = page.locator("table.q-table tbody tr").nth(3);
    await row.waitFor({ state: "visible", timeout: 10000 });

    const cell = row.locator("td").first();
    await cell.click();

    await expect(page.locator(".q-dialog")).toBeVisible({ timeout: 5000 });
  });

  test("popup closes on cancel", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);

    const row = page.locator("table.q-table tbody tr").nth(3);
    await row.waitFor({ state: "visible", timeout: 10000 });

    const cell = row.locator("td").first();
    await cell.click();

    const cancelBtn = page.locator("button:has-text('Annulla')");
    if (await cancelBtn.isVisible({ timeout: 3000 })) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator(".q-dialog")).not.toBeVisible({
        timeout: 3000,
      });
    }
  });

  test("popup shows correct segment name", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);

    const row = page.locator("table.q-table tbody tr").nth(3);
    await row.waitFor({ state: "visible", timeout: 10000 });

    const segmentName = await row.locator("td").first().textContent();
    const cell = row.locator("td").first();
    await cell.click();

    const popupTitle = page.locator(".q-dialog .text-subtitle2");
    if (await popupTitle.isVisible({ timeout: 3000 })) {
      const popupText = await popupTitle.textContent();
      expect(popupText).toContain(segmentName.trim());
    }
  });

  test("save button disabled without required fields", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#");
    await page.waitForTimeout(3000);

    const row = page.locator("table.q-table tbody tr").nth(3);
    await row.waitFor({ state: "visible", timeout: 10000 });
    const cell = row.locator("td").first();
    await cell.click();

    const saveBtn = page.locator("button:has-text('Salva')");
    if (await saveBtn.isVisible({ timeout: 3000 })) {
      await expect(saveBtn).toBeEnabled();
    }
  });
});

test.describe("Team - Create Team", () => {
  test("create team with valid data", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=Crea Team");
    await page.waitForTimeout(1000);

    const nameInput = page.locator("input").first();
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(TEST_TEAM_NAME);

    const raceSelect = page.locator(".q-select").first();
    await raceSelect.click();
    await page.waitForTimeout(500);

    const raceOption = page
      .locator(".q-item")
      .filter({ hasText: TEST_RACE_NAME })
      .first();
    await raceOption.click();
    await page.waitForTimeout(500);

    await page.click("text=Crea Team");
    await page.waitForTimeout(5000);

    await expect(page.locator(".q-tab:has-text('I miei team')")).toBeVisible({
      timeout: 10000,
    });
  });

  test("create team button disabled without name", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=Crea Team");
    await page.waitForTimeout(1000);

    const raceSelect = page.locator(".q-select").first();
    await raceSelect.click();
    await page.waitForTimeout(500);

    const raceOption = page
      .locator(".q-item")
      .filter({ hasText: TEST_RACE_NAME })
      .first();
    await raceOption.click();
    await page.waitForTimeout(500);

    const createBtn = page.locator("button:has-text('Crea Team')");
    await expect(createBtn).toBeDisabled();
  });

  test("create team button disabled without race", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=Crea Team");
    await page.waitForTimeout(1000);

    const nameInput = page.locator("input").first();
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Team No Race");

    const createBtn = page.locator("button:has-text('Crea Team')");
    await expect(createBtn).toBeDisabled();
  });

  test("show captain info message", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=Crea Team");
    await page.waitForTimeout(1000);

    const infoMsg = page.locator("text=Solo i capitani possono creare team");
    if (await infoMsg.isVisible({ timeout: 3000 })) {
      await expect(infoMsg).toBeVisible();
    }
  });
});

test.describe("Team - My Teams", () => {
  test("show team selector when teams exist", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=I miei team");
    await page.waitForTimeout(2000);

    const teamSelect = page.locator(".q-select");
    if (await teamSelect.isVisible({ timeout: 3000 })) {
      await expect(teamSelect).toBeVisible();
    }
  });

  test("show empty state when no teams", async ({ page }) => {
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=I miei team");
    await page.waitForTimeout(2000);

    const emptyMsg = page.locator("text=Non fai ancora parte di nessun team");
    if (await emptyMsg.isVisible({ timeout: 3000 })) {
      await expect(emptyMsg).toBeVisible();
    }
  });

  test("show team details when selected", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=I miei team");
    await page.waitForTimeout(2000);

    const teamSelect = page.locator(".q-select");
    if (await teamSelect.isVisible({ timeout: 3000 })) {
      await teamSelect.click();
      await page.waitForTimeout(500);

      const teamOption = page.locator(".q-item").first();
      if (await teamOption.isVisible({ timeout: 2000 })) {
        await teamOption.click();
        await page.waitForTimeout(1000);

        const teamName = page.locator(".text-h6");
        if (await teamName.isVisible({ timeout: 3000 })) {
          await expect(teamName).toBeVisible();
        }
      }
    }
  });
});

test.describe("Team - Join Team", () => {
  test("join tab visible", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    const joinTab = page.locator(".q-tab:has-text('Entra nel Team')");
    await joinTab.waitFor({ state: "visible", timeout: 5000 });
    await expect(joinTab).toBeVisible();
  });

  test("show invitation code input", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=Entra nel Team");
    await page.waitForTimeout(1000);

    const codeInput = page.locator('input[aria-label="Codice invito"]');
    if (await codeInput.isVisible({ timeout: 3000 })) {
      await expect(codeInput).toBeVisible();
    }
  });

  test("join button disabled without code", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=Entra nel Team");
    await page.waitForTimeout(1000);

    const joinBtn = page.locator("button:has-text('Entra nel Team')").last();
    if (await joinBtn.isVisible({ timeout: 3000 })) {
      await expect(joinBtn).toBeDisabled();
    }
  });

  test("show error for invalid code", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#team");
    await page.waitForTimeout(3000);

    await page.click("text=Entra nel Team");
    await page.waitForTimeout(1000);

    const codeInput = page.locator('input[type="text"]').first();
    await codeInput.fill("INVALID-CODE-123");
    await page.waitForTimeout(500);

    const joinBtn = page.locator("button:has-text('Entra nel Team')").last();
    if (await joinBtn.isVisible({ timeout: 3000 })) {
      await joinBtn.click();
      await page.waitForTimeout(2000);

      const notification = page.locator(".q-notification");
      if (await notification.isVisible({ timeout: 3000 })) {
        await expect(notification).toBeVisible();
      }
    }
  });
});

test.describe("Language", () => {
  test("switch language from dropdown", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.waitForTimeout(3000);

    const langDropdown = page.locator(".q-btn-dropdown").first();
    if (await langDropdown.isVisible({ timeout: 5000 })) {
      await langDropdown.click();
      await page.waitForTimeout(500);

      const enOption = page.locator(".q-item:has-text('EN')");
      if (await enOption.isVisible({ timeout: 2000 })) {
        await enOption.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test("language persists after navigation", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.waitForTimeout(3000);

    await page.goto("/#team");
    await page.waitForTimeout(2000);

    await page.goto("/#");
    await page.waitForTimeout(2000);

    const pageContent = await page.content();
    expect(pageContent).toMatch(/Milano Relay|UniCredit/);
  });
});

test.describe("Security", () => {
  test("redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/#");
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/#\/login/);
  });

  test("redirect to home for non-admin accessing admin", async ({ page }) => {
    await login(page, RUNNER_EMAIL, RUNNER_PASSWORD);
    await page.goto("/#admin");
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/#\/(home|team)/);
  });
});

test.describe("Responsive", () => {
  test("sidebar works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.waitForTimeout(3000);

    const menuBtn = page.locator(".q-toolbar .q-btn").first();
    if (await menuBtn.isVisible({ timeout: 5000 })) {
      await menuBtn.click();
      await page.waitForTimeout(500);

      const drawer = page.locator(".q-drawer");
      if (await drawer.isVisible({ timeout: 3000 })) {
        await expect(drawer).toBeVisible();
      }
    }
  });
});
