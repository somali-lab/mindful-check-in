// @ts-check
const { test, expect } = require('../../fixtures/base');

// ─── Click Overview tab — URL hash #overview ───

test('click Overview tab, URL hash is #overview', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-route="overview"]:visible').first().click();
  await expect(page.locator('#view-overview')).toBeVisible();
  expect(page.url()).toContain('#overview');
});

// ─── Navigate with hash #settings ───

test('navigate with #settings hash, settings tab active', async ({ page }) => {
  await page.goto('/#settings');
  await expect(page.locator('#view-settings')).toBeVisible();
  await expect(page.locator('[data-route="settings"]:visible').first()).toHaveClass(/is-active/);
});

// ─── Invalid hash falls back to check-in ───

test('invalid hash #nonexistent defaults to home tab', async ({ page }) => {
  await page.goto('/#nonexistent');
  // v4 falls back to "home" for unknown routes
  await expect(page.locator('#view-home')).toHaveClass(/is-active/);
});

// ─── Exactly one tab button selected and one panel visible ───

test('exactly one tab button selected and one panel visible', async ({ page }) => {
  await page.goto('/');

  // Only one visible nav button should have is-active
  const selectedButtons = page.locator('[data-route].is-active:visible');
  await expect(selectedButtons).toHaveCount(1);

  // Only one view should have is-active
  const activePanels = page.locator('.view.is-active');
  await expect(activePanels).toHaveCount(1);

  // Switch to another tab and verify the constraint still holds
  await page.locator('[data-route="settings"]:visible').first().click();
  await expect(page.locator('[data-route].is-active:visible')).toHaveCount(1);
  await expect(page.locator('.view.is-active')).toHaveCount(1);
});
