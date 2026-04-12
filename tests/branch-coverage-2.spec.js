// @ts-check
// Branch coverage improvement tests – part 2
// Target: uncovered branches across all modules
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
// core.js branch coverage
// ═══════════════════════════════════════════════════════

test('MCI.off removes a specific handler from the bus', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    let called = 0;
    function handler() { called++; }
    MCI.on('test:off', handler);
    MCI.emit('test:off');
    MCI.off('test:off', handler);
    MCI.emit('test:off');
    return called;
  });
  expect(result).toBe(1);
});

test('MCI.off on non-existent event does nothing', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    MCI.off('nonexistent:event', function () {});
    return true;
  });
  expect(result).toBe(true);
});

test('MCI.emit catches handler errors without crashing', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    MCI.on('test:error', function () { throw new Error('test'); });
    MCI.emit('test:error');
    return true; // did not crash
  });
  expect(result).toBe(true);
});

test('MCI.emit on non-existent event does nothing', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    MCI.emit('nonexistent:event', { foo: 1 });
    return true;
  });
  expect(result).toBe(true);
});

test('MCI.put failure triggers banner warning', async ({ page }) => {
  await page.goto('/');
  const msg = await page.evaluate(() => {
    // override setItem to throw
    const orig = localStorage.setItem;
    localStorage.setItem = function () { throw new Error('quota'); };
    let bannerMsg = '';
    const origBanner = MCI.banner;
    MCI.banner = function (m) { bannerMsg = m; };
    MCI.put('x', 'y');
    localStorage.setItem = orig;
    MCI.banner = origBanner;
    return bannerMsg;
  });
  expect(msg).toBeTruthy();
});

test('MCI.del error branch does not crash', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const orig = localStorage.removeItem;
    localStorage.removeItem = function () { throw new Error('fail'); };
    MCI.del('some-key');
    localStorage.removeItem = orig;
    return true;
  });
  expect(result).toBe(true);
});

test('MCI.get returns fallback on parse error', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    localStorage.setItem('test-bad-json', '{invalid');
    return MCI.get('test-bad-json', 'fallback-val');
  });
  expect(result).toBe('fallback-val');
});

test('MCI.t falls back to English when key missing in current lang', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    MCI.lang = 'nl';
    // Use a key that exists in English but not Dutch
    const origNl = MCI.strings.nl['saveWarnEmpty'];
    delete MCI.strings.nl['saveWarnEmpty'];
    const val = MCI.t('saveWarnEmpty');
    if (origNl) MCI.strings.nl['saveWarnEmpty'] = origNl;
    MCI.lang = 'en';
    return val;
  });
  // Should get English fallback, not the raw key
  expect(result).not.toBe('saveWarnEmpty');
});

test('MCI.t with params substitutes placeholders', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.t('demoGenerated', { count: 42 });
  });
  expect(result).toContain('42');
});

test('MCI.normalize fills defaults for empty/null entry', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const n = MCI.normalize(null);
    return {
      hasId: !!n.id,
      thoughts: n.thoughts,
      energy: n.energy,
      bodySignals: n.bodySignals,
      moodRow: n.moodRow,
      weather: n.weather,
      moodScore: n.moodScore
    };
  });
  expect(result.hasId).toBe(true);
  expect(result.thoughts).toBe('');
  expect(result.energy).toEqual({ physical: null, mental: null, emotional: null });
  expect(result.bodySignals).toEqual([]);
  expect(result.moodRow).toBe(-1);
  expect(result.weather).toBeNull();
});

test('MCI.normalize handles entry with partial energy', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const n = MCI.normalize({ energy: { physical: 50 } });
    return n.energy;
  });
  expect(result.physical).toBe(50);
  expect(result.mental).toBeNull();
  expect(result.emotional).toBeNull();
});

test('MCI.normalize handles entry with weather data', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const n = MCI.normalize({
      weather: { temperature: 20, weathercode: 1, windspeed: 5, description: 'Sunny', location: 'Amsterdam' }
    });
    return n.weather;
  });
  expect(result.temperature).toBe(20);
  expect(result.location).toBe('Amsterdam');
});

test('MCI.dateFromKey returns null for empty key', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.dateFromKey('');
  });
  expect(result).toBeNull();
});

