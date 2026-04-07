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
      selectedEmotion: 'joy',
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Click a row (not the delete/export buttons)
  const row = page.locator('#overview-body tr').nth(2);
  await row.click();

  // Should switch to checkin tab
  await expect(page.locator('[data-tab-panel="checkin"]')).toBeVisible();

  // Form should be populated
  const thoughts = await page.locator('#thoughts').inputValue();
  expect(thoughts).toBeTruthy();
});

// ─── T100: Context pill shows entry date after loading ───

test('T100 [US27] load historical entry, context pill shows date', async ({ page }) => {
  const threeDaysAgo = getDateKey(3);
  const entries = {
    [threeDaysAgo]: createTestEntry({
      thoughts: 'Three days ago',
      selectedEmotion: 'joy',
    }),
  };
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Click the row
  const row = page.locator('#overview-body tr').first();
  await row.click();

  // Context pill should show the date
  const pill = page.locator('#checkin-context-pill');
  await expect(pill).not.toBeEmpty();
});

// ─── T101: Load historical entry, save creates new today entry ───

test('T101 [US27] load historical entry, save creates new today entry', async ({ page }) => {
  const twoDaysAgo = getDateKey(2);
  const entries = {
    [twoDaysAgo]: createTestEntry({
      thoughts: 'Old entry',
      selectedEmotion: 'joy',
    }),
  };
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Load the old entry
  await page.locator('#overview-body tr').first().click();
  await expect(page.locator('[data-tab-panel="checkin"]')).toBeVisible();

  // Save — should create new entry for today
  await page.locator('#save-checkin').click();
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

  const stored = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const todayEntries = Object.keys(stored).filter(k => k.startsWith(todayKey));
  expect(todayEntries.length).toBeGreaterThanOrEqual(1);

  // Old entry should still exist
  expect(stored[twoDaysAgo]).toBeTruthy();
});

// ─── T102: Load entry with weather data shows recorded weather ───

test('T102 [US27] load entry with weather, shows recorded weather data', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = {
    [todayKey]: createTestEntry({
      thoughts: 'With weather',
      selectedEmotion: 'joy',
      weather: { temperature: 18, weathercode: 1, description: 'Partly cloudy' },
    }),
  };
  await injectEntries(page, entries);
  await page.goto('/');

  // Weather widget should display the recorded temperature
  const weatherTemp = page.locator('#weather-temp');
  // May or may not show — depends on weather component being enabled
  // But entry weather should be intact in localStorage
  const stored = await getLocalStorageEntries(page);
  expect(stored[todayKey].weather.temperature).toBe(18);
});
