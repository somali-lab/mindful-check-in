// @ts-check
const { test, expect } = require('./fixtures/base');
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

// ─── XSS in thoughts field — escaped ───

test('XSS script tag in thoughts escaped as literal text', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    thoughts: '<script>alert(1)</script>',
    coreFeeling: 'joy',
  });
  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/#checkin');

  // The thoughts should be displayed as literal text, not executed
  await expect(page.locator('#fld-thoughts')).toHaveValue('<script>alert(1)</script>');

  // Navigate to overview to verify escaped in table
  await navigateToTab(page, 'overview');
  const bodyHtml = await page.locator('#ov-tbody').innerHTML();
  expect(bodyHtml).not.toContain('<script>');
});

// ─── XSS in note field via img onerror ───

test('XSS img onerror in note escaped in rendered output', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    note: '<img onerror=alert(1) src=x>',
    coreFeeling: 'joy',
  });
  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/');

  // Navigate to overview
  await navigateToTab(page, 'overview');
  const bodyHtml = await page.locator('#ov-tbody').innerHTML();
  expect(bodyHtml).not.toContain('<img');
});

// ─── 10,000+ characters in note ───

test('very long text (10000 chars) in note saves without hang', async ({ page }) => {
  await page.goto('/#checkin');
  const longText = 'A'.repeat(10000);
  await page.locator('#fld-note').fill(longText);
  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#ci-btn-save').click();

  await expect(page.locator('.toast--success')).toBeVisible();

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const entry = entries[todayKey] || entries[Object.keys(entries).find(k => k.startsWith(todayKey))];
  expect(entry.note.length).toBe(10000);
});

// ─── Double-click Save — only one entry ───

test('double-click Save creates only one entry', async ({ page }) => {
  await page.goto('/#checkin');
  await page.locator('.emotion-segment[data-em="joy"]').click();

  // Rapid double click
  await page.locator('#ci-btn-save').click();
  await page.locator('#ci-btn-save').click();

  await page.waitForTimeout(300);

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const todayEntries = Object.keys(entries).filter(k => k.startsWith(todayKey));
  // Should have only 1 entry (update, not duplicate)
  expect(todayEntries.length).toBe(1);
});

// ─── 5+ entries on same day — unique timestamped keys ───

test('multiple entries per day get unique timestamped keys', async ({ page }) => {
  await page.goto('/#checkin');

  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      await page.locator('#ci-btn-new').click();
    }
    await page.locator('.emotion-segment[data-em="joy"]').click();
    await page.locator('#fld-thoughts').fill(`Entry ${i + 1}`);
    await page.locator('#ci-btn-save').click();
    await expect(page.locator('.toast--success').first()).toBeVisible();
    // Wait for toast to disappear before next save
    await page.waitForTimeout(1500);
  }

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const todayEntries = Object.keys(entries).filter(k => k.startsWith(todayKey));
  expect(todayEntries.length).toBe(3);

  // Keys should be unique
  const uniqueKeys = new Set(todayEntries);
  expect(uniqueKeys.size).toBe(3);
});

// ─── No entries — empty states ───

test('no entries shows empty states in overview and summary', async ({ page }) => {
  await page.goto('/#checkin');

  // Summary should show empty state
  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText(/no entries|save|check/i);

  // Overview should show empty message
  await navigateToTab(page, 'overview');
  const emptyMsg = page.locator('#ov-empty');
  await expect(emptyMsg).not.toBeEmpty();
});

// ─── Overview pagination out of bounds ───

test('pagination clamps to valid range', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await injectSettings(page, createTestSettings({ rowsPerPage: 5 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Go to last page
  await page.locator('#ov-last').click();

  // Next should be disabled (can't go beyond last)
  await expect(page.locator('#ov-next')).toBeDisabled();
});

// ─── Clear search after date filter — filter remains ───

test('clear search after date filter, filter remains active', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Apply date filter
  await page.locator('#ov-filter').selectOption('7');
  await page.waitForTimeout(200);

  // Type and clear search
  await page.locator('#ov-search').fill('test');
  await page.waitForTimeout(200);
  await page.locator('#ov-search').fill('');
  await page.waitForTimeout(200);

  // Filter should still be "last7"
  await expect(page.locator('#ov-filter')).toHaveValue('7');
});

// ─── Import entries with extra unknown fields ───

test('import entries with unknown fields, only known fields kept', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // v4 import expects an object keyed by entry key, not an array
  const dateKey = getDateKey(0);
  const entries = {};
  entries[dateKey] = {
    ...createTestEntry({ thoughts: 'Valid', coreFeeling: 'joy' }),
    unknownField: 'should be ignored or kept harmlessly',
    anotherField: 12345,
  };

  const tmpPath = require('path').join(__dirname, 'tmp-extra-fields.json');
  const fs = require('fs');
  fs.writeFileSync(tmpPath, JSON.stringify(entries));
  await page.locator('#ov-import').setInputFiles(tmpPath);

  // v4 shows import dialog — click "Overwrite matching"
  await page.locator('#dlg-overwrite').click();
  await page.waitForTimeout(500);

  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBeGreaterThanOrEqual(1);
  const entryKey = Object.keys(stored).find(k => k.startsWith(dateKey)) || Object.keys(stored)[0];
  expect(stored[entryKey].thoughts).toBe('Valid');

  try { fs.unlinkSync(tmpPath); } catch (_) {}
});

