// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');

// ─── T119: Click Overview tab — URL hash #overview ───

test('T119 [US23] click Overview tab, URL hash is #overview', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-tab-target="overview"]').click();
  await expect(page.locator('[data-tab-panel="overview"]')).toBeVisible();
  expect(page.url()).toContain('#overview');
});

// ─── T120: Navigate with hash #settings ───

test('T120 [US23] navigate with #settings hash, settings tab active', async ({ page }) => {
  await page.goto('/#settings');
  await expect(page.locator('[data-tab-panel="settings"]')).toBeVisible();
  await expect(page.locator('[data-tab-target="settings"]')).toHaveClass(/is-active/);
});

// ─── T121: Browser back navigates to previous tab ───

test('T121 [US23] switch tabs, browser back returns to previous', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-tab-target="overview"]').click();
  await expect(page.locator('[data-tab-panel="overview"]')).toBeVisible();

  await page.locator('[data-tab-target="settings"]').click();
  await expect(page.locator('[data-tab-panel="settings"]')).toBeVisible();

  await page.goBack();
  await expect(page.locator('[data-tab-panel="overview"]')).toBeVisible();
});

// ─── T122: Invalid hash falls back to check-in ───

test('T122 [US23] invalid hash #nonexistent defaults to check-in tab', async ({ page }) => {
  await page.goto('/#nonexistent');
  await expect(page.locator('[data-tab-panel="checkin"]')).toBeVisible();
});

// ─── T123: Exactly one tab button selected and one panel visible ───

test('T123 [US23] exactly one tab button selected and one panel visible', async ({ page }) => {
  await page.goto('/');

  // Only one tab should have is-selected
  const selectedButtons = page.locator('.tab-button.is-active');
  await expect(selectedButtons).toHaveCount(1);

  // Only one panel should be visible (has is-active class)
  const activePanels = page.locator('.tab-panel.is-active');
  await expect(activePanels).toHaveCount(1);

  // Switch to another tab and verify the constraint still holds
  await page.locator('[data-tab-target="settings"]').click();
  await expect(page.locator('.tab-button.is-active')).toHaveCount(1);
  await expect(page.locator('.tab-panel.is-active')).toHaveCount(1);
});
