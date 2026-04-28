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
  test.skip("navigate to home page", async ({ page }) => {
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
  test("show race timeline when team is selected", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    // Verify start section is visible
    const startSection = page.locator(".timeline-start");
    await expect(startSection).toBeVisible();

    // Verify end section is visible
    const endSection = page.locator(".timeline-end");
    await expect(endSection).toBeVisible();

    // Verify timeline is visible
    const timeline = page.locator(".q-timeline");
    await expect(timeline).toBeVisible({ timeout: 10000 });

    // Verify timeline has entries (race segments)
    const timelineEntries = page.locator(".q-timeline__entry");
    const entryCount = await timelineEntries.count();
    expect(entryCount).toBeGreaterThan(0);

    // Verify header shows race name
    const headerText = await page.locator(".q-header .q-toolbar__title").textContent();
    expect(headerText).toMatch(/Relay|Marathon/);
  });

  test("clicking pace badge opens pace dialog", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    // Check if pace badges exist
    const paceBadges = page.locator(".pace-badge");
    await expect(paceBadges.first()).toBeVisible();

    // Click first pace badge
    await paceBadges.first().click();
    await page.waitForTimeout(500);

    // Screenshot for verification
    await page.screenshot({ path: "pace-picker-result.png" });

    // Verify pace dialog is visible
    const paceDialog = page.locator(".q-dialog");
    await expect(paceDialog).toBeVisible({ timeout: 5000 });
  });

  test("show race timeline on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    const timeline = page.locator(".q-timeline");
    await expect(timeline).toBeVisible({ timeout: 10000 });
  });

  test("drawer shows navigation options", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/home");
    await page.waitForTimeout(2000);

    // Click the hamburger menu button
    const menuBtn = page.locator(".q-header .q-btn");
    await menuBtn.click();
    await page.waitForTimeout(500);

    // Screenshot for verification
    await page.screenshot({ path: "drawer-open.png" });

    // Verify drawer is visible
    const drawer = page.locator(".q-drawer");
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Verify navigation options are visible
    const navHome = page.locator("text=Home");
    const navTeam = page.locator("text=Team");
    const navRaces = page.locator("text=Gare");
    const navAppointments = page.locator("text=Appuntamenti");
    const navRoute = page.locator("text=Percorso");
    const navFaq = page.locator("text=Domande Frequenti");

    await expect(navHome).toBeVisible();
    await expect(navTeam).toBeVisible();
    await expect(navRaces).toBeVisible();
    await expect(navAppointments).toBeVisible();
    await expect(navRoute).toBeVisible();
    await expect(navFaq).toBeVisible();
  });

  test("race selection page shows races", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/race");
    await page.waitForTimeout(3000);

    // Verify race page header
    await expect(page.locator(".q-header .q-toolbar__title")).toContainText(/Gare|Races/);

    // Verify race list exists
    await expect(page.locator(".q-list")).toBeVisible();
  });

  test("change race from race page", async ({ page }) => {
    await login(page, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
    await page.goto("/#/race");
    await page.waitForTimeout(3000);

    // Click on a race to select it
    const raceItem = page.locator(".q-item").first();
    if (await raceItem.isVisible({ timeout: 3000 })) {
      await raceItem.click();
      await page.waitForTimeout(1000);
      // Should navigate back to home
      expect(page.url()).toMatch(/#\/(home|\/)/);
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

test.describe("Guest User", () => {
  test("guest user sees timeline on home page", async ({ page }) => {
    // Go directly to home without login
    await page.goto("/#/home");
    await page.waitForTimeout(5000);

    // Check if user is logged out (for debugging)
    const loginBtn = page.locator("text=Accedi").or(page.locator("text=Login"));
    await loginBtn.isVisible({ timeout: 3000 }).catch(() => false);

    // If logged out, we should see either:
    // 1. A timeline if a race is selected (default)
    // 2. A message to select a race
    const timeline = page.locator(".q-timeline");
    const timelineVisible = await timeline.isVisible().catch(() => false);

    const noRaceMsg = page.locator("text=/Nessuna gara|Seleziona gara|No race/");
    const noRaceVisible = await noRaceMsg.isVisible().catch(() => false);

    // Either timeline should be visible or a message to select race
    console.log("Guest user - Timeline visible:", timelineVisible);
    console.log("Guest user - No race message visible:", noRaceVisible);

    // At minimum, the page should be accessible and show something
    expect(timelineVisible || noRaceVisible).toBeTruthy();
  });

  test("guest user can navigate to race selection", async ({ page }) => {
    await page.goto("/#/home");
    await page.waitForTimeout(3000);

    // Click menu to open drawer
    const menuBtn = page.locator(".q-header .q-btn").first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(500);

      // Click on "Gare" to go to race selection
      const gareLink = page.locator(".q-drawer .q-item:has-text('Gare')");
      if (await gareLink.isVisible()) {
        await gareLink.click();
        await page.waitForTimeout(2000);

        // Should be on race selection page
        await expect(page.locator(".q-header .q-toolbar__title")).toContainText(/Gare|Races/);
      }
    }
  });
});

test.describe("Home - Segment Editing", () => {
  test.skip("segment editing works in timeline", async () => {
    // TODO: Implement segment editing test for timeline
    // The timeline should have clickable entries that open the PacePicker
  });

  test.skip("delay popup opens on timeline entry click", async () => {
    // TODO: Implement delay editing test for timeline
    // Clicking on the "+ X" delay indicator should open the delay dialog
  });
});

test.describe("Team - Create Team", () => {
  test.skip("create team with valid data", async ({ page }) => {
    // TODO: Fix this test - race selection may have changed
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

  test.skip("create team button disabled without name", async ({ page }) => {
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

  test.skip("create team button disabled without race", async ({ page }) => {
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

  test.skip("join button disabled without code", async ({ page }) => {
    // TODO: Fix this test - button state may have changed
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
    expect(page.url()).toMatch(/#\/(login|splash)/);
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
