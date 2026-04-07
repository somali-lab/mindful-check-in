// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  getTodayKey,
} = require('./fixtures/helpers');

// Helper: click body part via dispatchEvent to bypass SVG overlap
async function clickBodyPart(page, partName) {
  await page.locator(`.body-part[data-part="${partName}"]`).dispatchEvent('click');
}

// ─── T016: Click body part — highlights and shows in display ───

test('T016 [US3] click chest zone highlights and shows in display', async ({ page }) => {
  await page.goto('/');
  await clickBodyPart(page, 'chest');
  const chest = page.locator('.body-part[data-part="chest"]');
  await expect(chest).toHaveClass(/is-selected/);
  const display = page.locator('#body-signals-display');
  await expect(display).not.toHaveClass(/is-empty/);
  // Should show the translated body part name
  await expect(display).toContainText(/chest/i);
});

// ─── T017: Toggle off body part ───

test('T017 [US3] click chest to select, click again to deselect', async ({ page }) => {
  await page.goto('/');
  const chest = page.locator('.body-part[data-part="chest"]');

  // Select
  await clickBodyPart(page, 'chest');
  await expect(chest).toHaveClass(/is-selected/);

  // Deselect
  await clickBodyPart(page, 'chest');
  await expect(chest).not.toHaveClass(/is-selected/);
  await expect(page.locator('#body-signals-display')).toHaveClass(/is-empty/);
});

// ─── T018: Multiple body parts — reset clears all ───

test('T018 [US3] select multiple parts then reset clears all', async ({ page }) => {
  await page.goto('/');

  await clickBodyPart(page, 'head');
  await clickBodyPart(page, 'chest');
  await clickBodyPart(page, 'left-hand');

  // All should be selected
  await expect(page.locator('.body-part[data-part="head"]')).toHaveClass(/is-selected/);
  await expect(page.locator('.body-part[data-part="chest"]')).toHaveClass(/is-selected/);
  await expect(page.locator('.body-part[data-part="left-hand"]')).toHaveClass(/is-selected/);

  // Reset
  await page.locator('#reset-body-signals').click();

  // All should be deselected
  await expect(page.locator('.body-part[data-part="head"]')).not.toHaveClass(/is-selected/);
  await expect(page.locator('.body-part[data-part="chest"]')).not.toHaveClass(/is-selected/);
  await expect(page.locator('.body-part[data-part="left-hand"]')).not.toHaveClass(/is-selected/);
  await expect(page.locator('#body-signals-display')).toHaveClass(/is-empty/);
});

// ─── T019: Save with body parts, reload, verify persistence ───

test('T019 [US3] select 5 body parts, save, reload, verify re-highlight', async ({ page }) => {
  const parts = ['head', 'chest', 'left-shoulder', 'right-hand', 'left-knee'];

  await page.goto('/');

  // Select emotion to pass save validation
  await page.locator('.emotion-segment[data-emotion="joy"]').click();

  // Select body parts
  for (const part of parts) {
    await clickBodyPart(page, part);
  }

  // Save
  await page.locator('#save-checkin').click();
  await expect(page.locator('#history-banner')).toHaveClass(/is-success/);

  // Reload
  await page.reload();

  // Verify all 5 parts are re-highlighted
  for (const part of parts) {
    await expect(page.locator(`.body-part[data-part="${part}"]`)).toHaveClass(/is-selected/);
  }
});

// ─── T020: Parameterized test — all body part zones toggle independently ───

const allBodyParts = [
  'head', 'neck', 'left-shoulder', 'right-shoulder', 'chest', 'abdomen',
  'left-upper-arm', 'right-upper-arm', 'left-elbow', 'right-elbow',
  'left-forearm', 'right-forearm', 'left-hand', 'right-hand',
  'left-hip', 'right-hip', 'left-leg', 'right-leg',
  'left-knee', 'right-knee', 'left-lower-leg', 'right-lower-leg',
  'left-foot', 'right-foot', 'upper-back', 'lower-back',
];

test('T020 [US3] all body part zones toggle on/off independently', async ({ page }) => {
  await page.goto('/');

  for (const part of allBodyParts) {
    const el = page.locator(`.body-part[data-part="${part}"]`);

    // Toggle on (dispatchEvent bypasses SVG overlap)
    await el.dispatchEvent('click');
    await expect(el).toHaveClass(/is-selected/);

    // Toggle off
    await el.dispatchEvent('click');
    await expect(el).not.toHaveClass(/is-selected/);
  }
});
