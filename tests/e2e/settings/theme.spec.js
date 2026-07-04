// @ts-check
const { test, expect } = require('../../fixtures/base');

// ─── Click dark theme button ───

test('click dark theme button, data-theme changes to dark', async ({ page }) => {
  await page.goto('/');
  await page.locator('.theme-button[data-theme-pick="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// ─── System theme with emulated dark color scheme ───

test('system theme with emulated dark scheme applies dark theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.locator('.theme-button[data-theme-pick="system"]').click();

  // With system theme + dark color scheme, the app should be in dark mode
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// ─── Selected button has is-selected class ───

test('selected theme button has is-selected class', async ({ page }) => {
  await page.goto('/');
  await page.locator('.theme-button[data-theme-pick="dark"]').click();

  await expect(page.locator('.theme-button[data-theme-pick="dark"]')).toHaveClass(/is-selected/);
  await expect(page.locator('.theme-button[data-theme-pick="light"]')).not.toHaveClass(
    /is-selected/,
  );
  await expect(page.locator('.theme-button[data-theme-pick="system"]')).not.toHaveClass(
    /is-selected/,
  );
});

// ─── Theme persists across reload ───

test('dark theme persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('.theme-button[data-theme-pick="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// ─── Header changes reflect in the open settings form ───

test('header theme + language switches sync the settings form controls live', async ({ page }) => {
  const { navigateToTab } = require('../../fixtures/helpers');
  await page.goto('/');
  await navigateToTab(page, 'settings');

  // Baseline: form shows the defaults.
  await expect(page.locator('#cfg-theme')).toHaveValue('system');
  await expect(page.locator('#cfg-lang')).toHaveValue('en');

  // Change theme + language from the header while settings is open.
  await page.locator('.theme-button[data-theme-pick="dark"]').click();
  await page.locator('.language-button[data-lang-pick="nl"]').click();

  // The form controls follow without a save or reload.
  await expect(page.locator('#cfg-theme')).toHaveValue('dark');
  await expect(page.locator('#cfg-lang')).toHaveValue('nl');
  await expect(page.locator('#view-settings [data-t="settingLanguage"]')).toHaveText('Taal');
});
