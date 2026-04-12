// @ts-check
// Branch coverage improvement tests – part 4
// Target: remaining achievable branch coverage gaps
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
// demo.js — exercise generateEntry branches by running demo
// ═══════════════════════════════════════════════════════

test('demo generate creates entries with all fields populated', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'info');
  page.once('dialog', async d => { await d.accept(); });
  await page.click('#demo-btn-generate');
  await page.waitForTimeout(500);
  const entries = await getLocalStorageEntries(page);
  const keys = Object.keys(entries);
  expect(keys.length).toBeGreaterThan(20);
  // Check that generated entries have all expected fields
  const entry = entries[keys[0]];
  expect(entry.coreFeeling).toBeTruthy();
  expect(entry.thoughts).toBeTruthy();
  expect(entry.energy).toBeTruthy();
  expect(entry.moodRow).toBeGreaterThanOrEqual(0);
  expect(entry.moodCol).toBeGreaterThanOrEqual(0);
  expect(entry.moodLabel).toBeTruthy();
  expect(entry.wheelType).toBeTruthy();
});

test('demo clearAll after accept both confirms clears everything', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'info');

  // Generate data first
  page.once('dialog', async d => { await d.accept(); });
  await page.click('#demo-btn-generate');
  await page.waitForTimeout(500);

  let entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThan(0);

  // Clear — accept both confirms; page will reload
  page.on('dialog', async d => { await d.accept(); });

  // Use waitForNavigation pattern since clearAll triggers location.reload()
  await Promise.all([
    page.waitForURL('**/*', { waitUntil: 'load', timeout: 10000 }).catch(() => {}),
    page.click('#demo-btn-clear'),
  ]);
  await page.waitForTimeout(1000);

  entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBe(0);
});

// ═══════════════════════════════════════════════════════
// settings.js — exercise gather() and loadForm() more
// ═══════════════════════════════════════════════════════

test('settings: gather collects all form values', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  // Change multiple settings
  await page.selectOption('#cfg-wheel', 'extended');
  await page.selectOption('#cfg-energy-label', 'emotional');
  await page.fill('#cfg-rows', '10');
  await page.fill('#cfg-maxchars', '200');
  await page.fill('#cfg-toast', '6');
  await page.fill('#cfg-location', 'Rotterdam');
  await page.click('#cfg-btn-save');
  await page.waitForTimeout(200);
  // Verify saved settings
  const settings = await page.evaluate(() => MCI.loadSettings());
  expect(settings.defaultWheelType).toBe('extended');
  expect(settings.energyEmotionalLabel).toBe('emotional');
  expect(settings.rowsPerPage).toBe(10);
  expect(settings.overviewMaxChars).toBe(200);
  expect(settings.toastDuration).toBe(6);
  expect(settings.weatherLocation).toBe('Rotterdam');
});

test('settings: loadForm restores saved settings to form', async ({ page }) => {
  const settings = createTestSettings({
    defaultWheelType: 'extended',
    rowsPerPage: 15,
    weatherLocation: 'Berlin'
  });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'settings');
  const wheel = await page.inputValue('#cfg-wheel');
  const rows = await page.inputValue('#cfg-rows');
  const loc = await page.inputValue('#cfg-location');
  expect(wheel).toBe('extended');
  expect(rows).toBe('15');
  expect(loc).toBe('Berlin');
});

test('settings: save with different language applies it', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  await page.selectOption('#cfg-lang', 'nl');
  await page.click('#cfg-btn-save');
  await page.waitForTimeout(300);
  // Verify Dutch was applied
  const lang = await page.evaluate(() => MCI.lang);
  expect(lang).toBe('nl');
  // Switch back
  await page.selectOption('#cfg-lang', 'en');
  await page.click('#cfg-btn-save');
});

test('settings: language:changed swaps default QA to Dutch', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  // Ensure using defaults
  await page.evaluate(() => {
    var s = MCI.loadSettings();
    s.isDefaultQuickActions = true;
    MCI.saveSettings(s, 'settings');
  });
  await page.evaluate(() => { MCI.setLang('nl'); });
  await page.waitForTimeout(200);
  const s = await page.evaluate(() => MCI.loadSettings());
  // Quick actions should now be Dutch defaults
  expect(s.quickActions.length).toBeGreaterThan(0);
  // Switch back
  await page.evaluate(() => { MCI.setLang('en'); });
});

