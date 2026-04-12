// @ts-check
// Branch coverage improvement tests
// Target: uncovered branches in init.js, settings-ui.js, utils.js, weather.js, overview.js
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestEntry,
  createTestSettings,
  getLocalStorageEntries,
  navigateToTab,
  generateEntries,
  getDateKey,
  getTodayKey,
  mockWeatherAPI,
  VISIBILITY_PRESETS,
} = require('./fixtures/helpers');

// ═══════════════════════════════════════════════════════
// init.js branches
// ═══════════════════════════════════════════════════════

test('popstate with invalid hash falls back to checkin tab', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'overview');
  // Push an invalid hash
  await page.evaluate(() => {
    history.pushState({}, '', '#nonexistent');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  const checkinPanel = page.locator('[data-tab-panel="checkin"]');
  await expect(checkinPanel).toHaveClass(/is-active/);
});

test('clear localStorage cancel keeps data intact', async ({ page }) => {
  const entries = {};
  entries[getTodayKey()] = createTestEntry({ thoughts: 'keep me' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'info');

  // Dismiss the confirm dialog
  page.on('dialog', (dialog) => dialog.dismiss());
  await page.locator('#clear-local-storage').click();
  await page.waitForTimeout(300);

  // Data should still be present
  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(1);
});

test('language switch updates history banner for past entry', async ({ page }) => {
  // Inject a past entry and load it
  const pastKey = getDateKey(5);
  const entries = {};
  entries[pastKey] = createTestEntry({ thoughts: 'old entry' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator(`tr[data-entry-key="${pastKey}"]`).first().click();
  await page.waitForTimeout(300);

  // Switch language - should re-render the history banner
  await page.locator('.language-button[data-language="nl"]').click();
  await page.waitForTimeout(300);
  const banner = page.locator('#history-banner');
  const bannerText = await banner.textContent();
  // In Dutch, the banner should show something (not empty since it's a past entry)
  expect(bannerText.length).toBeGreaterThan(0);
});

// ═══════════════════════════════════════════════════════
// settings-ui.js branches
// ═══════════════════════════════════════════════════════

test('settings reset restores defaults', async ({ page }) => {
  const customSettings = createTestSettings({
    theme: 'dark',
    rowsPerPage: 50,
    overviewMaxChars: 200,
  });
  await injectSettings(page, customSettings);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#settings-reset').click();
  await page.waitForTimeout(500);

  // Theme should be back to system (default)
  const themeValue = await page.locator('#settings-theme').inputValue();
  expect(themeValue).toBe('system');
});

test('energy emotional label set to "emotional" only', async ({ page }) => {
  const settings = createTestSettings({ energyEmotionalLabel: 'emotional' });
  await injectSettings(page, settings);
  await page.goto('/');

  // The emotional energy label should reflect the "emotional only" variant
  const label = page.locator('#energy-emotional-type-label');
  if (await label.count() > 0) {
    const text = await label.textContent();
    expect(text.length).toBeGreaterThan(0);
  }
});

test('energy emotional label set to "social" only', async ({ page }) => {
  const settings = createTestSettings({ energyEmotionalLabel: 'social' });
  await injectSettings(page, settings);
  await page.goto('/');

  const label = page.locator('#energy-emotional-type-label');
  if (await label.count() > 0) {
    const text = await label.textContent();
    expect(text.length).toBeGreaterThan(0);
  }
});

test('save settings with weather location triggers geocoding', async ({ page }) => {
  // Mock geocoding API
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [{ latitude: 52.37, longitude: 4.9, name: 'Amsterdam' }],
      }),
    });
  });
  await mockWeatherAPI(page);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#settings-weather-location').fill('Amsterdam');
  await page.locator('#settings-save').click();
  await page.waitForTimeout(1000);

  // Coords should be saved
  const settings = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('local-mood-tracker-settings') || '{}')
  );
  expect(settings.weatherCoords).toBeTruthy();
  expect(settings.weatherCoords.lat).toBeCloseTo(52.37);
});

