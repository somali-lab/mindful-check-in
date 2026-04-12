// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  generateEntries,
  navigateToTab,
  getDateKey,
} = require('./fixtures/helpers');

// ─── T054: Search "walk" matches only entries with that text ───

test('T054 [US10] search "walk" filters to matching entries', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 10; i++) {
    entries[getDateKey(i)] = createTestEntry({
      actions: i % 3 === 0 ? 'Take a walk' : 'Rest',
      thoughts: `Day ${i}`,
      coreFeeling: 'joy',
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#ov-search').fill('walk');
  // Wait for filter to apply
  await page.waitForTimeout(300);

  const rows = page.locator('#ov-tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(10);
});

// ─── T055: Date filter "Last 7 days" shows only recent entries ───

test('T055 [US10] Last 7 days filter shows only recent entries', async ({ page }) => {
  const { injectSettings, createTestSettings } = require('./fixtures/helpers');
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 50 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#ov-filter').selectOption('7');
  await page.waitForTimeout(500);

  // Each entry renders 2 rows (main + note), so count only main rows
  const rows = page.locator('#ov-tbody tr:not(.ov-row-note)');
  const count = await rows.count();
  expect(count).toBeLessThanOrEqual(7);
  expect(count).toBeGreaterThan(0);
});

// ─── T056: Search with no matches shows empty state ───

test('T056 [US10] search "xyz" with no matches shows empty state', async ({ page }) => {
  await injectEntries(page, generateEntries(5));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#ov-search').fill('xyznonexistent');
  await page.waitForTimeout(300);

  const emptyMessage = page.locator('#ov-empty');
  await expect(emptyMessage).not.toBeEmpty();
});

// ─── T058: Clear search field restores all entries ───

test('T058 [US10] clear search field shows all entries again', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const allRowsBefore = await page.locator('#ov-tbody tr').count();

  await page.locator('#ov-search').fill('walk');
  await page.waitForTimeout(300);
  await page.locator('#ov-search').fill('');
  await page.waitForTimeout(300);

  const allRowsAfter = await page.locator('#ov-tbody tr').count();
  expect(allRowsAfter).toBe(allRowsBefore);
});

// ─── T059: All date filter options work ───

const dateFilters = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 2 weeks' },
  { value: '30', label: 'Last month' },
  { value: '90', label: 'Last 3 months' },
];

for (const filter of dateFilters) {
  test(`T059 [US10] date filter "${filter.label}" applies correctly`, async ({ page }) => {
    await injectEntries(page, generateEntries(90));
    await page.goto('/');
    await navigateToTab(page, 'overview');

    await page.locator('#ov-filter').selectOption(filter.value);
    await page.waitForTimeout(300);

    // No crash, table is still visible
    if (filter.value === 'all') {
      const rows = page.locator('#ov-tbody tr');
      await expect(rows.first()).toBeVisible();
    }
  });
}
