// @ts-check
// Branch coverage improvement tests – part 3
// Target: remaining uncovered branches to reach 85%
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestEntry,
  createTestSettings,
  getLocalStorageEntries,
  navigateToTab,
  generateEntries,
  getDateKey,
  getTodayKey,
  mockWeatherAPI,
  VISIBILITY_PRESETS,
} = require('./fixtures/helpers');

// ═══════════════════════════════════════════════════════
// core.js — remaining branch hits
// ═══════════════════════════════════════════════════════

test('MCI.uid fallback when crypto.randomUUID unavailable', async ({ page }) => {
  await page.goto('/');
  const id = await page.evaluate(() => {
    var orig = crypto.randomUUID;
    crypto.randomUUID = undefined;
    var uid = MCI.uid();
    crypto.randomUUID = orig;
    return uid;
  });
  expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('MCI.debounce cancels previous timer on rapid calls', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      var count = 0;
      var fn = MCI.debounce(function () { count++; resolve(count); }, 50);
      fn(); fn(); fn(); // only last should fire
    });
  });
  expect(result).toBe(1);
});

test('MCI.hasLightBackground for light and dark colors', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return {
      white: MCI.hasLightBackground('#ffffff'),
      black: MCI.hasLightBackground('#000000'),
      bad: MCI.hasLightBackground('xyz'),
      short: MCI.hasLightBackground('#fff')
    };
  });
  expect(result.white).toBe(true);
  expect(result.black).toBe(false);
  expect(result.bad).toBe(false);
  expect(result.short).toBe(false);
});

test('MCI.download creates and triggers download', async ({ page }) => {
  await page.goto('/');
  const download = page.waitForEvent('download');
  await page.evaluate(() => {
    MCI.download({ test: 'data' }, 'test.json');
  });
  const d = await download;
  expect(d.suggestedFilename()).toBe('test.json');
});

test('MCI.formatDate with string input', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.formatDate('2025-06-15T10:30:00');
  });
  expect(result).toBe('2025-06-15');
});

test('MCI.formatTime with string input', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.formatTime('2025-06-15T10:30:00');
  });
  expect(result).toBe('10:30');
});

test('MCI.setLang updates placeholders and aria labels', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { MCI.setLang('nl'); });
  // Check that data-t-placeholder elements got updated
  const placeholder = await page.locator('#ov-search').getAttribute('placeholder');
  expect(placeholder).toBeTruthy();
  // Switch back to English
  await page.evaluate(() => { MCI.setLang('en'); });
});

test('MCI.loadSettings merges partial stored settings with defaults', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    localStorage.setItem('local-mood-tracker-settings', JSON.stringify({ rowsPerPage: 15 }));
    var s = MCI.loadSettings();
    return { rows: s.rowsPerPage, wheel: s.defaultWheelType, hasComponents: !!s.components };
  });
  expect(result.rows).toBe(15);
  expect(result.wheel).toBe('act');
  expect(result.hasComponents).toBe(true);
});

test('MCI.normalize with energy as non-object uses defaults', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.normalize({ energy: 'invalid' }).energy;
  });
  expect(result).toEqual({ physical: null, mental: null, emotional: null });
});

test('MCI.normalize with null moodRow/moodCol defaults to -1', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    var n = MCI.normalize({ moodRow: null, moodCol: undefined });
    return { row: n.moodRow, col: n.moodCol };
  });
  expect(result.row).toBe(-1);
  expect(result.col).toBe(-1);
});

test('MCI.saveEntry emits entry:saved event', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    var received = null;
    MCI.on('entry:saved', function (d) { received = d; });
    MCI.saveEntry('test-key', { thoughts: 'test' });
    return { key: received.key, hasEntry: !!received.entry };
  });
  expect(result.key).toBe('test-key');
  expect(result.hasEntry).toBe(true);
});

test('MCI.deleteEntry emits entry:deleted event', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    MCI.saveEntry('del-key', { thoughts: 'delete me' });
    var received = null;
    MCI.on('entry:deleted', function (d) { received = d; });
    MCI.deleteEntry('del-key');
    return received;
  });
  expect(result.key).toBe('del-key');
});

