// @ts-check
const { test, expect } = require('../../fixtures/base');
const { injectLanguage, navigateToTab } = require('../../fixtures/helpers');

const QUADRANT_KEY = 'local-mood-tracker-quadrant';

async function getStoredQuadrant(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.v === 'number' && 'data' in parsed ? parsed.data : parsed;
  }, QUADRANT_KEY);
}

// ─── Navigation ───

test('quadrant tab navigates to the quadrant view', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'quadrant');
  expect(new URL(page.url()).hash).toBe('#quadrant');
  await expect(page.locator('#view-quadrant')).toBeVisible();
  await expect(page.locator('.quadrant-panel')).toHaveCount(4);
});

// ─── First-use seeds ───

test('first visit shows example items in every panel', async ({ page }) => {
  await page.goto('/#quadrant');
  for (const key of ['internalFrom', 'internalTo', 'externalFrom', 'externalTo']) {
    const items = page.locator(`[data-qlist="${key}"] .quadrant-item`);
    await expect(items.first()).toBeVisible();
  }
  await expect(page.locator('[data-qlist="externalTo"]')).toContainText('Doing check-in moments');
  // Soft default: seeds are not persisted until the user edits.
  expect(await getStoredQuadrant(page)).toBeNull();
});

test('seeds follow the stored language', async ({ page }) => {
  await injectLanguage(page, 'nl');
  await page.goto('/#quadrant');
  await expect(page.locator('[data-qlist="externalTo"]')).toContainText('Incheckmomenten doen');
  await expect(page.locator('[data-qpanel="internalFrom"] .quadrant-panel-title')).toHaveText(
    'Intern · vanaf',
  );
});

// ─── Add ───

test('adding an item appends it and persists across reload', async ({ page }) => {
  await page.goto('/#quadrant');
  await page.locator('[data-qinput="internalTo"]').fill('Sleep before midnight');
  await page.locator('[data-qadd="internalTo"]').click();

  const list = page.locator('[data-qlist="internalTo"]');
  await expect(list).toContainText('Sleep before midnight');

  await page.reload();
  await expect(page.locator('[data-qlist="internalTo"]')).toContainText('Sleep before midnight');
  const stored = await getStoredQuadrant(page);
  expect(stored.internalTo).toContain('Sleep before midnight');
});

test('Enter in the input also adds the item', async ({ page }) => {
  await page.goto('/#quadrant');
  const input = page.locator('[data-qinput="externalFrom"]');
  await input.fill('Skipping lunch');
  await input.press('Enter');
  await expect(page.locator('[data-qlist="externalFrom"]')).toContainText('Skipping lunch');
  await expect(input).toHaveValue('');
});

test('a blank input adds nothing', async ({ page }) => {
  await page.goto('/#quadrant');
  const before = await page.locator('[data-qlist="internalFrom"] .quadrant-item').count();
  await page.locator('[data-qinput="internalFrom"]').fill('   ');
  await page.locator('[data-qadd="internalFrom"]').click();
  await expect(page.locator('[data-qlist="internalFrom"] .quadrant-item')).toHaveCount(before);
});

// ─── Edit ───

test('clicking an item edits it inline; Enter commits', async ({ page }) => {
  await page.goto('/#quadrant');
  const first = page.locator('[data-qlist="internalFrom"] .quadrant-item').first();
  await first.locator('.quadrant-item-text').click();

  const edit = page.locator('[data-qlist="internalFrom"] .quadrant-item-edit');
  await edit.fill('Rewritten item');
  await edit.press('Enter');

  await expect(page.locator('[data-qlist="internalFrom"]')).toContainText('Rewritten item');
  const stored = await getStoredQuadrant(page);
  expect(stored.internalFrom).toContain('Rewritten item');
});

test('Escape cancels an inline edit without saving', async ({ page }) => {
  await page.goto('/#quadrant');
  const text = await page
    .locator('[data-qlist="internalTo"] .quadrant-item-text')
    .first()
    .textContent();
  await page.locator('[data-qlist="internalTo"] .quadrant-item-text').first().click();
  const edit = page.locator('[data-qlist="internalTo"] .quadrant-item-edit');
  await edit.fill('Should not stick');
  await edit.press('Escape');
  await expect(page.locator('[data-qlist="internalTo"]')).not.toContainText('Should not stick');
  await expect(page.locator('[data-qlist="internalTo"]')).toContainText(text ?? '');
  expect(await getStoredQuadrant(page)).toBeNull(); // never persisted
});

test('emptying an item during edit removes it', async ({ page }) => {
  await page.goto('/#quadrant');
  const items = page.locator('[data-qlist="externalTo"] .quadrant-item');
  const before = await items.count();
  await items.first().locator('.quadrant-item-text').click();
  const edit = page.locator('[data-qlist="externalTo"] .quadrant-item-edit');
  await edit.fill('');
  await edit.press('Enter');
  await expect(page.locator('[data-qlist="externalTo"] .quadrant-item')).toHaveCount(before - 1);
});

// ─── Centre (values/compass) ───

test('the centre shows the hint, and an entered value persists across reload', async ({ page }) => {
  await page.goto('/#quadrant');
  const center = page.locator('#quadrant-center');
  await expect(center).toHaveClass(/is-empty/);
  await expect(center).toContainText('Who or what matters to you?');

  await center.click();
  const edit = page.locator('.quadrant-center-edit');
  await edit.fill('Family, health, calm');
  await edit.press('Enter');

  await expect(center).not.toHaveClass(/is-empty/);
  await expect(center).toContainText('Family, health, calm');

  await page.reload();
  await expect(page.locator('#quadrant-center')).toContainText('Family, health, calm');
  const stored = await getStoredQuadrant(page);
  expect(stored.center).toBe('Family, health, calm');
});

test('Escape cancels a centre edit without saving', async ({ page }) => {
  await page.goto('/#quadrant');
  await page.locator('#quadrant-center').click();
  const edit = page.locator('.quadrant-center-edit');
  await edit.fill('Should not stick');
  await edit.press('Escape');
  await expect(page.locator('#quadrant-center')).not.toContainText('Should not stick');
  await expect(page.locator('#quadrant-center')).toHaveClass(/is-empty/);
  expect(await getStoredQuadrant(page)).toBeNull();
});

// ─── Delete ───

test('the ✕ button removes an item, and removal survives reload (no re-seed)', async ({ page }) => {
  await page.goto('/#quadrant');
  const list = page.locator('[data-qlist="internalFrom"]');
  const items = list.locator('.quadrant-item');
  const count = await items.count();

  // Delete every item in the panel.
  for (let i = 0; i < count; i++) {
    await items.first().hover();
    await items.first().locator('.quadrant-item-del').click();
  }
  await expect(list.locator('.quadrant-empty')).toBeVisible();

  // After a reload the emptied panel must stay empty — not re-seeded.
  await page.reload();
  await expect(page.locator('[data-qlist="internalFrom"] .quadrant-empty')).toBeVisible();
  const stored = await getStoredQuadrant(page);
  expect(stored.internalFrom).toEqual([]);
});