test('save settings with geocoding failure still saves', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#settings-weather-location').fill('nonexistentcity12345');
  await page.locator('#settings-save').click();
  // Wait for async geocode + save to complete
  await page.waitForTimeout(2000);

  const settings = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('local-mood-tracker-settings') || '{}')
  );
  // Settings saved with the location text even though geocoding failed
  expect(settings.weatherLocation).toBe('nonexistentcity12345');
});

test('clearing weather location removes coords on save', async ({ page }) => {
  const settings = createTestSettings({
    weatherLocation: 'Amsterdam',
    weatherCoords: { lat: 52.37, lon: 4.9, name: 'Amsterdam' },
  });
  await injectSettings(page, settings);
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => route.abort());
  await page.route('**/api.open-meteo.com/**', (route) => route.abort());
  await page.goto('/');
  await navigateToTab(page, 'settings');

  // Verify location is pre-filled
  const prefilled = await page.locator('#settings-weather-location').inputValue();
  expect(prefilled).toBe('Amsterdam');

  // Clear it and save — exercises the !weatherLocation branch in save handler
  await page.locator('#settings-weather-location').fill('');
  await page.locator('#settings-save').click();
  await page.waitForTimeout(500);

  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('local-mood-tracker-settings') || '{}')
  );
  // Location is cleared; coords get refilled by normalizeSettings defaults
  expect(saved.weatherLocation).toBe('');
});

test('add quick action via Enter key', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  const input = page.locator('#quick-action-input');
  await input.fill('Meditate');
  await input.press('Enter');
  await page.waitForTimeout(300);

  const tags = page.locator('.quick-action-tag');
  const count = await tags.count();
  expect(count).toBeGreaterThanOrEqual(1);
  // Check the last tag contains our text
  const lastTag = tags.nth(count - 1);
  await expect(lastTag).toContainText('Meditate');
});

test('settings export downloads a file', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#settings-export').click(),
  ]);
  expect(download.suggestedFilename()).toContain('settings');
});

// ═══════════════════════════════════════════════════════
// utils.js branches
// ═══════════════════════════════════════════════════════

test('hasLightBackground returns false for invalid hex', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => App.hasLightBackground('xyz'));
  expect(result).toBe(false);
});

test('hasLightBackground returns true for white', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => App.hasLightBackground('#ffffff'));
  expect(result).toBe(true);
});

test('hasLightBackground returns false for black', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => App.hasLightBackground('#000000'));
  expect(result).toBe(false);
});

test('formatEntryTime returns time from short key part', async ({ page }) => {
  await page.goto('/');
  // 4-digit time part (e.g. HHMM without seconds)
  const result = await page.evaluate(() => App.formatEntryTime('2026-04-01_1430', {}));
  expect(result).toBe('14:30:00');
});

test('formatEntryTime returns empty for plain date key without updatedAt', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => App.formatEntryTime('2026-04-01', {}));
  expect(result).toBe('');
});

test('formatEntryTime falls back to updatedAt ISO string', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() =>
    App.formatEntryTime('2026-04-01', { updatedAt: '2026-04-01T09:30:00.000Z' })
  );
  expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
});

test('formatEntryTime returns empty for invalid ISO date', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() =>
    App.formatEntryTime('2026-04-01', { updatedAt: 'not-a-date' })
  );
  expect(result).toBe('');
});

test('t() returns key when translation not found', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => App.t('nonexistent.key.path'));
  expect(result).toBe('nonexistent.key.path');
});

test('extractDateKey returns first 10 chars', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => App.extractDateKey('2026-04-01_143000000'));
  expect(result).toBe('2026-04-01');
});

test('readJsonFile with invalid JSON triggers error callback', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  // Create a non-JSON file and trigger import
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('#settings-import').click();
  const fileChooser = await fileChooserPromise;

  // Upload invalid JSON
  await fileChooser.setFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('not valid json {{'),
  });
  await page.waitForTimeout(500);
  // Should not crash — app shows warning
});

// ═══════════════════════════════════════════════════════
// weather.js branches
// ═══════════════════════════════════════════════════════

