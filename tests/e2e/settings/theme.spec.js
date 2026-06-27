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
  await expect(page.locator('.theme-button[data-theme-pick="light"]')).not.toHaveClass(/is-selected/);
  await expect(page.locator('.theme-button[data-theme-pick="system"]')).not.toHaveClass(/is-selected/);
});

// ─── Theme persists across reload ───

test('dark theme persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('.theme-button[data-theme-pick="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
