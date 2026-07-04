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
  await expect(page.locator('.quadrant-axis--away')).toHaveText('Weg van');
  await expect(page.locator('#quadrant-values')).toContainText('Verbondenheid');
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
  expect(stored.internalTo.map((i) => i.text)).toContain('Sleep before midnight');
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
  expect(stored.internalFrom.map((i) => i.text)).toContain('Rewritten item');
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

// ─── Strike-through (overcome) ───

test('the ✓ toggle strikes an item through and persists; toggling back clears it', async ({
  page,
}) => {
  await page.goto('/#quadrant');
  const first = page.locator('[data-qlist="internalFrom"] .quadrant-item').first();
  await first.hover();
  await first.locator('.quadrant-item-done').click();
  await expect(page.locator('[data-qlist="internalFrom"] .quadrant-item').first()).toHaveClass(
    /is-done/,
  );

  await page.reload();
  const reloaded = page.locator('[data-qlist="internalFrom"] .quadrant-item').first();
  await expect(reloaded).toHaveClass(/is-done/);
  const stored = await getStoredQuadrant(page);
  expect(stored.internalFrom[0].done).toBe(true);

  await reloaded.hover();
  await reloaded.locator('.quadrant-item-done').click();
  await expect(page.locator('[data-qlist="internalFrom"] .quadrant-item').first()).not.toHaveClass(
    /is-done/,
  );
});

// ─── Drag between panels ───

test('dragging an item by its handle to another panel moves it there', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'covered on desktop; mobile uses the same pointer flow with auto-scroll');
  // Tall enough that source and target panels are both on screen (the drop
  // hit-test uses elementFromPoint, which only sees the visible viewport).
  await page.setViewportSize({ width: 1280, height: 1500 });
  await page.goto('/#quadrant');

  const source = page.locator('[data-qlist="externalFrom"] .quadrant-item').first();
  const sourceText = await source.locator('.quadrant-item-text').textContent();
  const before = await page.locator('[data-qlist="externalFrom"] .quadrant-item').count();

  // Pointer-based drag: press the ⠿ handle, move over the target panel, release.
  const target = page.locator('[data-qpanel="externalTo"]');
  await source.locator('.quadrant-item-grab').hover();
  await page.mouse.down();
  const box = await target.boundingBox();
  if (!box) throw new Error('target panel not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();

  await expect(page.locator('[data-qlist="externalFrom"] .quadrant-item')).toHaveCount(before - 1);
  await expect(page.locator('[data-qlist="externalTo"]')).toContainText(sourceText ?? '');
  const stored = await getStoredQuadrant(page);
  expect(stored.externalTo.map((i) => i.text)).toContain(sourceText);
  expect(stored.externalFrom.map((i) => i.text)).not.toContain(sourceText);
});

// ─── Compass (values) ───

test('the compass shows seed value chips; adding one persists across reload', async ({ page }) => {
  await page.goto('/#quadrant');
  const hub = page.locator('#quadrant-center');
  await expect(hub).toContainText('Who or what matters to you?');
  await expect(hub).toContainText('Calm');
  await expect(hub).toContainText('Connection');

  await page.locator('.quadrant-value-input').fill('Family');
  await page.locator('.quadrant-value-add-btn').click();
  await expect(hub).toContainText('Family');

  await page.reload();
  await expect(page.locator('#quadrant-center')).toContainText('Family');
  const stored = await getStoredQuadrant(page);
  expect(stored.values).toContain('Family');
});

test('removing a value chip deletes it; Enter in the value input also adds', async ({ page }) => {
  await page.goto('/#quadrant');
  const hub = page.locator('#quadrant-center');

  const input = page.locator('.quadrant-value-input');
  await input.fill('Play');
  await input.press('Enter');
  await expect(hub).toContainText('Play');

  const chips = page.locator('.quadrant-value-chip');
  const before = await chips.count();
  await chips.first().locator('.quadrant-value-del').click();
  await expect(page.locator('.quadrant-value-chip')).toHaveCount(before - 1);
  const stored = await getStoredQuadrant(page);
  expect(stored.values).not.toContain('Calm'); // first seed chip removed
  expect(stored.values).toContain('Play');
});

test('a legacy stored center string appears as a value chip', async ({ page }) => {
  await page.addInitScript(() => {
    const q = {
      internalFrom: [],
      internalTo: [],
      externalFrom: [],
      externalTo: [],
      center: 'My family',
    };
    localStorage.setItem('local-mood-tracker-quadrant', JSON.stringify({ v: 1, data: q }));
  });
  await page.goto('/#quadrant');
  await expect(page.locator('.quadrant-value-chip')).toHaveText(/My family/);
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
