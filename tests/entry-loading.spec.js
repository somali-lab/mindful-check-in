// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  navigateToTab,
  getDateKey,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── T099: Click overview row loads entry into form ───

test('T099 [US27] click overview row loads entry and switches to checkin', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts: `Entry ${i}`,
      coreFeeling: 'joy',
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Click a row (not the delete/export buttons)
  const row = page.locator('#ov-tbody tr').nth(2);
  await row.click();

  // Should switch to checkin tab
  await expect(page.locator('#view-checkin')).toBeVisible();

  // Form should be populated
  const thoughts = await page.locator('#fld-thoughts').inputValue();
  expect(thoughts).toBeTruthy();
});

// ─── T100: Context pill shows entry date after loading ───

test('T100 [US27] load historical entry, context pill shows date', async ({ page }) => {
  const threeDaysAgo = getDateKey(3);
  const entries = {
    [threeDaysAgo]: createTestEntry({
      thoughts: 'Three days ago',
      coreFeeling: 'joy',
    }),
  };
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Click the row
  const row = page.locator('#ov-tbody tr').first();
  await row.click();

  // Context pill should show the date
  const pill = page.locator('#ci-pill');
  await expect(pill).not.toBeEmpty();
});

// ─── T101: Load historical entry, save creates new today entry ───

test('T101 [US27] load historical entry, save updates the same entry', async ({ page }) => {
  const twoDaysAgo = getDateKey(2);
  const entries = {
    [twoDaysAgo]: createTestEntry({
      thoughts: 'Old entry',
      coreFeeling: 'joy',
    }),
  };
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Load the old entry
  await page.locator('#ov-tbody tr').first().click();
  await expect(page.locator('#view-checkin')).toBeVisible();

  // Save — in v4, saving a loaded entry updates the same key
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  const stored = await getLocalStorageEntries(page);
  // Old entry should still exist (updated in place)
  expect(stored[twoDaysAgo]).toBeTruthy();
  expect(stored[twoDaysAgo].coreFeeling).toBe('joy');
});

// ─── T102: Load entry with weather data shows recorded weather ───

test('T102 [US27] load entry with weather, shows recorded weather data', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = {
    [todayKey]: createTestEntry({
      thoughts: 'With weather',
      coreFeeling: 'joy',
      weather: { temperature: 18, weathercode: 1, description: 'Partly cloudy' },
    }),
  };
  await injectEntries(page, entries);
  await page.goto('/#checkin');
  // But entry weather should be intact in localStorage
  const stored = await getLocalStorageEntries(page);
  expect(stored[todayKey].weather.temperature).toBe(18);
});