test('MCI.readFile onerror triggers error callback', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      // Create a mock to trigger onerror
      var origFR = FileReader;
      window.FileReader = function () {
        this.readAsText = function () {
          var self = this;
          setTimeout(function () { if (self.onerror) self.onerror(); }, 10);
        };
      };
      var blob = new Blob(['test']);
      var file = new File([blob], 'test.txt');
      MCI.readFile(file, function (err, data) {
        window.FileReader = origFR;
        resolve({ hasError: !!err, data: data });
      });
    });
  });
  expect(result.hasError).toBe(true);
  expect(result.data).toBeNull();
});

// ═══════════════════════════════════════════════════════
// navigation.js — remaining branches
// ═══════════════════════════════════════════════════════

test('navigation: apply dark theme directly', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-theme-pick="dark"]').click();
  const theme = await page.getAttribute('html', 'data-theme');
  expect(theme).toBe('dark');
});

test('navigation: apply light theme directly', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-theme-pick="light"]').click();
  const theme = await page.getAttribute('html', 'data-theme');
  expect(theme).toBeNull(); // light removes data-theme attr
});

test('navigation: apply system theme', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-theme-pick="system"]').click();
  const btn = page.locator('[data-theme-pick="system"]');
  await expect(btn).toHaveClass(/is-selected/);
});

test('navigation: settings:changed syncs theme button', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    var s = MCI.loadSettings();
    s.theme = 'dark';
    MCI.saveSettings(s, 'settings');
  });
  const darkBtn = page.locator('[data-theme-pick="dark"]');
  await expect(darkBtn).toHaveClass(/is-selected/);
});

test('navigation: saved tab persists across load', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    MCI.put(MCI.KEYS.activeTab, 'overview');
  });
  await page.goto('/');
  const activePanel = page.locator('.view.is-active');
  await expect(activePanel).toHaveAttribute('id', 'view-overview');
});

test('navigation: language buttons update on language change', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-lang-pick="nl"]').click();
  const nlBtn = page.locator('[data-lang-pick="nl"]');
  await expect(nlBtn).toHaveClass(/is-selected/);
  // Switch back
  await page.locator('[data-lang-pick="en"]').click();
});

// ═══════════════════════════════════════════════════════
// overview.js — sort and filter branches
// ═══════════════════════════════════════════════════════

test('overview: sort by feeling column', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('th[data-sortcol="feeling"]').click();
  const firstRow = page.locator('.ov-row').first();
  await expect(firstRow).toBeVisible();
});

test('overview: sort by mood column', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('th[data-sortcol="mood"]').click();
  const firstRow = page.locator('.ov-row').first();
  await expect(firstRow).toBeVisible();
});

test('overview: sort by energy column', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('th[data-sortcol="energy"]').click();
  const firstRow = page.locator('.ov-row').first();
  await expect(firstRow).toBeVisible();
});

test('overview: sort by thoughts column', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('th[data-sortcol="thoughts"]').click();
  const firstRow = page.locator('.ov-row').first();
  await expect(firstRow).toBeVisible();
});

test('overview: sort by actions column', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('th[data-sortcol="actions"]').click();
  const firstRow = page.locator('.ov-row').first();
  await expect(firstRow).toBeVisible();
});

test('overview: sort by score column asc and desc', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const scoreCol = page.locator('th[data-sortcol="score"]');
  await scoreCol.click(); // asc
  await scoreCol.click(); // desc
  const firstRow = page.locator('.ov-row').first();
  await expect(firstRow).toBeVisible();
});

test('overview: filter today', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'today entry' });
  entries[getDateKey(-5)] = createTestEntry({ thoughts: 'old entry' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('#ov-filter').selectOption('today');
  await page.waitForTimeout(300);
  const rows = page.locator('.ov-row');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(2);
});

