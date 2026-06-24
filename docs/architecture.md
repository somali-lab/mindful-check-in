# Mindful Check-in — Architecture Reference

**Created**: 2026-04-12
**Status**: Active

This document captures the technology choices and constraints of the **current implementation** — how the application is built today.

---

## Technology Stack

| Concern | Choice |
|---------|--------|
| Language | Vanilla JavaScript, ES5-compatible |
| Module pattern | IIFEs (`(function () { "use strict"; ... })();`) |
| Global namespace | `MCI` (`window.MCI = window.MCI \|\| {}`) |
| Styling | Plain CSS with custom properties (no preprocessors) |
| Entry point | Single `index.html` — no build step, no bundler, no transpiler |
| Runtime dependencies | Zero — no libraries, no frameworks |
| External services | Open-Meteo Weather API, Open-Meteo Geocoding API (optional) |

### Why ES5?

ES5-compatible code ensures the widest browser support without requiring transpilation. No `let`, `const`, arrow functions, template literals, `class`, or `import`/`export` are used.

---

## Persistence

### Storage Layer

- **Engine**: `localStorage` — sole persistence layer
- **Format**: JSON for all keys
- **Error handling**: All reads wrapped in `try/catch` (parse errors return defaults); all writes wrapped in `try/catch` (quota exceeded → silent degradation)

### Storage Keys (6)

| Key | Type | Content |
|-----|------|---------|
| `local-mood-tracker-entries` | Object | `{ [dateKey]: Entry }` — all check-in entries |
| `local-mood-tracker-settings` | Object | User preferences and component visibility |
| `local-mood-tracker-language` | String | Active language (`"en"` or `"nl"`) |
| `local-mood-tracker-active-tab` | String | Active section (`"checkin"`, `"overview"`, `"settings"`, `"info"`) |
| `local-mood-tracker-overview-ui` | Object | Overview table state (search, filter, sort, page) |
| `local-mood-tracker-weather-cache` | Object | Cached weather responses with TTL timestamps |

The keys live in one place, `MCI.KEYS` (`lib/core.js`). The active emotion-wheel variant is **not** a separate key — it is stored inside settings as `defaultWheelType` and on each entry as `wheelType`.

### Entry Key Format

The first entry of a day uses `YYYY-MM-DD` (e.g., `2026-04-12`); each additional entry the same day uses `YYYY-MM-DD_HHMMSSmmm` (e.g., `2026-04-12_143052123`). `MCI.dateFromKey()` parses both.

---

## File Structure

All app sources live under `src/`:

```
src/index.html               — HTML shell, inline SVG body figure
src/boot.js                  — DOMContentLoaded: calls Module.init() in dependency order
src/lib/core.js              — Event bus, Store, i18n engine, helpers, entry normalization
src/lib/compute.js           — Derived calculations (mood scoring, streaks)
src/data/static.js           — Pure data: wheel variants, mood grid labels, weather codes, body zones
src/data/translations.js     — All translation strings (flat object per language)
src/modules/<name>.js        — One module per feature
src/css/<name>.css           — One stylesheet per concern
```

---

## Module Pattern

### Namespace

Every file is a self-contained IIFE attaching its public API to `MCI`:

```js
(function () {
  "use strict";
  var MCI = window.MCI;
  // private state (IIFE-scoped variables)
  // private functions
  MCI.ModuleName = {
    init: function () { /* cache DOM, bind events, subscribe bus, initial render */ },
    getValue: function () { /* getter for Checkin to collect form state */ },
    setValue: function (v) { /* setter for Checkin to restore form state */ }
  };
})();
```

### Communication

- **Event bus** (`MCI.on`, `MCI.off`, `MCI.emit`) for cross-module communication
- Modules MUST NOT call other modules directly — use events
- Modules own their own rendering — no module tells another what to render
- **Exception**: Checkin may call getter/setter methods on its direct sub-modules (Wheel, Body, Energy, Mood)

### Standard Events

| Event | Emitted by | Payload |
|-------|-----------|---------|
| `settings:changed` | `MCI.saveSettings()` | settings object |
| `language:changed` | `MCI.setLang()` | lang string |
| `entry:saved` | `MCI.saveEntry()` | `{ key, entry }` |
| `entry:deleted` | `MCI.deleteEntry()` | `{ key }` |
| `entries:changed` | `MCI.saveAllEntries()` | — (bulk import / replace) |
| `entry:load` | Checkin | `{ key, entry }` |
| `entry:new` | Checkin | — |
| `entry:request-load` | `MCI.bindEntryClick()`, Overview | `{ key, entry }` |
| `tab:changed` | Nav | route string |
| `theme:changed` | Nav | theme string |
| `navigate:route` | Home | route string |
| `body:toggled` | Body | zones array |
| `energy:set` | Energy | `{ key, value }` or null |
| `mood:selected` | Mood | selection `{ row, col, label, color }` or null |
| `wheel:selected` | Wheel | picked emotion id (string) |
| `weather:fetched` | Weather | weather data object |

---

## Core API (`lib/core.js`)

