# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Mindful Check-in is a private, offline-first mood/check-in web app. Vanilla JavaScript, **no build step, no dependencies, no framework**. All app sources live under **`src/`** — a single `src/index.html` plus plain JS/CSS files (`src/boot.js`, `src/lib/`, `src/modules/`, `src/data/`, `src/css/`, `src/assets/`, `src/favicon.svg`). Tests, docs and config stay at the repo root.

## Working style

- Don't assume and don't hide confusion — surface tradeoffs and ask when anything is unclear. Be critical: push back and ask for clarification rather than telling the user what they want to hear.
- Base decisions on verified facts and data, not guesses. If you don't have the data, ask for it or run an experiment to get it.
- Write the minimum code that solves the problem — nothing speculative. Touch only what the task requires, and clean up only your own mess.
- Define success criteria up front and loop until they're verified.
- Don't make changes outside the task's scope without confirming first.
- All code and comments in English unless asked otherwise.
- No data migrations or backwards-compatibility shims unless explicitly requested, and don't document or justify differences from previous versions of the code unless asked.

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
- Persistence is `localStorage` only (6 JSON keys). Full module contract, event list, storage keys, and entry schema: @architecture.md

## i18n — never hardcode UI text

The app is bilingual (EN + NL). All user-facing strings live in `src/data/translations.js` and are applied via `data-t` / `data-t-placeholder` / `data-t-aria` attributes (or `MCI.t(key)` in JS). Any new UI string must be added to **both** the `en` and `nl` blocks; never hardcode display text in HTML/JS.

## Styling

Hand-written CSS with custom properties; design tokens (light + dark palettes) live in `src/css/base.css`, one stylesheet per concern. **No Tailwind / preprocessor.** Fonts are self-hosted in `src/assets/fonts/` (loaded via `src/css/fonts.css`) to keep the app fully offline with no external requests.

## Before a change is "done"

1. Source stays ES5 (see above).
2. Run the Playwright tests (`cd tests && npx playwright test`) and ensure they pass.
3. Visually verify in the browser — serve and screenshot the affected view (see `/screenshot`).
4. Any new UI text added to both EN and NL in `src/data/translations.js`.
5. Share work in small increments. After verification, stage **only** the files relevant to the task and make **one** Conventional Commit directly to `main` — unless the user says not to commit or to leave changes unstaged. Use a scoped message: `feat(area): summary` (prefixes `feat`/`fix`/`refactor`/`style`/`docs`/`chore`/`test`; area = the affected module or view, e.g. `nav`, `settings`, `wheel`).

## Testing notes

- Cover both the happy path and the sad path (error/edge conditions), not just the success case.
- Any check you run by hand while working that isn't already in the suite should be added to it.
- Tests import `test` from `tests/fixtures/` (use `base.js`, or `coverage.js` when `COVERAGE=1`); the base fixture mocks the Open-Meteo weather/geocoding APIs (no real network). Helpers: `injectEntries`, `injectSettings`, `createTestEntry`.
- Clicking SVG elements (emotion wheel, body figure) in tests requires `dispatchEvent('click')` to bypass overlap.

## Bugs and scope

- When you hit a bug, first reproduce it. If it reproduces, add a failing test before fixing it, then make the test pass.
- For a pre-existing bug outside your task, apply the Boy Scout Rule: leave the code cleaner than you found it. Fix it if it's safe and small; otherwise note it in your summary. Never introduce new regressions.

## Summarizing your work

At the end of a task, write a concise summary of what changed and why — a table works well (file/change/reason) — including any tradeoffs you weighed. No filler. List any additional issues or improvements you spotted but didn't address in a separate section, so the reviewer can decide whether to tackle them now or later.