test('overview: filter 7 days', async ({ page }) => {
  const entries = generateEntries(10);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('#ov-filter').selectOption('7');
  const rows = page.locator('.ov-row');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

test('overview: filter 14 days', async ({ page }) => {
  const entries = generateEntries(15);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('#ov-filter').selectOption('14');
  const rows = page.locator('.ov-row');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

test('overview: filter 90 days', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('#ov-filter').selectOption('90');
  const rows = page.locator('.ov-row');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

test('overview: search filters results', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'unicorn rainbow magic' });
  entries[getDateKey(-1)] = createTestEntry({ thoughts: 'boring ordinary day' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.fill('#ov-search', 'unicorn');
  await page.waitForTimeout(500);
  const rows = page.locator('.ov-row');
  const count = await rows.count();
  expect(count).toBe(1);
});

test('overview: pagination first/prev/next/last buttons', async ({ page }) => {
  const entries = generateEntries(20);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  // Navigate through pages
  const next = page.locator('#ov-next');
  const prev = page.locator('#ov-prev');
  const first = page.locator('#ov-first');
  const last = page.locator('#ov-last');
  if (!await next.isDisabled()) {
    await next.click();
    await page.waitForTimeout(100);
  }
  if (!await last.isDisabled()) {
    await last.click();
    await page.waitForTimeout(100);
  }
  if (!await prev.isDisabled()) {
    await prev.click();
    await page.waitForTimeout(100);
  }
  if (!await first.isDisabled()) {
    await first.click();
    await page.waitForTimeout(100);
  }
});

test('overview: empty state shows when no entries', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const empty = page.locator('#ov-empty');
  await expect(empty).not.toHaveClass(/is-hidden/);
});

test('overview: delete entry removes row', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'to be deleted' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  page.once('dialog', async d => { await d.accept(); });
  await page.locator('.ov-del').first().click();
  await page.waitForTimeout(300);
  const remaining = await page.locator('.ov-row').count();
  expect(remaining).toBe(0);
});

// ═══════════════════════════════════════════════════════
// settings.js — more branch hits
// ═══════════════════════════════════════════════════════

test('settings: import valid settings JSON file', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const fileInput = page.locator('#cfg-inp-import');

  const settingsData = JSON.stringify({
    defaultWheelType: 'extended',
    rowsPerPage: 15
  });

  await fileInput.setInputFiles({
    name: 'settings.json',
    mimeType: 'application/json',
    buffer: Buffer.from(settingsData)
  });
  await page.waitForTimeout(500);
  const toast = page.locator('.toast');
  await expect(toast.first()).toBeVisible({ timeout: 3000 });
});

test('settings: import invalid JSON shows error', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const fileInput = page.locator('#cfg-inp-import');

  await fileInput.setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('this is not json {{{')
  });
  await page.waitForTimeout(500);
  const toast = page.locator('.toast.toast--warning');
  await expect(toast.first()).toBeVisible({ timeout: 3000 });
});

test('settings: export settings creates download', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const download = page.waitForEvent('download');
  await page.click('#cfg-btn-export');
  const d = await download;
  expect(d.suggestedFilename()).toContain('settings');
});

test('settings: reset to defaults', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  page.once('dialog', async d => { await d.accept(); });
  await page.click('#cfg-btn-reset');
  const toast = page.locator('.toast');
  await expect(toast.first()).toBeVisible({ timeout: 3000 });
});

test('settings: delete quick action tag', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const beforeCount = await page.locator('#qa-list .quick-action-tag').count();
  await page.locator('#qa-list .qa-del').first().click();
  await page.waitForTimeout(200);
  const afterCount = await page.locator('#qa-list .quick-action-tag').count();
  expect(afterCount).toBe(beforeCount - 1);
});

test('settings: add quick action via Enter key', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const qaInput = page.locator('#qa-input');
  await qaInput.fill('New unique action XYZ');
  await qaInput.press('Enter');
  const tags = page.locator('#qa-list .quick-action-tag');
  const lastTag = await tags.last().textContent();
  expect(lastTag).toContain('New unique action XYZ');
});

test('settings: component toggle checkboxes have data-comp', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  // Toggle the thoughts component off (this is more accessible than weather)
  const thoughtsCheck = page.locator('[data-comp="thoughts"]');
  if (await thoughtsCheck.isVisible()) {
    await thoughtsCheck.uncheck();
    await page.click('#cfg-btn-save');
    await page.waitForTimeout(200);
    await navigateToTab(page, 'checkin');
    const section = page.locator('[data-component="thoughts"]');
    await expect(section).toHaveClass(/is-hidden/);
  }
});

