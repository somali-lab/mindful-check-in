// @ts-check
const { test, expect } = require('../../fixtures/base');
const { getLocalStorageEntries } = require('../../fixtures/helpers');

// The body and energy notes are plain free-text fields; confirm they round-trip
// through a save into the stored entry.

test('body and energy notes persist on save', async ({ page }) => {
  await page.goto('/#checkin');

  // A thought makes the entry valid to save.
  await page.locator('#fld-thoughts').fill('Note round-trip');
  await page.locator('#fld-body-note').fill('Tight shoulders');
  await page.locator('#fld-energy-note').fill('Low after lunch');
  await page.locator('#ci-btn-save').click();

  const entry = Object.values(await getLocalStorageEntries(page))[0];
  expect(entry?.bodyNote).toBe('Tight shoulders');
  expect(entry?.energyNote).toBe('Low after lunch');
});
