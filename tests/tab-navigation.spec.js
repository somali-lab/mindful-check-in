// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');

// ─── T119: Click Overview tab — URL hash #overview ───

test('T119 [US23] click Overview tab, URL hash is #overview', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-route="overview"]').click();
  await expect(page.locator('#view-overview')).toBeVisible();
  expect(page.url()).toContain('#overview');
});

// ─── T120: Navigate with hash #settings ───

test('T120 [US23] navigate with #settings hash, settings tab active', async ({ page }) => {
  await page.goto('/#settings');
  await expect(page.locator('#view-settings')).toBeVisible();
  await expect(page.locator('[data-route="settings"]')).toHaveClass(/is-active/);
});

// ─── T122: Invalid hash falls back to check-in ───

test('T122 [US23] invalid hash #nonexistent defaults to home tab', async ({ page }) => {
  await page.goto('/#nonexistent');
  // v4 falls back to "home" for unknown routes
  await expect(page.locator('#view-home')).toHaveClass(/is-active/);
});

// ─── T123: Exactly one tab button selected and one panel visible ───

test('T123 [US23] exactly one tab button selected and one panel visible', async ({ page }) => {
  await page.goto('/');

  // Only one nav button should have is-active
  const selectedButtons = page.locator('[data-route].is-active');
  await expect(selectedButtons).toHaveCount(1);

  // Only one view should have is-active
  const activePanels = page.locator('.view.is-active');
  await expect(activePanels).toHaveCount(1);

  // Switch to another tab and verify the constraint still holds
  await page.locator('[data-route="settings"]').click();
  await expect(page.locator('[data-route].is-active')).toHaveCount(1);
  await expect(page.locator('.view.is-active')).toHaveCount(1);
});
