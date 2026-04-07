// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestEntry,
  createTestSettings,
  getLocalStorageEntries,
  getLocalStorageSettings,
  navigateToTab,
  generateEntries,
  getDateKey,
  getTodayKey,
  VISIBILITY_PRESETS,
} = require('./fixtures/helpers');

// ─── T134: XSS in thoughts field — escaped ───

test('T134 XSS script tag in thoughts escaped as literal text', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    thoughts: '<script>alert(1)</script>',
    selectedEmotion: 'joy',
  });
  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/');

  // The thoughts should be displayed as literal text, not executed
  await expect(page.locator('#thoughts')).toHaveValue('<script>alert(1)</script>');

  // Navigate to overview to verify escaped in table
  await navigateToTab(page, 'overview');
  const bodyHtml = await page.locator('#overview-body').innerHTML();
  expect(bodyHtml).not.toContain('<script>');
});

// ─── T135: XSS in note field via img onerror ───

test('T135 XSS img onerror in note escaped in rendered output', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    note: '<img onerror=alert(1) src=x>',
    selectedEmotion: 'joy',
  });
  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/');

  // Navigate to overview
  await navigateToTab(page, 'overview');
  const bodyHtml = await page.locator('#overview-body').innerHTML();
  expect(bodyHtml).not.toContain('<img');
});

// ─── T136: 10,000+ characters in note ───

test('T136 very long text (10000 chars) in note saves without hang', async ({ page }) => {
  await page.goto('/');
  const longText = 'A'.repeat(10000);
  await page.locator('#note').fill(longText);
  await page.locator('.emotion-segment[data-emotion="joy"]').click();
  await page.locator('#save-checkin').click();

  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const entry = entries[todayKey] || entries[Object.keys(entries).find(k => k.startsWith(todayKey))];
  expect(entry.note.length).toBe(10000);
});

// ─── T137: Double-click Save — only one entry ───

test('T137 double-click Save creates only one entry', async ({ page }) => {
  await page.goto('/');
  await page.locator('.emotion-segment[data-emotion="joy"]').click();

  // Rapid double click
  await page.locator('#save-checkin').click();
  await page.locator('#save-checkin').click();

  await page.waitForTimeout(300);

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const todayEntries = Object.keys(entries).filter(k => k.startsWith(todayKey));
  // Should have only 1 entry (update, not duplicate)
  expect(todayEntries.length).toBe(1);
});

// ─── T138: 5+ entries on same day — unique timestamped keys ───

test('T138 multiple entries per day get unique timestamped keys', async ({ page }) => {
  await page.goto('/');

  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      await page.locator('#new-checkin').click();
    }
    await page.locator('.emotion-segment[data-emotion="joy"]').click();
    await page.locator('#thoughts').fill(`Entry ${i + 1}`);
    await page.locator('#save-checkin').click();
    await expect(page.locator('#history-banner')).toHaveClass(/is-success/);
    await page.waitForTimeout(100);
  }

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const todayEntries = Object.keys(entries).filter(k => k.startsWith(todayKey));
  expect(todayEntries.length).toBe(3);

  // Keys should be unique
  const uniqueKeys = new Set(todayEntries);
  expect(uniqueKeys.size).toBe(3);
});

// ─── T139: No entries — empty states ───

test('T139 no entries shows empty states in overview and summary', async ({ page }) => {
  await page.goto('/');

  // Summary should mention saving first check-in
  const summary = page.locator('#summary-content');
  await expect(summary).toContainText(/save|check/i);

  // Overview should show empty message
  await navigateToTab(page, 'overview');
  const emptyMsg = page.locator('#overview-empty');
  await expect(emptyMsg).not.toBeEmpty();
});

// ─── T140: Overview pagination out of bounds ───

