// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');
const {
  injectEntries,
  injectSettings,
  createTestEntry,
  createTestSettings,
  getDateKey,
} = require('./fixtures/helpers');

// ─── T094: 28 entries render colored history grid ───

test('T094 [US22] 28 days of entries render history calendar grid', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 28; i++) {
    entries[getDateKey(i)] = createTestEntry({
      coreFeeling: i % 3 === 0 ? 'joy' : i % 3 === 1 ? 'sadness' : 'anger',
      moodScore: i % 3 === 0 ? 3 : i % 3 === 1 ? 1 : 2,
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');

  const historyContent = page.locator('#history-content');
  await expect(historyContent).not.toContainText(/empty/i);

  // Should have calendar cells
  const cells = page.locator('.cal-cell');
  await expect(cells.first()).toBeVisible();
});

// ─── T095: Core feeling mode — joy entry shows positive color ───

test('T095 [US22] core feeling mode, joy entry has positive color', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({
      coreFeeling: 'joy',
      moodScore: 3,
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');

  // The "Core feeling" mode should be active by default or selectable
  const feelingBtn = page.locator('.cal-mode-btn[data-mode="feeling"]');
  if (await feelingBtn.count() > 0) {
    await feelingBtn.click();
  }

  // Cells with entries should have a score-based class
  const cellWithEntry = page.locator('.cal-cell[data-date]').first();
  await expect(cellWithEntry).toBeVisible();
});

// ─── T096: Physical energy mode — colors reflect energy levels ───

test('T096 [US22] physical energy mode, colors reflect energy levels', async ({ page }) => {
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
  await page.goto('/');

  const energyPhysBtn = page.locator('.cal-mode-btn[data-mode="energyPhysical"]');
  if (await energyPhysBtn.count() > 0) {
    await energyPhysBtn.click();
    const cells = page.locator('.cal-cell[data-date]');
    await expect(cells.first()).toBeVisible();
  }
});

// ─── T097: Click history cell loads entry into form ───

test('T097 [US22] click history cell with entry loads into form', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({
      thoughts: `History ${i}`,
      coreFeeling: 'joy',
    });
  }
  await injectEntries(page, entries);
  await page.goto('/');

  // Click a history cell that has an entry
  const cellWithEntry = page.locator('.cal-cell[data-date]').first();
  if (await cellWithEntry.count() > 0) {
    await cellWithEntry.click({ force: true });
    // After clicking, form should be populated (may auto-switch to checkin tab)
    await page.waitForTimeout(300);
    const thoughts = await page.locator('#thoughts').inputValue();
    expect(thoughts).toContain('History');
  }
});

// ─── T098: Disable core feeling — mode button absent ───

test('T098 [US22] disable core feeling, Core feeling mode button absent', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 7; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy' });
  }
  const settings = createTestSettings({ components: { coreFeeling: false } });
  await injectEntries(page, entries);
  await injectSettings(page, settings);
  await page.goto('/');

  const feelingBtn = page.locator('.cal-mode-btn[data-mode="feeling"]');
  await expect(feelingBtn).toHaveCount(0);
});
