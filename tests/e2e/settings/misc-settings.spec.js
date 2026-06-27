// @ts-check
const { test, expect } = require('../../fixtures/base');
const { navigateToTab, getLocalStorageSettings } = require('../../fixtures/helpers');

// Settings not covered by the theme/logo/wheel/reminder specs.

test('toast duration and default language persist on save', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-toast').fill('8');
  await page.locator('#cfg-lang').selectOption('nl');
  await page.locator('#cfg-btn-save').click();

  const settings = await getLocalStorageSettings(page);
  expect(settings.toastDuration).toBe(8);
  expect(settings.defaultLanguage).toBe('nl');
});
