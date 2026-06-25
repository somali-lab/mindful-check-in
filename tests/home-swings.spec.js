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
      moodRow: i % 3,
      moodCol: i % 2 === 0 ? 1 : 8,
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await expect(page.locator('#view-home')).toHaveClass(/is-active/);

  // Wheel card plus both matrix axes (valence + energy) show a score and sparkline
  await expect(page.locator('#home-swing-wheel-score')).not.toHaveText('—');
  await expect(page.locator('#home-swing-valence-score')).not.toHaveText('—');
  await expect(page.locator('#home-swing-arousal-score')).not.toHaveText('—');
  await expect(page.locator('#home-swing-wheel-spark svg')).toBeVisible();
  await expect(page.locator('#home-swing-valence-spark svg')).toBeVisible();
  await expect(page.locator('#home-swing-arousal-spark svg')).toBeVisible();

  // Each score carries a plain-word tier label
  await expect(page.locator('#home-swing-wheel-tier')).not.toHaveText('');
  await expect(page.locator('#home-swing-valence-tier')).not.toHaveText('');

  // The "Mood swings" header has an explanatory tooltip
  await expect(page.locator('.swing-info')).toHaveAttribute('title', /0 =/);

  // The removed Top Feeling card is gone
  await expect(page.locator('#home-mood')).toHaveCount(0);
});

test('Total card shows the day span between first and last check-in', async ({ page }) => {
  await injectEntries(page, {
    [getDateKey(0)]: createTestEntry({ coreFeeling: 'joy' }),
    [getDateKey(9)]: createTestEntry({ coreFeeling: 'joy' }),
  });
  await page.goto('/');
  await expect(page.locator('#home-span')).toHaveText('across 9 days');
});

test('Total card hides the span with a single entry', async ({ page }) => {
  await injectEntries(page, { [getDateKey(0)]: createTestEntry({ coreFeeling: 'joy' }) });
  await page.goto('/');
  await expect(page.locator('#home-span')).toHaveText('');
});

test('the About guide explains the mood-swing score', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-route="info"]:visible').first().click();
  await page.locator('#view-info [data-settings-tab="guide"]').click();

  const desc = page.locator('[data-t="infoSwingsDesc"]');
  await expect(desc).toBeVisible();
  await expect(desc).toContainText('standard deviation');
});

test('the Mood swings info button toggles an inline explanation', async ({ page }) => {
  await page.goto('/');
  const help = page.locator('#home-swing-help');
  const btn = page.locator('#home-swing-info');

  await expect(help).toBeHidden();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');

  await btn.click();
  await expect(help).toBeVisible();
  await expect(help).toContainText('0 =');
  await expect(btn).toHaveAttribute('aria-expanded', 'true');

  await btn.click();
  await expect(help).toBeHidden();
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

  const valenceScore = page.locator('#home-swing-valence-score');
  await expect(valenceScore).toHaveText('0'); // default 28-day window: stable

  await page.locator('#home-swing-period').selectOption('365');
  await expect(valenceScore).not.toHaveText('0'); // year window picks up the old swings
});
