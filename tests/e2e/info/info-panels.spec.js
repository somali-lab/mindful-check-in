// @ts-check
const { test, expect } = require('../../fixtures/base');
const { openInfoTab } = require('../../fixtures/helpers');

// The remaining About sub-tabs (about/guide/data are covered elsewhere).

test('privacy sub-tab shows the privacy panel', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'privacy');

  const panel = page.locator('#view-info [data-settings-panel="privacy"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(/privacy|server|tracking/i);
});

test('heatmap sub-tab shows the score explanation panel', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'heatmap');

  await expect(page.locator('#view-info [data-settings-panel="heatmap"]')).toBeVisible();
});