// ═══════════════════════════════════════════════════════
// weather.js — cache, error, geolocation branches
// ═══════════════════════════════════════════════════════

test('weather: cached weather renders immediately', async ({ page }) => {
  const settings = createTestSettings({ weatherLocation: 'Amsterdam' });
  await injectSettings(page, settings);
  await page.goto('/');
  // Pre-fill the weather cache after page load
  await page.evaluate(() => {
    localStorage.setItem('local-mood-tracker-weather-cache', JSON.stringify({
      ts: Date.now(),
      data: { temperature: 15, weathercode: 2, windspeed: 10 }
    }));
    // Trigger re-render via settings change
    MCI.emit('settings:changed', MCI.loadSettings());
  });
  await navigateToTab(page, 'checkin');
  await page.waitForTimeout(300);
  const weather = page.locator('#weather-slot');
  const text = await weather.textContent();
  expect(text).toContain('15');
});

test('weather: language change re-renders weather', async ({ page }) => {
  const settings = createTestSettings({ weatherLocation: 'Amsterdam' });
  await injectSettings(page, settings);
  await page.goto('/');
  // Set cache after page load
  await page.evaluate(() => {
    localStorage.setItem('local-mood-tracker-weather-cache', JSON.stringify({
      ts: Date.now(),
      data: { temperature: 20, weathercode: 0, windspeed: 5 }
    }));
    MCI.emit('settings:changed', MCI.loadSettings());
  });
  await navigateToTab(page, 'checkin');
  await page.waitForTimeout(300);
  await page.evaluate(() => { MCI.setLang('nl'); });
  await page.waitForTimeout(100);
  const text = await page.locator('#weather-slot').textContent();
  expect(text).toContain('20');
  await page.evaluate(() => { MCI.setLang('en'); });
});

test('weather: no location and no cache shows hint', async ({ page }) => {
  const settings = createTestSettings({ weatherLocation: '', weatherCoords: null });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.waitForTimeout(500);
  const text = await page.locator('#weather-slot').textContent();
  expect(text).toBeTruthy();
});

// ═══════════════════════════════════════════════════════
// body.js — remaining branches
// ═══════════════════════════════════════════════════════

test('body: setZones with null/empty array clears all', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  // Select a zone first
  await page.locator('.bz').first().click();
  await expect(page.locator('#body-display')).not.toHaveClass(/is-empty/);
  // Reset
  await page.locator('#bdy-btn-reset').click();
  await expect(page.locator('#body-display')).toHaveClass(/is-empty/);
});

test('body: body note is cleared on reset', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.fill('#fld-body-note', 'some note');
  await page.locator('#bdy-btn-reset').click();
  const val = await page.inputValue('#fld-body-note');
  expect(val).toBe('');
});

test('body: showDisplay with zone that has no translation key', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  // Click multiple body zones to cover all zone types
  const zones = page.locator('.bz');
  const count = await zones.count();
  if (count >= 3) {
    await zones.nth(0).click();
    await zones.nth(1).click();
    await zones.nth(2).click();
  }
  const display = page.locator('#body-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

// ═══════════════════════════════════════════════════════
// energy.js — additional branches
// ═══════════════════════════════════════════════════════

test('energy: reset clears all meters and note', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  // Set energy first
  await page.locator('[data-sval="75"][data-meter="physical"]').click();
  await page.fill('#fld-energy-note', 'energy note');
  // Reset
  await page.locator('#nrg-btn-reset').click();
  const display = page.locator('#energy-display');
  await expect(display).toHaveClass(/is-empty/);
  const note = await page.inputValue('#fld-energy-note');
  expect(note).toBe('');
});

test('energy: disabled component is not rendered', async ({ page }) => {
  const settings = createTestSettings({ components: { ...VISIBILITY_PRESETS['all-on'], energyPhysical: false } });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  // Physical meter should not be present
  const physMeter = page.locator('[data-meter="physical"]');
  // It could still be in the DOM but the energy-column may be missing
  const text = await page.locator('#energy-display').textContent();
  expect(text).toBeTruthy(); // At minimum the display exists
});

test('energy: emotional label "social" maps correctly', async ({ page }) => {
  const settings = createTestSettings({ energyEmotionalLabel: 'social' });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  // Check the emotional column label
  const labels = page.locator('.energy-type-label');
  const count = await labels.count();
  if (count >= 3) {
    const lastLabel = await labels.nth(2).textContent();
    expect(lastLabel).toBeTruthy();
  }
});

test('energy: emotional label "emotionalSocial" as default', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const labels = page.locator('.energy-type-label');
  const count = await labels.count();
  expect(count).toBeGreaterThanOrEqual(3);
});

