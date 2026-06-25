// @ts-check
const { test, expect } = require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  getLocalStorageSettings,
  navigateToTab,
  openInfoTab,
  acceptConfirm,
  dismissConfirm,
  getDateKey,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── Generate demo data — entries created ───

test('generate demo data creates entries in localStorage', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  await page.locator('#demo-btn-generate').click();
  await acceptConfirm(page); // in-app confirm modal
  await page.waitForTimeout(500);

  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThanOrEqual(20);
});

// ─── Demo data appears in overview ───

test('demo data entries appear in overview', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  await page.locator('#demo-btn-generate').click();
  await acceptConfirm(page);
  await page.waitForTimeout(500);

  await navigateToTab(page, 'overview');
  const rows = page.locator('#ov-tbody tr');
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

// ─── Demo data doesn't delete existing entries ───

test('demo data adds alongside existing entries', async ({ page }) => {
  const existing = {
    [getDateKey(100)]: createTestEntry({ thoughts: 'Original entry', coreFeeling: 'joy' }),
  };
  await injectEntries(page, existing);
  await page.goto('/');
  await openInfoTab(page, 'data');

  await page.locator('#demo-btn-generate').click();
  await acceptConfirm(page);
  await page.waitForTimeout(500);

  const entries = await getLocalStorageEntries(page);
  // Original entry should still exist
  expect(entries[getDateKey(100)]).toBeTruthy();
  // Plus demo entries
  expect(Object.keys(entries).length).toBeGreaterThan(1);
});

// ─── Clear all data — everything removed ───

test('clear all local data removes all localStorage keys', async ({ page }) => {
  await page.goto('/');

  // Inject entries AFTER page load (not via addInitScript which would re-inject on reload)
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy' });
  }
  await page.evaluate((data) => {
    localStorage.setItem('local-mood-tracker-entries', JSON.stringify(data));
  }, entries);
  await page.reload();
  await openInfoTab(page, 'data');

  // clearAll() shows the confirm modal TWICE — accept both
  await page.locator('#demo-btn-clear').click();
  await acceptConfirm(page);
  await acceptConfirm(page);

  // clearAll() reloads after 1500ms — wait for it
  await page.waitForTimeout(2000);
  await page.waitForLoadState('load');

  const stored = await getLocalStorageEntries(page);
  // Should be empty or null
  expect(!stored || Object.keys(stored).length === 0).toBeTruthy();
});

// ─── Clear all data — dismiss confirm — nothing deleted ───

test('dismiss clear data confirm, nothing deleted', async ({ page }) => {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ coreFeeling: 'joy' });
  }
  await injectEntries(page, entries);
  await page.goto('/');
  await openInfoTab(page, 'data');

  // Dismiss the first confirm modal — clearAll returns early
  await page.locator('#demo-btn-clear').click();
  await dismissConfirm(page);
  await page.waitForTimeout(300);

  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(5);
});

// ─── Data tools live in the About > Data sub-tab as cards, not the footer ───

test('About > Data tab presents the data actions as cards with text', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  // Export & import entries (moved from the Overview footer) plus demo & clear
  const cardFor = (sel) => page.locator('.data-card', { has: page.locator(sel) });
  const cards = {
    export: cardFor('#ov-export'),
    import: cardFor('#ov-import'),
    demo: cardFor('#demo-btn-generate'),
    clear: cardFor('#demo-btn-clear'),
  };
  for (const card of Object.values(cards)) {
    await expect(card).toBeVisible();
    await expect(card.locator('p')).not.toHaveText(''); // each carries explanatory text
  }

  // The clear action is flagged as destructive
  await expect(cards.clear).toHaveClass(/data-card--danger/);

  // The overview no longer renders its own footer (export/import moved away)
  await expect(page.locator('.app-shell-footer-bar[data-footer="overview"]')).toHaveCount(0);
  await expect(page.locator('.app-shell-footer-bar[data-footer="info"]')).toHaveCount(0);
});