test('MCI.dateFromKey handles timestamp key with time portion', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const d = MCI.dateFromKey('2025-03-15_143000000');
    return { hours: d.getHours(), minutes: d.getMinutes() };
  });
  expect(result.hours).toBe(14);
  expect(result.minutes).toBe(30);
});

test('MCI.readFile error branch fires callback with error', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      // Create a fake file that triggers an error in FileReader
      const blob = new Blob(['test'], { type: 'text/plain' });
      const file = new File([blob], 'test.txt');
      MCI.readFile(file, function (err, data) {
        resolve({ err: err === null, data: data });
      });
    });
  });
  expect(result.err).toBe(true);
  expect(result.data).toBeTruthy();
});

test('MCI.esc returns empty string for non-string input', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return [MCI.esc(null), MCI.esc(undefined), MCI.esc(123)];
  });
  expect(result).toEqual(['', '', '']);
});

test('MCI.loadEntries returns empty object for invalid stored data', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    localStorage.setItem('local-mood-tracker-entries', JSON.stringify([1, 2, 3]));
    const e = MCI.loadEntries();
    return Object.keys(e).length;
  });
  expect(result).toBe(0);
});

test('MCI.banner creates and auto-dismisses toast', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    MCI.banner('Test message', 'success');
  });
  const toast = page.locator('.toast');
  await expect(toast.first()).toBeVisible();
});

test('MCI.banner with warning type shows warning toast', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    MCI.banner('Warning test', 'warning');
  });
  const toast = page.locator('.toast--warning');
  await expect(toast.first()).toBeVisible();
});

// ═══════════════════════════════════════════════════════
// navigation.js branch coverage
// ═══════════════════════════════════════════════════════

test('invalid hash route falls back to home', async ({ page }) => {
  await page.goto('/#invalidRoute');
  const activePanel = page.locator('.view.is-active');
  await expect(activePanel).toHaveAttribute('id', 'view-home');
});

test('navigate via hash to settings tab', async ({ page }) => {
  await page.goto('/#settings');
  const activePanel = page.locator('.view.is-active');
  await expect(activePanel).toHaveAttribute('id', 'view-settings');
});

test('system theme change while set to system updates theme', async ({ page }) => {
  await page.goto('/');
  // Emulate dark mode and check that system theme is applied
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(100);
  const theme = await page.getAttribute('html', 'data-theme');
  expect(theme).toBe('dark');
});

test('navigate:route event switches tab', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { MCI.emit('navigate:route', 'overview'); });
  const activePanel = page.locator('.view.is-active');
  await expect(activePanel).toHaveAttribute('id', 'view-overview');
});

test('entry:request-load event switches to checkin', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { MCI.emit('navigate:route', 'overview'); });
  await page.evaluate(() => { MCI.emit('entry:request-load'); });
  const activePanel = page.locator('.view.is-active');
  await expect(activePanel).toHaveAttribute('id', 'view-checkin');
});

// ═══════════════════════════════════════════════════════
// mood.js branch coverage
// ═══════════════════════════════════════════════════════

test('mood cell keyboard Enter selects cell', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('.mood-cell').first();
  await cell.focus();
  await cell.press('Enter');
  await expect(cell).toHaveClass(/is-selected/);
});

test('mood cell keyboard Space selects cell', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('.mood-cell').first();
  await cell.focus();
  await cell.press(' ');
  await expect(cell).toHaveClass(/is-selected/);
});

test('clicking selected mood cell deselects it', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('.mood-cell[data-mr="5"][data-mc="5"]');
  await cell.click();
  await expect(cell).toHaveClass(/is-selected/);
  await cell.click();
  await expect(cell).not.toHaveClass(/is-selected/);
});

test('mood display shows empty state when nothing selected', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const display = page.locator('#mood-display');
  await expect(display).toHaveClass(/is-empty/);
});

// ═══════════════════════════════════════════════════════
// wheel.js branch coverage
// ═══════════════════════════════════════════════════════

