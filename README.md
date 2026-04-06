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
- **Save** — updates the latest check-in for today
- **Extra** — creates an additional check-in for the same day

### Emotion wheel variants

Five models to choose from (switch per check-in or set a default):

| Variant  | Emotions                                                                    |
|----------|-----------------------------------------------------------------------------|
| ACT      | 8 (joy, serenity, love, acceptance, sadness, melancholy, anger, aggression) |
| Plutchik | 8 (joy, trust, fear, surprise, sadness, disgust, anger, anticipation)       |
| Ekman    | 6 (joy, sadness, anger, fear, surprise, disgust)                            |
| Junto    | 6 (love, joy, surprise, anger, sadness, fear)                               |
| Extended | 12                                                                          |

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
- Weather location (city name or coordinates)
- Emotional/Social energy label variant
- Per-component visibility toggles (hide sections you don't use)
- Quick actions editor
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

Entries are stored in `localStorage` under the key `local-mood-tracker-entries` as a JSON object keyed by date (`YYYY-MM-DD`) or entry ID.

Each entry contains:

```json
{
  "thoughts": "...",
  "selectedEmotion": "joy",
  "customFeelings": "...",
  "energy": { "physical": 70, "mental": 55, "emotional": 60 },
  "bodySignals": ["chest", "shoulders"],
  "bodyNote": "...",
  "energyNote": "...",
  "action": "...",
  "note": "...",
  "moodGrid": { "energy": 7, "valence": 8 },
  "weather": { "temperature": 14, "code": 1, "icon": "🌤️", "description": "Mainly clear" },
  "updatedAt": "2026-04-06T09:30:00.000Z"
}
```

Other `localStorage` keys used by the app:

| Key                              | Contents                                |
|----------------------------------|-----------------------------------------|
| `local-mood-tracker-entries`     | All check-in entries                    |
| `local-mood-tracker-settings`    | User settings                           |
| `local-mood-tracker-language`    | Active language (`en` / `nl`)           |
| `local-mood-tracker-active-tab`  | Last active tab                         |
| `local-mood-tracker-overview-ui` | Overview UI state (sort, filters, page) |

---

## File structure

```text
index.html          — App shell, all HTML markup
styles.css          — All styles, CSS custom properties, light/dark themes
translations.js     — All UI strings in English and Dutch
js/
  data.js           — Static data: mood grid words, color map, emotion wheel configs
  storage.js        — localStorage read/write, entry normalization, migration
  utils.js          — Shared helpers: i18n, HTML escaping, ID generation, date utils
  checkin.js        — Check-in tab: emotion wheel, body figure, mood grid, energy meters
  overview.js       — Overview tab: table rendering, sort, filter, search, export/import
  settings-ui.js    — Settings tab: form sync, theme application, component visibility
  weather.js        — Weather widget: Open-Meteo fetch, geocoding, rendering
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
