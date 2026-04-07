// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── T021: Click near top of physical energy meter — high value ───

test('T021 [US4] click near top of physical energy meter shows ~90-100%', async ({ page }) => {
  await page.goto('/');
  const meter = page.locator('.energy-meter[data-energy-type="physical"]');
  const box = await meter.boundingBox();
  // Click near the very top of the meter
  await meter.click({ position: { x: box.width / 2, y: 5 } });

  // Verify fill height is high
  const fillHeight = await page.locator('#energy-fill-physical').evaluate(el => el.style.height);
  const value = parseInt(fillHeight);
  expect(value).toBeGreaterThanOrEqual(85);

  // Verify display updates
  const display = page.locator('#energy-display');
  await expect(display).not.toHaveClass(/is-empty/);
});

// ─── T022: Click scale label 75 on mental meter ───

test('T022 [US4] click on mental energy meter at 75% position', async ({ page }) => {
  await page.goto('/');
  const meter = page.locator('.energy-meter[data-energy-type="mental"]');
  const box = await meter.boundingBox();
  // 75% from bottom = 25% from top
  await meter.click({ position: { x: box.width / 2, y: Math.round(box.height * 0.25) } });

  const fillHeight = await page.locator('#energy-fill-mental').evaluate(el => el.style.height);
  const value = parseInt(fillHeight);
  expect(value).toBeGreaterThanOrEqual(65);
  expect(value).toBeLessThanOrEqual(85);
});

// ─── T023: Set all three meters, reset, verify all clear ───

test('T023 [US4] set all three meters then reset clears all', async ({ page }) => {
  await page.goto('/');

  // Click each meter
  for (const type of ['physical', 'mental', 'emotional']) {
    const meter = page.locator(`.energy-meter[data-energy-type="${type}"]`);
    await meter.click({ position: { x: 15, y: 50 } });
  }

  // Verify display is not empty
  await expect(page.locator('#energy-display')).not.toHaveClass(/is-empty/);

  // Reset
  await page.locator('#reset-energy').click();

  // Verify all cleared
  await expect(page.locator('#energy-display')).toHaveClass(/is-empty/);
  for (const type of ['physical', 'mental', 'emotional']) {
    const fill = await page.locator(`#energy-fill-${type}`).evaluate(el => el.style.height);
    expect(fill === '0%' || fill === '').toBeTruthy();
  }
});

// ─── T024: Set energy, save, reload — verify persistence ───

test('T024 [US4] set energy levels, save, reload, verify meters persist', async ({ page }) => {
  await page.goto('/');

  // Select emotion to pass validation
  await page.locator('.emotion-segment[data-emotion="joy"]').click();

  // Set energy meters at approximate positions
  const physicalMeter = page.locator('.energy-meter[data-energy-type="physical"]');
  const physBox = await physicalMeter.boundingBox();
  await physicalMeter.click({ position: { x: physBox.width / 2, y: Math.round(physBox.height * 0.7) } });

  const mentalMeter = page.locator('.energy-meter[data-energy-type="mental"]');
  const menBox = await mentalMeter.boundingBox();
  await mentalMeter.click({ position: { x: menBox.width / 2, y: Math.round(menBox.height * 0.4) } });

  const emotionalMeter = page.locator('.energy-meter[data-energy-type="emotional"]');
  const emoBox = await emotionalMeter.boundingBox();
  await emotionalMeter.click({ position: { x: emoBox.width / 2, y: Math.round(emoBox.height * 0.1) } });

  // Save
  await page.locator('#save-checkin').click();
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

  // Read localStorage values before reload
  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const entry = entries[todayKey] || entries[Object.keys(entries).find(k => k.startsWith(todayKey))];
  expect(entry.energy.physical).toBeDefined();
  expect(entry.energy.mental).toBeDefined();
  expect(entry.energy.emotional).toBeDefined();

  // Reload and verify
  await page.reload();
  await expect(page.locator('#energy-display')).not.toHaveClass(/is-empty/);
});

// ─── T025: Boundary values — 0% and 100% ───

test('T025 [US4] click at very bottom (0%) and very top (100%) of meter', async ({ page }) => {
  await page.goto('/');

  const meter = page.locator('.energy-meter[data-energy-type="physical"]');
  const box = await meter.boundingBox();

  // Click at bottom — 0%
  await meter.click({ position: { x: box.width / 2, y: box.height - 2 }, force: true });
  let fill = await page.locator('#energy-fill-physical').evaluate(el => el.style.height);
  expect(parseInt(fill)).toBeLessThanOrEqual(5);

  // Click at top — 100%
  await meter.click({ position: { x: box.width / 2, y: 2 }, force: true });
  fill = await page.locator('#energy-fill-physical').evaluate(el => el.style.height);
  expect(parseInt(fill)).toBeGreaterThanOrEqual(95);
});
