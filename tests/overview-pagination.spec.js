// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestSettings,
  generateEntries,
  navigateToTab,
} = require('./fixtures/helpers');

// ─── T060: 30 entries with 7 rows/page, verify pagination state ───

test('T060 [US11] 30 entries with 7 rows/page shows correct pagination', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Verify page info
  await expect(page.locator('#overview-page-info')).toContainText('Page 1');

  // First and Previous should be disabled on page 1
  await expect(page.locator('#overview-first')).toBeDisabled();
  await expect(page.locator('#overview-prev')).toBeDisabled();
});

// ─── T061: Click Next from page 1 → page 2 ───

test('T061 [US11] click Next goes to page 2 with all nav enabled', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#overview-next').click();
  await expect(page.locator('#overview-page-info')).toContainText('Page 2');

  // All buttons should be enabled on page 2 (middle page)
  await expect(page.locator('#overview-first')).toBeEnabled();
  await expect(page.locator('#overview-prev')).toBeEnabled();
  await expect(page.locator('#overview-next')).toBeEnabled();
  await expect(page.locator('#overview-last')).toBeEnabled();
});

// ─── T062: Navigate to last page → Next/Last disabled ───

test('T062 [US11] last page has Next and Last disabled', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#overview-last').click();

  await expect(page.locator('#overview-next')).toBeDisabled();
  await expect(page.locator('#overview-last')).toBeDisabled();
  await expect(page.locator('#overview-first')).toBeEnabled();
  await expect(page.locator('#overview-prev')).toBeEnabled();
});

// ─── T063: From page 3, click First → page 1 ───

test('T063 [US11] from page 3, click First goes to page 1', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Go to page 3
  await page.locator('#overview-next').click();
  await page.locator('#overview-next').click();
  await expect(page.locator('#overview-page-info')).toContainText('Page 3');

  // Click First
  await page.locator('#overview-first').click();
  await expect(page.locator('#overview-page-info')).toContainText('Page 1');
});

// ─── T064: Search reduces to 1 page → all pagination disabled ───

test('T064 [US11] search reducing to 1 page disables all pagination', async ({ page }) => {
  const { createTestEntry, getDateKey } = require('./fixtures/helpers');
  const entries = {};
  for (let i = 0; i < 20; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts: i === 0 ? 'unique-search-term' : 'Regular thought',
      selectedEmotion: 'joy',
    });
  }
  await injectEntries(page, entries);
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#overview-search').fill('unique-search-term');
  await page.waitForTimeout(300);

  // Only 1 result — all pagination should be disabled
  await expect(page.locator('#overview-first')).toBeDisabled();
  await expect(page.locator('#overview-prev')).toBeDisabled();
  await expect(page.locator('#overview-next')).toBeDisabled();
  await expect(page.locator('#overview-last')).toBeDisabled();
});
