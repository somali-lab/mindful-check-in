// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectSettings,
  createTestSettings,
  navigateToTab,
  openInfoTab,
} = require('../../fixtures/helpers');

// ─── Saved logo is reflected on body[data-logo] at startup ───

test('saved logo is applied to body[data-logo] on load', async ({ page }) => {
  await injectSettings(page, createTestSettings({ logo: 'cat' }));
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-logo', 'cat');
});

// ─── Picking a logo and saving swaps the brand mark ───

test('selecting a logo and saving updates body[data-logo]', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  await page.locator('#cfg-logo').selectOption('cat');
  await page.locator('#cfg-btn-save').click();
  await expect(page.locator('body')).toHaveAttribute('data-logo', 'cat');
});

// ─── The chosen logo survives a reload ───

test('logo choice persists across reload', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  await page.locator('#cfg-logo').selectOption('cat');
  await page.locator('#cfg-btn-save').click();
  await expect(page.locator('body')).toHaveAttribute('data-logo', 'cat');

  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-logo', 'cat');
});

// ─── The About panel always shows the brand emblem ───

test('About panel shows the brand logo mark', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'about');
  await expect(page.locator('#view-info .info-hero-mark')).toBeVisible();
});
