# Data Model: Comprehensive Playwright E2E Test Suite

**Date**: 2026-04-07  
**Feature**: [spec.md](spec.md)

---

## Entities

### Test Entry (fixture data injected into localStorage)

Represents a check-in entry used to pre-seed test state. Matches the app's `normalizeEntry()` output format.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string (UUID) | Yes | UUID v4 format | Auto-generated if missing |
| thoughts | string | No | — | Free-text |
| selectedEmotion | string \| null | No | Must match wheel variant | e.g., "joy", "trust", "fear" |
| wheelType | string | No | "act" \| "plutchik" \| "ekman" \| "junto" \| "extended" | Wheel used for this entry |
| customFeelings | string | No | — | Free-text note |
| energy | object | No | `{ physical: 0–100\|null, mental: 0–100\|null, emotional: 0–100\|null }` | All null if unset |
| bodySignals | string[] | No | Valid body part keys | e.g., ["chest", "head", "left-hand"] |
| bodyNote | string | No | — | Free-text |
| energyNote | string | No | — | Free-text |
| action | string | No | — | Free-text |
| note | string | No | — | Free-text |
| moodGrid | object \| null | No | `{ energy: 1–10, valence: 1–10 }` | Null if unset |
| mood | string \| null | No | "great" \| "okay" \| "low" \| null | Derived mood bucket |
| weather | object \| null | No | `{ temperature, code, icon, description, location }` | Captured at save time |
| updatedAt | string (ISO 8601) | No | Valid ISO timestamp | e.g., "2026-04-07T09:30:00.000Z" |

**Entry Key Format**: `YYYY-MM-DD` (first of day) or `YYYY-MM-DD_HHMMSSmmm` (subsequent).

### Test Settings (fixture data injected into localStorage)

Represents the app settings object.

| Field | Type | Default | Constraints |
|-------|------|---------|-------------|
| defaultLanguage | string | "en" | "en" \| "nl" |
| theme | string | "system" | "system" \| "light" \| "dark" |
| defaultWheelType | string | "act" | "act" \| "plutchik" \| "ekman" \| "junto" \| "extended" |
| rowsPerPage | number | 7 | 5–100 |
| overviewMaxChars | number | 120 | 20–500 |
| energyEmotionalLabel | string | "social" | "emotionalSocial" \| "emotional" \| "social" |
| weatherLocation | string | "Amsterdam" | Max 100 chars |
| weatherCoords | object \| null | `{ lat: 52.37, lon: 4.90, name: "Amsterdam" }` | — |
| quickActions | string[] | (language-dependent) | Each max 100 chars |
| components | object | (all true) | 10 boolean toggles |

**Components sub-object**:

| Toggle | Controls | Default |
|--------|----------|---------|
| weather | Weather widget on check-in | true |
| thoughts | Thoughts textarea | true |
| coreFeeling | Emotion wheel + custom feelings | true |
| bodySignals | Body figure SVG + body note | true |
| energyPhysical | Physical energy meter | true |
| energyMental | Mental energy meter | true |
| energyEmotional | Emotional/Social energy meter | true |
| moodMatrix | 10×10 mood grid | true |
| actions | Action textarea + quick action chips | true |
| note | Optional note textarea | true |

### Visibility Combination Presets

Pre-defined component toggle configurations used across tests.

| Preset Name | Purpose | Components ON |
|-------------|---------|---------------|
| all-on | Default — all components visible | All 10 |
| all-off | Minimal mode — no optional components | None |
| mood-only | Core feeling + mood matrix only | coreFeeling, moodMatrix |
| energy-only | All three energy meters only | energyPhysical, energyMental, energyEmotional |
| no-weather | Everything except weather | All except weather |
| single-energy | One energy meter only | energyMental |
| text-only | Text fields only (no interactive visualizations) | thoughts, actions, note |

### Weather Mock Response

Mock data structure for Open-Meteo API route interception.

| Field | Type | Example |
|-------|------|---------|
| current_weather.temperature | number | 14 |
| current_weather.weathercode | number | 1 |
| current_weather.is_day | number | 1 |
| current_weather.windspeed | number | 8.5 |

### Geocoding Mock Response

Mock data structure for Open-Meteo Geocoding API.

| Field | Type | Example |
|-------|------|---------|
| results[0].name | string | "Amsterdam" |
| results[0].latitude | number | 52.3676 |
| results[0].longitude | number | 4.9041 |
| results[0].country | string | "Netherlands" |

---

## State Transitions

### Check-in Form State Machine

```
[Empty Form] ---(select emotion)---> [Has Core Feeling]
[Empty Form] ---(select mood cell)---> [Has Mood Grid]
[Has Core Feeling] ---(click Save)---> [Entry Saved] ---(auto)---> [Form Loaded with Today's Entry]
[Has Mood Grid] ---(click Save)---> [Entry Saved]
[Entry Saved] ---(click "New check-in")---> [Empty Form]
[Entry Saved] ---(modify + Save)---> [Entry Updated]
[Any State] ---(click history cell / overview row)---> [Form Loaded with Historical Entry]
[Form Loaded with Historical Entry] ---(click Save)---> [New Entry for Today Created]
```

### Component Visibility State

```
[Settings Saved] ---(component toggle off)---> [Component Hidden in Check-in]
[Component Hidden] ---(toggle on + save)---> [Component Visible in Check-in]
[Component Hidden] ---(data exists for component)---> [Data Preserved in localStorage, Visible in Overview]
```

### Save Validation State

```
[Both mood inputs enabled + neither selected] ---(Save)---> [Warning: mood required]
[At least one mood input selected] ---(Save)---> [Entry Saved]
[Both mood inputs disabled in settings] ---(Save)---> [Entry Saved (no mood required)]
```

---

## Relationships

- **Entry ↔ Settings**: Settings determine which components are visible during entry creation; entries store data for all components regardless of visibility.
- **Entry ↔ Weather Mock**: Weather data attached to entries comes from the mocked API response active at save time.
- **Visibility Presets ↔ Tests**: Multiple test files reference the same presets for consistency.
- **Entry Key ↔ Date**: Each entry key maps to exactly one date; multiple entries per day use timestamped suffixes.
