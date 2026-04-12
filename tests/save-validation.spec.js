// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectSettings,
  createTestSettings,
  getLocalStorageEntries,
  VISIBILITY_PRESETS,
} = require('./fixtures/helpers');

// ─── T031: Both mood inputs enabled, neither selected — warning ───

test('T031 [US6] both feeling and mood matrix enabled, nothing selected, Save shows warning', async ({ page }) => {
  await page.goto('/#checkin');

  // Both coreFeeling and moodMatrix are enabled by default
  // Don't select any feeling or mood cell, don't fill thoughts
  // v4 validation: requires coreFeeling OR thoughts

  await page.locator('#ci-btn-save').click();

  // Should show warning
  await expect(page.locator('.toast--warning')).toBeVisible();

  // No entry should be saved
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries)).toHaveLength(0);
});

// ─── T032: Only core feeling enabled, select feeling → success ───

test('T032 [US6] only core feeling enabled, select feeling, Save succeeds', async ({ page }) => {
  const settings = createTestSettings({
    components: { moodMatrix: false, coreFeeling: true },
  });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#ci-btn-save').click();

  await expect(page.locator('.toast--success')).toBeVisible();
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThanOrEqual(1);
});

// ─── T033: Only mood matrix enabled, select cell → success ───

test('T033 [US6] only mood matrix enabled, select cell + thoughts, Save succeeds', async ({ page }) => {
  const settings = createTestSettings({
    components: { moodMatrix: true, coreFeeling: false },
  });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await page.locator('.mood-cell[data-mr="5"][data-mc="5"]').click();
  // v4 validation: requires coreFeeling OR thoughts — add thoughts since coreFeeling is disabled
  await page.locator('#fld-thoughts').fill('Mood-only check-in');
  await page.locator('#ci-btn-save').click();

  await expect(page.locator('.toast--success')).toBeVisible();
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThanOrEqual(1);
});

// ─── T034: Both mood inputs disabled — Save succeeds without mood ───

test('T034 [US6] both mood inputs disabled, Save succeeds without mood requirement', async ({ page }) => {
  const settings = createTestSettings({
    components: { moodMatrix: false, coreFeeling: false },
  });
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  await page.locator('#fld-thoughts').fill('Just some thoughts');
  await page.locator('#ci-btn-save').click();

  await expect(page.locator('.toast--success')).toBeVisible();
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThanOrEqual(1);
});

// ─── T035: Core feeling selected + mood matrix NOT selected → success ───

test('T035 [US6] core feeling selected, mood matrix not selected, Save succeeds', async ({ page }) => {
  await page.goto('/#checkin');

  // Both enabled by default — select only core feeling
  await page.locator('.emotion-segment[data-em="joy"]').click();
  // Don't select any mood cell

  await page.locator('#ci-btn-save').click();

  await expect(page.locator('.toast--success')).toBeVisible();
  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThanOrEqual(1);
});
