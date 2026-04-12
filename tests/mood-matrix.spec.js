// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── T026: Click mood cell and verify display ───

test('T026 [US5] click cell (energy=8, valence=9) shows positive mood label', async ({ page }) => {
  await page.goto('/#checkin');
  // energy=8 -> row = 10-8 = 2, valence=9 -> col = 9-1 = 8
  await page.locator('.mood-cell[data-mr="2"][data-mc="8"]').click();
  const display = page.locator('#mood-display');
  await expect(display).not.toHaveClass(/is-empty/);
  await expect(display).toContainText('E 8/10, V 9/10');
});

// ─── T027: Select mood cell, reset, verify cleared ───

test('T027 [US5] select mood cell then reset clears selection', async ({ page }) => {
  await page.goto('/#checkin');
  await page.locator('.mood-cell[data-mr="3"][data-mc="7"]').click();
  await expect(page.locator('#mood-display')).not.toHaveClass(/is-empty/);

  await page.locator('#mood-btn-reset').click();
  await expect(page.locator('#mood-display')).toHaveClass(/is-empty/);
  const selectedCells = page.locator('.mood-cell.is-selected');
  await expect(selectedCells).toHaveCount(0);
});

// ─── T028: Save with mood grid selection, reload, verify persistence ───

test('T028 [US5] save entry with mood grid selection, reload, verify re-highlights', async ({ page }) => {
  await page.goto('/#checkin');
  // Select a mood cell: energy=5, valence=6 -> row=5, col=5
  await page.locator('.mood-cell[data-mr="5"][data-mc="5"]').click();

  // Also select emotion to pass validation (coreFeeling or thoughts required)
  await page.locator('.emotion-segment[data-em="joy"]').click();

  // Save
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  // Reload
  await page.reload();

  // Verify the same cell is selected
  await expect(page.locator('.mood-cell[data-mr="5"][data-mc="5"]')).toHaveClass(/is-selected/);
  await expect(page.locator('#mood-display')).toContainText('E 5/10, V 6/10');
});

// ─── T029: Multiple clicks — only last selection active ───

test('T029 [US5] clicking multiple cells keeps only last selection active', async ({ page }) => {
  await page.goto('/#checkin');

  await page.locator('.mood-cell[data-mr="0"][data-mc="0"]').click();
  await page.locator('.mood-cell[data-mr="5"][data-mc="5"]').click();
  await page.locator('.mood-cell[data-mr="9"][data-mc="9"]').click();

  // Only the last cell should be selected
  await expect(page.locator('.mood-cell.is-selected')).toHaveCount(1);
  await expect(page.locator('.mood-cell[data-mr="9"][data-mc="9"]')).toHaveClass(/is-selected/);
});

// ─── T030: Corner cells — boundary labels ───

test('T030 [US5] corner cells render correct boundary labels', async ({ page }) => {
  await page.goto('/#checkin');

  // (1,1) = row=9, col=0 — Low energy, Negative
  await page.locator('.mood-cell[data-mr="9"][data-mc="0"]').click();
  await expect(page.locator('#mood-display')).toContainText('E 1/10, V 1/10');

  // (1,10) = row=9, col=9 — Low energy, Positive
  await page.locator('.mood-cell[data-mr="9"][data-mc="9"]').click();
  await expect(page.locator('#mood-display')).toContainText('E 1/10, V 10/10');

  // (10,1) = row=0, col=0 — High energy, Negative
  await page.locator('.mood-cell[data-mr="0"][data-mc="0"]').click();
  await expect(page.locator('#mood-display')).toContainText('E 10/10, V 1/10');

  // (10,10) = row=0, col=9 — High energy, Positive
  await page.locator('.mood-cell[data-mr="0"][data-mc="9"]').click();
  await expect(page.locator('#mood-display')).toContainText('E 10/10, V 10/10');
});