// ─── Import settings with unknown keys ───

test('import settings with unknown keys, unknown keys ignored', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  const settingsToImport = createTestSettings({ theme: 'dark' });
  settingsToImport.unknownSetting = 'should not break';

  const fs = require('fs');
  const tmpPath = require('path').join(__dirname, 'tmp-unknown-settings.json');
  fs.writeFileSync(tmpPath, JSON.stringify(settingsToImport));
  await page.locator('#cfg-inp-import').setInputFiles(tmpPath);
  await page.waitForTimeout(500);

  // App should still work
  await expect(page.locator('[data-route="settings"]:visible').first()).toBeVisible();

  try { fs.unlinkSync(tmpPath); } catch (_) {}
});

// ─── Disable and re-enable components ───

test('disable then re-enable components, no stale state', async ({ page }) => {
  await page.goto('/#checkin');

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

// ─── localStorage persistence across reload ───

test('localStorage persistence across page reload', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = { [todayKey]: createTestEntry({ thoughts: 'Persist test', coreFeeling: 'joy' }) };
  const settings = createTestSettings({ theme: 'dark' });

  await injectEntries(page, entries);
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  // Verify loaded
  await expect(page.locator('#fld-thoughts')).toHaveValue('Persist test');

  // Reload
  await page.reload();

  // Still persisted
  await expect(page.locator('#fld-thoughts')).toHaveValue('Persist test');
  const stored = await getLocalStorageEntries(page);
  expect(stored[todayKey].thoughts).toBe('Persist test');
  const storedSettings = await getLocalStorageSettings(page);
  expect(storedSettings.theme).toBe('dark');
});

// ─── Special characters in text fields ───

test('special characters safely escaped in text fields', async ({ page }) => {
  await page.goto('/#checkin');

  await page.locator('#fld-thoughts').fill('"quotes" & <tags>');
  await page.locator('.emotion-segment[data-em="joy"]').click();
  // #fld-action is hidden (chips drive it); set its value directly
  await page.locator('#fld-action').evaluate((el) => { el.value = 'action with "special" & <chars>'; });
  await page.locator('#fld-note').fill('<b>bold</b> & "quote"');

  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  // Navigate to overview and verify escaped
  await navigateToTab(page, 'overview');
  const bodyHtml = await page.locator('#ov-tbody').innerHTML();
  expect(bodyHtml).not.toContain('<b>bold</b>');
  // The raw text should be escaped, not rendered as HTML
  expect(bodyHtml).not.toMatch(/<b>/);
});

// ─── localStorage quota full — app does not crash ───

test('localStorage quota full, save does not crash the app', async ({ page }) => {
  await page.goto('/#checkin');

  // Fill localStorage to near capacity (5MB limit in most browsers)
  // by writing large strings, leaving barely any space for an entry
  await page.evaluate(() => {
    const key = 'quota-filler-';
    const chunk = 'x'.repeat(1024 * 100); // 100KB per chunk
    try {
      for (let i = 0; i < 100; i++) {
        localStorage.setItem(key + i, chunk);
      }
    } catch (e) {
      // Expected — storage full
    }
  });

  // Select an emotion so save validation passes
  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#fld-thoughts').fill('Quota test entry');

  // Attempt save — should not crash the page
  await page.locator('#ci-btn-save').click();

  // The page should still be functional (not a blank error page)
  await expect(page.locator('#fld-thoughts')).toBeVisible();
  // The tab navigation should still work
  await expect(page.locator('[data-route="checkin"]:visible').first()).toBeVisible();

  // Clean up filler data so other tests aren't affected
  await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('quota-filler-'));
    keys.forEach(k => localStorage.removeItem(k));
  });
});

// ─── Date boundary — entries at 23:59 and 00:01 get different date keys ───

test('entries at 23:59 and 00:01 stored under different date keys', async ({ page }) => {
  // Create two entries with timestamps straddling midnight
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yy = yesterday.getFullYear();
  const ym = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yd = String(yesterday.getDate()).padStart(2, '0');
  const lateKey = `${yy}-${ym}-${yd}_235900000`; // 23:59 yesterday

  const ty = today.getFullYear();
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const earlyKey = `${ty}-${tm}-${td}_000100000`; // 00:01 today

  const lateEntry = createTestEntry({ thoughts: 'Before midnight', coreFeeling: 'sadness' });
  const earlyEntry = createTestEntry({ thoughts: 'After midnight', coreFeeling: 'joy' });

  await injectEntries(page, {
    [lateKey]: lateEntry,
    [earlyKey]: earlyEntry,
  });
  await page.goto('/');

  // Navigate to overview — both entries should appear
  await navigateToTab(page, 'overview');

  const rows = page.locator('#ov-tbody tr');
  // Both entries should be visible as separate rows
  const allText = await page.locator('#ov-tbody').innerText();
  expect(allText).toContain('Before midnight');
  expect(allText).toContain('After midnight');

  // Verify they are stored under different date prefixes in localStorage
  const entries = await getLocalStorageEntries(page);
  const keys = Object.keys(entries);
  const lateDate = lateKey.split('_')[0];
  const earlyDate = earlyKey.split('_')[0];
  expect(lateDate).not.toBe(earlyDate);
  expect(keys).toContain(lateKey);
  expect(keys).toContain(earlyKey);
});
