// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestSettings,
  generateEntries,
  navigateToTab,
} = require('../../fixtures/helpers');

// ─── 30 entries with 7 rows/page, verify pagination state ───

test('30 entries with 7 rows/page shows correct pagination', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Verify page info
  await expect(page.locator('#ov-page-info')).toContainText('Page 1');

  // First and Previous should be disabled on page 1
  await expect(page.locator('#ov-first')).toBeDisabled();
  await expect(page.locator('#ov-prev')).toBeDisabled();
});

// ─── Click Next from page 1 → page 2 ───

test('click Next goes to page 2 with all nav enabled', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#ov-next').click();
  await expect(page.locator('#ov-page-info')).toContainText('Page 2');

  // All buttons should be enabled on page 2 (middle page)
  await expect(page.locator('#ov-first')).toBeEnabled();
  await expect(page.locator('#ov-prev')).toBeEnabled();
  await expect(page.locator('#ov-next')).toBeEnabled();
  await expect(page.locator('#ov-last')).toBeEnabled();
});

// ─── Navigate to last page → Next/Last disabled ───

test('last page has Next and Last disabled', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#ov-last').click();

  await expect(page.locator('#ov-next')).toBeDisabled();
  await expect(page.locator('#ov-last')).toBeDisabled();
  await expect(page.locator('#ov-first')).toBeEnabled();
  await expect(page.locator('#ov-prev')).toBeEnabled();
});

// ─── From page 3, click First → page 1 ───

test('from page 3, click First goes to page 1', async ({ page }) => {
  await injectEntries(page, generateEntries(30));
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  // Go to page 3
  await page.locator('#ov-next').click();
  await page.locator('#ov-next').click();
  await expect(page.locator('#ov-page-info')).toContainText('Page 3');

  // Click First
  await page.locator('#ov-first').click();
  await expect(page.locator('#ov-page-info')).toContainText('Page 1');
});

// ─── Search reduces to 1 page → all pagination disabled ───

test('search reducing to 1 page disables all pagination', async ({ page }) => {
  const { createTestEntry, getDateKey } = require('../../fixtures/helpers');
  const entries = {};
  for (let i = 0; i < 20; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts: i === 0 ? 'unique-search-term' : 'Regular thought',
      coreFeeling: 'joy',
    });
  }
  await injectEntries(page, entries);
  await injectSettings(page, createTestSettings({ rowsPerPage: 7 }));
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('#ov-search').fill('unique-search-term');
  await page.waitForTimeout(300);

  // Only 1 result — all pagination should be disabled
  await expect(page.locator('#ov-first')).toBeDisabled();
  await expect(page.locator('#ov-prev')).toBeDisabled();
  await expect(page.locator('#ov-next')).toBeDisabled();
  await expect(page.locator('#ov-last')).toBeDisabled();
});
