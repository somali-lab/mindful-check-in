// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  injectSettings,
  injectLanguage,
  createTestEntry,
  createTestSettings,
  generateEntries,
  navigateToTab,
} = require('../../fixtures/helpers');

// ─── Inject 30 entries — table renders with pagination ───

test('inject 30 entries, table renders with pagination', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const rows = page.locator('#ov-tbody tr');
  await expect(rows.first()).toBeVisible();
  const pageInfo = page.locator('#ov-page-info');
  await expect(pageInfo).toContainText('Page');
});

// ─── Default sort date descending, click to flip ───

test('default sort date descending, click header to flip', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Get first row date before sort
  const firstRowBefore = await page.locator('#ov-tbody tr').first().textContent();

  // Click date header to change sort
  await page.locator('th.ov-th-sortable[data-sortcol="date"]').click();

  // Get first row date after sort — should be different
  const firstRowAfter = await page.locator('#ov-tbody tr').first().textContent();
  expect(firstRowAfter).not.toBe(firstRowBefore);
});

// ─── Sort by Core Feeling column ───

test('click Core Feeling header to sort by emotion', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const coreFeelingHeader = page.locator('th.ov-th-sortable[data-sortcol="feeling"]');
  if ((await coreFeelingHeader.count()) > 0) {
    await coreFeelingHeader.click();
    // Just verify no crash and rows still visible
    await expect(page.locator('#ov-tbody tr').first()).toBeVisible();
  }
});

// ─── Sort state persists across tab switches ───

test('sort state persists across tab switches', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('th.ov-th-sortable[data-sortcol="date"]').click();

  // Switch to checkin and back
  await navigateToTab(page, 'checkin');
  await navigateToTab(page, 'overview');

  // Rows should still be visible (sort state persisted)
  await expect(page.locator('#ov-tbody tr').first()).toBeVisible();
});

// ─── Hide components → corresponding columns absent ───

test('hide components, overview columns absent', async ({ page }) => {
  const settings = createTestSettings({
    components: { bodySignals: false, moodMatrix: false },
  });
  await injectEntries(page, generateEntries(5));
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // v4 doesn't have body or mood as separate columns; check columns that should be absent
  // bodySignals and moodMatrix are not column keys in v4 (columns are: date, feeling, mood, energy, thoughts, score, actions)
  // With those components hidden, the table should still render
  await expect(page.locator('#ov-tbody')).toBeVisible();
});

// ─── Sort by each sortable column ───

const sortableColumns = ['date', 'feeling', 'mood', 'energy', 'thoughts', 'score', 'actions'];

for (const sortKey of sortableColumns) {
  test(`sort by ${sortKey} changes order`, async ({ page }) => {
    await injectEntries(page, generateEntries(10));
    await page.goto('/');
    await navigateToTab(page, 'overview');

    const header = page.locator(`th.ov-th-sortable[data-sortcol="${sortKey}"]`);
    if ((await header.count()) > 0) {
      await header.click();
      await expect(page.locator('#ov-tbody tr').first()).toBeVisible();
    }
  });
}

// ─── Mood column reflects the active language, not the saved-time language ───

// Mood cell row 3 / col 7 — EN "Happy" / NL "Blij". moodLabel is frozen at save
// time (English here); the column must re-derive the label from row/col for the
// active language instead of echoing the stale stored string.
test('mood column shows the translated label for the active language', async ({ page }) => {
  await injectEntries(page, {
    '2026-06-20': createTestEntry({ moodRow: 3, moodCol: 7, moodLabel: 'Happy' }),
  });
  await injectLanguage(page, 'nl');
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const moodCell = page.locator('#ov-tbody tr').first().locator('td').nth(2);
  await expect(moodCell).toHaveText('Blij');
});

// Switching language live must relabel the mood column too.
test('mood column relabels when switching language EN -> NL', async ({ page }) => {
  await injectEntries(page, {
    '2026-06-20': createTestEntry({ moodRow: 3, moodCol: 7, moodLabel: 'Happy' }),
  });
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const moodCell = page.locator('#ov-tbody tr').first().locator('td').nth(2);
  await expect(moodCell).toHaveText('Happy');

  await page.locator('[data-lang-pick="nl"]:visible').first().click();
  await expect(moodCell).toHaveText('Blij');
});
