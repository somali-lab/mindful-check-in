// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  navigateToTab,
  getDateKey,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── T071: Delete entry — accept confirm — removed from table & localStorage ───

test('T071 [US13] delete entry, accept confirm, removed from table and localStorage', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ thoughts: `Entry ${i}`, coreFeeling: 'joy' });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Accept the confirm dialog
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  const deleteBtn = page.locator('.overview-delete-button').first();
  await deleteBtn.click();
  await page.waitForTimeout(300);

  // One fewer entry
  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(4);
});

// ─── T072: Delete entry — dismiss confirm — nothing changes ───

test('T072 [US13] delete entry, dismiss confirm, nothing changes', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ thoughts: `Entry ${i}`, coreFeeling: 'joy' });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Dismiss the confirm dialog
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });

  const deleteBtn = page.locator('.overview-delete-button').first();
  await deleteBtn.click();
  await page.waitForTimeout(300);

  // Same number of entries
  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(5);
});

// ─── T073: Delete today's loaded entry — form resets ───

test('T073 [US13] delete today entry from overview, form resets', async ({ page }) => {
  const todayKey = getTodayKey();
  const entries = {
    [todayKey]: createTestEntry({ thoughts: 'Today thoughts', coreFeeling: 'joy' }),
    [getDateKey(1)]: createTestEntry({ thoughts: 'Yesterday', coreFeeling: 'sadness' }),
  };
  await injectEntries(page, entries);
  await page.goto('/');

  // Verify thoughts shows today's entry
  await expect(page.locator('#thoughts')).toHaveValue('Today thoughts');

  // Navigate to overview and delete today's entry
  await navigateToTab(page, 'overview');

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  // Find the row for today and delete it
  const deleteBtn = page.locator('.overview-delete-button').first();
  await deleteBtn.click();
  await page.waitForTimeout(300);

  // Navigate back to checkin
  await navigateToTab(page, 'checkin');

  // Form should be hydrated with the next available entry or be empty
  const thoughtsValue = await page.locator('#thoughts').inputValue();
  expect(thoughtsValue).not.toBe('Today thoughts');
});
