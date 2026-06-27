// @ts-check
const { test, expect } = require('../../fixtures/base');
const { navigateToTab, openSettingsTab } = require('../../fixtures/helpers');

// ─── Default quick actions render as chips ───

test('default quick actions render chips on check-in', async ({ page }) => {
  await page.goto('/#checkin');
  const chips = page.locator('#ci-chips .ci-act-pill');
  await expect(chips.first()).toBeVisible();
});

// ─── Click chip appends to action textarea ───

test('click chip appends text to action textarea', async ({ page }) => {
  await page.goto('/#checkin');
  const firstChip = page.locator('#ci-chips .ci-act-pill').first();
  const chipText = await firstChip.textContent();
  await firstChip.click();

  const action = await page.locator('#fld-action').inputValue();
  expect(action).toContain(chipText.trim());
});

// ─── Add new quick action in settings editor ───

test('type new action in settings and add', async ({ page }) => {
  await page.goto('/');
  await openSettingsTab(page, 'actions');

  await page.locator('#qa-input').fill('Meditate');
  await page.locator('#cfg-btn-add-qa').click();

  const list = page.locator('#qa-list');
  await expect(list).toContainText('Meditate');
});

// ─── Remove quick action from list ───

test('remove quick action from list', async ({ page }) => {
  await page.goto('/');
  await openSettingsTab(page, 'actions');

  // Count items before
  const itemsBefore = await page.locator('#qa-list .quick-action-tag').count();

  // Click remove on first item
  const removeBtn = page.locator('#qa-list .qa-del').first();
  if ((await removeBtn.count()) > 0) {
    await removeBtn.click();
    const itemsAfter = await page.locator('#qa-list .quick-action-tag').count();
    expect(itemsAfter).toBe(itemsBefore - 1);
  }
});

// ─── Custom actions persist to check-in chips ───

test('save custom actions, verify chips on check-in', async ({ page }) => {
  await page.goto('/');
  await openSettingsTab(page, 'actions');

  // Add a custom action
  await page.locator('#qa-input').fill('Yoga session');
  await page.locator('#cfg-btn-add-qa').click();

  // Save settings
  await page.locator('#cfg-btn-save').click();

  // Go to check-in
  await navigateToTab(page, 'checkin');

  const chips = page.locator('#ci-chips');
  await expect(chips).toContainText('Yoga session');
});
