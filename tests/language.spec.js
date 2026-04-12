// @ts-check
const { test, expect } = process.env.COVERAGE === '1' ? require('./fixtures/coverage') : require('./fixtures/base');

// ─── T084: Switch to NL, verify Dutch text ───

test('T084 [US18] click NL button, verify Dutch text appears', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-lang-pick="nl"]').click();

  // Verify key UI elements switched to Dutch (use data-t elements, nav buttons are icon-only)
  await expect(page.locator('[data-t="homeGreeting"]')).toContainText('Hoe gaat het met je vandaag?');
});

// ─── T085: Switch NL → EN, verify English restores ───

test('T085 [US18] switch NL then back to EN restores English', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-lang-pick="nl"]').click();
  await expect(page.locator('[data-t="homeGreeting"]')).toContainText('Hoe gaat het met je vandaag?');

  await page.locator('.language-button[data-lang-pick="en"]').click();
  await expect(page.locator('[data-t="homeGreeting"]')).toContainText('How are you today?');
});

// ─── T086: NL language persists across reload ───

test('T086 [US18] NL language persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-button[data-lang-pick="nl"]').click();
  await expect(page.locator('[data-t="homeGreeting"]')).toContainText('Hoe gaat het met je vandaag?');

  await page.reload();
  await expect(page.locator('[data-t="homeGreeting"]')).toContainText('Hoe gaat het met je vandaag?');
});

// ─── T087: NL active, mood matrix shows Dutch labels ───

test('T087 [US18] NL active, mood matrix shows Dutch labels', async ({ page }) => {
  await page.goto('/#checkin');
  await page.locator('.language-button[data-lang-pick="nl"]').click();

  // The mood grid should now have Dutch labels
  // First cell [0][0] in Dutch is "Woedend"
  const firstCell = page.locator('.mood-cell').first();
  await expect(firstCell).toContainText('Woedend');
});

// ─── T088: EN active, body signals show English names ───

test('T088 [US18] EN active, body signals show English part names', async ({ page }) => {
  await page.goto('/#checkin');

  // Click a body part and verify English name
  await page.locator('.body-part[data-zone="chest"]').dispatchEvent('click');
  const display = page.locator('#body-display');
  await expect(display).toContainText(/chest/i);
});
