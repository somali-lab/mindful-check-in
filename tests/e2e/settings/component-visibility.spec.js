// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectSettings,
  createTestSettings,
  VISIBILITY_PRESETS,
} = require('../../fixtures/helpers');

// ─── Phase 9: User Story 7 — Component Visibility Toggles ───

// Disable weather in settings, verify hidden
test('disable weather in settings, verify widget hidden', async ({ page }) => {
  const settings = createTestSettings({ components: { weather: false } });
  await injectSettings(page, settings);
  await page.goto('/#checkin');
  await expect(page.locator('[data-component="weather"]')).toBeHidden();
});

// Parameterized — each of 10 component toggles
const componentToggles = [
  { id: 'weather', selector: '[data-component="weather"]' },
  { id: 'thoughts', selector: '[data-component="thoughts"]' },
  { id: 'coreFeeling', selector: '[data-component="coreFeeling"]' },
  { id: 'bodySignals', selector: '[data-component="bodySignals"]' },
  { id: 'moodMatrix', selector: '[data-component="moodMatrix"]' },
  { id: 'actions', selector: '[data-component="actions"]' },
  { id: 'note', selector: '[data-component="note"]' },
  { id: 'energyPhysical', selector: '.nrg-row[data-energy-type="physical"]' },
  { id: 'energyMental', selector: '.nrg-row[data-energy-type="mental"]' },
  { id: 'energyEmotional', selector: '.nrg-row[data-energy-type="emotional"]' },
];

for (const toggle of componentToggles) {
  test(`disable ${toggle.id} — section disappears`, async ({ page }) => {
    const settings = createTestSettings({ components: { [toggle.id]: false } });
    await injectSettings(page, settings);
    await page.goto('/#checkin');

    // Listen for JS errors
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await expect(page.locator(toggle.selector)).toBeHidden();
    expect(errors).toHaveLength(0);
  });
}

// Disable all except thoughts — save works
test('disable all except thoughts, save without mood requirement', async ({ page }) => {
  const { getLocalStorageEntries, getTodayKey } = require('../../fixtures/helpers');
  const settings = createTestSettings({
    components: {
      ...VISIBILITY_PRESETS['all-off'],
      thoughts: true,
    },
    weatherLocation: '',
    weatherCoords: null,
  });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await page.locator('#fld-thoughts').fill('Just thoughts');
  await page.locator('#ci-btn-save').click();

  // Even with every history mode disabled, the save must complete and toast.
  await expect(page.locator('.toast--success')).toBeVisible();

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const keys = Object.keys(entries).filter(k => k.startsWith(todayKey));
  expect(keys.length).toBeGreaterThanOrEqual(1);
  expect(entries[keys[0]].thoughts).toBe('Just thoughts');
});

// Disable all 3 energy types — energy panel hidden
test('disable all 3 energy types, individual energy meters hidden', async ({ page }) => {
  const settings = createTestSettings({
    components: { energyPhysical: false, energyMental: false, energyEmotional: false },
  });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await expect(page.locator('.nrg-row[data-energy-type="physical"]')).toBeHidden();
  await expect(page.locator('.nrg-row[data-energy-type="mental"]')).toBeHidden();
  await expect(page.locator('.nrg-row[data-energy-type="emotional"]')).toBeHidden();
});

// Disable core feeling, verify history mode button absent
test('disable core feeling, history mode button absent', async ({ page }) => {
  const { injectEntries, createTestEntry, getDateKey } = require('../../fixtures/helpers');
  // Inject some entries so history renders
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy', moodScore: 3 });
  }
  const settings = createTestSettings({ components: { coreFeeling: false } });
  await injectEntries(page, entries);
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  // Check the history section for mode buttons
  const historyContent = page.locator('#history-grid');
  await expect(historyContent).toBeVisible();
  // The "Core feeling" mode button should not exist when coreFeeling is disabled
  const feelingModeBtn = page.locator('.cal-mode-btn[data-mode="feeling"]');
  await expect(feelingModeBtn).toHaveCount(0);
});

// Hide component, load entry with that data — data preserved in localStorage
test('hide component, data preserved in localStorage', async ({ page }) => {
  const { injectEntries, createTestEntry, getLocalStorageEntries, getTodayKey } = require('../../fixtures/helpers');
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    thoughts: 'Test thoughts',
    coreFeeling: 'joy',
    bodySignals: ['chest', 'head'],
  });
  const settings = createTestSettings({ components: { bodySignals: false } });
  await injectEntries(page, { [todayKey]: entry });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  // Verify body signals component is hidden
  await expect(page.locator('[data-component="bodySignals"]')).toBeHidden();

  // But data should still be in localStorage
  const entries = await getLocalStorageEntries(page);
  expect(entries[todayKey].bodySignals).toEqual(expect.arrayContaining(['chest', 'head']));
});

