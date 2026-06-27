# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Mindful Check-in is a private, offline-first mood/check-in web app. **TypeScript (strict) + Vite**, light-DOM components, no UI framework. It builds to a single classic IIFE bundle that is **double-clickable from `file://`**. All app sources live under **`src/`** (`src/index.html` is at the repo root; TS under `src/core/`, `src/infra/`, `src/state/`, `src/ui/`, `src/i18n/`, `src/data/`; CSS under `src/css/`; fonts/logos in `src/assets/` and `public/`). Tests, docs and config stay at the repo root.

> The previous vanilla-ES5 implementation is preserved, unmaintained, in **`legacy-src/`** — do not edit it; it's a reference/rollback only.

## Working style

- Don't assume and don't hide confusion — surface tradeoffs and ask when anything is unclear. Be critical: push back and ask for clarification rather than telling the user what they want to hear.
- Base decisions on verified facts and data, not guesses. If you don't have the data, ask for it or run an experiment to get it.
- Write the minimum code that solves the problem — nothing speculative. Touch only what the task requires, and clean up only your own mess.
- Define success criteria up front and loop until they're verified.
- Don't make changes outside the task's scope without confirming first.
- All code and comments in English unless asked otherwise.
- No data migrations or backwards-compatibility shims unless explicitly requested, and don't document or justify differences from previous versions of the code unless asked.

## Commands

- Run locally: `npm run dev` (Vite dev server, native ESM over HTTP). Serve over HTTP, not `file://`, during development (Web Notifications + fetch need a server/secure context).
- Build: `npm run build` (`tsc --noEmit && vite build` → `dist/`). The output is one classic `app.js` + `assets/style.css` + relative paths, so `dist/index.html` is double-clickable from `file://`.
- Unit tests: `npm test` (Vitest, `src/**/*.test.ts`). `npm run test:watch` to watch.
- E2E tests: `cd tests && npx playwright test` (Playwright auto-starts Vite on `http://localhost:3000`; runs desktop chromium + Pixel-7 mobile). Filter with `--project=chromium`, `-g "<name>"`, `--headed --workers=1`.
- Lint/format: `npm run lint` / `npm run format` (Biome).

## Hard constraints

1. **`file://`-safe build.** The build must stay a single classic (non-module) script with relative paths so `dist/index.html` runs by double-click — ES modules are CORS-blocked on `file://`. The Vite `classic-script` plugin (build-only) handles this; don't reintroduce `type="module"` into the built HTML.
2. **Strict TypeScript stays clean.** `tsc --noEmit` must pass with the existing strict flags (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, …). Avoid `any`/unsafe casts/non-null assertions; coerce untrusted data at the boundary instead.
3. **Biome clean.** `npm run lint` must pass (CSS under `src/css/` is excluded from Biome — it's hand-written).

## Architecture — functional core / imperative shell

- **`core/`** — pure domain logic, no DOM/storage (datetime, entry `normalize`, scoring/streaks/swings, stats, color, reminders window, demo generator, types). 100% Vitest-able.
- **`infra/`** — side effects behind interfaces: `Repository` (localStorage now, swappable) for the 6 storage keys; `WeatherService` (Open-Meteo + cache); Web Notifications wrapper.
- **`state/`** — one reactive primitive (`signal`) + a single `Store` (the single source of truth; replaces the old event bus). UI subscribes to `store.entries` / `store.settings`; mutations go through `Store` methods which persist then notify.
- **`ui/`** — plain-class light-DOM components per domain, each subscribing to the store and owning its own rendering. **Components talk to the store, never to each other.** The check-in **orchestrator** (`ui/checkin/checkin.ts`) composes the form sub-components and owns collect/save/validation. Cross-view "load this entry into the form" goes through the `entryLoadRequest` signal (`state/load-request.ts`), not direct reach-in. Shared UI helpers live in `ui/common/` (e.g. `ui/common/dom.ts`); app-level wiring (router, theme, language, reminders, bridge) lives in `ui/shell/`.
- **`main.ts`** — composition root: build repo + store + services, then wire the views.
- **`ui/shell/bridge.ts`** exposes pure core fns + static data on `window.MCI` for the existing `core-units.spec.js` unit specs (no store handle — no global mutation surface).
- Persistence is `localStorage` only (6 JSON keys). Full layer contract, storage keys, and entry schema: @docs/architecture.md

## i18n — never hardcode UI text

The app is bilingual (EN + NL). All user-facing strings live in `src/i18n/translations.ts` and are applied via `data-t` / `data-t-placeholder` / `data-t-aria` / `data-t-title` attributes (or `t(key, params)` in TS; `emotionLabel(id)` for emotions). Dynamic keys are fine (`t('em' + Id)`, `t('swingTier' + n)`). Any new UI string must be added to **both** the `en` and `nl` blocks; never hardcode display text in HTML/TS.

## Styling

Hand-written CSS with custom properties; design tokens (light + dark palettes) live in `src/css/base.css`, one stylesheet per concern, all `@import`ed via `src/styles.css` (which `main.ts` imports). **No Tailwind / preprocessor.** Fonts are self-hosted in `src/assets/fonts/` (loaded via `src/css/fonts.css`) to keep the app fully offline with no external requests.

## Before a change is "done"

1. `npx tsc --noEmit` clean and `npm run lint` clean (see Hard constraints).
2. `npm test` (Vitest) green, and `cd tests && npx playwright test` green.
3. Visually verify in the browser — CSS/layout changes aren't caught by the suite; serve and screenshot the affected view (see `/screenshot`), or drive the dev server.
4. Any new UI text added to both EN and NL in `src/i18n/translations.ts`.
5. Share work in small increments. After verification, stage **only** the files relevant to the task and make **one** Conventional Commit directly to `main` — unless the user says not to commit or to leave changes unstaged. Use a scoped message: `feat(area): summary` (prefixes `feat`/`fix`/`refactor`/`style`/`docs`/`chore`/`test`; area = the affected module/view, e.g. `checkin`, `settings`, `wheel`).

## Testing notes

- Cover both the happy path and the sad path (error/edge conditions), not just the success case.
- Any check you run by hand while working that isn't already in the suite should be added to it.
- Playwright specs import `test` from `tests/fixtures/base.js`; the base fixture mocks the Open-Meteo weather/geocoding APIs (no real network). Helpers: `injectEntries`, `injectSettings`, `createTestEntry`.
- Clicking SVG elements (emotion wheel, body figure) in tests requires `dispatchEvent('click')` to bypass overlap.
- Pure logic gets a colocated Vitest (`src/**/*.test.ts`); DOM behaviour gets a Playwright spec.

## Bugs and scope

- When you hit a bug, first reproduce it. If it reproduces, add a failing test before fixing it, then make the test pass.
- For a pre-existing bug outside your task, apply the Boy Scout Rule: leave the code cleaner than you found it. Fix it if it's safe and small; otherwise note it in your summary. Never introduce new regressions.

## Summarizing your work

At the end of a task, write a concise summary of what changed and why — a table works well (file/change/reason) — including any tradeoffs you weighed. No filler. List any additional issues or improvements you spotted but didn't address in a separate section, so the reviewer can decide whether to tackle them now or later.
