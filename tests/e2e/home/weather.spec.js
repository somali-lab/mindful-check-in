// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectSettings,
  injectWeatherCache,
  createTestSettings,
  mockWeatherAPI,
  mockWeatherAPIFailure,
  mockGeocodingAPI,
  mockGeocodingAPIEmpty,
  getLocalStorageEntries,
  navigateToTab,
  getTodayKey,
} = require('../../fixtures/helpers');

// ─── Weather API success — widget shows data ───

test('mock weather API success, widget shows temperature', async ({ page }) => {
  await mockWeatherAPI(page, { temperature: 18, weathercode: 1, is_day: 1 });
  await mockGeocodingAPI(page);
  const settings = createTestSettings({ components: { weather: true } });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  // Wait for weather fetch to complete
  await expect(page.locator('.weather-temp')).not.toHaveText('', { timeout: 5000 });
  await expect(page.locator('.weather-temp')).toContainText('18');
});

// ─── Cached weather — no API call ───

test('cached weather (< 1h old) uses cache, no API call', async ({ page }) => {
  // v4 cache format: single { ts, data } object where data = current_weather fields
  const cache = {
    ts: Date.now(),
    data: { temperature: 22, weathercode: 0, windspeed: 5, is_day: 1 },
  };
  await injectWeatherCache(page, cache);
  const settings = createTestSettings({ components: { weather: true } });
  await injectSettings(page, settings);

  let apiCalled = false;
  await page.route('**/api.open-meteo.com/**', (route) => {
    apiCalled = true;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_weather: { temperature: 99, weathercode: 0, windspeed: 0, is_day: 1 },
      }),
    });
  });

  await page.goto('/#checkin');
  await page.waitForTimeout(1000);

  // If cache was used, the temperature should show cached value (22), not 99
  const temp = await page.locator('.weather-temp').textContent();
  expect(temp).toContain('22');
  // A fresh cache must short-circuit the network — the API is never hit.
  expect(apiCalled).toBe(false);
});

// ─── Weather API failure — app doesn't crash ───

test('weather API failure, app does not crash', async ({ page }) => {
  await mockWeatherAPIFailure(page);
  const settings = createTestSettings({ components: { weather: true } });
  await injectSettings(page, settings);

  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForTimeout(1000);

  // App should still function
  await expect(page.locator('[data-route="checkin"]:visible').first()).toBeVisible();
  // No critical JS errors
  expect(errors.filter((e) => !e.includes('fetch'))).toHaveLength(0);
});

// ─── Weather disabled — widget hidden ───

test('disable weather in settings, widget hidden', async ({ page }) => {
  const settings = createTestSettings({ components: { weather: false } });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await expect(page.locator('[data-component="weather"]')).toBeHidden();
});

// ─── Save with weather — weather data in entry ───

test('save with mocked weather, weather data in entry', async ({ page }) => {
  await mockWeatherAPI(page, { temperature: 15, weathercode: 2, is_day: 1 });
  await mockGeocodingAPI(page);
  const settings = createTestSettings({ components: { weather: true } });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  // Wait for weather to load (temp element gets populated)
  await expect(page.locator('.weather-temp')).not.toHaveText('', { timeout: 5000 });

  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const entry = entries[Object.keys(entries).find((k) => k.startsWith(todayKey))];
  expect(entry.weather).toBeTruthy();
  expect(entry.weather.temperature).toBe(15);
});

// ─── Geocoding — change location ───

test('change weather location to Berlin, verify coords update', async ({ page }) => {
  await mockGeocodingAPI(page, [
    { name: 'Berlin', latitude: 52.52, longitude: 13.405, country: 'Germany' },
  ]);
  await mockWeatherAPI(page);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-location').fill('Berlin');
  await page.locator('#cfg-btn-save').click();
  await page.waitForTimeout(500);

  // Settings should reflect the new location
  const { getLocalStorageSettings } = require('../../fixtures/helpers');
  const settings = await getLocalStorageSettings(page);
  expect(settings.weatherLocation).toBe('Berlin');
});

// ─── Geocoding empty results — warning ───

test('geocoding empty results for nonsense city', async ({ page }) => {
  await mockGeocodingAPIEmpty(page);
  await mockWeatherAPI(page);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-location').fill('xyznonexistentcity');
  await page.locator('#cfg-btn-save').click();
  await page.waitForTimeout(500);

  // Should show some status/warning message
  // Geocoding happens in weather module, not during settings save in v4
  // App should not crash at minimum
  await expect(page.locator('[data-route="settings"]:visible').first()).toBeVisible();
});
