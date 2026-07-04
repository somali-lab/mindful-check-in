# mindful-check-in Development Guidelines

Guidance for AI coding assistants working in this repo. See also `CLAUDE.md` and `docs/architecture.md`.

## Active Technologies
- TypeScript (strict — `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, …), zero shipped runtime dependencies
- Vite (dev + build), Vitest (unit), Playwright (E2E), Biome (lint/format)
- UI: plain TS classes rendering light DOM — no framework, no Shadow DOM
- Styling: hand-written CSS with custom properties (light + dark tokens); no preprocessor
- `localStorage` — 6 JSON keys: entries, settings, language, overview UI state, weather cache, quadrant
- Build output: one classic IIFE `app.js` + `assets/style.css` (relative paths → double-clickable from `file://`), plus `mindful-check-in.html` (whole app inlined into one self-contained file)

## Project Structure

```text
src/      — application source (index.html, main.ts, core/, infra/, state/, ui/, i18n/, data/, css/, assets/)
public/   — favicon + logos served at the web root
docs/     — architecture reference
tests/    — Playwright E2E suite
legacy-src/ — unmaintained vanilla-ES5 predecessor (reference / rollback only — do not edit)
```

## Commands

- `npm run dev` — Vite dev server (native ESM, HMR) on http://localhost:3000
- `npm run build` — type-check (`src/` + `vite.config.ts`) then `vite build` → `dist/` + single-file `dist/mindful-check-in.html`
- `npm test` — Vitest (`src/**/*.test.ts`); `npm run test:watch` to watch
- `cd tests && npx playwright test` — Playwright E2E (auto-starts Vite on :3000; chromium + Pixel-7)
- `npm run lint` / `npm run format` — Biome

## Code Style

TypeScript for all app code under `src/`. No `any`/unsafe casts/non-null assertions — coerce untrusted data at the boundary instead. Test files may use whatever the test runner supports.

<!-- MANUAL ADDITIONS START -->

## Architecture — functional core / imperative shell

All frontend code MUST follow this architecture. This section defines the rules.

### Layers

```
src/
  index.html    — DOM shell (view sections, dialogs, toast container)
  main.ts       — composition root: build repo + store + services, wire the views
  core/         — pure domain logic, no DOM/storage/signals (datetime, entry normalize, scoring,
                  stats, color, reminders, demo, settings, quadrant, types) — unit-testable without mocks
  infra/        — side effects behind interfaces: Repository (storage.ts), WeatherService (weather.ts),
                  Notifications (notifications.ts)
  state/        — reactivity: signal.ts (primitive), store.ts (single source of truth),
                  load-request.ts (entryLoadRequest signal)
  ui/           — light-DOM components, one folder per screen (checkin, home, overview, quadrant,
                  settings, info) + shell/ (router, theme, language, reminders) + common/ (dom, toast, confirm)
  i18n/         — translations.ts (EN+NL tables, pure data) + index.ts (t, emotionLabel, lang signal)
  data/         — static.ts (wheels, mood grid, body zones, weather codes, mood scores)
  css/          — one stylesheet per concern, @import-ed via src/styles.css
```

### Reference

The full layer contract, `Store`/`signal` API, storage keys, entry/settings schema, and HTML conventions (`data-component`, `data-t` / `-placeholder` / `-aria` / `-title`, `data-theme-pick`, `data-lang-pick`) are documented once in **[docs/architecture.md](../docs/architecture.md)** — the canonical reference. The rules below are what to follow when generating code.

### Dependency rule

`ui → anything below it`, `state → core/infra`, `infra → core`, `core → data + i18n/translations + types`, `data → types`. Pure data modules (`data/static.ts`, `i18n/translations.ts`) are importable from anywhere; **signals, DOM, and storage are not.**

- Only `ui/` and `state/` may touch signals.
- Only `infra/` (and callers holding a `Repository`) touches storage.
- Only `ui/` touches the DOM.
- Core never imports `i18n/index` — anything language-, theme- or user-dependent enters core as a **parameter**.

### Reactivity & communication (CRITICAL)

1. **`Store` is the single source of truth and the only writer of storage.** Mutations (`saveEntry`, `deleteEntry`, `replaceAllEntries`, `saveSettings`, `load/saveLanguage`, `load/saveOverviewUI`, `clearAllData`) **persist then notify**, and flag `persistError` on write failure. UI components never hold a `Repository`.

2. **Components subscribe to the store; they never call each other.** Each owns its own rendering. No component tells another what to re-render.

3. **The check-in orchestrator (`ui/checkin/checkin.ts`) is the one exception** — it composes the form sub-components (wheel, body, energy, mood, chips, meta, summary, history, section-nav) and owns collect → validate → `computeMoodScore` → `store.saveEntry`.

4. **Cross-view "load this entry into the form"** flows through the `entryLoadRequest` signal (`state/load-request.ts`), never a direct call.

5. **Component lifecycle** — components extend the `Component` base (`ui/common/component.ts`): signal subscriptions go through `this.listen(...)` (tracked, removable via `destroy()`); the full-render entry point is conventionally named `render()`. In the app, components are singletons created once in `main.ts` and views are CSS-toggled, never unmounted.

### i18n — never hardcode UI text

Bilingual (EN + NL). All user-facing strings live in `src/i18n/translations.ts`, applied via `data-t` / `data-t-placeholder` / `data-t-aria` / `data-t-title` attributes (or `t(key, params)` in TS; `emotionLabel(id)` for emotions). Dynamic keys are fine. Any new UI string must be added to **both** the `en` and `nl` blocks.

### What NOT to do

- Do NOT reintroduce `type="module"` into the built HTML — the `file://`-safe classic bundle must stay a single IIFE with relative paths
- Do NOT add runtime dependencies (no UI libraries/frameworks)
- Do NOT use `any`, unsafe casts, or non-null assertions — coerce at the boundary (`normalize`, `mergeSettings`, `mergeQuadrant`)
- Do NOT let components call each other — go through the store or `entryLoadRequest`
- Do NOT put business logic or state hydration in `main.ts` beyond wiring
- Do NOT touch the DOM outside `ui/`, storage outside `infra/`, or signals outside `ui/`/`state/`
- Do NOT import `i18n/index` from `core/` — pass language-dependent data in as parameters
- Do NOT hardcode display text in HTML/TS — add keys to both EN and NL
- Do NOT edit `legacy-src/` — it is a frozen reference/rollback only

<!-- MANUAL ADDITIONS END -->
