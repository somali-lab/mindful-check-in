// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectSettings,
  createTestSettings,
  navigateToTab,
} = require('./fixtures/helpers');

// ─── T107: Default quick actions render as chips ───

test('T107 [US16] default quick actions render chips on check-in', async ({ page }) => {
  await page.goto('/');
  const chips = page.locator('#quick-actions-chips .qa-chip');
  await expect(chips.first()).toBeVisible();
});

// ─── T108: Click chip appends to action textarea ───

test('T108 [US16] click chip appends text to action textarea', async ({ page }) => {
  await page.goto('/');
  const firstChip = page.locator('#quick-actions-chips .qa-chip').first();
  const chipText = await firstChip.textContent();
  await firstChip.click();

  const action = await page.locator('#action').inputValue();
  expect(action).toContain(chipText.trim());
});

// ─── T109: Add new quick action in settings editor ───

test('T109 [US16] type new action in settings and add', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  await page.locator('#quick-action-input').fill('Meditate');
  await page.locator('#quick-action-add').click();

  const list = page.locator('#quick-actions-list');
  await expect(list).toContainText('Meditate');
});

// ─── T110: Remove quick action from list ───

test('T110 [US16] remove quick action from list', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  // Count items before
  const itemsBefore = await page.locator('#quick-actions-list .quick-action-tag').count();

  // Click remove on first item
  const removeBtn = page.locator('#quick-actions-list .qa-remove').first();
  if (await removeBtn.count() > 0) {
    await removeBtn.click();
    const itemsAfter = await page.locator('#quick-actions-list .quick-action-tag').count();
    expect(itemsAfter).toBe(itemsBefore - 1);
  }
});

// ─── T111: Custom actions persist to check-in chips ───

test('T111 [US16] save custom actions, verify chips on check-in', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'settings');

  // Add a custom action
  await page.locator('#quick-action-input').fill('Yoga session');
  await page.locator('#quick-action-add').click();

  // Save settings
  await page.locator('#settings-save').click();

  // Go to check-in
  await navigateToTab(page, 'checkin');

  const chips = page.locator('#quick-actions-chips');
  await expect(chips).toContainText('Yoga session');
});
