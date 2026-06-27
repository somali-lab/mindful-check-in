// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  generateEntries,
  navigateToTab,
  getLocalStorageSettings,
} = require('../../fixtures/helpers');

// ─── Change theme to Dark ───

test('change theme to Dark, verify data-theme attribute', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-theme').selectOption('dark');
  await page.locator('#cfg-btn-save').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// ─── Set rows per page to 5 ───

test('set rows per page to 5, verify overview shows 5 rows', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-rows').fill('5');
  await page.locator('#cfg-btn-save').click();
  await page.waitForTimeout(500);

  // Reload to ensure settings are fully applied
  await page.reload();
  await navigateToTab(page, 'overview');
  // Each entry renders 2 rows (main + note), so count only main rows
  const rows = page.locator('#ov-tbody tr:not(.ov-row-note)');
  await expect(rows).toHaveCount(5);
});

// ─── Set max chars to 30 ───

test('set max chars to 30, overview cells truncated', async ({ page }) => {
  const { createTestEntry, getDateKey } = require('../../fixtures/helpers');
  const entries = {};
  for (let i = 0; i < 3; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts:
        'This is a very long thought that should be truncated at thirty characters definitely',
      coreFeeling: 'joy',
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-maxchars').fill('30');
  await page.locator('#cfg-btn-save').click();
  await page.waitForTimeout(500);

  // Reload to ensure settings are fully applied
  await page.reload();
  await navigateToTab(page, 'overview');
  // Verify some cell text is truncated (v4 uses \u2026 ellipsis for truncation)
  const cells = page.locator('#ov-tbody td');
  const allCellTexts = await cells.allTextContents();
  const truncated = allCellTexts.some((text) => text.includes('\u2026'));
  expect(truncated).toBeTruthy();
});

// ─── Set energy emotional label to Social ───

test('set energy emotional label to Social, verify label updates', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-energy-label').selectOption('social');
  await page.locator('#cfg-btn-save').click();

  await navigateToTab(page, 'checkin');
  // the emotional meter's bar label honours the third-label setting
  const label = page.locator('.nrg-row[data-energy-type="emotional"] .nrg-label');
  await expect(label).toContainText(/social/i);
});

// ─── Set default wheel to Extended ───

test('set default wheel to Extended, verify wheel renders', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-wheel').selectOption('extended');
  await page.locator('#cfg-btn-save').click();

  await navigateToTab(page, 'checkin');
  await expect(page.locator('#sel-wheel')).toHaveValue('extended');
  await expect(page.locator('.emotion-segment')).toHaveCount(12);
});

// ─── Settings persist across reload ───

test('changed settings persist across reload', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-theme').selectOption('dark');
  await page.locator('#cfg-rows').fill('10');
  await page.locator('#cfg-btn-save').click();

  await page.reload();

  const settings = await getLocalStorageSettings(page);
  expect(settings.theme).toBe('dark');
  expect(settings.rowsPerPage).toBe(10);
});