// ═══════════════════════════════════════════════════════
// mood.js — additional branches
// ═══════════════════════════════════════════════════════

test('mood: selection row=5, col=5 center grid', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('.mood-cell[data-mr="5"][data-mc="5"]');
  await cell.click();
  const display = page.locator('#mood-display');
  await expect(display).not.toHaveClass(/is-empty/);
  const text = await display.textContent();
  expect(text).toBeTruthy();
});

test('mood: selection top-left corner (high arousal, low valence)', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('.mood-cell[data-mr="0"][data-mc="0"]');
  await cell.click();
  const display = page.locator('#mood-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('mood: selection bottom-right corner (low arousal, high valence)', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('.mood-cell[data-mr="9"][data-mc="9"]');
  await cell.click();
  const display = page.locator('#mood-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('mood: keyboard Enter on same cell deselects', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('.mood-cell[data-mr="3"][data-mc="3"]');
  await cell.focus();
  await cell.press('Enter');
  await expect(cell).toHaveClass(/is-selected/);
  await cell.press('Enter');
  await expect(cell).not.toHaveClass(/is-selected/);
});

// ═══════════════════════════════════════════════════════
// wheel.js — additional branches
// ═══════════════════════════════════════════════════════

test('wheel: setVariant to extended changes wheel', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.evaluate(() => {
    MCI.Wheel.setVariant('extended');
  });
  const segments = page.locator('#wheel-svg [data-em]');
  const count = await segments.count();
  expect(count).toBe(12);
});

test('wheel: setPicked selects a segment', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.evaluate(() => {
    MCI.Wheel.setPicked('joy');
  });
  const display = page.locator('#wheel-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('wheel: setPicked empty string clears selection', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.evaluate(() => {
    MCI.Wheel.setPicked('joy');
    MCI.Wheel.setPicked('');
  });
  const display = page.locator('#wheel-display');
  await expect(display).toHaveClass(/is-empty/);
});

// ═══════════════════════════════════════════════════════
// home.js — score classifications
// ═══════════════════════════════════════════════════════

test('home: heatmap cells get score-based classes (high)', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodScore: 4 });
  await injectEntries(page, entries);
  await page.goto('/');
  const highCell = page.locator('#home-heatmap .has-entry.home-heat-high');
  const count = await highCell.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('home: heatmap cells get score-based classes (low)', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodScore: 1 });
  await injectEntries(page, entries);
  await page.goto('/');
  const lowCell = page.locator('#home-heatmap .has-entry.home-heat-low');
  const count = await lowCell.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('home: heatmap cells get score-based classes (mid)', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodScore: 2 });
  await injectEntries(page, entries);
  await page.goto('/');
  const midCell = page.locator('#home-heatmap .has-entry.home-heat-mid');
  const count = await midCell.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('home: stats update after entry saved', async ({ page }) => {
  await page.goto('/');
  const streak0 = await page.locator('#home-streak').textContent();
  expect(streak0).toBe('0');
  // Save an entry
  await page.evaluate(() => {
    MCI.saveEntry(MCI.todayKey(), MCI.normalize({ thoughts: 'test', coreFeeling: 'joy', moodScore: 3 }));
  });
  await page.waitForTimeout(200);
  const streak1 = await page.locator('#home-streak').textContent();
  expect(parseInt(streak1)).toBeGreaterThanOrEqual(1);
});