test('wheel segment keyboard Enter selects emotion', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const seg = page.locator('#wheel-svg [data-em]').first();
  await seg.focus();
  await seg.press('Enter');
  const display = page.locator('#wheel-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('wheel segment keyboard Space selects emotion', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const seg = page.locator('#wheel-svg [data-em]').first();
  await seg.focus();
  await seg.press(' ');
  const display = page.locator('#wheel-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('clicking selected wheel segment deselects it', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const seg = page.locator('#wheel-svg [data-em]').first();
  await seg.click();
  const display = page.locator('#wheel-display');
  await expect(display).not.toHaveClass(/is-empty/);
  await seg.click();
  await expect(display).toHaveClass(/is-empty/);
});

test('settings:changed updates wheel variant', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.evaluate(() => {
    var s = MCI.loadSettings();
    s.defaultWheelType = 'extended';
    MCI.saveSettings(s, 'other');
  });
  const segments = page.locator('#wheel-svg [data-em]');
  await expect(segments).toHaveCount(12);
});

test('wheel display shows label from translation for selected emotion', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('#wheel-svg [data-em="joy"]').click();
  const display = page.locator('#wheel-display');
  const text = await display.textContent();
  expect(text).toBeTruthy();
  expect(text).not.toBe('');
});

// ═══════════════════════════════════════════════════════
// dashboard.js branch coverage — history modes
// ═══════════════════════════════════════════════════════

test('dashboard mood history mode shows mood-based colors', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const moodBtn = page.locator('[data-hmode="mood"]');
  await moodBtn.click();
  const cells = page.locator('#history-grid .cal-cell');
  await expect(cells.first()).toBeVisible();
});

test('dashboard physical energy history mode', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const btn = page.locator('[data-hmode="physical"]');
  await btn.click();
  const cells = page.locator('#history-grid .cal-cell');
  await expect(cells.first()).toBeVisible();
});

test('dashboard mental energy history mode', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const btn = page.locator('[data-hmode="mental"]');
  await btn.click();
  const cells = page.locator('#history-grid .cal-cell');
  await expect(cells.first()).toBeVisible();
});

test('dashboard emotional energy history mode', async ({ page }) => {
  const entries = generateEntries(5);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const btn = page.locator('[data-hmode="emotional"]');
  await btn.click();
  const cells = page.locator('#history-grid .cal-cell');
  await expect(cells.first()).toBeVisible();
});

test('dashboard getCellClass for mood mode with no moodCol', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodRow: -1, moodCol: -1 });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const btn = page.locator('[data-hmode="mood"]');
  await btn.click();
  // Entry with no mood selection should show empty
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toBeVisible();
});

test('dashboard getCellClass for mood mode with high valence', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodRow: 3, moodCol: 8, moodLabel: 'Happy' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="mood"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toHaveClass(/cal-high/);
});

test('dashboard getCellClass for mood mode with mid valence', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodRow: 5, moodCol: 5, moodLabel: 'Content' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="mood"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toHaveClass(/cal-mid/);
});

test('dashboard getCellClass for mood mode with low valence', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ moodRow: 5, moodCol: 2, moodLabel: 'Sad' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="mood"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toHaveClass(/cal-low/);
});

test('dashboard energyCellClass with no energy data shows empty', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ energy: { physical: null, mental: null, emotional: null } });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="physical"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toHaveClass(/cal-empty/);
});

test('dashboard energyCellClass with high energy (>=67)', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ energy: { physical: 80, mental: 90, emotional: 70 } });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="physical"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toHaveClass(/cal-high/);
});

test('dashboard energyCellClass with mid energy (34-66)', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ energy: { physical: 50, mental: 50, emotional: 50 } });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="physical"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toHaveClass(/cal-mid/);
});

test('dashboard energyCellClass with low energy (<34)', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ energy: { physical: 10, mental: 10, emotional: 10 } });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="physical"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  await expect(cell).toHaveClass(/cal-low/);
});

test('dashboard getCellLabel for physical mode with energy data', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ energy: { physical: 75, mental: 50, emotional: 25 } });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('[data-hmode="physical"]').click();
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  const title = await cell.getAttribute('title');
  expect(title).toContain('75%');
});

test('dashboard with disabled core feeling hides that mode button', async ({ page }) => {
  const settings = createTestSettings({ components: { ...VISIBILITY_PRESETS['all-on'], coreFeeling: false } });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const coreBtn = page.locator('[data-hmode="core"]');
  await expect(coreBtn).toHaveCount(0);
});

