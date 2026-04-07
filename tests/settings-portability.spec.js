// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectSettings,
  createTestSettings,
  getLocalStorageSettings,
  navigateToTab,
} = require('./fixtures/helpers');

// ─── T103: Export settings downloads JSON ───

test('T103 [US15] export settings downloads JSON file', async ({ page }) => {
  const settings = createTestSettings({ theme: 'dark', rowsPerPage: 10 });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#settings-export').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.json$/);

  const fs = require('fs');
  const path = await download.path();
  const content = JSON.parse(fs.readFileSync(path, 'utf-8'));
  expect(content.theme).toBe('dark');
});

// ─── T104: Import valid settings ───

test('T104 [US15] import valid settings JSON applies immediately', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  const settingsToImport = createTestSettings({ theme: 'dark', rowsPerPage: 5 });

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#settings-import').click(),
  ]);

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-settings-import.json');
  fs.writeFileSync(tmpPath, JSON.stringify(settingsToImport));
  await fileChooser.setFiles(tmpPath);
  await page.waitForTimeout(500);

  // Verify settings applied
  const stored = await getLocalStorageSettings(page);
  expect(stored.theme).toBe('dark');

  fs.unlinkSync(tmpPath);
});

// ─── T105: Import corrupt settings — error ───

test('T105 [US15] import corrupt settings shows error, settings unchanged', async ({ page }) => {
  const settings = createTestSettings({ theme: 'light' });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  page.on('dialog', async (dialog) => await dialog.accept());

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#settings-import').click(),
  ]);

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-bad-settings.json');
  fs.writeFileSync(tmpPath, 'not valid json');
  await fileChooser.setFiles(tmpPath);
  await page.waitForTimeout(500);

  // Settings unchanged
  const stored = await getLocalStorageSettings(page);
  expect(stored.theme).toBe('light');

  fs.unlinkSync(tmpPath);
});

// ─── T106: Reset settings ───

test('T106 [US15] reset settings restores defaults', async ({ page }) => {
  const settings = createTestSettings({ theme: 'dark', rowsPerPage: 50 });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'settings');

  page.on('dialog', async (dialog) => await dialog.accept());

  await page.locator('#settings-reset').click();
  await page.waitForTimeout(300);

  // Settings should be reset to defaults
  const stored = await getLocalStorageSettings(page);
  // Default theme is 'system', default rows is 7
  expect(stored.theme).toBe('system');
  expect(stored.rowsPerPage).toBe(7);
});
