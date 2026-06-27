// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getTodayKey,
  getDateKey,
} = require('../../fixtures/helpers');

// The streak / average / status come from computeStats (unit-tested); this
// confirms those numbers actually reach the home DOM.

test('home shows streak, average mood and today status from the entries', async ({ page }) => {
  // Three consecutive days ending today → streak 3; scores 3,1,2 → avg 2.0.
  await injectEntries(page, {
    [getTodayKey()]: createTestEntry({ coreFeeling: 'joy', moodScore: 3 }),
    [getDateKey(1)]: createTestEntry({ coreFeeling: 'sadness', moodScore: 1 }),
    [getDateKey(2)]: createTestEntry({ coreFeeling: 'joy', moodScore: 2 }),
  });
  await page.goto('/');

  // The streak number is rendered inside the ring SVG.
  await expect(page.locator('#home-streak-ring .home-ring-num')).toHaveText('3');
  await expect(page.locator('#home-total')).toHaveText('3');
  await expect(page.locator('#home-avg')).toHaveText('2.0');
  // A today entry exists, so the status is the "checked in" state, not empty.
  await expect(page.locator('#home-status')).not.toBeEmpty();
});

test('home streak is 0 and average is a dash with no entries', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#home-streak-ring .home-ring-num')).toHaveText('0');
  await expect(page.locator('#home-avg')).toHaveText('—');
});
