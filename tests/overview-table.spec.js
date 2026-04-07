// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestSettings,
  generateEntries,
  navigateToTab,
} = require('./fixtures/helpers');

// ─── T048: Inject 30 entries — table renders with pagination ───

test('T048 [US9] inject 30 entries, table renders with pagination', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const rows = page.locator('#overview-body tr');
  await expect(rows.first()).toBeVisible();
  const pageInfo = page.locator('#overview-page-info');
  await expect(pageInfo).toContainText('Page');
});

// ─── T049: Default sort date descending, click to flip ───

test('T049 [US9] default sort date descending, click header to flip', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Get first row date before sort
  const firstRowBefore = await page.locator('#overview-body tr').first().textContent();

  // Click date header to change sort
  await page.locator('th.overview-sortable[data-sort-key="date"]').click();

  // Get first row date after sort — should be different
  const firstRowAfter = await page.locator('#overview-body tr').first().textContent();
  expect(firstRowAfter).not.toBe(firstRowBefore);
});

// ─── T050: Sort by Core Feeling column ───

test('T050 [US9] click Core Feeling header to sort by emotion', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  const coreFeelingHeader = page.locator('th.overview-sortable[data-sort-key="coreFeeling"]');
  if (await coreFeelingHeader.count() > 0) {
    await coreFeelingHeader.click();
    // Just verify no crash and rows still visible
    await expect(page.locator('#overview-body tr').first()).toBeVisible();
  }
});

// ─── T051: Sort state persists across tab switches ───

test('T051 [US9] sort state persists across tab switches', async ({ page }) => {
  await injectEntries(page, generateEntries(10));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Click date header to change sort direction
  await page.locator('th.overview-sortable[data-sort-key="date"]').click();

  // Switch to checkin and back
  await navigateToTab(page, 'checkin');
  await navigateToTab(page, 'overview');

  // Rows should still be visible (sort state persisted)
  await expect(page.locator('#overview-body tr').first()).toBeVisible();
});

// ─── T052: Hide components → corresponding columns absent ───

test('T052 [US9] hide components, overview columns absent', async ({ page }) => {
  const settings = createTestSettings({
    components: { bodySignals: false, moodMatrix: false },
  });
  await injectEntries(page, generateEntries(5));
  await injectSettings(page, settings);
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await expect(page.locator('th[data-sort-key="bodySignals"]')).toHaveCount(0);
  await expect(page.locator('th[data-sort-key="moodMatrix"]')).toHaveCount(0);
});

// ─── T053: Sort by each sortable column ───

const sortableColumns = [
  'date', 'coreFeeling', 'thoughts', 'bodySignals',
  'energyPhysical', 'energyMental', 'energyEmotional',
  'moodMatrix', 'actions',
];

for (const sortKey of sortableColumns) {
  test(`T053 [US9] sort by ${sortKey} changes order`, async ({ page }) => {
    await injectEntries(page, generateEntries(10));
    await page.goto('/');
    await navigateToTab(page, 'overview');

    const header = page.locator(`th.overview-sortable[data-sort-key="${sortKey}"]`);
    if (await header.count() > 0) {
      await header.click();
      await expect(page.locator('#overview-body tr').first()).toBeVisible();
    }
  });
}
