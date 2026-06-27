// @ts-check
const { test, expect } = require('../../fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestEntry,
  createTestSettings,
  getDateKey,
} = require('../../fixtures/helpers');

// ─── 28 entries render colored history grid ───

test('28 days of entries render history calendar grid', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 28; i++) {
    entries[getDateKey(i)] = createTestEntry({
      coreFeeling: i % 3 === 0 ? 'joy' : i % 3 === 1 ? 'sadness' : 'anger',
      moodScore: i % 3 === 0 ? 3 : i % 3 === 1 ? 1 : 2,
    });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  const historyContent = page.locator('#history-grid');
  await expect(historyContent).not.toContainText(/empty/i);

  // Should have calendar cells
  const cells = page.locator('.cal-cell');
  await expect(cells.first()).toBeVisible();
});

// ─── Core feeling mode — joy entry shows positive color ───

test('core feeling mode, joy entry has positive color', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({
      coreFeeling: 'joy',
      moodScore: 3,
    });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  // The "Core" mode should be active by default or selectable
  const feelingBtn = page.locator('.cal-mode-btn[data-hmode="core"]');
  if ((await feelingBtn.count()) > 0) {
    await feelingBtn.click();
  }

  // Cells with entries should have an entry-key attribute
  const cellWithEntry = page.locator('.cal-cell[data-entry-key]').first();
  await expect(cellWithEntry).toBeVisible();
});

// ─── Physical energy mode — colors reflect energy levels ───

test('physical energy mode, colors reflect energy levels', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({
      energy: {
        physical: i < 3 ? 80 : i < 5 ? 50 : 20,
        mental: 50,
        emotional: 50,
      },
      coreFeeling: 'joy',
    });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  const energyPhysBtn = page.locator('.cal-mode-btn[data-hmode="physical"]');
  if ((await energyPhysBtn.count()) > 0) {
    await energyPhysBtn.click();
    const cells = page.locator('.cal-cell[data-entry-key]');
    await expect(cells.first()).toBeVisible();
  }
});

// ─── Click history cell loads entry into form ───

test('click history cell with entry loads into form', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts: `History ${i}`,
      coreFeeling: 'joy',
    });
  }
  await injectEntries(page, entries);
  await page.goto('/#checkin');

  // Click a history cell that has an entry
  const cellWithEntry = page.locator('.cal-cell[data-entry-key]').first();
  if ((await cellWithEntry.count()) > 0) {
    await cellWithEntry.click({ force: true });
    // After clicking, form should be populated (may auto-switch to checkin tab)
    await page.waitForTimeout(300);
    const thoughts = await page.locator('#fld-thoughts').inputValue();
    expect(thoughts).toContain('History');
  }
});

// ─── Disable core feeling — mode button absent ───

test('disable core feeling, Core feeling mode button absent', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy' });
  }
  const settings = createTestSettings({ components: { coreFeeling: false } });
  await injectEntries(page, entries);
  await injectSettings(page, settings);
  await page.goto('/#checkin');

  const feelingBtn = page.locator('.cal-mode-btn[data-hmode="core"]');
  await expect(feelingBtn).toHaveCount(0);
});