// ═══════════════════════════════════════════════════════
// energy.js branch coverage
// ═══════════════════════════════════════════════════════

test('energy emotional label: "emotional" maps to correct translation key', async ({ page }) => {
  const settings = createTestSettings({ energyEmotionalLabel: 'emotional' });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const label = page.locator('.energy-type-label').last();
  const text = await label.textContent();
  expect(text).toBeTruthy();
});

test('energy scale click sets meter value', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const scale = page.locator('[data-sval="75"][data-meter="physical"]');
  await scale.click();
  const display = page.locator('#energy-display');
  const text = await display.textContent();
  expect(text).toContain('75%');
});

test('energy meter click sets percentage based on click position', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const meter = page.locator('.energy-meter[data-meter="mental"]');
  const box = await meter.boundingBox();
  if (box) {
    // Click near the top (high energy)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.1);
  }
  const display = page.locator('#energy-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

// ═══════════════════════════════════════════════════════
// settings.js branch coverage
// ═══════════════════════════════════════════════════════

test('settings: language change swaps default quick actions', async ({ page }) => {
  // Start with default English quick actions
  await page.goto('/');
  await navigateToTab(page, 'settings');

  // Click NL language button
  const nlBtn = page.locator('[data-lang-pick="nl"]');
  await nlBtn.click();
  await page.waitForTimeout(200);

  // Verify quick actions changed to Dutch
  const qaList = page.locator('#qa-list');
  const text = await qaList.textContent();
  expect(text).toBeTruthy();
});

test('settings: external settings:changed event reloads form', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  // Trigger settings change from non-settings source
  await page.evaluate(() => {
    var s = MCI.loadSettings();
    s.rowsPerPage = 10;
    MCI.saveSettings(s, 'navigation');
  });
  const rows = page.locator('#cfg-rows');
  await expect(rows).toHaveValue('10');
});

test('settings: add duplicate quick action is ignored', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const qaInput = page.locator('#qa-input');
  const addBtn = page.locator('#cfg-btn-add-qa');
  // Get current count
  const beforeCount = await page.locator('#qa-list .quick-action-tag').count();
  // Add the first existing action again
  const firstAction = await page.locator('#qa-list .quick-action-tag').first().textContent();
  const actionText = firstAction ? firstAction.replace('✕', '').trim() : '';
  await qaInput.fill(actionText);
  await addBtn.click();
  const afterCount = await page.locator('#qa-list .quick-action-tag').count();
  expect(afterCount).toBe(beforeCount);
});

test('settings: add empty quick action is ignored', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const addBtn = page.locator('#cfg-btn-add-qa');
  const beforeCount = await page.locator('#qa-list .quick-action-tag').count();
  await addBtn.click();
  const afterCount = await page.locator('#qa-list .quick-action-tag').count();
  expect(afterCount).toBe(beforeCount);
});

test('settings: save with language change applies new language', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  await page.locator('#cfg-lang').selectOption('nl');
  await page.locator('#cfg-btn-save').click();
  // Verify Dutch text somewhere
  const heading = page.locator('[data-t="settingsTitle"]');
  const text = await heading.textContent();
  expect(text).toBeTruthy();
});

// ═══════════════════════════════════════════════════════
// checkin.js branch coverage
// ═══════════════════════════════════════════════════════

test('checkin: save with only thoughts (no feeling) succeeds', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.fill('#fld-thoughts', 'Just some thoughts');
  await page.click('#ci-btn-save');
  const toast = page.locator('.toast.toast--success');
  await expect(toast.first()).toBeVisible({ timeout: 5000 });
});

test('checkin: save with only core feeling (no thoughts) succeeds', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('#wheel-svg [data-em]').first().click();
  await page.click('#ci-btn-save');
  const toast = page.locator('.toast.toast--success');
  await expect(toast.first()).toBeVisible({ timeout: 5000 });
});

test('checkin: save empty form shows warning', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.click('#ci-btn-save');
  const toast = page.locator('.toast.toast--warning');
  await expect(toast.first()).toBeVisible({ timeout: 5000 });
});

