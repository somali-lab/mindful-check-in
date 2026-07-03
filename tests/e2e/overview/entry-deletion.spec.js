// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  navigateToTab,
  acceptConfirm,
  dismissConfirm,
  getDateKey,
  getTodayKey,
} = require('../../fixtures/helpers');

// ─── Delete entry — accept confirm — removed from table & localStorage ───

test('delete entry, accept confirm, removed from table and localStorage', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ thoughts: `Entry ${i}`, coreFeeling: 'joy' });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const deleteBtn = page.locator('.ov-del').first();
  await deleteBtn.click();
  await acceptConfirm(page); // accept the in-app confirm modal
  await page.waitForTimeout(300);

  // One fewer entry
  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(4);
});

// ─── Delete entry — dismiss confirm — nothing changes ───

test('delete entry, dismiss confirm, nothing changes', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ thoughts: `Entry ${i}`, coreFeeling: 'joy' });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const deleteBtn = page.locator('.ov-del').first();
  await deleteBtn.click();
  await dismissConfirm(page); // cancel the in-app confirm modal
  await page.waitForTimeout(300);

  // Same number of entries
  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(5);
});

// ─── Delete today's loaded entry — form resets ───

test('delete today entry from overview, form resets', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = {
    [todayKey]: createTestEntry({ thoughts: 'Today thoughts', coreFeeling: 'joy' }),
    [getDateKey(1)]: createTestEntry({ thoughts: 'Yesterday', coreFeeling: 'sadness' }),
  };
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  // Verify thoughts shows today's entry
  await expect(page.locator('#fld-thoughts')).toHaveValue('Today thoughts');

  // Navigate to overview and delete today's entry
  await navigateToTab(page, 'overview');

  // Find the row for today and delete it
  const deleteBtn = page.locator('.ov-del').first();
  await deleteBtn.click();
  await acceptConfirm(page);
  await page.waitForTimeout(300);

  // Verify entry was removed from storage
  const remaining = await page.evaluate(() => {
    var raw = localStorage.getItem('local-mood-tracker-entries');
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    var data = parsed && typeof parsed.v === 'number' && 'data' in parsed ? parsed.data : parsed;
    return Object.keys(data);
  });
  expect(remaining).not.toContain(todayKey);
});