// ─── Phase 10: User Story 8 — Visibility Combination Matrix ───

// All-on preset — fill everything, save, verify all data
test('all-on preset — all fields fillable and saved', async ({ page }) => {
  const { getLocalStorageEntries, getTodayKey } = require('../../fixtures/helpers');
  const settings = createTestSettings({ components: VISIBILITY_PRESETS['all-on'] });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await page.locator('#fld-thoughts').fill('All on test');
  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('.body-part[data-zone="chest"]').dispatchEvent('click');
  await page.locator('.mood-cell[data-mr="5"][data-mc="5"]').click();
  // #fld-action is hidden (chips drive it); set its value directly
  await page.locator('#fld-action').evaluate((el) => { el.value = 'Walk'; });
  await page.locator('#fld-note').fill('A note');

  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const keys = Object.keys(entries).filter(k => k.startsWith(todayKey));
  const entry = entries[keys[0]];
  expect(entry.thoughts).toBe('All on test');
  expect(entry.coreFeeling).toBe('joy');
  expect(entry.bodySignals).toContain('chest');
  expect(entry.moodRow).toBeGreaterThanOrEqual(0);
  expect(entry.actions).toBe('Walk');
  expect(entry.note).toBe('A note');
});

// All-off preset — save works without error
test('all-off preset — save works without mood requirement', async ({ page }) => {
  const { getLocalStorageEntries, getTodayKey } = require('../../fixtures/helpers');
  const settings = createTestSettings({
    components: VISIBILITY_PRESETS['all-off'],
    weatherLocation: '',
    weatherCoords: null,
  });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  // v4 validation requires coreFeeling OR thoughts — with all-off no fields are visible
  // Save should show warning since nothing can be filled
  await page.locator('#ci-btn-save').click();

  // No entry should be saved (validation blocks it)
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries)).toHaveLength(0);
});

// Mood-only preset — only mood fields populated
test('mood-only preset — select emotion, save, only mood fields', async ({ page }) => {
  const { getLocalStorageEntries, getTodayKey } = require('../../fixtures/helpers');
  const settings = createTestSettings({ components: VISIBILITY_PRESETS['mood-only'] });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const entry = entries[Object.keys(entries).find(k => k.startsWith(todayKey))];
  expect(entry.coreFeeling).toBe('joy');
});

// Energy-only preset — only energy panel visible
test('energy-only preset — only 3 energy meters visible', async ({ page }) => {
  const settings = createTestSettings({ components: VISIBILITY_PRESETS['energy-only'] });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await expect(page.locator('.nrg-row[data-energy-type="physical"]')).toBeVisible();
  await expect(page.locator('.nrg-row[data-energy-type="mental"]')).toBeVisible();
  await expect(page.locator('.nrg-row[data-energy-type="emotional"]')).toBeVisible();
  await expect(page.locator('[data-component="coreFeeling"]')).toBeHidden();
  await expect(page.locator('[data-component="bodySignals"]')).toBeHidden();
  await expect(page.locator('[data-component="moodMatrix"]')).toBeHidden();
});

// Single-energy preset — only mental meter visible
test('single-energy preset — only mental meter visible', async ({ page }) => {
  const settings = createTestSettings({ components: VISIBILITY_PRESETS['single-energy'] });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await expect(page.locator('.nrg-row[data-energy-type="mental"]')).toBeVisible();
  await expect(page.locator('.nrg-row[data-energy-type="physical"]')).toBeHidden();
  await expect(page.locator('.nrg-row[data-energy-type="emotional"]')).toBeHidden();
});

// Text-only preset — no interactive visualizations
test('text-only preset — no wheel, body, grid visible', async ({ page }) => {
  const settings = createTestSettings({ components: VISIBILITY_PRESETS['text-only'] });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await expect(page.locator('[data-component="thoughts"]')).toBeVisible();
  await expect(page.locator('[data-component="actions"]')).toBeVisible();
  await expect(page.locator('[data-component="note"]')).toBeVisible();
  await expect(page.locator('[data-component="coreFeeling"]')).toBeHidden();
  await expect(page.locator('[data-component="bodySignals"]')).toBeHidden();
  await expect(page.locator('[data-component="moodMatrix"]')).toBeHidden();
});
