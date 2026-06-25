// @ts-check
const { test, expect } = require('./fixtures/base');
const { injectEntries, createTestEntry, getDateKey } = require('./fixtures/helpers');

// The home "Mood swings" cards replace the old "Top Feeling" card and show a
// spread score (0-100) plus a sparkline for the wheel and the matrix.

test('home shows wheel and matrix swing cards, not the old Top Feeling card', async ({ page }) => {
  const entries = {};
  const ids = ['joy', 'sadness', 'anger', 'serenity', 'fear', 'love'];
  for (let i = 0; i < 6; i++) {
    entries[getDateKey(i)] = createTestEntry({
      coreFeeling: ids[i % ids.length],
      moodRow: 5,
      moodCol: i % 2 === 0 ? 1 : 8,
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await expect(page.locator('#view-home')).toHaveClass(/is-active/);

  // Both swing cards show a numeric score and a rendered sparkline
  await expect(page.locator('#home-swing-wheel-score')).not.toHaveText('—');
  await expect(page.locator('#home-swing-matrix-score')).not.toHaveText('—');
  await expect(page.locator('#home-swing-wheel-spark svg')).toBeVisible();
  await expect(page.locator('#home-swing-matrix-spark svg')).toBeVisible();

  // The removed Top Feeling card is gone
  await expect(page.locator('#home-mood')).toHaveCount(0);
});

test('swing cards show the empty state with too little data', async ({ page }) => {
  await injectEntries(page, { [getDateKey(0)]: createTestEntry({ coreFeeling: 'joy', moodRow: 5, moodCol: 5 }) });
  await page.goto('/');

  await expect(page.locator('#home-swing-wheel-score')).toHaveText('—');
  await expect(page.locator('#home-swing-wheel-sub')).not.toHaveText('');
  await expect(page.locator('#home-swing-wheel-spark svg')).toHaveCount(0);
});

test('changing the period re-computes the swing score', async ({ page }) => {
  const entries = {};
  // Recent 5 days: a perfectly stable matrix valence → spread 0 in the 28-day window
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ moodRow: 5, moodCol: 5 });
  }
  // ~100 days back: wide valence swings → spread > 0 once the year window includes them
  entries[getDateKey(100)] = createTestEntry({ moodRow: 5, moodCol: 0 });
  entries[getDateKey(101)] = createTestEntry({ moodRow: 5, moodCol: 9 });
  entries[getDateKey(102)] = createTestEntry({ moodRow: 5, moodCol: 0 });

  await injectEntries(page, entries);
  await page.goto('/');

  const matrixScore = page.locator('#home-swing-matrix-score');
  await expect(matrixScore).toHaveText('0'); // default 28-day window: stable

  await page.locator('#home-swing-period').selectOption('365');
  await expect(matrixScore).not.toHaveText('0'); // year window picks up the old swings
});
