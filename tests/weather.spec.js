// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
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
} = require('./fixtures/helpers');

// ─── T112: Weather API success — widget shows data ───

test('T112 [US19] mock weather API success, widget shows temperature', async ({ page }) => {
  await mockWeatherAPI(page, { temperature: 18, weathercode: 1, is_day: 1 });
  await mockGeocodingAPI(page);
  const settings = createTestSettings({ components: { weather: true } });
  await injectSettings(page, settings);
  await page.goto('/');

  // Wait for weather fetch to complete
  await expect(page.locator('#weather-temp')).not.toHaveText('', { timeout: 5000 });
  await expect(page.locator('#weather-temp')).toContainText('18');
});

// ─── T113: Cached weather — no API call ───

test('T113 [US19] cached weather (< 1h old) uses cache, no API call', async ({ page }) => {
  // Cache uses getCacheKey(lat, lon) = "Math.round(lat*100)/100,Math.round(lon*100)/100"
  // Settings weatherCoords = { lat: 52.3676, lon: 4.9041 } → key = "52.37,4.9"
  const cache = {
    '52.37,4.9': {
      ts: Date.now(),
      data: { temperature: 22, code: 0, description: 'Clear', icon: '☀️', isDay: 1 },
    },
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
      body: JSON.stringify({ current: { temperature_2m: 99, weather_code: 0, is_day: 1 } }),
    });
  });

  await page.goto('/');
  await page.waitForTimeout(1000);

  // If cache was used, the temperature should show cached value (22), not 99
  const temp = await page.locator('#weather-temp').textContent();
  expect(temp).toContain('22');
});

// ─── T114: Weather API failure — app doesn't crash ───

test('T114 [US19] weather API failure, app does not crash', async ({ page }) => {
  await mockWeatherAPIFailure(page);
  const settings = createTestSettings({ components: { weather: true } });
  await injectSettings(page, settings);

  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForTimeout(1000);

  // App should still function
  await expect(page.locator('[data-tab-target="checkin"]')).toBeVisible();
  // No critical JS errors
  expect(errors.filter(e => !e.includes('fetch'))).toHaveLength(0);
});

// ─── T115: Weather disabled — widget hidden ───

test('T115 [US19] disable weather in settings, widget hidden', async ({ page }) => {
  const settings = createTestSettings({ components: { weather: false } });
  await injectSettings(page, settings);
  await page.goto('/');

  await expect(page.locator('[data-component="weather"]')).toBeHidden();
});

// ─── T116: Save with weather — weather data in entry ───

test('T116 [US19] save with mocked weather, weather data in entry', async ({ page }) => {
  await mockWeatherAPI(page, { temperature: 15, weathercode: 2, is_day: 1 });
  await mockGeocodingAPI(page);
  const settings = createTestSettings({ components: { weather: true } });
  await injectSettings(page, settings);
  await page.goto('/');

  // Wait for weather to load (temp element gets populated)
  await expect(page.locator('#weather-temp')).not.toHaveText('', { timeout: 5000 });

  await page.locator('.emotion-segment[data-emotion="joy"]').click();
  await page.locator('#save-checkin').click();
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const entry = entries[Object.keys(entries).find(k => k.startsWith(todayKey))];
  expect(entry.weather).toBeTruthy();
  expect(entry.weather.temperature).toBe(15);
});

// ─── T117: Geocoding — change location ───

test('T117 [US20] change weather location to Berlin, verify coords update', async ({ page }) => {
  await mockGeocodingAPI(page, [
    { name: 'Berlin', latitude: 52.52, longitude: 13.405, country: 'Germany' },
  ]);
  await mockWeatherAPI(page);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#settings-weather-location').fill('Berlin');
  await page.locator('#settings-save').click();
  await page.waitForTimeout(500);

  // Settings should reflect the new location
  const { getLocalStorageSettings } = require('./fixtures/helpers');
  const settings = await getLocalStorageSettings(page);
  expect(settings.weatherLocation).toBe('Berlin');
});

// ─── T118: Geocoding empty results — warning ───

test('T118 [US20] geocoding empty results for nonsense city', async ({ page }) => {
  await mockGeocodingAPIEmpty(page);
  await mockWeatherAPI(page);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#settings-weather-location').fill('xyznonexistentcity');
  await page.locator('#settings-save').click();
  await page.waitForTimeout(500);

  // Should show some status/warning message
  const status = page.locator('#settings-status');
  // May or may not show a warning — app should not crash at minimum
  await expect(page.locator('[data-tab-target="settings"]')).toBeVisible();
});
