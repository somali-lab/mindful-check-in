# Mindful Check-in — Architecture Reference

**Status**: Active — describes the current TypeScript + Vite implementation under `src/`.
**Predecessor**: a vanilla-ES5 build is preserved unmaintained in `legacy-src/` (reference / rollback only).

---

## Technology Stack

| Concern | Choice |
|---------|--------|
| Language | TypeScript, strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, …) |
| Tooling | Vite (dev + build), Vitest (unit), Playwright (E2E), Biome (lint/format) |
| UI | Plain TS classes rendering light DOM — **no framework, no Shadow DOM** |
| Styling | Hand-written CSS with custom properties (light + dark tokens); no preprocessor |
| Build output | One classic IIFE `app.js` + `assets/style.css`, relative paths → **double-clickable from `file://`** |
| Runtime dependencies | Zero shipped — no UI libraries/frameworks |
| External services | Open-Meteo Weather + Geocoding APIs (optional, weather widget only) |

### Why a classic (non-module) build?

ES-module scripts are CORS-blocked under the `file:` protocol. The Vite `classic-script` plugin (build-only) rewrites the built HTML's `type="module"` to `defer` and emits a single IIFE bundle, so `dist/index.html` runs by double-click while dev keeps native ESM/HMR.

---

## Layered architecture — functional core / imperative shell

```
src/
  index.html        — DOM shell (5 .view sections, dialogs, toast container)
  main.ts           — composition root: build repo + store + services, wire the views
  core/             — domain logic, deterministic* (no DOM/storage/signals) — unit-testable without mocks
    datetime.ts       pad/format/parse keys, weekday headers
    entry.ts          uid(), normalize() (fills + coerces an untrusted entry)
    scoring.ts        calculateStreak, computeMoodScore, tiers, computeSwing
    stats.ts          computeStats, weekStripDays, buildHeatmapData, entrySpanDays
    color.ts          hasLightBackground (text-contrast)
    reminders.ts      isWithinReminderWindow
    demo.ts           generateDemoEntries(lang)
    settings.ts       Settings type, defaultSettings, mergeSettings (boundary coercion)
    types.ts          Entry, Energy, EntryWeather, EntryMap, Tier, Swing*, WheelType …
  infra/            — side effects behind interfaces
    storage.ts        Repository interface + LocalStorageRepository + MemoryRepository
    weather.ts        WeatherService (geocode + fetch + 30-min cache)
    notifications.ts  Web Notifications wrapper (degrades on file://)
  state/            — reactivity (single source of truth)
    signal.ts         minimal get/set/subscribe primitive (Object.is dedupe)
    store.ts          Store: reactive entries + settings, persisted via Repository
    load-request.ts   entryLoadRequest signal (overview/history → check-in form)
  ui/               — light-DOM components (one per domain) + shell wiring
    checkin/  home/  overview/  settings/  info/   — one folder per screen (home/ also holds weather.ts)
    shell/            app-level wiring started once in main.ts: router theme language reminders
    common/           shared UI helpers/services used across screens: dom dom-i18n toast confirm
  i18n/             — translations.ts (EN+NL tables + quick-action seeds; pure data) + index.ts (t, emotionLabel, lang signal)
  data/             — static.ts (wheels, mood grid labels/colors, body zones, weather codes, mood scores)
  css/              — one stylesheet per concern, @import-ed via src/styles.css
  assets/           — self-hosted fonts + logos
public/             — favicon + logos served at the web root
```

**Dependency rule:** `ui → anything below it`, `state → core/infra`, `infra → core`, `core → data + i18n/translations + types`, `data → types`. The point is not the import count but what an import drags in: **pure data modules (`data/static.ts`, `i18n/translations.ts`) are importable from anywhere; signals, DOM, and storage are not.** Only `ui/` and `state/` may touch signals; only `infra/` (and callers holding a `Repository`) touches storage; only `ui/` touches the DOM. Core never imports `i18n/index` (that would pull in the mutable `lang` signal — anything language-, theme- or user-dependent enters core as a parameter).

\* Core is deterministic with two accepted exceptions: the clock (`todayKey()`, `updatedAt`) and `uid()`'s randomness. Everything else: same inputs → same outputs.

### Reactivity & communication

- **`signal<T>`** — holds a value, notifies subscribers on change, skips no-op sets (`Object.is`), returns an unsubscribe fn, copies listeners before dispatch (safe unsubscribe mid-emit).
- **`Store`** — the single source of truth. Exposes `entries` / `settings` (read-only signals) + `persistError`; mutations (`saveEntry`, `deleteEntry`, `replaceAllEntries`, `saveSettings`) **persist then notify**, and flag `persistError` if a write fails (e.g. quota).
- **Components subscribe to the store; they never call each other.** Each owns its rendering. The check-in **orchestrator** (`ui/checkin/checkin.ts`) is the one exception: it composes the form sub-components (wheel, body, energy, mood, chips, meta, summary, history, section-nav) and owns collect → validate → `computeMoodScore` → `store.saveEntry`. Cross-view "load this entry into the form" flows through the `entryLoadRequest` signal, not a direct call.
- **Lifecycle:** components are singletons created once in `main.ts`; views are CSS-toggled, never unmounted — so subscriptions are intentionally never torn down.

---

## Persistence

`localStorage` only, JSON per key; all reads/writes wrapped in try/catch (parse error → default; write failure → `persistError` + degrade). Untrusted data is coerced at the boundary by `normalize` (entries) and `mergeSettings` (settings).

### Storage keys (6)

