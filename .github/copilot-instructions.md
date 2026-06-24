# mindful-check-in Development Guidelines

Guidance for AI coding assistants working in this repo. See also `CLAUDE.md` and `docs/architecture.md`.

## Active Technologies
- Vanilla JavaScript (ES5-compatible IIFEs, `"use strict"`), zero runtime dependencies, no build step
- `localStorage` — 6 JSON keys: entries, settings, language, active tab, overview UI state, weather cache
- Tests: `@playwright/test` (dev-only), served via `npx serve` — test files are modern JS (ES2020+)

## Project Structure

```text
src/      — application source (index.html, boot.js, lib/, modules/, data/, css/, assets/)
docs/     — architecture reference
tests/    — Playwright E2E suite
```

## Commands

- `npm run dev` — serve the app on http://localhost:3004
- `cd tests && npx playwright test` — run the E2E suite

## Code Style

ES5 for all app code under `src/` (no `let`/`const`/arrow functions/`class`/template literals/modules). Test files may use modern JS.

<!-- MANUAL ADDITIONS START -->

## JavaScript Architecture

All frontend JavaScript MUST follow this architecture. This section defines the rules.

### Namespace & Module Pattern

- Single global namespace: `MCI` (`window.MCI = window.MCI || {}`)
- Every file is an IIFE: `(function () { "use strict"; var MCI = window.MCI; ... })();`
- ES5 syntax only — no `let`, `const`, arrow functions, template literals, `class`, or ES modules
- Zero runtime dependencies

### File Structure

All app sources live under `src/`.

```
src/lib/core.js          — Event bus, Store, i18n engine, helpers, entry normalization
src/data/static.js       — Pure data: wheel variants, mood grid labels, weather codes, body zones
src/data/translations.js — All translation strings (flat object per language)
src/modules/<name>.js    — One module per feature (checkin, overview, settings, dashboard, etc.)
src/boot.js              — DOMContentLoaded: only calls <Module>.init() in dependency order
```

### Reference

The full Core API (`MCI.on/off/emit`, Store, typed loaders, i18n, helpers, `normalize`), the standard event list with payloads, the data layer and the HTML conventions (`data-component`, `data-t` / `-placeholder` / `-aria`, `data-theme-pick`, `data-lang-pick`) are documented once in **[docs/architecture.md](../docs/architecture.md)** — the canonical reference. The rules below are what to follow when generating code.

### Module Contract

Every module MUST follow this pattern:

```js
(function () {
  "use strict";
  var MCI = window.MCI;

  // Private state — never exposed
  var _localVar = null;

  // Private functions
  function doSomething() { ... }

  // Public API — attach to MCI.<ModuleName>
  MCI.MyModule = {
    init: function () {
      // 1. Cache DOM references
      // 2. Bind event listeners
      // 3. Subscribe to bus events: MCI.on("event:name", handler)
      // 4. Initial render
    },
    // Getter/setter methods for Checkin to collect/restore form state
    getValue: function () { return _localVar; },
    setValue: function (v) { _localVar = v; /* re-render */ }
  };
})();
```

### Communication Rules (CRITICAL)

1. **Modules MUST NOT call other modules directly** — use the event bus
   - WRONG: `MCI.Checkin.renderSummary()` from Settings
   - RIGHT: `MCI.emit("settings:changed", settings)` → Checkin listens with `MCI.on("settings:changed", fn)`

2. **Store functions emit events** — `MCI.saveSettings()` emits `"settings:changed"`, `MCI.saveEntry()` emits `"entry:saved"`, `MCI.deleteEntry()` emits `"entry:deleted"`. Modules subscribe to these.

3. **Modules own their own rendering** — When a module receives a bus event, it decides what to re-render. No other module tells it what to do.

4. **Allowed direct references**:
   - Modules MAY call `MCI.t()`, `MCI.esc()`, `MCI.loadSettings()`, `MCI.loadEntries()` and other core helpers
   - Modules MAY read `MCI.Data.*` for static data (wheels, zones, weather codes)
   - Checkin MAY call getter/setter methods on sub-modules it orchestrates (`MCI.Wheel.getPicked()`, `MCI.Body.getZones()`, `MCI.Energy.getValues()`, `MCI.Mood.getSelection()`, `MCI.CheckinMeta.getOverrideKey()`) and may read `MCI.Weather.getCurrent()` / `MCI.Nav.activeRoute()`. The `CheckinChips`/`CheckinMeta` helpers otherwise react to the entry-lifecycle bus events

5. **boot.js is declarative only** — It calls `<Module>.init()` in dependency order. No business logic, no render calls, no state hydration.

### What NOT to do

- Do NOT use ES6+ syntax (let, const, =>, class, template literals, import/export)
- Do NOT add runtime dependencies
- Do NOT create god-modules that know about other modules' internals
- Do NOT put rendering logic in boot.js
- Do NOT bypass the event bus for cross-module communication
- Do NOT access localStorage directly — always go through MCI.get/put/del or typed loaders
- Do NOT store private state on the MCI namespace — use IIFE-scoped variables

<!-- MANUAL ADDITIONS END -->
