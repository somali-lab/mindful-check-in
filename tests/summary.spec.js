// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getDateKey,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── T089: No entries — summary shows "not checked in" ───

test('T089 [US21] no entries, summary shows empty/not checked in state', async ({ page }) => {
  await page.goto('/#checkin');
  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText(/no entries|save|check/i);
});

// ─── T090: Save check-in today — summary updates ───

test('T090 [US21] save check-in, summary shows checked in with streak 1', async ({ page }) => {
  await page.goto('/#checkin');

  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText(/check/i);
  await expect(summary).toContainText('1');
});

// ─── T091: 5 consecutive days → streak shows 5 ───

test('T091 [US21] 5 consecutive days entries, streak shows 5', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy', moodScore: 3 });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText('5');
});

// ─── T092: Heatmap cells colored by mood ───

test('T092 [US21] scattered entries show 7-day heatmap cells', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({
      coreFeeling: i % 2 === 0 ? 'joy' : 'sadness',
      moodScore: i % 2 === 0 ? 3 : 1,
    });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  // Verify heatmap cells exist in summary
  const heatmapCells = page.locator('#summary-slot .heat-day');
  await expect(heatmapCells).toHaveCount(7);
});

// ─── T093: Total count shows correct number ───

test('T093 [US21] 10 entries shows total count 10', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 10; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy', moodScore: 3 });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText('10');
});
