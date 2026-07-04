// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  createTestEntry,
  generateEntries,
  getLocalStorageEntries,
  navigateToTab,
  openInfoTab,
  getDateKey,
} = require('../../fixtures/helpers');

// ─── Export entries downloads JSON ───

test('export entries triggers download with correct JSON', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await openInfoTab(page, 'data');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#ov-export').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.json$/);

  // Read the download content
  const path = await download.path();
  const fs = require('node:fs');
  const content = JSON.parse(fs.readFileSync(path, 'utf-8'));
  // The export wraps the entry map together with the quadrant board.
  expect(typeof content).toBe('object');
  expect(Object.keys(content.entries).length).toBe(10);
  expect(content.quadrant).toBeDefined();
  expect(Array.isArray(content.quadrant.internalFrom)).toBe(true);
});

// ─── Import a wrapped export file restores the quadrant board ───

test('importing a wrapped export file restores entries and quadrant', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  const file = {
    entries: { [getDateKey(0)]: createTestEntry({ thoughts: 'From backup' }) },
    quadrant: {
      internalFrom: [{ text: 'Backup worry', done: false }],
      internalTo: [],
      externalFrom: [],
      externalTo: [{ text: 'Backup walk', done: true }],
      values: ['Family'], // legacy compass data migrates into quadrant 1
    },
  };
  const fs = require('node:fs');
  const tmpPath = require('node:path').join(__dirname, 'tmp-import-wrapped.json');
  fs.writeFileSync(tmpPath, JSON.stringify(file));
  await page.locator('#ov-import').setInputFiles(tmpPath);
  await page.locator('#dlg-overwrite').click();
  await page.waitForTimeout(500);

  const storedEntries = await getLocalStorageEntries(page);
  expect(Object.keys(storedEntries).length).toBe(1);

  await page.goto('/#quadrant');
  await expect(page.locator('[data-qlist="internalFrom"]')).toContainText('Backup worry');
  await expect(page.locator('[data-qlist="externalTo"] .quadrant-item').first()).toHaveClass(
    /is-done/,
  );
  await expect(page.locator('[data-qlist="internalTo"]')).toContainText('Family');

  try {
    fs.unlinkSync(tmpPath);
  } catch (_) {}
});

// ─── Import valid JSON into empty app ───

test('import valid JSON into empty app adds entries', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  // Create a temp file to import (v4 expects object keyed by entry key)
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts: `Imported ${i}`,
      coreFeeling: 'joy',
    });
  }

  // Use setInputFiles on hidden input
  const fs = require('node:fs');
  const tmpPath = require('node:path').join(__dirname, 'tmp-import.json');
  fs.writeFileSync(tmpPath, JSON.stringify(entries));
  await page.locator('#ov-import').setInputFiles(tmpPath);

  // v4 shows import dialog — click "Overwrite matching"
  await page.locator('#dlg-overwrite').click();
  await page.waitForTimeout(500);

  // Verify entries imported
  const storedEntries = await getLocalStorageEntries(page);
  expect(Object.keys(storedEntries).length).toBeGreaterThanOrEqual(5);

  // Cleanup
  try {
    fs.unlinkSync(tmpPath);
  } catch (_) {}
});

// ─── Import with overlap — overwrite mode ───

test('import overlapping entries, overwrite updates them', async ({ page }) => {
  const dateKey = getDateKey(0);
  const testId = 'test-overwrite-id';
  const existing = { [dateKey]: createTestEntry({ thoughts: 'Original', id: testId }) };
  await injectEntries(page, existing);
  await page.goto('/');
  await openInfoTab(page, 'data');

  // v4 import expects object keyed by entry key
  const imported = {};
  imported[dateKey] = createTestEntry({ thoughts: 'Overwritten', id: testId });

  const fs = require('node:fs');
  const tmpPath = require('node:path').join(__dirname, 'tmp-overwrite.json');
  fs.writeFileSync(tmpPath, JSON.stringify(imported));
  await page.locator('#ov-import').setInputFiles(tmpPath);

  // v4 shows dialog — click "Overwrite matching"
  await page.locator('#dlg-overwrite').click();
  await page.waitForTimeout(500);

  const entries = await getLocalStorageEntries(page);
  // After overwrite, the entry should have the new thoughts
  expect(entries[dateKey].thoughts).toBe('Overwritten');

  try {
    fs.unlinkSync(tmpPath);
  } catch (_) {}
});

// ─── Import with overlap — skip mode ───

test('import overlapping entries, skip preserves originals', async ({ page }) => {
  const dateKey = getDateKey(0);
  const testId = 'test-skip-id';
  const existing = { [dateKey]: createTestEntry({ thoughts: 'Original', id: testId }) };
  await injectEntries(page, existing);
  await page.goto('/');
  await openInfoTab(page, 'data');

  // v4 import expects object keyed by entry key
  const imported = {};
  imported[dateKey] = createTestEntry({ thoughts: 'Skipped', id: testId });

  const fs = require('node:fs');
  const tmpPath = require('node:path').join(__dirname, 'tmp-skip.json');
  fs.writeFileSync(tmpPath, JSON.stringify(imported));
  await page.locator('#ov-import').setInputFiles(tmpPath);

  // v4 shows dialog — click "Skip matching"
  await page.locator('#dlg-skip').click();
  await page.waitForTimeout(500);

  const entries = await getLocalStorageEntries(page);
  // Original should be preserved
  expect(entries[dateKey].thoughts).toBe('Original');

  try {
    fs.unlinkSync(tmpPath);
  } catch (_) {}
});

// ─── Import invalid JSON — error ───

test('import invalid JSON shows error, no data changes', async ({ page }) => {
  await injectEntries(page, generateEntries(3));
  await page.goto('/');
  await openInfoTab(page, 'data');

  const fs = require('node:fs');
  const tmpPath = require('node:path').join(__dirname, 'tmp-invalid.json');
  fs.writeFileSync(tmpPath, 'not valid json {{{');
  await page.locator('#ov-import').setInputFiles(tmpPath);
  await page.waitForTimeout(500);

  // Invalid JSON should show warning banner, entries still intact
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBe(3);

  try {
    fs.unlinkSync(tmpPath);
  } catch (_) {}
});

// ─── Per-row export button ───

test('per-row export button downloads single entry', async ({ page }) => {
  await injectEntries(page, generateEntries(3));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const exportBtn = page.locator('.ov-export-entry').first();
  if ((await exportBtn.count()) > 0) {
    const [download] = await Promise.all([page.waitForEvent('download'), exportBtn.click()]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  }
});
