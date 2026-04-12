// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestSettings,
  generateEntries,
  navigateToTab,
  getLocalStorageSettings,
} = require('./fixtures/helpers');

// ─── T074: Change theme to Dark ───

test('T074 [US14] change theme to Dark, verify data-theme attribute', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-theme').selectOption('dark');
  await page.locator('#cfg-btn-save').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// ─── T075: Set rows per page to 5 ───

test('T075 [US14] set rows per page to 5, verify overview shows 5 rows', async ({ page }) => {
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

// ─── T076: Set max chars to 30 ───

test('T076 [US14] set max chars to 30, overview cells truncated', async ({ page }) => {
  const { createTestEntry, getDateKey } = require('./fixtures/helpers');
  const entries = {};
  for (let i = 0; i < 3; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts: 'This is a very long thought that should be truncated at thirty characters definitely',
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
  const truncated = allCellTexts.some(text => text.includes('\u2026'));
  expect(truncated).toBeTruthy();
});

// ─── T077: Set energy emotional label to Social ───

test('T077 [US14] set energy emotional label to Social, verify label updates', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-energy-label').selectOption('social');
  await page.locator('#cfg-btn-save').click();

  await navigateToTab(page, 'checkin');
  // v4 renders the label dynamically as .energy-type-label inside the emotional meter column
  const label = page.locator('.energy-type-label').last();
  await expect(label).toContainText(/social/i);
});

// ─── T078: Set default wheel to Extended ───

test('T078 [US14] set default wheel to Extended, verify wheel renders', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-wheel').selectOption('extended');
  await page.locator('#cfg-btn-save').click();

  await navigateToTab(page, 'checkin');
  await expect(page.locator('#sel-wheel')).toHaveValue('extended');
  await expect(page.locator('.emotion-segment')).toHaveCount(12);
});

// ─── T079: Settings persist across reload ───

test('T079 [US14] changed settings persist across reload', async ({ page }) => {
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
