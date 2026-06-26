# Rebuild plan & progress

Clean greenfield rebuild of Mindful Check-in. **The existing app in `src/` stays
fully intact and runnable throughout** — the new app is built independently in
`app/`. Only when the new app passes the full Playwright suite (the acceptance
bar) and the `file://` smoke test do we swap `app/` → `src/`.

## Locked decisions

- **Language:** TypeScript (strict). Compiles away at build — no effect on `file://`.
- **Tooling:** Vite (dev server + build), Vitest (unit), Playwright (E2E, existing
  suite is the bar), Biome (lint + format).
- **Build output = "option C":** one classic IIFE `app.js` + separate `app.css` +
  `fonts/`, relative paths → **double-clickable from `file://`**. No ES modules in
  the output (they are CORS-blocked on `file://`).
- **Architecture:** functional core / imperative shell.
  - `core/` — pure domain logic, no DOM/storage (100% Vitest-able)
  - `infra/` — side effects behind interfaces (Repository pattern for storage:
    localStorage now, IndexedDB swappable later; weather client; notifications)
  - `state/` — one reactive store (single source of truth; replaces the old event bus)
  - `ui/` — **light-DOM custom elements** per domain (no Shadow DOM)
  - `i18n/`, `data/`
- **Domains:** unchanged from the existing app (good decomposition).
- **Storage:** localStorage behind a Repository interface (same 6 keys / schema).
- **`window.MCI` bridge:** exposed for the existing `core-units.spec.js` unit specs.
- **Check-in form = cleanly factored** (decided): each sub-feature (wheel, body, energy,
  mood-matrix, chips, summary, weather) is its OWN light-DOM component subscribing to the
  store; a thin check-in **orchestrator** composes them and handles save/validation.
  Components talk to the store, never to each other — the clean boundaries the old code
  (global bus + direct `Checkin→sub` reach-through) lacked.
- **UI layout/DOM contract preserved** (decided): same screen structure as the existing app
  (summary panel inside the check-in view, weather widget inside the form). Reuse the CSS;
  the existing Playwright selectors stay the acceptance bar. No layout re-architecture.

## Known limitation (unchanged)

- Break reminders use **Web Notifications**, which require a secure context — they
  do **not** work from `file://`, only when served (localhost). Accepted as-is.

## Notes / cleanup spotted

- `CLAUDE.md` references `@architecture.md`, but that file does not exist. Create it
  in Phase 6.

## Phases

| # | Phase | Status | Gate |
|---|-------|--------|------|
| 1 | Tooling + `file://` build proof | ✅ done | `npm run build` → `dist/` opens via `file://` |
| 2 | Pure core domain + Vitest | ✅ done | `vitest` green |
| 3 | Infra + state + i18n + data | ✅ done | `vitest` green |
| 4 | App shell (nav, theme, language) + `window.MCI` bridge | ✅ done | app boots, shell selectors present |
| 5 | Domain UI components | ⬜ todo | per-domain Playwright specs green |
| 6 | Full suite green, swap, docs, commit | ⬜ todo | 384 Playwright + `file://` smoke green |

Baseline: existing suite **384 passed (37.5s)** — this is the bar to match.

## Progress log

- **Phase 1 started.** Created self-contained `app/` project: `package.json`,
  `tsconfig.json` (strict), `vite.config.ts` (classic IIFE output for `file://`),
  `biome.json`, `.gitignore`, skeleton `index.html` + `src/main.ts` + `styles.css`.
  Root `package.json` restored (existing app untouched).
- **Phase 1 DONE.** Installed newest tooling: Vite 8, TypeScript 6, Vitest 4,
  Biome 2. Proven:
  - `npm run build` → `dist/index.html` with a **classic** `<script defer src="./app.js">`
    (the plugin rewrites `type="module"` → `defer`, keeping post-DOM timing without CORS)
    + `assets/style.css`, all relative paths.
  - Headless Chromium loads the built file over the **`file:` protocol**, renders,
    **zero console errors**.
  - Vite dev server serves native ESM over http (200; `src/main.ts` transpiled on the fly).
  - Biome `check` clean with the `recommended` preset; `tsc --noEmit` passes (strict).