| Key | Type | Content |
|-----|------|---------|
| `local-mood-tracker-entries` | Object | `{ [dateKey]: Entry }` — all check-in entries |
| `local-mood-tracker-settings` | Object | User preferences and component visibility |
| `local-mood-tracker-language` | String | Active language (`"en"` or `"nl"`) |
| `local-mood-tracker-active-tab` | String | Active route (`"home"`, `"checkin"`, `"overview"`, `"settings"`, `"info"`) |
| `local-mood-tracker-overview-ui` | Object | Overview table state (search, filter, sort, page) |
| `local-mood-tracker-weather-cache` | Object | `{ ts, data }` cached current-weather reading |

Keys live in one place: `STORAGE_KEYS` (`infra/storage.ts`). The active wheel variant is not a separate key — it's `defaultWheelType` in settings and `wheelType` on each entry.

### Entry key format

First entry of a day: `YYYY-MM-DD` (e.g. `2026-04-12`). Additional same-day entries: `YYYY-MM-DD_HHMMSSmmm` (e.g. `2026-04-12_143052123`). `dateFromKey()` parses both and returns `null` for malformed keys.

---

## Entry data schema

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `id` | UUID string | auto | `crypto.randomUUID()` with `Math.random` fallback |
| `thoughts` | string | `""` | |
| `coreFeeling` | string | `""` | Emotion id within the active variant |
| `wheelType` | `WheelType` | `"act"` | `act`, `plutchik`, `ekman`, `junto`, `extended` (validated) |
| `customFeelings` | string | `""` | Comma-list backing the feeling chips |
| `energy` | object | `{ physical:null, mental:null, emotional:null }` | each 0–100 or null |
| `energyNote` | string | `""` | |
| `bodySignals` | string[] | `[]` | zone ids (26-zone set) |
| `bodyNote` | string | `""` | |
| `moodRow` | number | `-1` | 0–9 grid row, -1 = unset |
| `moodCol` | number | `-1` | 0–9 grid column, -1 = unset |
| `moodLabel` | string | `""` | label at save time (UI re-derives per active language) |
| `moodColor` | string | `""` | cell colour at save time (persisted for export round-trip) |
| `actions` | string | `""` | comma-list backing the action chips |
| `note` | string | `""` | |
| `weather` | object \| null | `null` | `{ temperature?, weathercode?, windspeed?, description, location }` (numerics coerced) |
| `moodScore` | number | `2` | 1 (negative) / 2 (mixed) / 3 (positive) |
| `updatedAt` | ISO 8601 string | set on save | |

### Settings fields

| Field | Type | Default |
|-------|------|---------|
| `defaultLanguage` | `"en"`/`"nl"` | `"en"` |
| `theme` | `"system"`/`"light"`/`"dark"` | `"system"` |
| `logo` | logo id | `"wolf"` (legacy `logo3` migrates to `wolf`) |
| `defaultWheelType` | one of 5 variant ids | `"act"` |
| `rowsPerPage` | number (5–100) | `7` |
| `overviewMaxChars` | number (20–500) | `120` |
| `toastDuration` | number (seconds) | `4` |
| `energyEmotionalLabel` | `"emotionalSocial"`/`"emotional"`/`"social"` | `"social"` |
| `weatherLocation` | string | `"Amsterdam"` |
| `weatherCoords` | `{ lat, lon, name }` \| null | `null` |
| `isDefaultQuickActions` | boolean | `true` |
| `quickActions` | string[] | language defaults |
| `components` | 10 booleans | all `true` |
| `reminderEnabled` | boolean | `false` |
| `reminderInterval` | number (min) | `120` |
| `reminderDays` | number[] (0=Sun) | `[1,2,3,4,5]` |
| `reminderStartHour` / `reminderEndHour` | number (0–23) | `8` / `18` |
| `reminderCustomTitle` / `reminderCustomBody` | string | `""` |

`mergeSettings` coerces every field to its default's type (finite numbers, same-typed array elements, forced booleans) before trusting persisted/imported JSON.

### Component-visibility toggles

`weather`, `thoughts`, `coreFeeling`, `bodySignals`, `energyPhysical`, `energyMental`, `energyEmotional`, `moodMatrix`, `actions`, `note`.

---

## HTML / DOM conventions

| Convention | Attribute | Purpose |
|------------|-----------|---------|
| Component visibility | `data-component="key"` | hidden when the matching settings flag is off |
| Translatable text / placeholder / aria / title | `data-t` / `data-t-placeholder` / `data-t-aria` / `data-t-title` | applied by `ui/common/dom-i18n.ts` |
| Active route | `body[data-active-route]` + `.is-active` on `[data-route]`/`.view` | CSS-driven view + footer-bar switching |
| Theme / language pick | `data-theme-pick` / `data-lang-pick` | switch buttons |
| State classes | `.is-active` / `.is-selected` / `.is-on` | `is-active` = the current tab/mode/route/section; `is-selected` = the chosen value in a single-choice control (wheel segment, mood cell, theme/language button); `is-on` = an element of a multi-select or fill control (body part, energy segment, action pill) |

The DOM shell + element ids are the stable contract the Playwright suite selects on.

---

## External services

- **Open-Meteo Weather** — current conditions; sends coordinates only; 30-min cache (`{ts,data}`); failure → graceful "unavailable", never crashes.
- **Open-Meteo Geocoding** — city name → coordinates; used when resolving a configured `weatherLocation`.
- Notifications: Web Notifications require a secure context, so break reminders work when served (localhost), **not** from `file://` — accepted.

---

## Build & test

- `npm run dev` — Vite dev (native ESM, HMR).
- `npm run build` — `tsc --noEmit && vite build` → `dist/` (file://-openable).
- `npm test` — Vitest (`src/**/*.test.ts`, pure core/infra/state).
- `cd tests && npx playwright test` — Playwright auto-starts Vite on `:3000`; chromium + Pixel-7.
