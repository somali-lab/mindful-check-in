# Mindful Check-in

A private, local-only mental health check-in web app. Runs entirely in the browser — no server, no account, no tracking. All data stays on your device in `localStorage`.

---

## Features

### Check-in

Each check-in is a snapshot of your current state across multiple dimensions:

| Component           | Description                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Weather**         | Current conditions fetched from [Open-Meteo](https://open-meteo.com/) (free, no API key) — attached to the entry automatically |
| **Thoughts**        | Free-text field for whatever is on your mind                                                                                   |
| **Core feeling**    | Interactive SVG emotion wheel — pick one primary emotion                                                                       |
| **Body signals**    | Clickable SVG body figure — mark where you notice physical sensations                                                          |
| **Energy meters**   | Three 0–100% click-to-set meters: Physical, Mental, Emotional/Social                                                           |
| **Custom feelings** | Free-text to describe nuanced emotions beyond the wheel                                                                        |
| **Body note**       | Free-text body description                                                                                                     |
| **Energy note**     | Free-text description of your energy quality                                                                                   |
| **Mood matrix**     | 10×10 color-coded grid (valence × arousal) with 100 labeled mood words                                                         |
| **Actions**         | What you did or plan to do                                                                                                     |
| **Optional note**   | Anything else to add                                                                                                           |

**Save behaviour:**

- **Save** — updates the latest check-in for today, or creates one if none exists
- **New check-in** — clears the form so you can start a fresh entry (creates an additional check-in for the same day on save)

### Emotion wheel variants

Five models to choose from (switch per check-in or set a default):

| Variant  | Emotions                                                                                                |
|----------|---------------------------------------------------------------------------------------------------------|
| ACT      | 8 (joy, serenity, love, acceptance, sadness, melancholy, anger, aggression)                             |
| Plutchik | 8 (joy, trust, fear, surprise, sadness, disgust, anger, anticipation)                                   |
| Ekman    | 6 (joy, sadness, anger, fear, surprise, disgust)                                                        |
| Junto    | 6 (love, joy, surprise, anger, sadness, fear)                                                           |
| Extended | 12 (joy, love, trust, surprise, curiosity, anticipation, anxiety, fear, sadness, disgust, anger, shame) |

### Summary & History

- **Summary** — today's status, 7-day heatmap, streak counter, total check-in count
- **History** — 28-day calendar view with color-coded dots; switchable between core feeling, mood matrix, and energy modes; click a day to load that entry

### Overview

- Paginated, sortable table of all saved entries
- Search across entries
- Date filters: today, last 7 days, last 2 weeks, last month, last 3 months
- Delete individual entries
- Export a single entry as JSON
- Bulk export / import (JSON) with overwrite or skip-duplicates choice

### Settings

- Default language (English / Dutch)
- Theme: light, dark, or follow system preference
- Default emotion wheel type
- Rows per page (5–100)
- Overview text truncation limit (20–500 characters)
- Weather location (city name, geocoded via Open-Meteo)
- Emotional/Social energy label variant
- Per-component visibility toggles (hide sections you don't use)
- Quick actions editor (configurable shortcut chips for the actions field)
- Export and import settings as JSON

### Info tab

- Quick usage guide
- Storage explanation
- Clear all local data
- Generate 30 demo entries for exploration

---

## Privacy

- **No server.** The app runs entirely in your browser — no backend, no account. The built bundle is a set of static files you can open directly.
- **No network requests** except for the optional weather widget (Open-Meteo, no personal data sent).
- **No cookies, no tracking, no analytics.**
- Data is stored as plain JSON in `localStorage`. It is not encrypted by the app.

---

## Usage

The app is built with TypeScript + Vite. The source lives under `src/`; the build output is a single classic bundle that runs straight from disk.

```bash
npm install          # first time only
npm run build        # → dist/  (one classic app.js + assets, relative paths)
# then double-click dist/index.html, or:
open dist/index.html
```

Opening the built `dist/index.html` directly works for the core app. The **weather widget and reminders** need the app served over HTTP — `fetch` and Web Notifications are blocked on the `file://` protocol.

For development (native ESM + hot reload):

```bash
npm run dev          # Vite dev server
```

> The previous vanilla-ES5 implementation is preserved, unmaintained, in `legacy-src/`.

---

## Reminders (push notifications)

The app can send browser notifications at set intervals as a reminder to check in. Enable this via **Settings → Reminders**.

> **Note:** browser notifications do not work when the app is opened directly as a file (`file://` protocol). You need to run the app through a local web server.

```bash
npm run dev                 # Vite dev server (recommended)
# or serve the built output:
npm run build && npx serve dist
```

Then open the app at the printed URL and enable reminders in settings.

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

| Key                                | Contents                                |
|------------------------------------|-----------------------------------------|
| `local-mood-tracker-entries`       | All check-in entries                    |
| `local-mood-tracker-settings`      | User settings                           |
| `local-mood-tracker-language`      | Active language (`en` / `nl`)           |
| `local-mood-tracker-active-tab`    | Last active tab                         |
| `local-mood-tracker-overview-ui`   | Overview UI state (sort, filters, page) |
| `local-mood-tracker-weather-cache` | Cached weather responses (1 hour TTL)   |

---

## File structure

```text
index.html            — DOM shell (views, dialogs, toast container)
src/
  main.ts             — composition root: build store + services, wire the views
  core/               — pure domain logic (datetime, entry, scoring, stats, demo, settings, types)
  infra/              — side effects behind interfaces (storage Repository, weather, notifications)
  state/              — reactive signal + Store (single source of truth)
  ui/                 — light-DOM components per view (checkin/ home/ overview/ settings/ info/) + shell
  i18n/               — translations (EN+NL) + t()/emotionLabel
  data/               — static data (wheels, mood grid, body zones, weather codes)
  css/                — one stylesheet per concern (@import-ed via styles.css)
  assets/             — self-hosted fonts + logos
public/               — favicon + logos served at the web root
```

---

## Architecture

TypeScript + Vite, **functional core / imperative shell**: a pure `core/`, side effects behind interfaces in `infra/`, a single reactive `Store` as the source of truth (`state/`), and plain light-DOM components (`ui/`) that subscribe to the store and never call each other. Builds to a classic IIFE that runs from `file://`.

See [architecture.md](docs/architecture.md) for the full specification: layer contract, storage keys, entry/settings schema, and conventions.

---

## Languages

English and Dutch. Switch at any time using the EN / NL toggle in the header. The default language is configurable in Settings.

---

## Browser support

Any modern browser that supports `localStorage`, `fetch`, `crypto.randomUUID`, and SVG. No polyfills included.

---

## External services

| Service                                                                  | Purpose                 | Required |
|--------------------------------------------------------------------------|-------------------------|----------|
| [Open-Meteo Forecast API](https://open-meteo.com/)                       | Current weather         | Optional |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | City name → coordinates | Optional |

Both are free and require no API key. Disable the weather component in Settings if you prefer fully offline operation.

---

## Testing

[Playwright](https://playwright.dev/) end-to-end suite (desktop Chromium + Pixel-7 mobile), run on every push/PR to `main` by GitHub Actions.

```bash
cd tests
npm install                                  # first time only
npx playwright install chromium

npx playwright test                          # all projects
npx playwright test --project=chromium       # desktop only
npx playwright test -g "wheel"               # filter by test name
npx playwright test --ui                     # interactive UI mode
npx playwright show-report                   # open the last HTML report
```

---

## Built with

This project was built entirely with AI-assisted development using:

- **[VS Code](https://code.visualstudio.com/)** and **[Cursor](https://cursor.com/)** as editors
- **GPT 5.3 Codex** (OpenAI) and **Claude Opus 4.6** (Anthropic) as coding models

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies — as long as you include attribution to the original source.

Copyright (c) 2026 [somali-lab](https://github.com/somali-lab)
