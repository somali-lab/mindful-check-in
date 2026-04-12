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
  await page.locator(`.body-part[data-zone="${partName}"]`).dispatchEvent('click');
}

// ─── T016: Click body part — highlights and shows in display ───

test('T016 [US3] click chest zone highlights and shows in display', async ({ page }) => {
  await page.goto('/#checkin');
  await clickBodyPart(page, 'chest');
  const chest = page.locator('.body-part[data-zone="chest"]');
  await expect(chest).toHaveClass(/is-on/);
  const display = page.locator('#body-display');
  await expect(display).not.toHaveClass(/is-empty/);
  // Should show the translated body part name
  await expect(display).toContainText(/chest/i);
});

// ─── T017: Toggle off body part ───

test('T017 [US3] click chest to select, click again to deselect', async ({ page }) => {
  await page.goto('/#checkin');
  const chest = page.locator('.body-part[data-zone="chest"]');

  // Select
  await clickBodyPart(page, 'chest');
  await expect(chest).toHaveClass(/is-on/);

  // Deselect
  await clickBodyPart(page, 'chest');
  await expect(chest).not.toHaveClass(/is-on/);
  await expect(page.locator('#body-display')).toHaveClass(/is-empty/);
});

// ─── T018: Multiple body parts — reset clears all ───

test('T018 [US3] select multiple parts then reset clears all', async ({ page }) => {
  await page.goto('/#checkin');

  await clickBodyPart(page, 'head');
  await clickBodyPart(page, 'chest');
  await clickBodyPart(page, 'left-hand');

  // All should be selected
  await expect(page.locator('.body-part[data-zone="head"]')).toHaveClass(/is-on/);
  await expect(page.locator('.body-part[data-zone="chest"]')).toHaveClass(/is-on/);
  await expect(page.locator('.body-part[data-zone="left-hand"]')).toHaveClass(/is-on/);

  // Reset
  await page.locator('#bdy-btn-reset').click();

  // All should be deselected
  await expect(page.locator('.body-part[data-zone="head"]')).not.toHaveClass(/is-on/);
  await expect(page.locator('.body-part[data-zone="chest"]')).not.toHaveClass(/is-on/);
  await expect(page.locator('.body-part[data-zone="left-hand"]')).not.toHaveClass(/is-on/);
  await expect(page.locator('#body-display')).toHaveClass(/is-empty/);
});

// ─── T019: Save with body parts, reload, verify persistence ───

test('T019 [US3] select 5 body parts, save, reload, verify re-highlight', async ({ page }) => {
  const parts = ['head', 'chest', 'left-shoulder', 'right-hand', 'left-knee'];

  await page.goto('/#checkin');

  // Select emotion to pass save validation
  await page.locator('.emotion-segment[data-em="joy"]').click();

  // Select body parts
  for (const part of parts) {
    await clickBodyPart(page, part);
  }

  // Save
  await page.locator('#ci-btn-save').click();
  await expect(page.locator('.toast--success')).toBeVisible();

  // Reload
  await page.reload();

  // Verify all 5 parts are re-highlighted
  for (const part of parts) {
    await expect(page.locator(`.body-part[data-zone="${part}"]`)).toHaveClass(/is-on/);
  }
});

// ─── T020: Parameterized test — all body part zones toggle independently ───

const allBodyParts = [
  'head', 'neck', 'left-shoulder', 'right-shoulder', 'chest', 'abdomen',
  'left-upper-arm', 'right-upper-arm', 'left-elbow', 'right-elbow',
  'left-forearm', 'right-forearm', 'left-hand', 'right-hand',
  'left-hip', 'right-hip', 'left-upper-leg', 'right-upper-leg',
  'left-knee', 'right-knee', 'left-lower-leg', 'right-lower-leg',
  'left-foot', 'right-foot', 'upper-back', 'lower-back',
];

test('T020 [US3] all body part zones toggle on/off independently', async ({ page }) => {
  await page.goto('/#checkin');

  for (const part of allBodyParts) {
    const el = page.locator(`.body-part[data-zone="${part}"]`);

    // Toggle on (dispatchEvent bypasses SVG overlap)
    await el.dispatchEvent('click');
    await expect(el).toHaveClass(/is-on/);

    // Toggle off
    await el.dispatchEvent('click');
    await expect(el).not.toHaveClass(/is-on/);
  }
});