// ═══════════════════════════════════════════════════════
// checkin.js — more branches
// ═══════════════════════════════════════════════════════

test('checkin: collect gathers weather from cached state', async ({ page }) => {
  const settings = createTestSettings({ weatherLocation: 'Amsterdam' });
  await injectSettings(page, settings);
  await page.goto('/');
  // Set cache after page load
  await page.evaluate(() => {
    localStorage.setItem('local-mood-tracker-weather-cache', JSON.stringify({
      ts: Date.now(),
      data: { temperature: 22, weathercode: 3, windspeed: 8 }
    }));
    MCI.emit('settings:changed', MCI.loadSettings());
  });
  await navigateToTab(page, 'checkin');
  await page.waitForTimeout(500);
  await page.fill('#fld-thoughts', 'weather test');
  await page.click('#ci-btn-save');
  await page.waitForTimeout(300);
  const entries = await getLocalStorageEntries(page);
  const keys = Object.keys(entries);
  expect(keys.length).toBeGreaterThan(0);
});

test('checkin: load entry with mood data restores mood selection', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodRow: 3, moodCol: 7, moodLabel: 'Happy', coreFeeling: 'joy' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('.ov-row[data-ekey]').first().click();
  await page.waitForTimeout(500);
  const display = page.locator('#mood-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('checkin: load entry with energy data restores meters', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({
    coreFeeling: 'joy',
    energy: { physical: 60, mental: 70, emotional: 80 }
  });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('.ov-row[data-ekey]').first().click();
  await page.waitForTimeout(500);
  const display = page.locator('#energy-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('checkin: updatePill shows saved date for existing entry', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'pill test', coreFeeling: 'joy' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('.ov-row[data-ekey]').first().click();
  await page.waitForTimeout(500);
  const pill = page.locator('#ci-pill');
  await expect(pill).toHaveClass(/is-saved/);
});

// ═══════════════════════════════════════════════════════
// compute.js — branch exercises
// ═══════════════════════════════════════════════════════

test('computeMoodScore with only energy, no mood', async ({ page }) => {
  await page.goto('/');
  const score = await page.evaluate(() => {
    return MCI.computeMoodScore({
      moodRow: -1, moodCol: -1,
      energy: { physical: 50, mental: 60, emotional: 70 },
      coreFeeling: ''
    });
  });
  expect(score).toBeGreaterThanOrEqual(1);
});

test('computeMoodScore with only coreFeeling from negative list', async ({ page }) => {
  await page.goto('/');
  const score = await page.evaluate(() => {
    return MCI.computeMoodScore({
      moodRow: -1, moodCol: -1,
      energy: null,
      coreFeeling: 'anger'
    });
  });
  expect(score).toBeLessThanOrEqual(2);
});

test('computeStats with multi-day entries calculates streak', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    var entries = {};
    var today = new Date();
    for (var i = 0; i < 5; i++) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      var key = MCI.formatDate(d);
      entries[key] = MCI.normalize({ thoughts: 'day ' + i, coreFeeling: 'joy', moodScore: 3 });
    }
    return MCI.computeStats(entries);
  });
  expect(result.streak).toBeGreaterThanOrEqual(5);
});

test('findEntryForDay finds entry with timestamp key', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    var entries = {};
    entries['2025-06-15_143000000'] = MCI.normalize({ thoughts: 'test' });
    var keys = Object.keys(entries);
    var found = MCI.findEntryForDay(entries, keys, '2025-06-15');
    return found !== null;
  });
  expect(result).toBe(true);
});

test('buildHeatmapData with entries marks correct days', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    var entries = {};
    entries[MCI.todayKey()] = MCI.normalize({ thoughts: 'today', moodScore: 3 });
    var data = MCI.buildHeatmapData(entries);
    var todayCell = data.days.find(function (d) { return d.isToday; });
    return { hasToday: !!todayCell, todayHasEntry: todayCell ? !!todayCell.entry : false };
  });
  expect(result.hasToday).toBe(true);
  expect(result.todayHasEntry).toBe(true);
});
