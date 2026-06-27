// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  getLocalStorageEntries,
  getTodayKey,
} = require('../../fixtures/helpers');

// Energy meters are a horizontal 20-segment bar (src/modules/energy.js).
// Clicking segment N sets the value to round(N * 100 / 20) = N * 5 %.
// dispatchEvent('click') targets the exact segment, bypassing overlap.
async function setMeter(page, type, segment) {
  await page.locator(`.nrg-seg[data-meter="${type}"][data-seg="${segment}"]`).dispatchEvent('click');
}

// ─── Click the top segment of the physical meter — high value ───

test('click top segment of physical energy meter shows 100%', async ({ page }) => {
  await page.goto('/#checkin');
  await setMeter(page, 'physical', 20);

  await expect(page.locator('.nrg-val[data-meter="physical"]')).toHaveText('100%');
  await expect(page.locator('#energy-display')).not.toHaveClass(/is-empty/);
});

// ─── Set the mental meter to 75% (segment 15) ───

test('click mental energy meter at the 75% segment', async ({ page }) => {
  await page.goto('/#checkin');
  await setMeter(page, 'mental', 15);

  await expect(page.locator('.nrg-val[data-meter="mental"]')).toHaveText('75%');
});

// ─── Set all three meters, reset, verify all clear ───

test('set all three meters then reset clears all', async ({ page }) => {
  await page.goto('/#checkin');

  for (const type of ['physical', 'mental', 'emotional']) {
    await setMeter(page, type, 10); // 50%
  }
  await expect(page.locator('#energy-display')).not.toHaveClass(/is-empty/);

  await page.locator('#nrg-btn-reset').click();

  await expect(page.locator('#energy-display')).toHaveClass(/is-empty/);
  for (const type of ['physical', 'mental', 'emotional']) {
    await expect(page.locator(`.nrg-val[data-meter="${type}"]`)).not.toContainText('%');
  }
});

// ─── Set energy, save, reload — verify persistence ───

test('set energy levels, save, reload, verify meters persist', async ({ page }) => {
  await page.goto('/#checkin');

  // Select emotion to pass validation
  await page.locator('.emotion-segment[data-em="joy"]').click();

  await setMeter(page, 'physical', 14);  // 70%
  await setMeter(page, 'mental', 8);     // 40%
  await setMeter(page, 'emotional', 2);  // 10%

  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  const entries = await getLocalStorageEntries(page);
  const todayKey = getTodayKey();
  const entry = entries[todayKey] || entries[Object.keys(entries).find(k => k.startsWith(todayKey))];
  expect(entry.energy.physical).toBe(70);
  expect(entry.energy.mental).toBe(40);
  expect(entry.energy.emotional).toBe(10);

  await page.reload();
  await expect(page.locator('#energy-display')).not.toHaveClass(/is-empty/);
});

// ─── Boundary segments — lowest (5%) and highest (100%) ───

test('click lowest and highest segments of a meter', async ({ page }) => {
  await page.goto('/#checkin');

  await setMeter(page, 'physical', 1); // lowest segment → 5%
  await expect(page.locator('.nrg-val[data-meter="physical"]')).toHaveText('5%');

  await setMeter(page, 'physical', 20); // highest segment → 100%
  await expect(page.locator('.nrg-val[data-meter="physical"]')).toHaveText('100%');
});
