// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestEntry,
  createTestSettings,
  getLocalStorageEntries,
  navigateToTab,
  clearAppState,
  getTodayKey,
  VISIBILITY_PRESETS,
} = require('../../fixtures/helpers');

// ─── Smoke Test ───

test('smoke: page loads with correct title and check-in tab visible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Mindful Check-in');
  await expect(page.locator('[data-route="checkin"]:visible').first()).toBeVisible();
  await navigateToTab(page, 'checkin');
  await expect(page.locator('#view-checkin')).toBeVisible();
});

// ─── Fresh app — fill all fields, save, verify entry in localStorage ───

test('fill all fields and save creates entry in localStorage', async ({ page }) => {
  await page.goto('/#checkin');

  // Fill thoughts
  await page.locator('#fld-thoughts').fill('Feeling good today');

  // Select emotion on wheel
  await page.locator('.emotion-segment[data-em="joy"]').click();

  // Click body parts (dispatchEvent bypasses SVG overlap)
  await page.locator('.body-part[data-zone="chest"]').dispatchEvent('click');
  await page.locator('.body-part[data-zone="head"]').dispatchEvent('click');

  // Set energy meters by tapping segments (horizontal 20-segment bar)
  await page.locator('.nrg-seg[data-meter="physical"][data-seg="14"]').dispatchEvent('click');
  await page.locator('.nrg-seg[data-meter="mental"][data-seg="8"]').dispatchEvent('click');
  await page.locator('.nrg-seg[data-meter="emotional"][data-seg="12"]').dispatchEvent('click');

  // Select mood cell
  await page.locator('.mood-cell[data-mr="2"][data-mc="8"]').click();

  // Actions: the raw textarea is hidden (chips drive it); set its value directly
  await page.locator('#fld-action').evaluate((el) => { el.value = 'Take a walk'; });
  await page.locator('#fld-note').fill('Good day overall');

  // Click save
  await page.locator('#ci-btn-save').click();

  // Verify success toast
  await expect(page.locator('.toast--success')).toBeVisible();

  // Verify entry in localStorage
  const entries = await getLocalStorageEntries(page);
  const keys = Object.keys(entries);
  expect(keys.length).toBeGreaterThanOrEqual(1);

  const todayKey = getTodayKey();
  const todayEntry = entries[todayKey] || entries[keys.find(k => k.startsWith(todayKey))];
  expect(todayEntry).toBeTruthy();
  expect(todayEntry.thoughts).toBe('Feeling good today');
  expect(todayEntry.coreFeeling).toBe('joy');
  expect(todayEntry.bodySignals).toEqual(expect.arrayContaining(['chest', 'head']));
  expect(todayEntry.actions).toBe('Take a walk');
  expect(todayEntry.note).toBe('Good day overall');
  expect(todayEntry.moodRow).toBeGreaterThanOrEqual(0);
});

// ─── Existing entry for today — modify and save updates (no duplicate) ───

test('modifying existing today entry updates without duplicating', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    thoughts: 'Original thought',
    coreFeeling: 'joy',
    actions: 'Original action',
  });

  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/#checkin');

  // Verify form is hydrated
  await expect(page.locator('#fld-thoughts')).toHaveValue('Original thought');

  // Modify thoughts
  await page.locator('#fld-thoughts').fill('Modified thought');

  // Save
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  // Verify only one entry for today — updated, not duplicated
  const entries = await getLocalStorageEntries(page);
  const todayKeys = Object.keys(entries).filter(k => k.startsWith(todayKey));
  expect(todayKeys).toHaveLength(1);
  expect(entries[todayKeys[0]].thoughts).toBe('Modified thought');
});

// ─── New check-in creates timestamped entry ───

test('New check-in creates second timestamped entry for today', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    thoughts: 'First entry',
    coreFeeling: 'joy',
  });

  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/#checkin');

  // Click "New check-in"
  await page.locator('#ci-btn-new').click();

  // Fill minimal fields (select emotion to pass validation)
  await page.locator('.emotion-segment[data-em="sadness"]').click();
  await page.locator('#fld-thoughts').fill('Second entry');

  // Save
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  // Verify two entries exist
  const entries = await getLocalStorageEntries(page);
  const todayKeys = Object.keys(entries).filter(k => k.startsWith(todayKey));
  expect(todayKeys.length).toBe(2);

  // The new entry should have a timestamped key
  const timestampedKey = todayKeys.find(k => k.includes('_'));
  expect(timestampedKey).toBeTruthy();
  expect(entries[timestampedKey].thoughts).toBe('Second entry');
  expect(entries[timestampedKey].coreFeeling).toBe('sadness');
});

// ─── After save — summary card updates ───

test('summary card updates after save with streak and count', async ({ page }) => {
  await page.goto('/#checkin');

  // Select emotion to pass validation
  await page.locator('.emotion-segment[data-em="joy"]').click();
  await page.locator('#ci-btn-save').click();

  // Verify summary shows content in summary slot
  const summaryContent = page.locator('#summary-slot');
  await expect(summaryContent).not.toContainText(/no entries/i);
});

// ─── Context pill shows correct state ───

test('context pill shows new state before save and entry date after save', async ({ page }) => {
  await page.goto('/#checkin');

  // Before save: pill should show new state text
  const pill = page.locator('#ci-pill');
  await expect(pill).toContainText(/not saved/i);

  // Select emotion to pass validation
  await page.locator('.emotion-segment[data-em="joy"]').click();

  // Save
  await page.locator('#ci-btn-save').click();

  // After save: pill should show saved state
  await expect(pill).toHaveClass(/is-saved/);
});
