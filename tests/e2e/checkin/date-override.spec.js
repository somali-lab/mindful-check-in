// @ts-check
const { test, expect } = require('../../fixtures/base');
const { getLocalStorageEntries, getTodayKey } = require('../../fixtures/helpers');

// ─── Editing the date override stores the entry under that date's key ───

test('backdating via the date override stores the entry under that date key', async ({ page }) => {
  await page.goto('/#checkin');

  // A signal is required to pass save validation.
  await page.locator('#fld-thoughts').fill('Backdated note');
  // datetime-local expects YYYY-MM-DDTHH:MM.
  await page.locator('#ci-date-override').fill('2026-03-15T14:30');
  await page.locator('#ci-btn-save').click();

  const keys = Object.keys(await getLocalStorageEntries(page));
  expect(
    keys.some((k) => k.startsWith('2026-03-15')),
    `expected a key for the overridden date, got: ${keys.join(', ')}`,
  ).toBe(true);
});

// ─── Without touching the override, the entry saves under today ───

test('an untouched date override saves the entry under today', async ({ page }) => {
  await page.goto('/#checkin');

  await page.locator('#fld-thoughts').fill('Today note');
  await page.locator('#ci-btn-save').click();

  const keys = Object.keys(await getLocalStorageEntries(page));
  const today = getTodayKey();
  expect(keys.some((k) => k.startsWith(today))).toBe(true);
});
