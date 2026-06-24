// @ts-check
const { test, expect } = require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getDateKey,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── No entries — summary shows "not checked in" ───

test('no entries, summary shows empty/not checked in state', async ({ page }) => {
  await page.goto('/#checkin');
  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText(/no entries|save|check/i);
});

// ─── Save check-in today — summary updates ───

test('save check-in, summary shows checked in with streak 1', async ({ page }) => {
  await page.goto('/#checkin');

  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText(/check/i);
  await expect(summary).toContainText('1');
});

// ─── 5 consecutive days → streak shows 5 ───

test('5 consecutive days entries, streak shows 5', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy', moodScore: 3 });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText('5');
});

// ─── Heatmap cells colored by mood ───

test('scattered entries show 7-day heatmap cells', async ({ page }) => {
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

// ─── Total count shows correct number ───

test('10 entries shows total count 10', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 10; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy', moodScore: 3 });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  const summary = page.locator('#summary-slot');
  await expect(summary).toContainText('10');
});
