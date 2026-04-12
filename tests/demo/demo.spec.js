// @ts-check
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mindful Check-in — Interactive Visual Demo                 ║
 * ║                                                             ║
 * ║  Een visuele rondleiding door de hele applicatie.            ║
 * ║  Draait headed op menselijk tempo zodat je kunt meekijken.  ║
 * ║                                                             ║
 * ║  Start:  cd tests && npx playwright test demo/              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
const { test, expect } = require('@playwright/test');

// ── Tempo: pauze tussen acties zodat een mens het kan volgen ──
const PAUSE = 600;
const SHORT = 350;
const LONG = 1200;

async function wait(page, ms) {
  await page.waitForTimeout(ms || PAUSE);
}

// ── Zichtbare muiscursor via CSS + JS ──
async function injectCursor(page) {
  await page.addStyleTag({ content: `
    #pw-cursor {
      position: fixed;
      z-index: 999999;
      width: 20px; height: 20px;
      margin: -10px 0 0 -10px;
      border-radius: 50%;
      background: rgba(255, 40, 40, 0.55);
      border: 2px solid rgba(255, 40, 40, 0.9);
      pointer-events: none;
      transition: left 0.08s ease-out, top 0.08s ease-out;
    }
  `});
  await page.evaluate(() => {
    var dot = document.createElement('div');
    dot.id = 'pw-cursor';
    document.body.appendChild(dot);
    document.addEventListener('mousemove', function (e) {
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    });
  });
}

// ── Weather + geocoding mocks (geen echte API calls) ──
async function mockAPIs(page) {
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_weather: { temperature: 18, weathercode: 1, windspeed: 12 },
      }),
    })
  );
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [{ name: 'Amsterdam', latitude: 52.37, longitude: 4.90, country: 'Netherlands' }],
      }),
    })
  );
}

// ═════════════════════════════════════════════════════════════════
//  De grote demo — één test die de hele app doorloopt
// ═════════════════════════════════════════════════════════════════

