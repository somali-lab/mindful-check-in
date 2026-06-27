// @ts-check
const { test, expect } = require('../../fixtures/base');
const { getLocalStorageEntries } = require('../../fixtures/helpers');

// ─── Add a custom feeling: renders a chip, mirrors the field, persists on save ───

test('add a custom feeling chip — renders, mirrors the field, persists on save', async ({
  page,
}) => {
  await page.goto('/#checkin');

  await page.locator('#ci-feel-chips [data-feladd]').click();
  const input = page.locator('#ci-feel-chips .ci-act-input');
  await input.fill('Restless');
  await input.press('Enter');

  await expect(page.locator('#ci-feel-chips .ci-chip', { hasText: 'Restless' })).toBeVisible();
  await expect(page.locator('#fld-custom')).toHaveValue(/Restless/);

  // A custom feeling alone is not a valid signal; add a thought so the save commits.
  await page.locator('#fld-thoughts').fill('Tracking a custom feeling');
  await page.locator('#ci-btn-save').click();
  const entries = await getLocalStorageEntries(page);
  const saved = Object.values(entries).some((e) => (e.customFeelings || '').includes('Restless'));
  expect(saved, 'saved entry should carry the custom feeling').toBe(true);
});

// ─── Remove a custom feeling chip — gone from the row and the field ───

test('remove a custom feeling chip', async ({ page }) => {
  await page.goto('/#checkin');

  await page.locator('#ci-feel-chips [data-feladd]').click();
  const input = page.locator('#ci-feel-chips .ci-act-input');
  await input.fill('Calm');
  await input.press('Enter');
  await expect(page.locator('#ci-feel-chips .ci-chip', { hasText: 'Calm' })).toBeVisible();

  await page.locator('#ci-feel-chips [data-felrm]').first().click();

  await expect(page.locator('#ci-feel-chips .ci-chip', { hasText: 'Calm' })).toHaveCount(0);
  await expect(page.locator('#fld-custom')).not.toHaveValue(/Calm/);
});
