// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');

// ─── T080: Click dark theme button ───

test('T080 [US17] click dark theme button, data-theme changes to dark', async ({ page }) => {
  await page.goto('/');
  await page.locator('.theme-button[data-theme-value="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// ─── T081: System theme with emulated dark color scheme ───

test('T081 [US17] system theme with emulated dark scheme applies dark theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.locator('.theme-button[data-theme-value="system"]').click();

  // With system theme + dark color scheme, the app should be in dark mode
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// ─── T082: Selected button has is-selected class ───

test('T082 [US17] selected theme button has is-selected class', async ({ page }) => {
  await page.goto('/');
  await page.locator('.theme-button[data-theme-value="dark"]').click();

  await expect(page.locator('.theme-button[data-theme-value="dark"]')).toHaveClass(/is-selected/);
  await expect(page.locator('.theme-button[data-theme-value="light"]')).not.toHaveClass(/is-selected/);
  await expect(page.locator('.theme-button[data-theme-value="system"]')).not.toHaveClass(/is-selected/);
});

// ─── T083: Theme persists across reload ───

test('T083 [US17] dark theme persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('.theme-button[data-theme-value="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
