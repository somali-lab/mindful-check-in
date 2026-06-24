# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Mindful Check-in is a private, offline-first mood/check-in web app. Vanilla JavaScript, **no build step, no dependencies, no framework**. All app sources live under **`src/`** — a single `src/index.html` plus plain JS/CSS files (`src/boot.js`, `src/lib/`, `src/modules/`, `src/data/`, `src/css/`, `src/assets/`, `src/favicon.svg`). Tests, docs and config stay at the repo root.

## Commands

- Run locally: `npm run dev` (= `npx serve src -p 3004`). The app must be served over HTTP, not opened as `file://` (Web Notifications + fetch).
- Tests: `cd tests && npx playwright test` (Playwright auto-serves the app on `http://localhost:3000`; runs desktop chromium + Pixel-7 mobile). Filter with `--project=chromium`, `-g "<name>"`, `--headed --workers=1`.
- Coverage: `cd tests && COVERAGE=1 npx playwright test` → report at `tests/coverage/report.html`.
- Visual demo walkthrough: `cd tests/demo && npx playwright test` (headed, ~1.5 min).

## Hard constraint: ES5 only

All JS in `src/lib/`, `src/modules/`, `src/data/`, and `src/boot.js` must be **ES5-compatible**. Do NOT use `const`/`let`, arrow functions, `class`, template literals (backticks), `import`/`export`, or destructuring. Use `var`, `function`, string concatenation, and IIFEs. (Test files under `tests/` are modern JS and exempt.)

## Architecture

- Every source file is an IIFE attaching its public API to the single global `window.MCI` (e.g. `MCI.Wheel = { init, ... }`). `src/boot.js` calls each module's `init()` in dependency order on `DOMContentLoaded`.
- Modules communicate **only** via the event bus (`MCI.on` / `MCI.off` / `MCI.emit`) — no direct module-to-module calls. Exception: `Checkin` may call getters/setters on its sub-modules `Wheel`, `Body`, `Energy`, `Mood`. Each module owns its own rendering.
- `src/lib/core.js` = event bus, localStorage Store (`MCI.get/put/del`), i18n, helpers, entry normalization. `src/lib/compute.js` = mood scoring / streaks. `src/data/static.js` = wheel/mood/weather/body data. `src/data/translations.js` = all UI strings.
- Persistence is `localStorage` only (7 JSON keys). Full module contract, event list, storage keys, and entry schema: @architecture.md

## i18n — never hardcode UI text

The app is bilingual (EN + NL). All user-facing strings live in `src/data/translations.js` and are applied via `data-t` / `data-t-placeholder` / `data-t-aria` attributes (or `MCI.t(key)` in JS). Any new UI string must be added to **both** the `en` and `nl` blocks; never hardcode display text in HTML/JS.

## Styling

Hand-written CSS with custom properties; design tokens (light + dark palettes) live in `src/css/base.css`, one stylesheet per concern. **No Tailwind / preprocessor** — ignore `.github/workflows/build-tw-css.yml`, it is stale and does not apply to this codebase. Fonts are self-hosted in `src/assets/fonts/` (loaded via `src/css/fonts.css`) to keep the app fully offline with no external requests.

## Before a change is "done"

1. Source stays ES5 (see above).
2. Run the Playwright tests (`cd tests && npx playwright test`) and ensure they pass.
3. Visually verify in the browser — serve and screenshot the affected view (see `/screenshot`).
4. Any new UI text added to both EN and NL in `src/data/translations.js`.
5. Commit messages use Conventional Commits (`feat:`, `fix:`, …); commit directly to `main`.

## Testing notes

- Tests import `test` from `tests/fixtures/` (use `base.js`, or `coverage.js` when `COVERAGE=1`); the base fixture mocks the Open-Meteo weather/geocoding APIs (no real network). Helpers: `injectEntries`, `injectSettings`, `createTestEntry`.
- Clicking SVG elements (emotion wheel, body figure) in tests requires `dispatchEvent('click')` to bypass overlap.
