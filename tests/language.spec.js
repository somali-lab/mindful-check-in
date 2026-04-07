// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');

// ─── T084: Switch to NL, verify Dutch text ───

test('T084 [US18] click NL button, verify Dutch text appears', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-language="nl"]').click();

  // Verify key UI elements switched to Dutch
  await expect(page.locator('[data-tab-target="overview"]')).toContainText('Overzicht');
  await expect(page.locator('[data-tab-target="settings"]')).toContainText('Instellingen');
});

// ─── T085: Switch NL → EN, verify English restores ───

test('T085 [US18] switch NL then back to EN restores English', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-language="nl"]').click();
  await expect(page.locator('[data-tab-target="overview"]')).toContainText('Overzicht');

  await page.locator('.language-button[data-language="en"]').click();
  await expect(page.locator('[data-tab-target="overview"]')).toContainText('Overview');
});

// ─── T086: NL language persists across reload ───

test('T086 [US18] NL language persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-language="nl"]').click();
  await expect(page.locator('[data-tab-target="overview"]')).toContainText('Overzicht');

  await page.reload();
  await expect(page.locator('[data-tab-target="overview"]')).toContainText('Overzicht');
});

// ─── T087: NL active, mood matrix shows Dutch labels ───

test('T087 [US18] NL active, mood matrix shows Dutch labels', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-language="nl"]').click();

  // The mood grid should now have Dutch labels
  // First cell [0][0] in Dutch is "Woedend"
  const firstCell = page.locator('.mood-cell').first();
  await expect(firstCell).toContainText('Woedend');
});

// ─── T088: EN active, body signals show English names ───

test('T088 [US18] EN active, body signals show English part names', async ({ page }) => {
  await page.goto('/');

  // Click a body part and verify English name
  await page.locator('.body-part[data-part="chest"]').dispatchEvent('click');
  const display = page.locator('#body-signals-display');
  await expect(display).toContainText(/chest/i);
});
