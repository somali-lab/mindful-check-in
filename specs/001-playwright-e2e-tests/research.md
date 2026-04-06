# Research: Comprehensive Playwright E2E Test Suite

**Date**: 2026-04-07  
**Feature**: [spec.md](spec.md)  
**Purpose**: Resolve technical decisions needed for test suite implementation

---

## Decision 1: Static File Server for Tests

**Decision**: Use `npx serve` via Playwright's `webServer` config option.

**Rationale**: The app is a static HTML file with no build step. Playwright's `webServer` config starts the server before tests and stops it after. `serve` is lightweight, already installed via npm, and handles MIME types correctly for CSS/JS modules.

**Alternatives considered**:
- `http-server`: Similar but `serve` has better defaults (no caching headers, correct MIME types).
- `python -m http.server`: Would add a Python dependency for CI environments.
- No server (file:// protocol): Fails for fetch() calls due to CORS restrictions.

**Config pattern**:
```js
// playwright.config.js
webServer: {
  command: 'npx serve .. -p 3000 -s',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

---

## Decision 2: localStorage Injection Pattern

**Decision**: Use `page.addInitScript()` to inject localStorage data *before* page load, with `page.evaluate()` for post-action verification.

**Rationale**: The app reads localStorage during `DOMContentLoaded`. Data must be present before the page loads for the app to hydrate correctly. `addInitScript` runs before any page script.

**Alternatives considered**:
- `page.evaluate()` before `goto()`: Not possible — evaluate requires a navigated page.
- `storageState`: Only handles cookies and sessionStorage origins, not localStorage keys.
- Navigate, set, reload: Works but doubles page load time per test.

**Pattern**:
```js
// Pre-seed before page load
await page.addInitScript((entries) => {
  localStorage.setItem('local-mood-tracker-entries', JSON.stringify(entries));
}, testEntries);
await page.goto('/');

// Verify after action
const stored = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('local-mood-tracker-entries'))
);
```

---

## Decision 3: Weather API Mocking

**Decision**: Use `page.route()` to intercept requests to `api.open-meteo.com` and `geocoding-api.open-meteo.com` with predefined mock responses.

**Rationale**: Tests must not depend on external APIs for reliability and speed. Route interception is the Playwright-native approach and works before response is received.

**Alternatives considered**:
- Network-level mock server: Overkill for two endpoints.
- Disable weather globally: Would skip testing the weather feature entirely.

**Pattern**:
```js
await page.route('**/api.open-meteo.com/**', route => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ current_weather: { temperature: 14, weathercode: 1 } }),
}));
```

---

## Decision 4: File Download Verification

**Decision**: Use Playwright's `page.waitForEvent('download')` to capture downloads, then read the file content from the temporary path.

**Rationale**: The app creates downloads via `URL.createObjectURL(blob)` + programmatic anchor click. Playwright intercepts the download event regardless of creation method.

**Pattern**:
```js
const downloadPromise = page.waitForEvent('download');
await page.click('#overview-export');
const download = await downloadPromise;
const content = JSON.parse(await download.path().then(p => fs.readFileSync(p, 'utf8')));
```

---

## Decision 5: File Upload (Import) Testing

**Decision**: Use Playwright's `fileChooser` event for button-triggered imports and `setInputFiles()` with in-memory buffers for direct file input.

**Rationale**: The app uses hidden `<input type="file">` elements triggered by buttons. The `filechooser` event captures when the file dialog opens. Buffer-based uploads avoid filesystem dependencies.

**Pattern**:
```js
const fileChooserPromise = page.waitForEvent('filechooser');
await page.click('#overview-import');
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles({
  name: 'import.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify(testData)),
});
```

---

## Decision 6: SVG Interaction Approach

**Decision**: Use CSS selectors targeting `data-*` attributes and CSS classes on SVG elements (`.body-part`, `[data-emotion]`, `.mood-cell`).

**Rationale**: The app's SVG elements have consistent selectors — body parts use class `.body-part` with readable IDs, emotion wheel segments have data attributes, mood grid cells have data attributes for row/column. Direct `.click()` works on SVG elements in Playwright.

**Alternatives considered**:
- Coordinate-based clicks: Fragile, breaks on layout changes.
- Text-based selectors: Not all SVG elements have visible text.

**Pattern**:
```js
// Emotion wheel
await page.locator('.emotion-segment[data-emotion="joy"]').click();

