// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
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
} = require('./fixtures/helpers');

// ─── Smoke Test ───

test('smoke: page loads with correct title and check-in tab visible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Mindful Check-in');
  await expect(page.locator('[data-tab-target="checkin"]')).toBeVisible();
  await expect(page.locator('[data-tab-panel="checkin"]')).toBeVisible();
});

// ─── T006: Fresh app — fill all fields, save, verify entry in localStorage ───

test('T006 [US1] fill all fields and save creates entry in localStorage', async ({ page }) => {
  await page.goto('/');

  // Fill thoughts
  await page.locator('#thoughts').fill('Feeling good today');

  // Select emotion on wheel
  await page.locator('.emotion-segment[data-emotion="joy"]').click();

  // Click body parts (dispatchEvent bypasses SVG overlap)
  await page.locator('.body-part[data-part="chest"]').dispatchEvent('click');
  await page.locator('.body-part[data-part="head"]').dispatchEvent('click');

  // Set energy meters by clicking scale labels
  const physicalMeter = page.locator('.energy-meter[data-energy-type="physical"]');
  await physicalMeter.click({ position: { x: 15, y: 10 } });

  const mentalMeter = page.locator('.energy-meter[data-energy-type="mental"]');
  await mentalMeter.click({ position: { x: 15, y: 40 } });

  const emotionalMeter = page.locator('.energy-meter[data-energy-type="emotional"]');
  await emotionalMeter.click({ position: { x: 15, y: 60 } });

  // Select mood cell
  await page.locator('.mood-cell[data-row="2"][data-col="8"]').click();

  // Fill action and note
  await page.locator('#action').fill('Take a walk');
  await page.locator('#note').fill('Good day overall');

  // Click save
  await page.locator('#save-checkin').click();

  // Verify success banner
  await expect(page.locator('#history-banner')).not.toHaveClass(/is-hidden/);
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

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

// ─── T007: Existing entry for today — modify and save updates (no duplicate) ───

test('T007 [US1] modifying existing today entry updates without duplicating', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    thoughts: 'Original thought',
    coreFeeling: 'joy',
    actions: 'Original action',
  });

  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/');

  // Verify form is hydrated
  await expect(page.locator('#thoughts')).toHaveValue('Original thought');

  // Modify thoughts
  await page.locator('#thoughts').fill('Modified thought');

  // Save
  await page.locator('#save-checkin').click();
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

  // Verify only one entry for today — updated, not duplicated
  const entries = await getLocalStorageEntries(page);
  const todayKeys = Object.keys(entries).filter(k => k.startsWith(todayKey));
  expect(todayKeys).toHaveLength(1);
  expect(entries[todayKeys[0]].thoughts).toBe('Modified thought');
});

// ─── T008: New check-in creates timestamped entry ───

test('T008 [US1] New check-in creates second timestamped entry for today', async ({ page }) => {
  const todayKey = getTodayKey();
  const entry = createTestEntry({
    thoughts: 'First entry',
    coreFeeling: 'joy',
  });

  await injectEntries(page, { [todayKey]: entry });
  await page.goto('/');

  // Click "New check-in"
  await page.locator('#new-checkin').click();

  // Fill minimal fields (select emotion to pass validation)
  await page.locator('.emotion-segment[data-emotion="sadness"]').click();
  await page.locator('#thoughts').fill('Second entry');

  // Save
  await page.locator('#save-checkin').click();
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

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

// ─── T009: After save — summary card updates ───

test('T009 [US1] summary card updates after save with streak and count', async ({ page }) => {
  await page.goto('/');

  // Select emotion to pass validation
  await page.locator('.emotion-segment[data-emotion="joy"]').click();
  await page.locator('#save-checkin').click();

  // Verify summary shows "Checked in at" text
  const summaryContent = page.locator('#summary-content');
  await expect(summaryContent).toContainText(/check/i);

  // Verify streak and total count info is present
  await expect(summaryContent).toContainText('1');
});

// ─── T010: Context pill shows correct state ───

test('T010 [US1] context pill shows new state before save and entry date after save', async ({ page }) => {
  await page.goto('/');

  // Before save: pill should be empty or show new state
  const pill = page.locator('#checkin-context-pill');

  // Select emotion to pass validation
  await page.locator('.emotion-segment[data-emotion="joy"]').click();

  // Save
  await page.locator('#save-checkin').click();

  // After save: pill should show today's date
  await expect(pill).not.toBeEmpty();
});