test('Mindful Check-in — volledige app demo', async ({ page }) => {
  test.setTimeout(180_000); // 3 minuten budget

  await mockAPIs(page);
  await page.goto('/');
  await injectCursor(page);
  await wait(page, LONG);

  // ┌─────────────────────────────────────────┐
  // │  1. HOME — welkomstscherm               │
  // └─────────────────────────────────────────┘
  await expect(page.locator('#view-home')).toHaveClass(/is-active/);
  await wait(page, LONG);

  // Klik "Start check-in" knop op home
  await page.locator('#home-btn-checkin').click();
  await wait(page, PAUSE);

  // ┌─────────────────────────────────────────┐
  // │  2. CHECK-IN — volledige invulling      │
  // └─────────────────────────────────────────┘
  await expect(page.locator('#view-checkin')).toHaveClass(/is-active/);
  await wait(page, SHORT);

  // 2a. Gedachten invullen
  const thoughts = page.locator('#fld-thoughts');
  await thoughts.click();
  await wait(page, SHORT);
  await thoughts.fill('');
  await thoughts.type('Vandaag voel ik me energiek en dankbaar. De zon schijnt!', { delay: 30 });
  await wait(page, PAUSE);

  // 2b. Emotiewiel — selecteer een emotie
  const wheelSegments = page.locator('#wheel-svg [data-em]');
  const segmentCount = await wheelSegments.count();
  if (segmentCount > 0) {
    // Hover en klik op de 2e emotie (bijv. "serenity" bij ACT)
    await wheelSegments.nth(1).hover();
    await wait(page, SHORT);
    await wheelSegments.nth(1).click();
    await wait(page, LONG);

    // Even een andere proberen
    await wheelSegments.nth(4).hover();
    await wait(page, SHORT);
    await wheelSegments.nth(4).click();
    await wait(page, LONG);

    // Terug naar de eerste keuze
    await wheelSegments.nth(1).hover();
    await wait(page, SHORT);
    await wheelSegments.nth(1).click();
    await wait(page, LONG);
  }

  // Bekijk de geselecteerde emotie in het display
  const wheelDisplay = page.locator('#wheel-display');
  await expect(wheelDisplay).not.toHaveClass(/is-empty/);
  await wait(page, PAUSE);

  // 2c. Custom gevoelens toevoegen
  const customFeelings = page.locator('#fld-custom');
  if (await customFeelings.isVisible()) {
    await customFeelings.click();
    await customFeelings.type('hoopvol, rustig', { delay: 40 });
    await wait(page, PAUSE);
  }

  // 2d. Lichaamssignalen — klik een paar zones
  const bodyZones = page.locator('#body-svg [data-zone]');
  const zoneCount = await bodyZones.count();
  if (zoneCount > 0) {
    await bodyZones.nth(0).click(); // hoofd
    await wait(page, SHORT);
    await bodyZones.nth(3).click(); // borst
    await wait(page, SHORT);
    await bodyZones.nth(8).click(); // linkerhand
    await wait(page, PAUSE);

    // Deselecteer hoofd weer
    await bodyZones.nth(0).click();
    await wait(page, SHORT);
  }

  // 2e. Lichaamsnotitie
  const bodyNote = page.locator('#fld-body-note');
  if (await bodyNote.isVisible()) {
    await bodyNote.click();
    await bodyNote.type('Spanning in schouders', { delay: 35 });
    await wait(page, PAUSE);
  }

  // 2f. Energie — klik op de schaalwaarden en meters
  const meters = page.locator('#energy-slot .energy-meter');
  const meterCount = await meters.count();
  if (meterCount >= 3) {
    // Physical: klik op schaal "75"
    await page.locator('[data-meter="physical"][data-sval="75"]').hover();
    await wait(page, SHORT);
    await page.locator('[data-meter="physical"][data-sval="75"]').click();
    await wait(page, PAUSE);

    // Mental: klik op de meter bar (~60%)
    const mentalMeter = meters.nth(1);
    const mentalBox = await mentalMeter.boundingBox();
    if (mentalBox) {
      await page.mouse.move(mentalBox.x + mentalBox.width / 2, mentalBox.y + mentalBox.height * 0.4);
      await wait(page, SHORT);
      await page.mouse.click(mentalBox.x + mentalBox.width / 2, mentalBox.y + mentalBox.height * 0.4);
    }
    await wait(page, PAUSE);

    // Emotional: klik op schaal "50"
    await page.locator('[data-meter="emotional"][data-sval="50"]').hover();
    await wait(page, SHORT);
    await page.locator('[data-meter="emotional"][data-sval="50"]').click();
    await wait(page, PAUSE);
  }

  // Bekijk de energiewaarden in het display
  const energyDisplay = page.locator('#energy-display');
  await expect(energyDisplay).not.toHaveClass(/is-empty/);
  await wait(page, LONG);

  // 2g. Energienotitie
  const energyNote = page.locator('#fld-energy-note');
  if (await energyNote.isVisible()) {
    await energyNote.click();
    await energyNote.type('Goed geslapen', { delay: 35 });
    await wait(page, PAUSE);
  }

  // 2h. Mood matrix — klik een cel
  const moodCells = page.locator('#mood-slot .mood-cell');
  const moodCount = await moodCells.count();
  if (moodCount > 0) {
    // Klik eerst een neutrale cel
    const neutralCell = moodCells.nth(45); // midden van het grid
    await neutralCell.scrollIntoViewIfNeeded();
    await neutralCell.hover();
    await wait(page, SHORT);
    await neutralCell.click();
    await wait(page, LONG);

    // Nu een positieve cel (rechtsonder = hoge energy + valence)
    const positiveCell = moodCells.nth(8); // rij 0, kolom 8
    await positiveCell.hover();
    await wait(page, SHORT);
    await positiveCell.click();
    await wait(page, LONG);
  }

  // Bekijk de mood selectie in het display
  const moodDisplay = page.locator('#mood-display');
  await expect(moodDisplay).not.toHaveClass(/is-empty/);
  await wait(page, PAUSE);

  // 2i. Actie invoeren + quick action chip
  const actionField = page.locator('#fld-action');
  if (await actionField.isVisible()) {
    // Klik eerst een quick-action chip
    const chips = page.locator('#ci-chips .chip');
    if (await chips.count() > 0) {
      await chips.first().click();
      await wait(page, SHORT);
    }
    await wait(page, PAUSE);
  }

  // 2j. Notitie
  const noteField = page.locator('#fld-note');
  if (await noteField.isVisible()) {
    await noteField.click();
    await noteField.type('Demo check-in vanuit Playwright!', { delay: 30 });
    await wait(page, PAUSE);
  }

  // 2k. OPSLAAN
  await page.locator('#ci-btn-save').click();
  await wait(page, LONG);

  // Controleer success toast
  await expect(page.locator('.toast--success').first()).toBeVisible();
  await wait(page, LONG);

  // ┌─────────────────────────────────────────┐
  // │  3. TWEEDE CHECK-IN (kort)              │
  // └─────────────────────────────────────────┘
  await page.locator('#ci-btn-new').click();
  await wait(page, PAUSE);

  await thoughts.fill('');
  await thoughts.type('Nog een check-in op dezelfde dag', { delay: 30 });
  await wait(page, SHORT);

  // Andere emotie kiezen
  if (segmentCount > 0) {
    await wheelSegments.nth(0).hover();
    await wait(page, SHORT);
    await wheelSegments.nth(0).click();
    await wait(page, PAUSE);
  }

  await page.locator('#ci-btn-save').click();
  await wait(page, LONG);

  // ┌─────────────────────────────────────────┐
  // │  4. EMOTIEWIEL VARIANTEN                │
  // └─────────────────────────────────────────┘
  const wheelSelect = page.locator('#sel-wheel');
  if (await wheelSelect.isVisible()) {
    const options = ['plutchik', 'ekman', 'junto', 'extended', 'act'];
    for (const opt of options) {
      await wheelSelect.hover();
      await wait(page, SHORT);
      await wheelSelect.selectOption(opt);
      await wait(page, LONG);
    }
  }

  // ┌─────────────────────────────────────────┐
  // │  5. HOME — statistieken bekijken        │
  // └─────────────────────────────────────────┘
  await page.locator('[data-route="home"]').click();
  await wait(page, LONG);
  await expect(page.locator('#view-home')).toHaveClass(/is-active/);

  // Streak en totaal moeten nu > 0 zijn
  const total = page.locator('#home-total');
  await expect(total).toBeVisible();
  await wait(page, LONG);

  // ┌─────────────────────────────────────────┐
  // │  6. OVERZICHT — tabel, sorteren, zoeken │
  // └─────────────────────────────────────────┘
  await page.locator('[data-route="overview"]').click();
  await wait(page, PAUSE);
  await expect(page.locator('#view-overview')).toHaveClass(/is-active/);
  await wait(page, PAUSE);

  // Er moeten rijen zijn
  const rows = page.locator('#ov-tbody tr');
  await expect(rows.first()).toBeVisible();
  await wait(page, PAUSE);

  // Sorteer op een kolom (klik header)
  const sortableHeaders = page.locator('.ov-th-sortable');
  if (await sortableHeaders.count() > 1) {
    await sortableHeaders.nth(1).click(); // bijv. "feeling"
    await wait(page, PAUSE);
    await sortableHeaders.nth(1).click(); // omgekeerd
    await wait(page, PAUSE);
  }

  // Zoeken
  const searchBox = page.locator('#ov-search');
  await searchBox.click();
  await searchBox.type('dankbaar', { delay: 40 });
  await wait(page, LONG);

  // Zoekresultaat bekijken
  await wait(page, PAUSE);
  await searchBox.fill(''); // wis zoekveld
  await wait(page, PAUSE);

  // Klik op een rij om entry te laden
  const firstRow = page.locator('#ov-tbody tr[data-ekey]').first();
  if (await firstRow.isVisible()) {
    await firstRow.click();
    await wait(page, LONG);
    // We zijn nu terug op checkin met de geladen entry
    await expect(page.locator('#view-checkin')).toHaveClass(/is-active/);
    await wait(page, LONG);
  }

  // ┌─────────────────────────────────────────┐
  // │  7. HISTORY KALENDER                    │
  // └─────────────────────────────────────────┘
  // History zit op de checkin-pagina, scroll naar beneden
  const historyModes = page.locator('#history-modes [data-hmode]');
  if (await historyModes.count() > 1) {
    // Switch door de modes
    const modeCount = await historyModes.count();
    for (let i = 0; i < modeCount; i++) {
      await historyModes.nth(i).click();
      await wait(page, PAUSE);
    }
  }

  // ┌─────────────────────────────────────────┐
  // │  8. INSTELLINGEN                        │
  // └─────────────────────────────────────────┘
  await page.locator('[data-route="settings"]').click();
  await wait(page, PAUSE);
  await expect(page.locator('#view-settings')).toHaveClass(/is-active/);
  await wait(page, PAUSE);

  // 8a. Thema wisselen
  await page.locator('[data-theme-pick="dark"]').click();
  await wait(page, LONG);
  await page.locator('[data-theme-pick="light"]').click();
  await wait(page, LONG);
  await page.locator('[data-theme-pick="system"]').click();
  await wait(page, PAUSE);

  // 8b. Taal wisselen naar Nederlands
  await page.locator('[data-lang-pick="nl"]').click();
  await wait(page, LONG);

  // 8c. Terug naar Engels
  await page.locator('[data-lang-pick="en"]').click();
  await wait(page, LONG);

  // 8d. Wissel emotiewiel type in settings
  const cfgWheel = page.locator('#cfg-wheel');
  if (await cfgWheel.isVisible()) {
    await cfgWheel.hover();
    await wait(page, SHORT);
    await cfgWheel.selectOption('plutchik');
    await wait(page, PAUSE);
  }

  // 8e. Pas rijen per pagina aan
  const cfgRows = page.locator('#cfg-rows');
  if (await cfgRows.isVisible()) {
    await cfgRows.hover();
    await wait(page, SHORT);
    await cfgRows.click();
    await cfgRows.fill('');
    await cfgRows.type('5', { delay: 50 });
    await wait(page, PAUSE);
  }

  // 8f. Schakel een component uit en weer aan (body signals)
  const bodyLabel = page.locator('label:has([data-comp="bodySignals"])');
  await bodyLabel.click(); // uncheck
  await wait(page, PAUSE);

  // 8g. Save settings
  await page.locator('#cfg-btn-save').click();
  await wait(page, LONG);

  // 8h. Bekijk effect in checkin
  await page.locator('[data-route="checkin"]').click();
  await wait(page, LONG);

  // 8i. Terug naar settings — zet het weer aan
  await page.locator('[data-route="settings"]').click();
  await wait(page, PAUSE);
  await page.locator('label:has([data-comp="bodySignals"])').click(); // re-check
  await wait(page, SHORT);
  await page.locator('#cfg-btn-save').click();
  await wait(page, PAUSE);

  // ┌─────────────────────────────────────────┐
  // │  9. DEMO DATA GENEREREN                 │
  // └─────────────────────────────────────────┘
  await page.locator('[data-route="info"]').click();
  await wait(page, PAUSE);
  await expect(page.locator('#view-info')).toHaveClass(/is-active/);
  await wait(page, PAUSE);

  // Accept confirm dialog
  page.once('dialog', async (dialog) => await dialog.accept());
  await page.locator('#demo-btn-generate').click();
  await wait(page, LONG);

  // Bekijk het resultaat in overview
  await page.locator('[data-route="overview"]').click();
  await wait(page, PAUSE);

  // Nu zijn er veel meer rijen
  await expect(page.locator('#ov-tbody tr').first()).toBeVisible();
  await wait(page, PAUSE);

  // Pagination doorlopen
  const nextBtn = page.locator('#ov-next');
  for (let p = 0; p < 3; p++) {
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await wait(page, PAUSE);
    }
  }
  // Terug naar eerste pagina
  await page.locator('#ov-first').click();
  await wait(page, PAUSE);

  // Filter op afgelopen 7 dagen
  const filter = page.locator('#ov-filter');
  await filter.hover();
  await wait(page, SHORT);
  await filter.selectOption('7');
  await wait(page, LONG);
  await filter.hover();
  await wait(page, SHORT);
  await filter.selectOption('all');
  await wait(page, PAUSE);

  // ┌─────────────────────────────────────────┐
  // │ 10. EXPORT — download entries            │
  // └─────────────────────────────────────────┘
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#ov-export').click(),
  ]);
  expect(download.suggestedFilename()).toContain('.json');
  await wait(page, LONG);

  // ┌─────────────────────────────────────────┐
  // │ 11. HOME — bekijk statistieken met data │
  // └─────────────────────────────────────────┘
  await page.locator('[data-route="home"]').click();
  await wait(page, LONG);

  // Streak en heatmap moeten nu gevuld zijn
  await expect(page.locator('#home-heatmap')).toBeVisible();
  await wait(page, LONG);

  // ┌─────────────────────────────────────────┐
  // │ 12. THEMA WISSEL — donker afsluiten     │
  // └─────────────────────────────────────────┘
  await page.locator('[data-theme-pick="dark"]').click();
  await wait(page, LONG);

  // Laatste blik op de app in dark mode
  await page.locator('[data-route="checkin"]').click();
  await wait(page, LONG);
  await page.locator('[data-route="overview"]').click();
  await wait(page, LONG);
  await page.locator('[data-route="home"]').click();
  await wait(page, LONG);

  // Terug naar system theme
  await page.locator('[data-theme-pick="system"]').click();
  await wait(page, PAUSE);

  // ╔═════════════════════════════════════════╗
  // ║  Demo klaar!                            ║
  // ╚═════════════════════════════════════════╝
});