- **Phase 2 DONE.** Pure core domain ported to TypeScript (no DOM / no storage):
  - `core/types.ts` — `Entry`, `Energy`, `EntryWeather`, `EntryMap`, `Tier`, `SwingSource`, etc.
  - `core/datetime.ts` — `pad2`, `formatDate`, `formatTime`, `todayKey`, `timestampKey`, `dateFromKey`.
  - `core/entry.ts` — `uid`, `normalize`.
  - `core/scoring.ts` — `calculateStreak`, `computeMoodScore`, `scoreTier`/`energyTier`/
    `valenceTier`/`swingTier`, `computeSwing`.
  - `core/color.ts` — `hasLightBackground`.
  - `data/static.ts` — full static data port (wheels, moodScores, bodyZones, zoneKeys,
    moodLabels, weatherCodes, generated moodColors). Pure, unblocks scoring.
  - **14 Vitest tests** mirror the existing `core-units.spec.js` assertions, all green.
    `tsc --noEmit` (strict) + Biome clean.
  - Deferred to later layers (i18n/view-coupled): `computeStats`, `buildHeatmapData`,
    `weekStripHtml`, `getDayNames`, `findEntryForDay`, `emotionLabel`.
- **Phase 3 DONE.** Infra + state + i18n + data, all unit-tested (44 Vitest tests total):
  - `i18n/translations.ts` — programmatically ported from the original (eval → JSON), so
    100% faithful. **389 EN + 389 NL keys, full parity (0 missing).**
  - `i18n/index.ts` — `lang` signal, `t(key, params)` (EN fallback + `{param}` substitution),
    `setLang`, `defaultQuickActions`.
  - `core/settings.ts` — `Settings` type, `defaultSettings`, `mergeSettings` (per-flag
    component merge + `logo3`→`wolf` migration).
  - `state/signal.ts` — minimal reactive primitive (get/set/subscribe, Object.is dedupe).
  - `state/store.ts` — `Store` class: reactive entries + settings, persisted via Repository;
    `saveEntry`/`deleteEntry`/`replaceAllEntries`/`saveSettings`.
  - `infra/storage.ts` — `Repository` interface + `LocalStorageRepository` +
    `MemoryRepository` (tests). Stable 6 `STORAGE_KEYS`.
  - `infra/weather.ts` — `WeatherService` (fetch + 30-min cache, Open-Meteo, current_weather shape).
  - `infra/notifications.ts` — Web Notifications wrapper (degrades on file://).
  - `core/reminders.ts` — pure `isWithinReminderWindow`.

- **Target bumped to `ESNext`** (tsconfig `target`+`lib`, Vite `build.target`) — latest
  syntax, modern-evergreen + file:// only. Re-verified: tsc + 44 tests + file:// boot green.

- **Phase 4 DONE (vertical slice proven).** Built the app shell + first real domains and
  got their existing Playwright specs green:
  - Reused the original CSS (`app/src/css/`, imported via `app/src/styles.css`) + fonts
    (`app/src/assets/fonts`) + logos/favicon (`app/public/`). CSS/public excluded from Biome.
  - `app/index.html` — shell DOM (nav-rail + header nav-tabs + theme/language switches +
    5 `.view` containers) reproducing the existing semantic hooks.
  - `ui/router.ts` (hash routing, `.is-active` on `[data-route]`+`.view`),
    `ui/theme.ts` (`<html data-theme>`, system via matchMedia, persisted),
    `ui/language.ts` + `ui/dom-i18n.ts` (data-t application, EN/NL),
    `ui/bridge.ts` (`window.MCI` for unit specs), `main.ts` composition root.
  - **Vite gotcha fixed:** the classic-script plugin must be `apply: 'build'` only — in dev
    it was stripping `type="module"` and breaking native ESM.
  - **Green: `theme.spec.js` + `tab-navigation.spec.js` = 16/16** (chromium + mobile).
    Also verified from **file://**: boots, `window.MCI` present, theme toggle works, 0 errors.

- **Phase 5 — check-in scaffold + emotion wheel DONE.** Full check-in view DOM added to
  `app/index.html` (all `data-component` sections, body SVG, mood/energy slots, summary +
  history slots, section-rail) + app-shell footer (per-route action bars) + import/confirm
  dialogs + toast container. `ui/checkin/wheel.ts` (SVG donut component) + `ui/checkin/checkin.ts`
  (orchestrator: loads today's entry, applies component visibility). Router toggles footer
  bars per route. **`emotion-wheel.spec.js` = 18/18 green** (chromium + mobile).
  Next components (build against the now-present scaffold, then run their spec):
  body-signals → energy-meters → mood-matrix → quick-actions/chips → checkin save+validation
  (`#ci-btn-save`/`#ci-btn-new`, collect→normalize→computeMoodScore→store.saveEntry, validation
  needs coreFeeling OR thoughts) → checkin-meta (date/greeting/pill) → section-nav → summary
  panel (`#summary-slot`: streak/total/7-day heat) → entry-loading (overview row → load form).

- **Phase 5 — body signals + minimal save DONE.** `ui/checkin/body.ts` (intensity-cycling
  body figure: tap 0→1→2→3→0, `getZones`/`setZones`, display + reset) wired into the
  orchestrator. The body-signals spec's persistence test forced the save path early, so the
  orchestrator now owns a minimal **collect→validate→normalize→saveEntry** (wheel + body +
  thoughts fields; energy/mood/etc. fill via `normalize`/`computeMoodScore` as those land) plus
  `#ci-btn-new` clear. Added `ui/toast.ts` (`.toast--success`/`--warning`, mirrors old
  `MCI.banner`). **Router bug fixed:** footer action bars are CSS-driven via
  `body[data-active-route]` — the router now sets that attribute instead of inline-styling the
  bars (the inline `display:''` fell back to the CSS `display:none`, hiding `#ci-btn-save`).
  **`body-signals.spec.js` = 10/10 green**; theme/tab-nav/emotion-wheel still 34/34.

## Where to resume (for a fresh context)

Phases 1–4 are complete and green. Foundation + app shell work via dev server AND from
file://. `cd app && npm run test` (44 Vitest), `npm run build` (→ `dist/`, file://-openable).
To run E2E against the new app: start `cd app && npx vite --port 3000 --strictPort`, then
`cd tests && npx playwright test <spec>` (Playwright reuses the server on :3000).

**Next: Phase 5** — port each remaining domain to a light-DOM custom element (or controller
module) inside its `.view`, wiring it to `Store`/`i18n`, and get that domain's existing
Playwright spec(s) green, one domain at a time.

**Dependency insight (revised order):** the domains are interdependent. `weather.spec`
already needs the check-in form (`.emotion-segment`, `#ci-btn-save`, save→toast) AND
settings (`#cfg-location`, `#cfg-btn-save`) — so weather is NOT a clean first slice. The
genuinely independent (entries-only, read) domains come first; the **check-in form is the
lynchpin** most specs depend on. Revised order:
1. **home / summary** (read-only dashboard: streak, total, 7-day heat strip, swings) —
   needs the deferred `computeStats` / `buildHeatmapData` / `weekStripHtml` / swings.
   NOTE: `summary.spec` reads `#summary-slot` **inside the check-in view** (`/#checkin`);
   4/5 tests need only injected entries, but 1 needs the form (save). So the check-in
   view scaffold + summary panel come together; the full form follows.
2. **overview** (read-only table: render, pagination, search, filter).
3. **check-in form** (the big one): wheel, body, energy, mood, chips, meta, save +
   validation, weather widget (lives in the form). Unblocks weather + save-validation specs.
4. **settings** (general/components/actions/reminders/portability) — unblocks weather geocoding.
5. info/heatmap, export/import, demo, confirm-modal, entry load/delete, edge-cases.

Then run the FULL suite (384) + add the file:// smoke test, swap `app/` → `src/`, write
`architecture.md`, update `CLAUDE.md`.
