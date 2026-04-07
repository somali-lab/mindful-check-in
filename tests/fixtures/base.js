// Base test fixture — auto-mocks weather and geocoding APIs for all tests.
// @ts-check
const { test: pwTest, expect } = require('@playwright/test');

const WEATHER_RESPONSE = {
  current: {
    temperature_2m: 14,
    weather_code: 1,
    is_day: 1,
    wind_speed_10m: 8.5,
  },
};

const GEOCODING_RESPONSE = {
  results: [
    { name: 'Amsterdam', latitude: 52.3676, longitude: 4.9041, country: 'Netherlands' },
  ],
};

const test = pwTest.extend({
  autoMockWeatherAPIs: [async ({ page }, use) => {
    await page.route('**/api.open-meteo.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(WEATHER_RESPONSE),
      })
    );
    await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(GEOCODING_RESPONSE),
      })
    );
    await use();
  }, { scope: 'test', auto: true }],
});

module.exports = { test, expect };
