// @ts-check
const { test, expect } = require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  getLocalStorageSettings,
  navigateToTab,
  openInfoTab,
  getDateKey,
  getTodayKey,
} = require('./fixtures/helpers');

// ─── Generate demo data — entries created ───

test('generate demo data creates entries in localStorage', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  // generateDemo() calls confirm() — accept it
  page.on('dialog', async (dialog) => await dialog.accept());

  await page.locator('#demo-btn-generate').click();
  await page.waitForTimeout(500);

  const entries = await getLocalStorageEntries(page);
  expect(Object.keys(entries).length).toBeGreaterThanOrEqual(20);
});

// ─── Demo data appears in overview ───

test('demo data entries appear in overview', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  page.on('dialog', async (dialog) => await dialog.accept());
  await page.locator('#demo-btn-generate').click();
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

  page.on('dialog', async (dialog) => await dialog.accept());
  await page.locator('#demo-btn-generate').click();
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

  // clearAll() calls confirm() TWICE — accept both
  page.on('dialog', async (dialog) => await dialog.accept());

  await page.locator('#demo-btn-clear').click();

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

  // Dismiss first confirm dialog — clearAll returns early
  page.on('dialog', async (dialog) => await dialog.dismiss());

  await page.locator('#demo-btn-clear').click();
  await page.waitForTimeout(300);

  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(5);
});

// ─── Data tools live in the About > Data sub-tab as cards, not the footer ───

test('About > Data tab presents demo and clear as cards with text', async ({ page }) => {
  await page.goto('/');
  await openInfoTab(page, 'data');

  const demoCard = page.locator('.info-data-card', { has: page.locator('#demo-btn-generate') });
  const clearCard = page.locator('.info-data-card', { has: page.locator('#demo-btn-clear') });
  await expect(demoCard).toBeVisible();
  await expect(clearCard).toBeVisible();

  // Each card carries an explanatory paragraph alongside its button
  await expect(demoCard.locator('p')).not.toHaveText('');
  await expect(clearCard.locator('p')).not.toHaveText('');

  // The buttons no longer live in the app-shell footer
  await expect(page.locator('.app-shell-footer-bar[data-footer="info"]')).toHaveCount(0);
});