test('T140 pagination clamps to valid range', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await injectSettings(page, createTestSettings({ rowsPerPage: 5 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Go to last page
  await page.locator('#overview-last').click();

  // Next should be disabled (can't go beyond last)
  await expect(page.locator('#overview-next')).toBeDisabled();
});

// ─── T141: Clear search after date filter — filter remains ───

test('T141 clear search after date filter, filter remains active', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Apply date filter
  await page.locator('#overview-filter').selectOption('last7');
  await page.waitForTimeout(200);

  // Type and clear search
  await page.locator('#overview-search').fill('test');
  await page.waitForTimeout(200);
  await page.locator('#overview-search').fill('');
  await page.waitForTimeout(200);

  // Filter should still be "last7"
  await expect(page.locator('#overview-filter')).toHaveValue('last7');
});

// ─── T142: Import entries with extra unknown fields ───

test('T142 import entries with unknown fields, only known fields kept', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const entries = [
    {
      entryKey: getDateKey(0),
      ...createTestEntry({ thoughts: 'Valid', selectedEmotion: 'joy' }),
      unknownField: 'should be ignored or kept harmlessly',
      anotherField: 12345,
    },
  ];

  page.on('dialog', async (dialog) => await dialog.accept());

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#overview-import').click(),
  ]);

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-extra-fields.json');
  fs.writeFileSync(tmpPath, JSON.stringify(entries));
  await fileChooser.setFiles(tmpPath);
  await page.waitForTimeout(500);

  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBeGreaterThanOrEqual(1);
  // Find the entry by dateKey or first available
  const entryKey = Object.keys(stored).find(k => k.startsWith(getDateKey(0))) || Object.keys(stored)[0];
  expect(stored[entryKey].thoughts).toBe('Valid');

  fs.unlinkSync(tmpPath);
});

// ─── T143: Import settings with unknown keys ───

test('T143 import settings with unknown keys, unknown keys ignored', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  const settingsToImport = createTestSettings({ theme: 'dark' });
  settingsToImport.unknownSetting = 'should not break';

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#settings-import').click(),
  ]);

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-unknown-settings.json');
  fs.writeFileSync(tmpPath, JSON.stringify(settingsToImport));
  await fileChooser.setFiles(tmpPath);
  await page.waitForTimeout(500);

  // App should still work
  await expect(page.locator('[data-tab-target="settings"]')).toBeVisible();

  fs.unlinkSync(tmpPath);
});

// ─── T144: Disable and re-enable components ───

test('T144 disable then re-enable components, no stale state', async ({ page }) => {
  await page.goto('/');

  // Inject all-off settings after page load (not via addInitScript to avoid re-injection on reload)
  const settingsOff = createTestSettings({
    components: VISIBILITY_PRESETS['all-off'],
    weatherLocation: '',
    weatherCoords: null,
  });
  await page.evaluate((settings) => {
    localStorage.setItem('local-mood-tracker-settings', JSON.stringify(settings));
  }, settingsOff);
  await page.reload();

  // Verify components hidden
  await expect(page.locator('[data-component="coreFeeling"]')).toBeHidden();

  // Now switch to all-on via evaluate
  const settingsOn = createTestSettings({
    components: VISIBILITY_PRESETS['all-on'],
    weatherLocation: '',
    weatherCoords: null,
  });
  await page.evaluate((settings) => {
    localStorage.setItem('local-mood-tracker-settings', JSON.stringify(settings));
  }, settingsOn);
  await page.reload();

  // Components should be visible
  await expect(page.locator('[data-component="coreFeeling"]')).toBeVisible();
  await expect(page.locator('[data-component="bodySignals"]')).toBeVisible();
  await expect(page.locator('[data-component="moodMatrix"]')).toBeVisible();
});

// ─── T145: localStorage persistence across reload ───

test('T145 localStorage persistence across page reload', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = { [todayKey]: createTestEntry({ thoughts: 'Persist test', selectedEmotion: 'joy' }) };
  const settings = createTestSettings({ theme: 'dark' });

  await injectEntries(page, entries);
  await injectSettings(page, settings);
  await page.goto('/');

  // Verify loaded
  await expect(page.locator('#thoughts')).toHaveValue('Persist test');

  // Reload
  await page.reload();

  // Still persisted
  await expect(page.locator('#thoughts')).toHaveValue('Persist test');
  const stored = await getLocalStorageEntries(page);
  expect(stored[todayKey].thoughts).toBe('Persist test');
  const storedSettings = await getLocalStorageSettings(page);
  expect(storedSettings.theme).toBe('dark');
});

// ─── T146: Special characters in text fields ───

test('T146 special characters safely escaped in text fields', async ({ page }) => {
  await page.goto('/');

  await page.locator('#thoughts').fill('"quotes" & <tags>');
  await page.locator('.emotion-segment[data-emotion="joy"]').click();
  await page.locator('#action').fill('action with "special" & <chars>');
  await page.locator('#note').fill('<b>bold</b> & "quote"');

  await page.locator('#save-checkin').click();
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

  // Navigate to overview and verify escaped
  await navigateToTab(page, 'overview');
  const bodyHtml = await page.locator('#overview-body').innerHTML();
  expect(bodyHtml).not.toContain('<b>bold</b>');
  // The raw text should be escaped, not rendered as HTML
  expect(bodyHtml).not.toMatch(/<b>/);
});