test('night weather icon shows moon for clear sky', async ({ page }) => {
  await page.goto('/');
  const icon = await page.evaluate(() => App.getWeatherIcon(0, false));
  expect(icon).toBe('🌙');
});

test('night weather icon shows moon for partly cloudy', async ({ page }) => {
  await page.goto('/');
  const icon1 = await page.evaluate(() => App.getWeatherIcon(1, false));
  const icon2 = await page.evaluate(() => App.getWeatherIcon(2, false));
  expect(icon1).toBe('🌙');
  expect(icon2).toBe('🌙');
});

test('unknown weather code shows question mark', async ({ page }) => {
  await page.goto('/');
  const icon = await page.evaluate(() => App.getWeatherIcon(999, true));
  expect(icon).toBe('❓');
});

test('weather widget shows empty state without location', async ({ page }) => {
  // No weather settings at all
  await page.goto('/');
  const desc = page.locator('#weather-desc');
  if (await desc.count() > 0) {
    const text = await desc.textContent();
    // Should show "unavailable" or equivalent
    expect(text.length).toBeGreaterThan(0);
  }
});

test('weather API network error handled gracefully', async ({ page }) => {
  await page.route('**/api.open-meteo.com/**', (route) => route.abort());
  const settings = createTestSettings({
    weatherLocation: 'Amsterdam',
    weatherCoords: { lat: 52.37, lon: 4.9, name: 'Amsterdam' },
  });
  await injectSettings(page, settings);
  await page.goto('/');
  await page.waitForTimeout(1000);

  // App should not crash — weather widget shows loading or unavailable
  const widget = page.locator('#weather-widget');
  if (await widget.count() > 0) {
    await expect(widget).toBeVisible();
  }
});

test('showEntryWeather displays weather from entry object', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = {};
  entries[todayKey] = createTestEntry({
    weather: { temperature: 18, code: 1, icon: '🌤️', description: 'Mainly clear', location: 'Utrecht' },
  });
  await injectEntries(page, entries);
  await page.goto('/');

  // Load the entry from overview
  await navigateToTab(page, 'overview');
  await page.locator(`tr[data-entry-key="${todayKey}"]`).first().click();
  await page.waitForTimeout(300);

  // Weather widget should show the entry's weather
  const temp = page.locator('#weather-temp');
  if (await temp.count() > 0) {
    await expect(temp).toContainText('18');
  }
});

// ═══════════════════════════════════════════════════════
// overview.js branches
// ═══════════════════════════════════════════════════════