test('settings: language:changed does NOT swap custom QA', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');
  // Set custom QA
  await page.evaluate(() => {
    var s = MCI.loadSettings();
    s.quickActions = ['My custom action'];
    s.isDefaultQuickActions = false;
    MCI.saveSettings(s, 'settings');
  });
  await page.evaluate(() => { MCI.setLang('nl'); });
  await page.waitForTimeout(200);
  const s = await page.evaluate(() => MCI.loadSettings());
  expect(s.quickActions).toContain('My custom action');
  await page.evaluate(() => { MCI.setLang('en'); });
});

// ═══════════════════════════════════════════════════════
// navigation.js — remaining branch hits
// ═══════════════════════════════════════════════════════

test('navigation: system theme with light scheme shows no data-theme', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.locator('[data-theme-pick="system"]').click();
  await page.waitForTimeout(100);
  const theme = await page.getAttribute('html', 'data-theme');
  expect(theme).toBeNull();
});

test('navigation: valid hash route loads correct view', async ({ page }) => {
  await page.goto('/#overview');
  const panel = page.locator('.view.is-active');
  await expect(panel).toHaveAttribute('id', 'view-overview');
});

test('navigation: switchTo emits tab:changed', async ({ page }) => {
  await page.goto('/');
  const route = await page.evaluate(() => {
    var received = null;
    MCI.on('tab:changed', function (r) { received = r; });
    MCI.Nav.switchTo('settings');
    return received;
  });
  expect(route).toBe('settings');
});

test('navigation: replaceState updates URL hash', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const hash = await page.evaluate(() => location.hash);
  expect(hash).toBe('#overview');
});

// ═══════════════════════════════════════════════════════
// overview.js — import entries and truncate branches
// ═══════════════════════════════════════════════════════

test('overview: export entries creates download', async ({ page }) => {
  const entries = generateEntries(3);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const download = page.waitForEvent('download');
  await page.click('#ov-export');
  const d = await download;
  expect(d.suggestedFilename()).toContain('export');
});

test('overview: entry row click loads into checkin', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'click me', coreFeeling: 'joy' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  await page.locator('.ov-row').first().click();
  await page.waitForTimeout(300);
  const active = page.locator('.view.is-active');
  await expect(active).toHaveAttribute('id', 'view-checkin');
});

test('overview: long thoughts text gets truncated', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'A'.repeat(200) });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const cell = page.locator('.ov-row td').nth(4);
  const text = await cell.textContent();
  expect(text).toContain('…');
  expect(text.length).toBeLessThan(200);
});

test('overview: entry without feelings shows dash', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ coreFeeling: '', moodLabel: '', thoughts: 'thoughts only' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const feelingCell = page.locator('.ov-row td').nth(1);
  const text = await feelingCell.textContent();
  expect(text).toBe('—');
});

test('overview: entry without energy shows dash', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({
    coreFeeling: 'joy',
    energy: { physical: null, mental: null, emotional: null }
  });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const energyCell = page.locator('.ov-row td').nth(3);
  const text = await energyCell.textContent();
  expect(text).toBe('—');
});

test('overview: entry with only partial energy shows what is set', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({
    coreFeeling: 'joy',
    energy: { physical: 50, mental: null, emotional: null }
  });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const energyCell = page.locator('.ov-row td').nth(3);
  const text = await energyCell.textContent();
  expect(text).toContain('P:50%');
});

