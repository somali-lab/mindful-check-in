// @ts-check
const { test, expect } = require('./fixtures/base');
const {
  injectEntries,
  createTestEntry,
  getLocalStorageEntries,
  navigateToTab,
  acceptConfirm,
  getDateKey,
} = require('./fixtures/helpers');

// The app must use its own modal (#dlg-confirm) instead of window.confirm.

function fiveEntries() {
  const entries = {};
  for (let i = 0; i < 5; i++) {
    entries[getDateKey(i)] = createTestEntry({ thoughts: `Entry ${i}`, coreFeeling: 'joy' });
  }
  return entries;
}

test('delete shows the in-app modal, not a native confirm dialog', async ({ page }) => {
  // Fail loudly if any native dialog (alert/confirm/prompt) is triggered.
  let nativeDialogFired = false;
  page.on('dialog', async (dialog) => {
    nativeDialogFired = true;
    await dialog.dismiss();
  });

  await injectEntries(page, fiveEntries());
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('.ov-del').first().click();

  const dlg = page.locator('#dlg-confirm');
  await expect(dlg).toBeVisible();
  await expect(page.locator('#dlg-confirm-body')).not.toHaveText('');

  await acceptConfirm(page);
  await page.waitForTimeout(300);

  expect(nativeDialogFired).toBe(false);
  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(4);
});

test('Escape closes the confirm modal and aborts the action', async ({ page }) => {
  await injectEntries(page, fiveEntries());
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('.ov-del').first().click();
  await expect(page.locator('#dlg-confirm')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('#dlg-confirm')).not.toBeVisible();
  await page.waitForTimeout(200);

  // Nothing deleted
  const stored = await getLocalStorageEntries(page);
  expect(Object.keys(stored).length).toBe(5);
});

test('destructive confirm uses danger styling on the accept button', async ({ page }) => {
  await injectEntries(page, fiveEntries());
  await page.goto('/');
  await navigateToTab(page, 'overview');

  await page.locator('.ov-del').first().click();
  await expect(page.locator('#dlg-confirm-ok')).toHaveClass(/info-btn-danger/);
});