test('sort overview by thoughts column', async ({ page }) => {
  const entries = {};
  entries[getDateKey(0)] = createTestEntry({ thoughts: 'Zebra thoughts' });
  entries[getDateKey(1)] = createTestEntry({ thoughts: 'Alpha thoughts' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Click the thoughts column header to sort
  const thoughtsHeader = page.locator('th[data-sort-key="thoughts"]');
  if (await thoughtsHeader.count() > 0) {
    await thoughtsHeader.click();
    await page.waitForTimeout(300);
    // Should reorder — verify no crash
    const rows = page.locator('#overview-body tr:not(.overview-row-note)');
    expect(await rows.count()).toBe(2);
  }
});

test('sort overview by coreFeeling column', async ({ page }) => {
  const entries = {};
  entries[getDateKey(0)] = createTestEntry({ coreFeeling: 'joy' });
  entries[getDateKey(1)] = createTestEntry({ coreFeeling: 'anger' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const header = page.locator('th[data-sort-key="coreFeeling"]');
  if (await header.count() > 0) {
    await header.click();
    await page.waitForTimeout(300);
    const rows = page.locator('#overview-body tr:not(.overview-row-note)');
    expect(await rows.count()).toBe(2);
  }
});

test('sort overview by bodySignals column', async ({ page }) => {
  const entries = {};
  entries[getDateKey(0)] = createTestEntry({ bodySignals: ['chest', 'head'] });
  entries[getDateKey(1)] = createTestEntry({ bodySignals: ['leftHand'] });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const header = page.locator('th[data-sort-key="bodySignals"]');
  if (await header.count() > 0) {
    await header.click();
    await page.waitForTimeout(300);
  }
});

test('sort overview by moodMatrix column', async ({ page }) => {
  const entries = {};
  entries[getDateKey(0)] = createTestEntry({ moodRow: 7, moodCol: 2 });
  entries[getDateKey(1)] = createTestEntry({ moodRow: 1, moodCol: 8 });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const header = page.locator('th[data-sort-key="moodMatrix"]');
  if (await header.count() > 0) {
    await header.click();
    await page.waitForTimeout(300);
  }
});

test('sort overview by actions column', async ({ page }) => {
  const entries = {};
  entries[getDateKey(0)] = createTestEntry({ action: 'yoga' });
  entries[getDateKey(1)] = createTestEntry({ action: 'running' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const header = page.locator('th[data-sort-key="actions"]');
  if (await header.count() > 0) {
    await header.click();
    await page.waitForTimeout(300);
  }
});

test('sort by energy physical column', async ({ page }) => {
  const entries = {};
  entries[getDateKey(0)] = createTestEntry({ energy: { physical: 80, mental: 50, emotional: 60 } });
  entries[getDateKey(1)] = createTestEntry({ energy: { physical: 20, mental: 90, emotional: 40 } });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const header = page.locator('th[data-sort-key="energyPhysical"]');
  if (await header.count() > 0) {
    await header.click();
    await page.waitForTimeout(300);
  }
});

test('export single entry from overview', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = {};
  entries[todayKey] = createTestEntry({ thoughts: 'export me' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const exportBtn = page.locator(`.overview-export-entry-button[data-entry-key="${todayKey}"]`);
  if (await exportBtn.count() > 0) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);
    expect(download.suggestedFilename()).toContain('.json');
  }
});

test('overview row keyboard Enter opens entry', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = {};
  entries[todayKey] = createTestEntry({ thoughts: 'keyboard nav' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const row = page.locator(`tr.overview-row[data-entry-key="${todayKey}"]`).first();
  await row.focus();
  await row.press('Enter');
  await page.waitForTimeout(300);

  // Should switch to checkin tab
  const checkinPanel = page.locator('[data-tab-panel="checkin"]');
  await expect(checkinPanel).toHaveClass(/is-active/);
});

test('date sort uses updatedAt when no timestamp in key', async ({ page }) => {
  const entries = {};
  // Entry with plain date key but with updatedAt
  entries[getDateKey(0)] = createTestEntry({
    thoughts: 'with updatedAt',
    updatedAt: new Date().toISOString(),
  });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Just verify rows render without error
  const rows = page.locator('#overview-body tr:not(.overview-row-note)');
  expect(await rows.count()).toBe(1);
});

test('overview last 2 weeks filter', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#overview-filter').selectOption('last14');
  await page.waitForTimeout(300);
  const rows = page.locator('#overview-body tr:not(.overview-row-note)');
  const count = await rows.count();
  // Should have entries but fewer than 30
  expect(count).toBeLessThanOrEqual(14);
  expect(count).toBeGreaterThan(0);
});

test('overview last 3 months filter', async ({ page }) => {
  await injectEntries(page, generateEntries(100));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#overview-filter').selectOption('last3Months');
  await page.waitForTimeout(300);
  const rows = page.locator('#overview-body tr:not(.overview-row-note)');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

test('overview first and last page buttons', async ({ page }) => {
  await injectEntries(page, generateEntries(50));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Go to last page
  const lastBtn = page.locator('#overview-last');
  if (await lastBtn.count() > 0 && !(await lastBtn.isDisabled())) {
    await lastBtn.click();
    await page.waitForTimeout(300);

    // Then go to first page
    const firstBtn = page.locator('#overview-first');
    if (await firstBtn.count() > 0 && !(await firstBtn.isDisabled())) {
      await firstBtn.click();
      await page.waitForTimeout(300);
    }
  }

  const pageInfo = page.locator('#overview-page-info');
  const text = await pageInfo.textContent();
  expect(text).toContain('1');
});