| Facility | API | Purpose |
|----------|-----|---------|
| Event Bus | `MCI.on(event, fn)`, `MCI.off(event, fn)`, `MCI.emit(event, data)` | Pub/sub for loose coupling |
| Store | `MCI.get(key, fallback)`, `MCI.put(key, value)`, `MCI.del(key)` | localStorage wrapper with JSON parse/stringify and try-catch |
| Typed loaders | `MCI.loadSettings()`, `MCI.loadEntries()`, `MCI.saveEntry(key, entry)`, `MCI.saveSettings(settings)`, `MCI.deleteEntry(key)` | Merge with defaults, normalize, emit events |
| i18n | `MCI.t(key, params)`, `MCI.setLang(lang)` | Translation lookup with `{param}` substitution; scans `[data-t]`, `[data-t-placeholder]`, `[data-t-aria]` |
| Helpers | `MCI.esc(str)`, `MCI.uid()`, `MCI.formatDate(d)`, `MCI.formatTime(d)`, `MCI.todayKey()`, `MCI.timestampKey()`, `MCI.dateFromKey(key)`, `MCI.download(data, filename)`, `MCI.readFile(file, cb)` | HTML escaping, dates, file I/O |
| Normalize | `MCI.normalize(entry)` | Fills missing fields with defaults |

---

## Static Data (`data/static.js`)

| Dataset | Stored as | Content |
|---------|-----------|---------|
| Emotion wheel variants | `MCI.Data.wheels` | 5 variants, each: `{ labelKey, emotions: [{ id, tKey }], colors[] }` |
| Mood grid labels | `MCI.Data.moodLabels` | Two 10×10 arrays (EN, NL) — 100 labels each |
| Mood grid colors | `MCI.Data.moodColors` | 10×10 hex color array |
| Body zone definitions | `MCI.Data.bodyZones` | 26 zone IDs |
| Weather codes | `MCI.Data.weatherCodes` | WMO code → { icon, description } |
| Mood score map | `MCI.Data.moodScores` | emotion name → 1 (negative) / 2 (mixed) / 3 (positive) |

---

## HTML Conventions

| Convention | Attribute | Purpose |
|------------|-----------|---------|
| Component visibility | `data-component="keyName"` | Toggle section visibility based on settings |
| Translatable text | `data-t="translationKey"` | i18n engine replaces inner text |
| Translatable placeholder | `data-t-placeholder="key"` | i18n engine sets placeholder attribute |
| Translatable aria | `data-t-aria="key"` | i18n engine sets aria-label |
| Theme selection | `data-theme-pick="system\|light\|dark"` | Theme button identification |
| Language selection | `data-lang-pick="en\|nl"` | Language button identification |

---

## Entry Data Schema

### Check-in Entry Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `id` | UUID string | auto-generated | `crypto.randomUUID()` with `Math.random` fallback |
| `thoughts` | string | `""` | |
| `coreFeeling` | string | `""` | Must match active variant |
| `wheelType` | enum | from settings | `act`, `plutchik`, `ekman`, `junto`, `extended` |
| `customFeelings` | string | `""` | |
| `energy` | object | `{ physical: null, mental: null, emotional: null }` | Each 0–100 or null |
| `bodySignals` | string[] | `[]` | Zone IDs from 26-zone set |
| `bodyNote` | string | `""` | |
| `energyNote` | string | `""` | |
| `actions` | string | `""` | |
| `note` | string | `""` | |
| `moodRow` | number | `-1` | 0–9 grid row index, -1 = unset |
| `moodCol` | number | `-1` | 0–9 grid column index, -1 = unset |
| `moodLabel` | string | `""` | Resolved mood label at save time |
| `moodColor` | string | `""` | Resolved cell color at save time |
| `moodScore` | number | `2` | 1 (negative) / 2 (mixed) / 3 (positive) |
| `weather` | object or null | `null` | `{ temperature, weathercode, windspeed, description, location }` |
| `updatedAt` | ISO 8601 string | set on save | |

### Settings Fields

| Field | Type | Default |
|-------|------|---------|
| `defaultLanguage` | `"en"` or `"nl"` | `"en"` |
| `theme` | `"system"`, `"light"`, `"dark"` | `"system"` |
| `logo` | logo id (e.g. `"wolf"`, `"cat"`) | `"wolf"` |
| `defaultWheelType` | one of 5 variant IDs | `"act"` |
| `rowsPerPage` | number (5–100) | `7` |
| `overviewMaxChars` | number (20–500) | `120` |
| `toastDuration` | number (seconds) | `4` |
| `energyEmotionalLabel` | `"emotionalSocial"`, `"emotional"`, `"social"` | `"social"` |
| `weatherLocation` | string | `"Amsterdam"` |
| `weatherCoords` | `{ lat, lon, name }` or null | `null` |
| `isDefaultQuickActions` | boolean (still using language defaults) | `true` |
| `quickActions` | string[] | language-specific defaults |
| `components` | 10 booleans | all `true` |
| `reminderEnabled` | boolean | `false` |
| `reminderInterval` | number (minutes) | `120` |
| `reminderDays` | number[] (day indices, 0 = Sunday) | `[1, 2, 3, 4, 5]` |
| `reminderStartHour` | number (0–23) | `8` |
| `reminderEndHour` | number (0–23) | `18` |
| `reminderCustomTitle` | string | `""` |
| `reminderCustomBody` | string | `""` |

### Component Visibility Toggles

`weather`, `thoughts`, `coreFeeling`, `bodySignals`, `energyPhysical`, `energyMental`, `energyEmotional`, `moodMatrix`, `actions`, `note`

---

## External Services

### Open-Meteo Weather API

- **Purpose**: Fetch current weather conditions
- **Data sent**: Geographic coordinates only (latitude, longitude) — never user content
- **Cache**: 1 hour TTL, keyed by rounded coordinates (`"{lat},{lon}"`)
- **Failure handling**: Error state in UI, no crash

### Open-Meteo Geocoding API

- **Purpose**: Convert city name to coordinates
- **Data sent**: City name string
- **Usage**: Settings save only (not on every page load)