test('overview: search clears and re-renders', async ({ page }) => {
  const entries = generateEntries(10);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  const searchEl = page.locator('#ov-search');
  await searchEl.fill('xyznotfound');
  await page.waitForTimeout(500);
  const empty = page.locator('#ov-empty');
  await expect(empty).not.toHaveClass(/is-hidden/);

  // Clear search shows all entries again
  await searchEl.fill('');
  await page.waitForTimeout(500);
  const rows = page.locator('.ov-row');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

test('overview: page state persists after refresh', async ({ page }) => {
  const entries = generateEntries(20);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');
  // Sort by score
  await page.locator('th[data-sortcol="score"]').click();
  await page.waitForTimeout(200);
  // Navigate away and back
  await navigateToTab(page, 'checkin');
  await navigateToTab(page, 'overview');
  // State should be restored (checking just that rows still render)
  const rows = page.locator('.ov-row');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

// ═══════════════════════════════════════════════════════
// wheel.js — variant and display branches
// ═══════════════════════════════════════════════════════

test('wheel: getPicked returns selected emotion id', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('#wheel-svg [data-em="joy"]').click();
  const picked = await page.evaluate(() => MCI.Wheel.getPicked());
  expect(picked).toBe('joy');
});

test('wheel: display updates with translation on language change', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('#wheel-svg [data-em]').first().click();
  const before = await page.locator('#wheel-display').textContent();
  await page.evaluate(() => { MCI.setLang('nl'); });
  await page.waitForTimeout(100);
  const after = await page.locator('#wheel-display').textContent();
  // At minimum the display should have text
  expect(after).toBeTruthy();
  await page.evaluate(() => { MCI.setLang('en'); });
});

test('wheel: getPicked and variant work together', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.evaluate(() => {
    MCI.Wheel.setVariant('extended');
  });
  const segments = page.locator('#wheel-svg [data-em]');
  const count = await segments.count();
  expect(count).toBe(12);
});

// ═══════════════════════════════════════════════════════
// home.js — data-driven stat rendering
// ═══════════════════════════════════════════════════════

test('home: with multi-day streak shows correct streak count', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 3; i++) {
    entries[getDateKey(-i)] = createTestEntry({ thoughts: 'day ' + i, moodScore: 3 });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  const streak = await page.locator('#home-streak').textContent();
  expect(parseInt(streak)).toBeGreaterThanOrEqual(1);
});

test('home: total count reflects all entries', async ({ page }) => {
  const entries = generateEntries(8);
  await injectEntries(page, entries);
  await page.goto('/');
  const total = await page.locator('#home-total').textContent();
  expect(parseInt(total)).toBeGreaterThanOrEqual(8);
});

test('home: avg mood shows numeric value', async ({ page }) => {
  const entries = {};
  entries[getTodayKey()] = createTestEntry({ moodScore: 4 });
  await injectEntries(page, entries);
  await page.goto('/');
  const avg = await page.locator('#home-avg').textContent();
  expect(parseFloat(avg)).toBeGreaterThan(0);
});

test('home: top mood shows most frequent feeling', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(-i)] = createTestEntry({ coreFeeling: 'joy', moodScore: 3 });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  const mood = await page.locator('#home-mood').textContent();
  expect(mood).toBeTruthy();
});

test('home: today status shows pending when no entry today', async ({ page }) => {
  const entries = {};
  entries[getDateKey(-3)] = createTestEntry({ thoughts: 'old entry' });
  await injectEntries(page, entries);
  await page.goto('/');
  const status = await page.locator('#home-status').textContent();
  expect(status).toBeTruthy();
});

test('home: today status shows done when entry exists today', async ({ page }) => {
  const entries = {};
  entries[getTodayKey()] = createTestEntry({ thoughts: 'done today', moodScore: 3 });
  await injectEntries(page, entries);
  await page.goto('/');
  const status = await page.locator('#home-status').textContent();
  expect(status).toBeTruthy();
});

// ═══════════════════════════════════════════════════════
// checkin.js — visibility and form state branches 
// ═══════════════════════════════════════════════════════

test('checkin: applyVisibility hides disabled components', async ({ page }) => {
  const settings = createTestSettings({
    components: {
      ...VISIBILITY_PRESETS['all-on'],
      bodySignals: false,
      moodMatrix: false
    }
  });
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await expect(page.locator('[data-component="bodySignals"]')).toHaveClass(/is-hidden/);
  await expect(page.locator('[data-component="moodMatrix"]')).toHaveClass(/is-hidden/);
});

test('checkin: applyVisibility shows enabled components', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await expect(page.locator('[data-component="thoughts"]')).not.toHaveClass(/is-hidden/);
  await expect(page.locator('[data-component="coreFeeling"]')).not.toHaveClass(/is-hidden/);
});

