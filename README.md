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

| Variant  | Emotions                                                                    |
|----------|-----------------------------------------------------------------------------|
| ACT      | 8 (joy, serenity, love, acceptance, sadness, melancholy, anger, aggression) |
| Plutchik | 8 (joy, trust, fear, surprise, sadness, disgust, anger, anticipation)       |
| Ekman    | 6 (joy, sadness, anger, fear, surprise, disgust)                            |
| Junto    | 6 (love, joy, surprise, anger, sadness, fear)                               |
| Extended | 12                                                                          |

### Summary & History

- **Summary** — today's status, 7-day heatmap, streak counter, total check-in count
- **History** — 28-day calendar view with color-coded dots; switchable between core feeling, mood matrix, and energy modes; click a day to load that entry

### Overview

- Paginated, sortable table of all saved entries
- Search across entries
- Date filters: today, last 7 days, last 2 weeks, last month, last 3 months
- Filter to entries with notes only
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

## Data format

Entries are stored in `localStorage` under the key `local-mood-tracker-entries` as a JSON object. Keys use the format `YYYY-MM-DD` (first entry of a day) or `YYYY-MM-DD_HHMMSSmmm` (subsequent entries on the same day).

Each entry contains:

```json
{
  "id": "a1b2c3d4-...",
  "thoughts": "...",
  "selectedEmotion": "joy",
  "wheelType": "act",
  "customFeelings": "...",
  "energy": { "physical": 70, "mental": 55, "emotional": 60 },
  "bodySignals": ["chest", "left-shoulder"],
  "bodyNote": "...",
  "energyNote": "...",
  "action": "...",
  "note": "...",
  "moodGrid": { "energy": 7, "valence": 8 },
  "mood": "great",
  "weather": { "temperature": 14, "code": 1, "icon": "🌤️", "description": "Mainly clear", "location": "Amsterdam" },
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
index.html          — App shell, all HTML markup
translations.js     — All UI strings in English and Dutch
css/
  base.css          — CSS custom properties, reset, dark theme, shared utilities
  layout.css        — App shell, hero header, tabs, grid layouts, responsive
  components.css    — Buttons, form inputs, toggle switches, banners, chips
  checkin.css       — Emotion wheel, body figure, energy meters, mood grid
  overview.css      — Table, sorting, pagination, row styles
  settings.css      — Settings grid, sub-items
  summary.css       — Summary cards, heatmap, history calendar
  weather.css       — Weather widget
  info.css          — Info page, score legend
js/
  data.js           — Static data: mood grid words, color map, emotion wheel configs
  storage.js        — localStorage read/write, entry normalization, migration
  utils.js          — Shared helpers: i18n, HTML escaping, ID generation, date utils, file I/O
  checkin.js        — Check-in tab: emotion wheel, body figure, mood grid, energy meters, summary, history
  overview.js       — Overview tab: table rendering, sort, filter, search, export/import
  settings-ui.js    — Settings tab: form sync, theme application, component visibility
  weather.js        — Weather widget: Open-Meteo fetch, geocoding, caching, rendering
  demo.js           — Demo data generator (30 random entries)
  init.js           — App bootstrap: DOM references, event binding, tab routing
```

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

## Built with

This project was built entirely with AI-assisted development using:

- **[VS Code](https://code.visualstudio.com/)** and **[Cursor](https://cursor.com/)** as editors
- **GPT 5.3 Codex** (OpenAI) and **Claude Opus 4.6** (Anthropic) as coding models

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies — as long as you include attribution to the original source.

Copyright (c) 2026 [somali-lab](https://github.com/somali-lab)