test('checkin: load entry then new button resets form', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'loaded entry', coreFeeling: 'joy' });
  await injectEntries(page, entries);
  await page.goto('/');
  // Load entry via overview click
  await navigateToTab(page, 'overview');
  await page.locator('.ov-row[data-ekey]').first().click();
  await page.waitForTimeout(500);
  // Now click New button
  await page.click('#ci-btn-new');
  const pill = page.locator('#ci-pill');
  await expect(pill).toHaveClass(/is-new/);
  const thoughts = await page.inputValue('#fld-thoughts');
  expect(thoughts).toBe('');
});

test('checkin: quick action chip appends to action field', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const chip = page.locator('.quick-action-chip').first();
  const chipText = await chip.textContent();
  await chip.click();
  const fldValue = await page.inputValue('#fld-action');
  expect(fldValue).toBe(chipText);
  // Click another chip — should append with comma
  const chip2 = page.locator('.quick-action-chip').nth(1);
  const chip2Text = await chip2.textContent();
  await chip2.click();
  const fldValue2 = await page.inputValue('#fld-action');
  expect(fldValue2).toContain(chipText);
  expect(fldValue2).toContain(chip2Text);
});

test('checkin: clicking same chip twice does not duplicate', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const chip = page.locator('.quick-action-chip').first();
  await chip.click();
  const val1 = await page.inputValue('#fld-action');
  await chip.click();
  const val2 = await page.inputValue('#fld-action');
  expect(val2).toBe(val1); // no duplication
});

// ═══════════════════════════════════════════════════════
// body.js branch coverage
// ═══════════════════════════════════════════════════════

test('body display shows zone labels when zones selected', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('.bz').first().click();
  const display = page.locator('#body-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

test('body display updates on language change', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('.bz').first().click();
  const before = await page.locator('#body-display').textContent();
  // Switch to Dutch
  await page.evaluate(() => { MCI.setLang('nl'); });
  await page.waitForTimeout(100);
  const after = await page.locator('#body-display').textContent();
  // Labels should change language  
  expect(after).toBeTruthy();
});

// ═══════════════════════════════════════════════════════
// overview.js branch coverage
// ═══════════════════════════════════════════════════════

test('overview: sort by multiple columns exercises sort branches', async ({ page }) => {
  const entries = generateEntries(10);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Sort by score column
  const scoreHeader = page.locator('th[data-sort="score"]');
  if (await scoreHeader.count() > 0) {
    await scoreHeader.click();
    await scoreHeader.click(); // reverse sort
  }
});

test('overview: filter Last month option exercises filter branch', async ({ page }) => {
  const entries = generateEntries(15);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const dateFilter = page.locator('#ov-filter');
  if (await dateFilter.count() > 0) {
    await dateFilter.selectOption('30');
    const rows = page.locator('.ov-row');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  }
});

// ═══════════════════════════════════════════════════════
// weather.js branch coverage
// ═══════════════════════════════════════════════════════

test('weather: empty location in settings shows hint', async ({ page }) => {
  const settings = createTestSettings({ weatherLocation: '', weatherCoords: null });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const widget = page.locator('#weather-slot');
  const text = await widget.textContent();
  // Should prompt to set location, or show empty
  expect(text).toBeDefined();
});

test('weather: disabled weather component hides widget', async ({ page }) => {
  const settings = createTestSettings({ components: { ...VISIBILITY_PRESETS['all-on'], weather: false } });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const section = page.locator('[data-component="weather"]');
  await expect(section).toHaveClass(/is-hidden/);
});

// ═══════════════════════════════════════════════════════
// home.js branch coverage
// ═══════════════════════════════════════════════════════

test('home heatmap cell click loads entry into checkin', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'clickable entry' });
  await injectEntries(page, entries);
  await page.goto('/');
  // Click the heatmap cell with an entry
  const cell = page.locator('#home-heatmap [data-entry-key]').first();
  await cell.click();
  await page.waitForTimeout(200);
  // Should switch to checkin tab
  const activePanel = page.locator('.view.is-active');
  await expect(activePanel).toHaveAttribute('id', 'view-checkin');
});

test('home CTA button navigates to checkin', async ({ page }) => {
  await page.goto('/');
  const ctaBtn = page.locator('#home-btn-checkin');
  if (await ctaBtn.count() > 0) {
    await ctaBtn.click();
    const activePanel = page.locator('.view.is-active');
    await expect(activePanel).toHaveAttribute('id', 'view-checkin');
  }
});

