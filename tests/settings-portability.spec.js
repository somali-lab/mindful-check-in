// @ts-check
const { test, expect } = require('./fixtures/base');
const {
  injectSettings,
  createTestSettings,
  getLocalStorageSettings,
  navigateToTab,
  openSettingsTab,
  acceptConfirm,
} = require('./fixtures/helpers');

// ─── Export settings downloads JSON ───

test('export settings downloads JSON file', async ({ page }) => {
  const settings = createTestSettings({ theme: 'dark', rowsPerPage: 10 });
  await injectSettings(page, settings);
  await page.goto('/');
  await openSettingsTab(page, 'portability');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#cfg-btn-export').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.json$/);

  const fs = require('fs');
  const path = await download.path();
  const content = JSON.parse(fs.readFileSync(path, 'utf-8'));
  expect(content.theme).toBe('dark');
});

// ─── Import valid settings ───

test('import valid settings JSON applies immediately', async ({ page }) => {
  await page.goto('/');
  await openSettingsTab(page, 'portability');

  const settingsToImport = createTestSettings({ theme: 'dark', rowsPerPage: 5 });

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-settings-import.json');
  fs.writeFileSync(tmpPath, JSON.stringify(settingsToImport));
  await page.locator('#cfg-inp-import').setInputFiles(tmpPath);
  await page.waitForTimeout(500);

  // Verify settings applied
  const stored = await getLocalStorageSettings(page);
  expect(stored.theme).toBe('dark');

  try { fs.unlinkSync(tmpPath); } catch (_) {}
});

// ─── Import corrupt settings — error ───

test('import corrupt settings shows error, settings unchanged', async ({ page }) => {
  const settings = createTestSettings({ theme: 'light' });
  await injectSettings(page, settings);
  await page.goto('/');
  await openSettingsTab(page, 'portability');

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-bad-settings.json');
  fs.writeFileSync(tmpPath, 'not valid json');
  await page.locator('#cfg-inp-import').setInputFiles(tmpPath);
  await page.waitForTimeout(500);

  // Settings unchanged
  const stored = await getLocalStorageSettings(page);
  expect(stored.theme).toBe('light');

  try { fs.unlinkSync(tmpPath); } catch (_) {}
});

// ─── Reset settings ───

test('reset settings restores defaults', async ({ page }) => {
  const settings = createTestSettings({ theme: 'dark', rowsPerPage: 50 });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#cfg-btn-reset').click();
  await acceptConfirm(page);
  await page.waitForTimeout(300);

  // Settings should be reset to defaults
  const stored = await getLocalStorageSettings(page);
  // Default theme is 'system', default rows is 7
  expect(stored.theme).toBe('system');
  expect(stored.rowsPerPage).toBe(7);
});

// ─── Import/Export sub-tab presents the actions as cards ───

test('Settings > Import/Export tab presents settings actions as cards', async ({ page }) => {
  await page.goto('/');
  await openSettingsTab(page, 'portability');

  const exportCard = page.locator('.data-card', { has: page.locator('#cfg-btn-export') });
  const importCard = page.locator('.data-card', { has: page.locator('#cfg-inp-import') });
  await expect(exportCard).toBeVisible();
  await expect(importCard).toBeVisible();
  await expect(exportCard.locator('p')).not.toHaveText('');
  await expect(importCard.locator('p')).not.toHaveText('');

  // Export/import moved out of the footer; only Reset + Save remain there
  await expect(page.locator('.app-shell-footer-bar[data-footer="settings"] #cfg-btn-export')).toHaveCount(0);
  await expect(page.locator('#cfg-btn-reset')).toBeVisible();
  await expect(page.locator('#cfg-btn-save')).toBeVisible();
});
