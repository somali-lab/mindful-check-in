// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const { navigateToTab } = require('./fixtures/helpers');

// ── Wheel → allowed emotions lookup (mirrors MCI.Data.wheels in static.js) ──
const WHEEL_EMOTIONS = {
  act:      ['joy', 'serenity', 'love', 'acceptance', 'sadness', 'melancholy', 'anger', 'aggression'],
  plutchik: ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation'],
  ekman:    ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'],
  junto:    ['love', 'joy', 'surprise', 'anger', 'sadness', 'fear'],
  extended: ['joy', 'love', 'trust', 'surprise', 'curiosity', 'anticipation', 'anxiety', 'fear', 'sadness', 'disgust', 'anger', 'shame'],
};
const VALID_WHEEL_TYPES = Object.keys(WHEEL_EMOTIONS);

// ─── Helper: generate demo data and return all entries ───

async function generateDemoAndGetEntries(page) {
  await page.goto('/frontend-v4/');
  // Auto-accept the confirm() dialog that generateDemo() fires
  page.on('dialog', async (dialog) => await dialog.accept());

  await navigateToTab(page, 'info');
  await page.locator('#demo-btn-generate').click();

  // Wait for the success banner to appear (signals demo generation is done)
  await page.locator('.toast--success').waitFor({ state: 'visible', timeout: 5000 });

  return page.evaluate(() => {
    const raw = localStorage.getItem('local-mood-tracker-entries');
    return raw ? JSON.parse(raw) : {};
  });
}

// ─── T-DW01: Every demo entry has a valid wheelType ───

test('T-DW01 every demo entry has a valid wheelType', async ({ page }) => {
  const entries = await generateDemoAndGetEntries(page);
  const keys = Object.keys(entries);
  expect(keys.length).toBeGreaterThanOrEqual(20);

  for (const key of keys) {
    const entry = entries[key];
    expect(VALID_WHEEL_TYPES, `entry ${key}: wheelType "${entry.wheelType}" is not a known wheel`).toContain(entry.wheelType);
  }
});

// ─── T-DW02: Every demo entry's coreFeeling belongs to its wheelType ───

test('T-DW02 every demo entry coreFeeling matches its wheelType emotions', async ({ page }) => {
  const entries = await generateDemoAndGetEntries(page);
  const keys = Object.keys(entries);
  expect(keys.length).toBeGreaterThanOrEqual(20);

  for (const key of keys) {
    const entry = entries[key];
    const allowed = WHEEL_EMOTIONS[entry.wheelType];
    expect(allowed,
      `entry ${key}: wheelType "${entry.wheelType}" not in lookup`).toBeDefined();
    expect(allowed,
      `entry ${key}: coreFeeling "${entry.coreFeeling}" not in ${entry.wheelType} emotions [${allowed}]`).toContain(entry.coreFeeling);
  }
});

// ─── T-DW03: Demo data uses more than one wheel type (randomness) ───

test('T-DW03 demo data contains multiple different wheel types', async ({ page }) => {
  const entries = await generateDemoAndGetEntries(page);
  const types = new Set(Object.values(entries).map((e) => e.wheelType));
  // With 30+ entries and 5 wheel types, expect at least 2 different types
  expect(types.size, `only found wheel types: ${[...types].join(', ')}`).toBeGreaterThanOrEqual(2);
});

// ─── T-DW04: Demo data has variety in emotions within a wheel type ───

test('T-DW04 demo data shows emotion variety within a wheel type', async ({ page }) => {
  const entries = await generateDemoAndGetEntries(page);

  // Group emotions by wheel type
  const emotionsByWheel = {};
  for (const entry of Object.values(entries)) {
    if (!emotionsByWheel[entry.wheelType]) emotionsByWheel[entry.wheelType] = new Set();
    emotionsByWheel[entry.wheelType].add(entry.coreFeeling);
  }

  // At least one wheel type should have multiple different emotions
  const maxVariety = Math.max(...Object.values(emotionsByWheel).map((s) => s.size));
  expect(maxVariety, 'expected at least some variety in emotions').toBeGreaterThanOrEqual(2);
});
