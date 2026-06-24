// @ts-check
const { test, expect } = require('./fixtures/base');

// ─── Switch to NL, verify Dutch text ───

test('click NL button, verify Dutch text appears', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-lang-pick="nl"]').click();

  // Verify key UI elements switched to Dutch (use data-t elements, nav buttons are icon-only)
  await expect(page.locator('[data-t="ciHowFeel"]')).toContainText('Hoe voel je je nu?');
});

// ─── Switch NL → EN, verify English restores ───

test('switch NL then back to EN restores English', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-lang-pick="nl"]').click();
  await expect(page.locator('[data-t="ciHowFeel"]')).toContainText('Hoe voel je je nu?');

  await page.locator('.language-button[data-lang-pick="en"]').click();
  await expect(page.locator('[data-t="ciHowFeel"]')).toContainText('How are you feeling now?');
});

// ─── NL language persists across reload ───

test('NL language persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-lang-pick="nl"]').click();
  await expect(page.locator('[data-t="ciHowFeel"]')).toContainText('Hoe voel je je nu?');

  await page.reload();
  await expect(page.locator('[data-t="ciHowFeel"]')).toContainText('Hoe voel je je nu?');
});

// ─── NL active, mood matrix shows Dutch labels ───

test('NL active, mood matrix shows Dutch labels', async ({ page }) => {
  await page.goto('/#checkin');
  await page.locator('.language-button[data-lang-pick="nl"]').click();

  // The mood grid should now have Dutch labels
  // First cell [0][0] in Dutch is "Woedend"
  const firstCell = page.locator('.mood-cell').first();
  await expect(firstCell).toContainText('Woedend');
});

// ─── EN active, body signals show English names ───

test('EN active, body signals show English part names', async ({ page }) => {
  await page.goto('/#checkin');

  // Click a body part and verify English name
  await page.locator('.body-part[data-zone="chest"]').dispatchEvent('click');
  const display = page.locator('#body-display');
  await expect(display).toContainText(/chest/i);
});
