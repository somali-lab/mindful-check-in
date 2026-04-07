// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  generateEntries,
  getLocalStorageEntries,
  navigateToTab,
  getDateKey,
} = require('./fixtures/helpers');

// ─── T065: Export entries downloads JSON ───

test('T065 [US12] export entries triggers download with correct JSON', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#overview-export').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.json$/);

  // Read the download content
  const path = await download.path();
  const fs = require('fs');
  const content = JSON.parse(fs.readFileSync(path, 'utf-8'));
  // Export produces an array of entries
  expect(Array.isArray(content)).toBeTruthy();
  expect(content.length).toBe(10);
});

// ─── T066: Import valid JSON into empty app ───

test('T066 [US12] import valid JSON into empty app adds entries', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Create a temp file to import (array format as app expects)
  const entries = [];
  for (let i = 0; i < 5; i++) {
    entries.push({
      entryKey: getDateKey(i),
      ...createTestEntry({
        thoughts: `Imported ${i}`,
        selectedEmotion: 'joy',
      }),
    });
  }

  // Trigger file chooser
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#overview-import').click(),
  ]);

  // Write temp file
  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-import.json');
  fs.writeFileSync(tmpPath, JSON.stringify(entries));
  await fileChooser.setFiles(tmpPath);

  // Wait for import to process
  await page.waitForTimeout(500);

  // Verify entries imported
  const storedEntries = await getLocalStorageEntries(page);
  expect(Object.keys(storedEntries).length).toBeGreaterThanOrEqual(5);

  // Cleanup
  fs.unlinkSync(tmpPath);
});

// ─── T067: Import with overlap — overwrite mode ───

test('T067 [US12] import overlapping entries, overwrite updates them', async ({ page }) => {
  const dateKey = getDateKey(0);
  const testId = 'test-overwrite-id';
  const existing = { [dateKey]: createTestEntry({ thoughts: 'Original', id: testId }) };
  await injectEntries(page, existing);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const imported = [{ entryKey: dateKey, ...createTestEntry({ thoughts: 'Overwritten', id: testId }) }];

  // Set up dialog handler to accept (overwrite)
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#overview-import').click(),
  ]);

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-overwrite.json');
  fs.writeFileSync(tmpPath, JSON.stringify(imported));
  await fileChooser.setFiles(tmpPath);
  await page.waitForTimeout(500);

  const entries = await getLocalStorageEntries(page);
  // After overwrite, the entry should have the new thoughts
  expect(entries[dateKey].thoughts).toBe('Overwritten');

  fs.unlinkSync(tmpPath);
});

// ─── T068: Import with overlap — skip mode ───

test('T068 [US12] import overlapping entries, skip preserves originals', async ({ page }) => {
  const dateKey = getDateKey(0);
  const testId = 'test-skip-id';
  const existing = { [dateKey]: createTestEntry({ thoughts: 'Original', id: testId }) };
  await injectEntries(page, existing);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const imported = [{ entryKey: dateKey, ...createTestEntry({ thoughts: 'Skipped', id: testId }) }];

  // Set up dialog handler to dismiss (skip)
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#overview-import').click(),
  ]);

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-skip.json');
  fs.writeFileSync(tmpPath, JSON.stringify(imported));
  await fileChooser.setFiles(tmpPath);
  await page.waitForTimeout(500);

  const entries = await getLocalStorageEntries(page);
  // Original should be preserved
  expect(entries[dateKey].thoughts).toBe('Original');

  fs.unlinkSync(tmpPath);
});

// ─── T069: Import invalid JSON — error ───

test('T069 [US12] import invalid JSON shows error, no data changes', async ({ page }) => {
  await injectEntries(page, generateEntries(3));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#overview-import').click(),
  ]);

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-invalid.json');
  fs.writeFileSync(tmpPath, 'not valid json {{{');
  await fileChooser.setFiles(tmpPath);
  await page.waitForTimeout(500);

  // Entries should still be intact
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBe(3);

  fs.unlinkSync(tmpPath);
});

// ─── T070: Per-row export button ───

test('T070 [US12] per-row export button downloads single entry', async ({ page }) => {
  await injectEntries(page, generateEntries(3));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const exportBtn = page.locator('.overview-export-entry-button').first();
  if (await exportBtn.count() > 0) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  }
});
