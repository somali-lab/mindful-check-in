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

- **No server.** The app is a static HTML file — open it directly in a browser.
- **No network requests** except for the optional weather widget (Open-Meteo, no personal data sent).
- **No cookies, no tracking, no analytics.**
- Data is stored as plain JSON in `localStorage`. It is not encrypted by the app.

---

## Usage

No installation or build step required.

```text
# Clone or download the repo, then open index.html in any modern browser:
open index.html
```

Or serve it locally for development:

```bash
npx serve .
# or
python -m http.server
```

---

## Reminders (push notifications)

The app can send browser notifications at set intervals as a reminder to check in. Enable this via **Settings → Reminders**.

> **Note:** browser notifications do not work when `index.html` is opened directly as a file (`file://` protocol). You need to run the app through a local web server.

Start a local web server in the project directory:

```bash
# Node.js (recommended)
npx serve .

# Python
python -m http.server 8080

# PHP
php -S localhost:8080
```

Then open the app at `http://localhost:8080` (or whichever port you chose) and enable reminders in settings.

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
| `moodTrackerWheelType`             | Currently selected emotion wheel type   |

---

## File structure

```text
index.html            — App shell, all HTML markup
boot.js               — DOMContentLoaded: calls Module.init() in dependency order
lib/
  core.js             — Event bus, Store, i18n engine, helpers, entry normalization
  compute.js          — Mood score computation
data/
  static.js           — Pure data: wheel variants, mood grid labels, weather codes, body zones
  translations.js     — All translation strings (flat object per language)
modules/
  navigation.js       — Tab routing, theme, language switching
  home.js             — Home dashboard: stats, heatmap, streak
  checkin.js          — Check-in form orchestration, save/load, visibility
  wheel.js            — Emotion wheel SVG rendering and selection
  body.js             — Body signals SVG interaction
  energy.js           — Energy meters rendering and click handling
  mood.js             — 10×10 mood matrix grid
  weather.js          — Weather widget: Open-Meteo fetch, geocoding, caching
  overview.js         — Overview table: sort, filter, search, pagination, export/import
  settings.js         — Settings form, component toggles, quick actions editor
  dashboard.js        — Summary card and 28-day history calendar
  demo.js             — Demo data generator (30 random entries)
css/
  base.css            — CSS custom properties, reset, dark theme, shared utilities
  layout.css          — App shell, nav rail, grid layouts, responsive
  components.css      — Buttons, form inputs, banners, chips, toasts
  checkin.css         — Emotion wheel, body figure, energy meters, mood grid
  overview.css        — Table, sorting, pagination, row styles
  settings.css        — Settings grid, sub-items
  summary.css         — Summary cards, heatmap, history calendar
  weather.css         — Weather widget
  info.css            — Info page, score legend
```

---

## Architecture

The app follows a modular ES5 IIFE pattern with a single global namespace (`MCI`). Modules communicate via an event bus — no module calls another directly.

See [architecture.md](architecture.md) for the full specification: module contract, event bus API, standard events, data layer, and communication rules.

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

The project includes a comprehensive [Playwright](https://playwright.dev/) end-to-end test suite (~380 tests).

### Prerequisites

```bash
cd tests
npm install
npx playwright install chromium
```

### Run tests (headless)

```bash
cd tests
npx playwright test                            # all projects (desktop + mobile)
npx playwright test --project=chromium         # desktop only
npx playwright test --project=mobile-chrome    # mobile only (Pixel 7 emulation)
```

### Run tests (headed — visible browser)

```bash
cd tests
npx playwright test --headed --workers=1
```

Slow down each action by 500 ms for easier observation:

```bash
cd tests
SLOW_MO=500 npx playwright test --headed --workers=1        # macOS/Linux
$env:SLOW_MO=500; npx playwright test --headed --workers=1   # PowerShell
```

### Run tests (interactive UI mode)

```bash
cd tests
npx playwright test --ui
```

### Run a single test file

```bash
cd tests
npx playwright test checkin.spec.js
```

### Run a specific test by name

```bash
cd tests
npx playwright test -g "T005"
```

### View the HTML test report

```bash
cd tests
npx playwright show-report
```

### Run tests with code coverage

```bash
cd tests
$env:COVERAGE=1; npx playwright test     # PowerShell
COVERAGE=1 npx playwright test           # macOS/Linux
```

Opens an interactive coverage report at `tests/coverage/report.html` showing per-file line, branch, and function coverage.

### Run interactive visual demo

A guided walkthrough of the entire app that runs in a visible browser at human-readable speed. Covers check-in, emotion wheel, energy meters, mood matrix, overview, settings, demo data, export, dark mode, and more.

```bash
cd tests/demo
npx playwright test
```

The demo runs headed by default (~1.5 minutes) with a visible red cursor dot so you can follow along.

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