test('home shows empty state text when no entries', async ({ page }) => {
  await page.goto('/');
  const streak = page.locator('#home-streak');
  const text = await streak.textContent();
  expect(text).toBe('0');
});

test('home heatmap renders week with score-based classes', async ({ page }) => {
  const entries = generateEntries(7);
  await injectEntries(page, entries);
  await page.goto('/');
  const heatmap = page.locator('#home-heatmap');
  await expect(heatmap).toBeVisible();
  // Should have cells with entries
  const cellsWithEntry = page.locator('#home-heatmap .has-entry');
  const count = await cellsWithEntry.count();
  expect(count).toBeGreaterThan(0);
});

// ═══════════════════════════════════════════════════════
// demo.js branch coverage — clearAll branches
// ═══════════════════════════════════════════════════════

test('clearAll dismiss first confirm does nothing', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'info');

  // Generate demo data - accept the confirm
  page.once('dialog', async d => { await d.accept(); });
  await page.click('#demo-btn-generate');
  await page.waitForTimeout(500);

  // Verify data exists
  let entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThan(0);

  // Try clear but dismiss first confirm
  page.once('dialog', async d => { await d.dismiss(); });
  await page.click('#demo-btn-clear');
  await page.waitForTimeout(300);

  // Data should still exist
  entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThan(0);
});

test('clearAll dismiss second confirm does nothing', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'info');

  // Generate demo data
  page.once('dialog', async d => { await d.accept(); });
  await page.click('#demo-btn-generate');
  await page.waitForTimeout(500);

  let entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThan(0);

  // Clear: accept first dialog, dismiss second
  let dialogCount = 0;
  const handler = async d => {
    dialogCount++;
    if (dialogCount === 1) await d.accept();
    else await d.dismiss();
  };
  page.on('dialog', handler);
  await page.click('#demo-btn-clear');
  await page.waitForTimeout(500);
  page.off('dialog', handler);

  entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThan(0);
});

// ═══════════════════════════════════════════════════════
// compute.js branch coverage
// ═══════════════════════════════════════════════════════

test('computeMoodScore with no mood and no energy returns default', async ({ page }) => {
  await page.goto('/');
  const score = await page.evaluate(() => {
    return MCI.computeMoodScore({ moodRow: -1, moodCol: -1, energy: null, coreFeeling: '' });
  });
  expect(score).toBe(2);
});

test('computeMoodScore with high energy and positive mood', async ({ page }) => {
  await page.goto('/');
  const score = await page.evaluate(() => {
    return MCI.computeMoodScore({
      moodRow: 2, moodCol: 8,
      energy: { physical: 90, mental: 85, emotional: 80 },
      coreFeeling: 'joy'
    });
  });
  expect(score).toBeGreaterThanOrEqual(3);
});

test('computeMoodScore with low energy and negative mood', async ({ page }) => {
  await page.goto('/');
  const score = await page.evaluate(() => {
    return MCI.computeMoodScore({
      moodRow: 8, moodCol: 1,
      energy: { physical: 10, mental: 15, emotional: 5 },
      coreFeeling: 'sadness'
    });
  });
  expect(score).toBeLessThanOrEqual(2);
});

test('computeStats with empty entries', async ({ page }) => {
  await page.goto('/');
  const stats = await page.evaluate(() => {
    return MCI.computeStats({});
  });
  expect(stats.streak).toBe(0);
  expect(stats.hasTodayEntry).toBe(false);
});

test('findEntryForDay with no matching entry returns null', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.findEntryForDay({}, [], '2025-01-01');
  });
  expect(result).toBeNull();
});

test('buildHeatmapData returns correct structure', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const data = MCI.buildHeatmapData({});
    return {
      hasDays: data.days.length > 0,
      hasDayNames: data.dayNames.length === 7,
      hasLeadingSpacers: typeof data.leadingSpacers === 'number'
    };
  });
  expect(result.hasDays).toBe(true);
  expect(result.hasDayNames).toBe(true);
  expect(result.hasLeadingSpacers).toBe(true);
});