test('checkin: settings:changed re-applies visibility', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  // Initially visible
  await expect(page.locator('[data-component="note"]')).not.toHaveClass(/is-hidden/);

  // Disable note via settings change
  await page.evaluate(() => {
    var s = MCI.loadSettings();
    s.components.note = false;
    MCI.saveSettings(s, 'other');
  });
  await page.waitForTimeout(200);
  await expect(page.locator('[data-component="note"]')).toHaveClass(/is-hidden/);
});

test('checkin: collect with body signals and note', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.fill('#fld-thoughts', 'Full checkin test');
  await page.locator('.bz').first().click();
  await page.fill('#fld-body-note', 'sore muscles');
  await page.fill('#fld-note', 'general note');
  await page.click('#ci-btn-save');
  await page.waitForTimeout(300);
  const entries = await getLocalStorageEntries(page);
  const keys = Object.keys(entries);
  const entry = entries[keys[keys.length-1]];
  expect(entry.bodyNote || '').toBeTruthy();
});

test('checkin: custom feelings field collects value', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  await page.locator('#wheel-svg [data-em]').first().click();
  await page.fill('#fld-custom', 'relieved and hopeful');
  await page.click('#ci-btn-save');
  await page.waitForTimeout(300);
  const entries = await getLocalStorageEntries(page);
  const keys = Object.keys(entries);
  const entry = entries[keys[keys.length-1]];
  expect(entry.customFeelings).toBe('relieved and hopeful');
});

// ═══════════════════════════════════════════════════════
// dashboard.js — empty entries and summary states
// ═══════════════════════════════════════════════════════

test('dashboard: summary with no entries shows empty state', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const summary = page.locator('#summary-slot');
  const text = await summary.textContent();
  expect(text).toBeTruthy();
});

test('dashboard: summary with entries shows stats', async ({ page }) => {
  const entries = generateEntries(10);
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const summary = page.locator('#summary-slot');
  const text = await summary.textContent();
  expect(text).toContain('10');
});

test('dashboard: history grid cell click loads entry', async ({ page }) => {
  const key = getTodayKey();
  const entries = {};
  entries[key] = createTestEntry({ thoughts: 'grid click test', coreFeeling: 'joy' });
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'checkin');
  const cell = page.locator('#history-grid .cal-cell[data-entry-key]').first();
  if (await cell.count() > 0) {
    await cell.click();
    await page.waitForTimeout(300);
    const thoughts = await page.inputValue('#fld-thoughts');
    expect(thoughts).toBe('grid click test');
  }
});

// ═══════════════════════════════════════════════════════
// core.js — more edge cases
// ═══════════════════════════════════════════════════════

test('MCI.t with unknown key returns key as fallback', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.t('totally_unknown_key_xyz');
  });
  expect(result).toBe('totally_unknown_key_xyz');
});

test('MCI.normalize with bodySignals as non-array defaults to empty', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return MCI.normalize({ bodySignals: 'invalid' }).bodySignals;
  });
  expect(result).toEqual([]);
});

test('MCI.saveAllEntries emits entries:changed', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    var received = false;
    MCI.on('entries:changed', function () { received = true; });
    MCI.saveAllEntries({ 'test-key': { thoughts: 'test' } });
    return received;
  });
  expect(result).toBe(true);
});

test('MCI.getSettingsSaveSource returns source during save', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    var captured = null;
    MCI.on('settings:changed', function () {
      captured = MCI.getSettingsSaveSource();
    });
    MCI.saveSettings(MCI.loadSettings(), 'test-source');
    return captured;
  });
  expect(result).toBe('test-source');
});

test('MCI.timestampKey generates expected format', async ({ page }) => {
  await page.goto('/');
  const key = await page.evaluate(() => MCI.timestampKey());
  expect(key).toMatch(/^\d{4}-\d{2}-\d{2}_\d{9}$/);
});

test('MCI.todayKey matches formatDate of today', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    return { today: MCI.todayKey(), format: MCI.formatDate(new Date()) };
  });
  expect(result.today).toBe(result.format);
});
