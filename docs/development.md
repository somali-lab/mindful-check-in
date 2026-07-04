# Development

Developer guide for Mindful Check-in. For a user-facing overview see the [README](../README.md); for the full technical reference (layer contract, schema, conventions) see [architecture.md](architecture.md).

The app is built with **TypeScript (strict) + Vite**, uses no UI framework, and builds to a single classic bundle that runs straight from disk.

---

## Build & run

```bash
npm install          # first time only
npm run build        # → dist/  (one classic app.js + assets, relative paths)
# then double-click dist/index.html, or:
open dist/index.html
```

`npm run build` type-checks (`src/` + `vite.config.ts`), then emits `dist/` plus `dist/mindful-check-in.html` — the whole app inlined into one self-contained file.

Opening the built `dist/index.html` directly works for the whole app, weather widget included — Open-Meteo sends permissive CORS headers, so `fetch` succeeds from the `file://` origin. Only **reminders** need the app served over HTTP: the Web Notifications API requires a secure context, which `file://` isn't.

For development (native ESM + hot reload):

```bash
npm run dev          # Vite dev server
```

To exercise reminders locally, serve the app over HTTP and enable them in **Settings → Reminders**:

```bash
npm run dev                 # Vite dev server (recommended)
# or serve the built output:
npm run build && npx serve dist
```

Lint/format with Biome: `npm run lint` / `npm run format`.

### Releasing

The `release` GitHub Actions workflow publishes downloadable builds. Push a version tag and it lints, builds, unit-tests, generates release notes from the commits since the previous tag, then attaches `mindful-check-in.html` + `mindful-check-in-dist.zip` to a GitHub Release:

```bash
git tag v1.1.0
git push origin v1.1.0
```

Or run it by hand from **Actions → release → Run workflow**, entering the tag name.

---

## Why a classic (non-module) build?

ES-module scripts are CORS-blocked under the `file:` protocol. The Vite `classic-script` plugin (build-only) rewrites the built HTML's `type="module"` to `defer` and emits a single IIFE bundle, so `dist/index.html` runs by double-click while dev keeps native ESM/HMR. Don't reintroduce `type="module"` into the built HTML.

---

## Project structure

```text
index.html            — DOM shell (views, dialogs, toast container)
src/
  main.ts             — composition root: build store + services, wire the views
  core/               — pure domain logic (datetime, entry, scoring, stats, demo, settings, types)
  infra/              — side effects behind interfaces (storage Repository, weather, notifications)
  state/              — reactive signal + Store (single source of truth)
  ui/                 — light-DOM components per view (checkin/ home/ overview/ quadrant/ settings/ info/) + shell/ + common/
  i18n/               — translations (EN+NL) + t()/emotionLabel
  data/               — static data (wheels, mood grid, body zones, weather codes)
  css/                — one stylesheet per concern (@import-ed via styles.css)
  assets/             — self-hosted fonts + logos
public/               — favicon + logos served at the web root
```

### Architecture

TypeScript + Vite, **functional core / imperative shell**: a pure `core/`, side effects behind interfaces in `infra/`, a single reactive `Store` as the source of truth (`state/`), and plain light-DOM components (`ui/`) that subscribe to the store and never call each other. Builds to a classic IIFE that runs from `file://`.

See [architecture.md](architecture.md) for the full specification: layer contract, storage keys, entry/settings schema, and conventions.

---

## Data format

Entries are stored in `localStorage` under the key `local-mood-tracker-entries` as a JSON object. Keys use the format `YYYY-MM-DD` (first entry of a day) or `YYYY-MM-DD_HHMMSSmmm` (subsequent entries on the same day).

Each entry contains:

```json
{
  "id": "a1b2c3d4-...",
  "thoughts": "...",
  "coreFeeling": "joy",
  "wheelType": "act",
  "customFeelings": "...",
  "energy": { "physical": 70, "mental": 55, "emotional": 60 },
  "bodySignals": ["chest", "left-shoulder"],
  "bodyNote": "...",
  "energyNote": "...",
  "actions": "...",
  "note": "...",
  "moodRow": 2,
  "moodCol": 8,
  "moodLabel": "content",
  "moodColor": "#7cb342",
  "moodScore": 3,
  "weather": { "temperature": 14, "weathercode": 1, "windspeed": 8.5, "description": "Mainly clear", "location": "Amsterdam" },
  "updatedAt": "2026-04-06T09:30:00.000Z"
}
```

Other `localStorage` keys used by the app:

| Key                                | Contents                                   |
|------------------------------------|--------------------------------------------|
| `local-mood-tracker-entries`       | All check-in entries                       |
| `local-mood-tracker-settings`      | User settings                              |
| `local-mood-tracker-language`      | Active language (`en` / `nl`)              |
| `local-mood-tracker-overview-ui`   | Overview UI state (sort, filters, page)    |
| `local-mood-tracker-weather-cache` | Cached weather responses (30-minute TTL)   |
| `local-mood-tracker-quadrant`      | Change quadrant board (ACT matrix items)   |

Every value is stored inside a version envelope `{ v, data }`; export/import files stay unwrapped (plain data) so old backups keep importing. See [architecture.md](architecture.md#persistence) for the full schema and coercion rules.

---

## External services

| Service                                                                  | Purpose                 | Required |
|--------------------------------------------------------------------------|-------------------------|----------|
| [Open-Meteo Forecast API](https://open-meteo.com/)                       | Current weather         | Optional |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | City name → coordinates | Optional |

Both are free and require no API key. Disable the weather component in Settings for fully offline operation.

---

## Testing

Two layers, each with one home:

- **Unit** — [Vitest](https://vitest.dev/), colocated as `src/**/*.test.ts`. Pure `core`/`infra`/`state` logic (scoring, normalize, datetime, demo generator, settings-merge, signal/store). No browser, runs in milliseconds.
- **E2E** — [Playwright](https://playwright.dev/) (desktop Chromium + Pixel-7 mobile), under `tests/e2e/<screen>/`, mirroring `src/ui/` (`checkin`, `overview`, `home`, `settings`, `info`, `shell`). Real DOM behaviour. Run on every push/PR to `main` by GitHub Actions.

```bash
npm test                                     # unit (Vitest) — from the repo root

cd tests
npm install                                  # first time only
npx playwright install chromium

npx playwright test                          # all E2E projects
npx playwright test --project=chromium       # desktop only
npx playwright test e2e/checkin              # one screen's specs
npx playwright test -g "wheel"               # filter by test name
npx playwright test --ui                     # interactive UI mode
npx playwright show-report                   # open the last HTML report
```

---

## Browser support

Any modern browser that supports `localStorage`, `fetch`, `crypto.randomUUID`, and SVG. No polyfills included.

---

## Built with

This project was built entirely with AI-assisted development using:

- **[VS Code](https://code.visualstudio.com/)** and **[Cursor](https://cursor.com/)** as editors
- **GPT 5.3 Codex** (OpenAI) and **Claude Opus 4.6** (Anthropic) as coding models