// Body signals
await page.locator('.body-part[data-part="chest"]').click();

// Mood grid
await page.locator('.mood-cell[data-row="8"][data-col="9"]').click();
```

---

## Decision 7: Dialog Handling (confirm/alert)

**Decision**: Use Playwright's `page.on('dialog')` event to auto-accept or auto-dismiss dialogs.

**Rationale**: The app uses `window.confirm()` for destructive actions (delete, clear data, import overwrite). Playwright's dialog event fires before the dialog blocks.

**Pattern**:
```js
page.on('dialog', dialog => dialog.accept()); // Auto-confirm
// or
page.on('dialog', dialog => dialog.dismiss()); // Auto-cancel
```

---

## Decision 8: Test Fixture Organization

**Decision**: Create a shared `fixtures/helpers.js` module with reusable helper functions imported by spec files. No page object model needed — the app is a single page.

**Rationale**: A full Page Object Model is overkill for a single-page app. Helper functions for common operations (inject entries, configure settings, mock weather, navigate to tab) provide reuse without abstraction overhead.

**Helpers needed**:
- `injectEntries(page, entries)` — add entries via addInitScript
- `injectSettings(page, settings)` — add settings via addInitScript
- `mockWeatherAPI(page, response)` — set up route interception
- `createTestEntry(overrides)` — generate a valid entry with defaults
- `clearAppState(page)` — clear localStorage
- `navigateToTab(page, tabName)` — click tab and wait for panel
- `getLocalStorageEntries(page)` — read entries from localStorage
- `getLocalStorageSettings(page)` — read settings from localStorage

---

## Decision 9: CSS Theme Verification

**Decision**: Assert on the `data-theme` attribute of the `<html>` element and spot-check computed CSS custom property values.

**Rationale**: The app switches themes by setting `data-theme` on `<html>`. Custom properties cascade automatically. Checking the attribute is deterministic; checking computed colors validates the cascade.

**Pattern**:
```js
await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
const bgColor = await page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue('--bg-body')
);
```

---

## Decision 10: Hash Routing / Browser History Testing

**Decision**: Verify `page.url()` includes expected hash, and use `page.goBack()` / `page.goForward()` for history navigation tests.

**Rationale**: The app uses `location.hash` for tab routing and `history.pushState` for browser back/forward support. Playwright provides native methods for history navigation.

**Pattern**:
```js
await page.click('[data-tab-target="overview"]');
expect(page.url()).toContain('#overview');
await page.goBack();
expect(page.url()).toContain('#checkin');
```

---

## Decision 11: Test File Organization — JavaScript vs TypeScript

**Decision**: Use plain JavaScript (`.spec.js`) for test files.

**Rationale**: The app itself is vanilla JS. Using JS for tests keeps consistency, avoids a TypeScript compile step, and aligns with the "zero build" philosophy for the test infrastructure. Playwright supports JS natively.

**Alternatives considered**:
- TypeScript: Better IDE support but adds a compilation dependency and configuration.

---

## Decision 12: Parallel vs Serial Test Execution

**Decision**: Run tests in parallel (Playwright default) with isolated browser contexts. Each test gets a fresh page and clean localStorage.

**Rationale**: Tests are independent — each seeds its own localStorage state. Parallel execution maximizes speed toward the <5 minute target.

**Pattern**: Default Playwright behavior — `fullyParallel: true` in config. Each `test()` gets a fresh `BrowserContext` and `Page`.
