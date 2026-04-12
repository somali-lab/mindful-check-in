# Mindful Check-in — Functional Specification

**Created**: 2026-04-12
**Status**: Active
**Related**: [architecture.md](architecture.md) (implementation reference)

## Introduction

Mindful Check-in is a private, local-only mental health check-in application. Users record daily check-ins capturing thoughts, emotions, body awareness, energy levels, mood state, actions, and notes. All data remains on the user's device — no accounts, no servers, no tracking.

### Design Philosophy

This specification is **layout-agnostic**. It defines *what* the application must do, not *how* the interface looks or flows. An implementation could present the same functionality as a single-page form, a multi-step wizard, a conversational UI, or any other layout — as long as all functional requirements and acceptance criteria are met.

### Scope

The specification covers the complete feature set of the application: check-in recording, emotion identification, body signal tracking, energy monitoring, mood assessment, data review, data portability, personalization, weather integration, bilingual support, and theming.

---

## User Stories

### P1 — Core Check-in

#### US-01: Daily Check-in Recording (P1)

A user records a personal check-in capturing their current state across multiple dimensions: thoughts, core feeling, body signals, energy levels, mood assessment, a planned action, and an optional note. After saving, the check-in is stored locally and appears in the historical overview.

**Why this priority**: The daily check-in is the core value proposition of the entire application. Without this working end-to-end, the app has no purpose.

**Independent Test**: Can be fully tested by filling every field, saving, and verifying that the data persists and is correctly displayed in the historical overview.

**Acceptance Scenarios**:

1. **Given** an empty application with no prior check-ins, **When** the user fills all available fields and saves, **Then** a success confirmation appears, the check-in is stored persistently, and the daily summary updates to show the check-in time.
2. **Given** an existing check-in for today, **When** the user modifies fields and saves, **Then** the existing check-in is updated (not duplicated) and an "Updated" confirmation appears.
3. **Given** an existing check-in for today, **When** the user starts a new check-in and saves, **Then** a second check-in is created for the same day with a unique timestamp-based key.
4. **Given** all fields filled, **When** save completes, **Then** the daily summary shows the check-in time, the recent mood history reflects the new entry, and the streak counter increments if applicable.
5. **Given** a fresh form, **When** the user views the context indicator, **Then** it clearly shows this is a new, unsaved check-in.
6. **Given** a saved check-in is loaded, **When** the user views the context indicator, **Then** it shows the entry's date and time.

---

#### US-02: Core Feeling Selection (P1)

A user identifies their core feeling by choosing from a structured set of emotions. Five emotion set variants are available, each with a distinct collection of emotions:

| Variant | Emotion Count | Emotions |
|---------|--------------|----------|
| ACT | 8 | joy, serenity, love, acceptance, sadness, melancholy, anger, aggression |
| Plutchik | 8 | joy, trust, fear, surprise, sadness, disgust, anger, anticipation |
| Ekman | 6 | joy, sadness, anger, fear, surprise, disgust |
| Junto | 6 | love, joy, surprise, anger, sadness, fear |
| Extended | 12 | 12 emotions covering a broader spectrum |

Each variant has associated colors for visual differentiation. The user can switch between variants, select an emotion, and reset the selection. A free-text field allows additional feelings beyond the structured set.

**Why this priority**: The core feeling is one of two mood inputs required for saving a check-in.

**Independent Test**: Can be tested by switching between variants, selecting emotions, resetting, and entering free text.

**Acceptance Scenarios**:

1. **Given** the ACT variant (8 emotions) is active, **When** the user selects "joy", **Then** the selection is confirmed, the emotion name is displayed, and the choice is stored in the check-in.
2. **Given** a selected emotion, **When** the user resets, **Then** no emotion is selected and the display reverts to its empty state.
3. **Given** the Ekman variant (6 emotions) is active, **When** switching to Extended (12 emotions), **Then** the new variant loads and the previous selection is cleared.
4. **Given** a saved check-in with a specific variant and emotion, **When** that check-in is loaded, **Then** the system switches to the saved variant and marks the saved emotion.
5. **Given** each of the 5 variants, **When** every emotion is selected, **Then** the correct emotion name displays for all emotions across all variants.
6. **Given** any variant, **When** the user switches to a different variant, **Then** the new type is saved as a preference and the variant redraws immediately.
7. **Given** the emotion section, **When** the user enters free text in the additional feelings field, **Then** the text is stored alongside the structured selection in the check-in.

---

#### US-03: Body Signals (P1)

A user indicates where in the body they experience physical sensations by selecting body zones. The body is divided into 26 interactive zones covering the entire body:

> head, neck, chest, abdomen, left shoulder, right shoulder, left upper arm, right upper arm, left elbow, right elbow, left forearm, right forearm, left hand, right hand, left hip, right hip, left upper leg, right upper leg, left knee, right knee, left lower leg, right lower leg, left foot, right foot, upper back, lower back

Multiple zones can be selected simultaneously. An optional free-text field is available for additional notes.

**Why this priority**: Body awareness is a core therapeutic self-monitoring component that creates a connection between body and mind.

**Independent Test**: Can be tested by selecting/deselecting body zones, resetting, and verifying selections after save and load.

**Acceptance Scenarios**:

1. **Given** no body zones selected, **When** the user selects "chest", **Then** "chest" is marked and displayed in the selection list.
2. **Given** "chest" is selected, **When** the user selects "chest" again, **Then** the selection is toggled off.
3. **Given** multiple zones selected (head, chest, left hand), **When** the user resets, **Then** all selections are cleared.
4. **Given** 5 body zones selected, **When** saving and reloading, **Then** the same 5 zones are marked.
5. **Given** the body signals component, **When** all 26 zones are selected one by one, **Then** each zone toggles correctly without affecting others.
6. **Given** selected body zones, **When** the display is viewed, **Then** zone names are shown in the current language, separated by commas.
7. **Given** the body signals section, **When** the user types a note in the text field, **Then** the note is saved with the check-in.

---

#### US-04: Energy Levels (P1)

A user sets three energy dimensions: physical, mental, and emotional/social. Each level ranges from 0 to 100%. Predefined shortcut values (0, 25, 50, 75, 100) are available for quick selection. The third energy dimension's label is configurable ("Emotional / Social", "Emotional", or "Social"). Each dimension has a distinct visual style (color gradient) for differentiation. An optional free-text field is available for notes.

**Why this priority**: Energy monitoring is a core self-monitoring component with three distinct dimensions that each provide valuable self-insight.

**Independent Test**: Can be tested by setting each level, using shortcuts, and verifying values after save/load.

**Acceptance Scenarios**:

1. **Given** physical energy not set, **When** the user selects a high level, **Then** the system shows a value around 90–100% and the display updates.
2. **Given** mental energy, **When** the user selects shortcut "75", **Then** the level jumps to 75%.
3. **Given** all three levels set, **When** reset is activated, **Then** all values return to empty.
4. **Given** energy values set to 30/60/90, **When** saving and reloading, **Then** the levels show 30/60/90 respectively.
5. **Given** the emotional label is changed to "Social" in settings, **When** the energy monitor is viewed, **Then** the third dimension label reads "Social".
6. **Given** each level, **When** selecting shortcuts 0 and 100, **Then** the levels correctly show 0% and 100% respectively.
7. **Given** the energy section, **When** the user types a note, **Then** the note is saved with the check-in.

---

#### US-05: Mood Assessment (P1)

A user determines their mood on a two-dimensional grid (energy × valence). The grid provides 100 unique mood labels per language. The vertical axis represents energy level (high to low) and the horizontal axis represents valence (negative to positive). Each position has a color reflecting the energy-valence combination.

**Why this priority**: The mood assessment is the second mood input and provides fine-grained tracking across two dimensions.

**Independent Test**: Can be tested by selecting positions, verifying labels and values per language, and verifying persistence.

**Acceptance Scenarios**:

1. **Given** no mood selected, **When** the user selects a position with high energy and high valence, **Then** a positive mood label is displayed with the corresponding energy/valence values (e.g., "E 8/10, V 9/10").
2. **Given** a mood selection, **When** reset is activated, **Then** the selection is cleared.
3. **Given** a mood selection, **When** saving and reloading, **Then** the same position is marked.
4. **Given** the grid, **When** multiple positions are selected sequentially, **Then** only the last selection is active.
5. **Given** the current language is Dutch, **When** the grid is viewed, **Then** all 100 positions show Dutch mood labels.
6. **Given** the current language is English, **When** the grid is viewed, **Then** all 100 positions show English mood labels.

---

#### US-06: Save Validation (P1)

The application requires that at least one mood input (core feeling or mood assessment) is provided before saving, but only when those components are enabled. If both mood components are disabled in settings, saving proceeds without mood validation.

**Why this priority**: Save validation prevents empty check-ins and is the gatekeeper for data persistence.

**Independent Test**: Can be tested by attempting to save with various mood input states and visibility configurations.

**Acceptance Scenarios**:

1. **Given** both core feeling and mood assessment enabled but neither selected, **When** Save is activated, **Then** a warning message appears and nothing is saved.
2. **Given** only core feeling enabled and an emotion selected, **When** Save is activated, **Then** the check-in saves successfully.
3. **Given** only mood assessment enabled and a position selected, **When** Save is activated, **Then** the check-in saves successfully.
4. **Given** both mood components disabled in settings, **When** Save is activated, **Then** the check-in saves without requiring mood input.
5. **Given** core feeling selected but mood assessment not selected, **When** Save is activated, **Then** the check-in saves (only one is needed).

---

### P2 — Data Management & History

#### US-07: Component Visibility (P2)

A user determines which check-in components are visible via settings. There are 10 toggleable components: weather, thoughts, core feeling, body signals, physical energy, mental energy, emotional energy, mood assessment, actions, note. Hidden components disappear from the check-in form, but previously saved data for hidden components is preserved. The historical overview adapts dynamically based on visible components.

**Why this priority**: Personalization allows users to tailor their check-in experience to personal needs.

**Independent Test**: Can be tested by toggling each component on/off and verifying that the form and overview respond correctly.

**Acceptance Scenarios**:

1. **Given** weather is enabled, **When** the user disables it and saves settings, **Then** the weather component disappears from the check-in.
2. **Given** all components enabled, **When** each is individually disabled, **Then** each component disappears without errors.
3. **Given** all components disabled except thoughts, **When** saving (no mood required since both mood inputs are off), **Then** the check-in saves successfully.
4. **Given** all three energy types disabled, **When** the check-in is viewed, **Then** the entire energy section is hidden.
5. **Given** a component is hidden, **When** previously saved data for that component is loaded, **Then** the hidden component's data is preserved and visible in the historical overview.
6. **Given** core feeling is disabled, **When** the recent history view is accessed, **Then** the "Core feeling" view mode is absent.

---

#### US-08: Historical Overview with Sorting, Search, and Pagination (P2)

A user views all saved check-ins in a tabular overview with dynamic columns (based on component visibility), sorts by any column header, searches entries by keyword, filters by date range, and navigates pages. Selecting an entry loads it into the check-in form.

**Why this priority**: The overview is the primary way to review historical data and discover patterns.

**Independent Test**: Can be tested by generating data and exercising sort, search, filter, pagination, and entry selection.

**Acceptance Scenarios**:

1. **Given** 30 check-ins exist, **When** the overview is opened, **Then** a paginated display appears showing "Page 1 of N".
2. **Given** default sort (date descending), **When** the date column header is activated, **Then** the sort flips to ascending.
3. **Given** check-ins with "walk" in the action field, **When** searching "walk", **Then** only matching entries appear.
4. **Given** entries across multiple months, **When** selecting "Last 7 days", **Then** only recent entries appear.
5. **Given** page 1, **When** Next is activated, **Then** page 2 loads with correct rows.
6. **Given** the last page, **When** viewed, **Then** Next/Last controls are disabled.
7. **Given** an entry in the overview, **When** it is selected, **Then** the entry loads into the check-in form and the view switches to the Check-in section.
8. **Given** sort and filter state, **When** switching sections and returning, **Then** the overview state (sort, filter, search, page) persists.

Date filter options: All, Today, Last 7 days, Last 2 weeks, Last month, Last 3 months.

---

#### US-09: Entry Export and Import (P2)

A user exports all entries as a file, exports individual entries, and imports entries from a file with a choice between overwrite and skip-duplicates for matching IDs.

**Why this priority**: Data portability and backup are critical for user trust and the privacy-first principle.

**Independent Test**: Can be tested by exporting, clearing data, and re-importing with both merge modes.

**Acceptance Scenarios**:

1. **Given** entries exist, **When** Export is activated, **Then** a JSON file downloads containing all filtered entries.
2. **Given** an exported file, **When** importing into an empty app, **Then** all entries appear.
3. **Given** overlapping entries, **When** importing with "overwrite", **Then** entries with matching IDs are updated; entries with different IDs but the same date are added alongside existing ones.
4. **Given** overlapping entries, **When** importing with "skip", **Then** entries with matching IDs are skipped with a count message; entries with different IDs are always added.
5. **Given** an invalid file, **When** importing, **Then** an error message displays and no data changes.
6. **Given** a single entry in the overview, **When** per-entry export is activated, **Then** that single entry downloads as JSON.

---

#### US-10: Entry Deletion (P2)

A user deletes an individual check-in from the overview after confirmation.

**Why this priority**: Users must be able to remove entries they no longer want, as part of data sovereignty.

**Independent Test**: Can be tested by deleting, confirming/cancelling, and verifying the outcome.

**Acceptance Scenarios**:

1. **Given** an entry in the overview, **When** delete is activated and confirmed, **Then** the entry is removed from the overview and local storage.
2. **Given** an entry in the overview, **When** delete is activated and cancelled, **Then** nothing changes.
3. **Given** today's check-in is loaded in the form, **When** it is deleted from the overview, **Then** the check-in form resets.

---

#### US-11: Settings Configuration and Persistence (P2)

A user configures all available settings — language, theme, default emotion variant, energy label, rows per page, maximum characters in overview cells, weather location, component visibility toggles, and quick actions — and they persist across page reloads.

**Why this priority**: Settings control the entire app experience and must persist reliably.

**Independent Test**: Can be tested by changing each setting, saving, refreshing, and verifying persistence.

**Acceptance Scenarios**:

1. **Given** default settings, **When** changing theme to "Dark" and saving, **Then** the dark color scheme applies immediately.
2. **Given** rows per page set to 5, **When** viewing the overview with 30 entries, **Then** only 5 rows appear per page.
3. **Given** max chars set to 30, **When** viewing the overview, **Then** long text cells truncate to 30 characters with "…".
4. **Given** default emotion variant set to "Extended", **When** opening the app fresh, **Then** the emotion selection defaults to Extended.
5. **Given** all settings configured, **When** reloading the page, **Then** every setting persists exactly as configured.

---

#### US-12: Theme Switching (P2)

A user switches between Light, Dark, and System themes. System mode follows the operating system's preferred color scheme. The selected theme persists across reloads.

**Why this priority**: Theme support is essential for readability and accessibility in different lighting conditions.

**Independent Test**: Can be tested by switching themes and verifying visual changes and persistence.

**Acceptance Scenarios**:

1. **Given** light theme active, **When** the dark theme is selected, **Then** the color scheme switches to dark mode immediately.
2. **Given** system theme active with OS in dark mode, **When** the app loads, **Then** dark colors render.
3. **Given** any theme, **When** the selected theme control is inspected, **Then** it has a visual "selected" indicator.
4. **Given** theme set to dark, **When** reloading, **Then** the dark theme persists.
5. **Given** system theme selected and OS changes from light to dark, **When** the change occurs, **Then** the app adapts in real time.

---

#### US-13: Language Switching (P2)

A user toggles between English and Dutch. All user-facing text updates instantly without page reload, including mood labels, body zone names, button text, and placeholders.

**Why this priority**: Bilingual support serves the target audience and is a core principle of the application.

**Independent Test**: Can be tested by switching the language and verifying text changes across all UI elements.

**Acceptance Scenarios**:

1. **Given** English active, **When** "NL" is selected, **Then** all translatable elements update to Dutch instantly.
2. **Given** Dutch active, **When** "EN" is selected, **Then** all elements revert to English.
3. **Given** language set to NL, **When** reloading, **Then** Dutch persists.
4. **Given** Dutch active, **When** viewing the mood assessment, **Then** all 100 mood labels display in Dutch.
5. **Given** English active, **When** viewing body signals, **Then** body zone names are in English.

---

#### US-14: Summary Card (P2)

The summary displays today's check-in status, a 7-day mood history, a streak counter, and the total check-in count.

**Why this priority**: The summary provides at-a-glance insight into recent check-in behavior and pattern awareness.

**Independent Test**: Can be tested by creating entries across multiple days and verifying summary values.

**Acceptance Scenarios**:

1. **Given** no entries exist, **When** the check-in section is viewed, **Then** the summary shows "Not checked in today yet" with no streak.
2. **Given** a check-in saved today, **When** the summary is viewed, **Then** it shows "Checked in at: [time]" with a streak of 1.
3. **Given** entries on 5 consecutive days, **When** the summary is viewed, **Then** the streak shows 5.
4. **Given** entries with various moods, **When** the 7-day mood history is viewed, **Then** each day is indicated by mood score (positive/mixed/negative/empty).
5. **Given** 10 total entries, **When** the summary is viewed, **Then** the total displays "10".

---

#### US-15: 28-Day History Calendar (P2)

A 28-day history view shows a 4-week grid with color-coded cells. Users switch between 5 view modes: core feeling, mood assessment, physical energy, mental energy, emotional energy. Selecting a cell with an entry loads it into the check-in form.

**Why this priority**: History visualization is the primary way users track patterns over time.

**Independent Test**: Can be tested by creating entries and switching between view modes.

**Acceptance Scenarios**:

1. **Given** entries over the past 28 days, **When** the history is viewed, **Then** a 4×7 grid renders with color-coded cells (Monday–Sunday columns).
2. **Given** the "Core feeling" mode is active with an entry having emotion "joy", **When** the cell is viewed, **Then** it shows a positive color.
3. **Given** mode switched to "Physical energy", **When** entries are viewed, **Then** colors reflect energy levels (≥67 positive, 34–66 mixed, ≤33 negative).
4. **Given** a cell with a single entry, **When** it is selected, **Then** that entry loads into the check-in form.
5. **Given** a cell with multiple entries on the same day, **When** it is selected, **Then** the most recent entry of that day loads.
6. **Given** disabled components, **When** the mode selector is viewed, **Then** only enabled components appear as mode options.

---

#### US-16: Section Navigation (P2)

A user navigates between 4 sections (Check-in, Overview, Settings, Info). The URL reflects the active section and browser back/forward navigation works correctly.

**Why this priority**: Navigation is the primary orientation pattern and supports direct links to sections.

**Independent Test**: Can be tested by switching sections and using browser navigation.

**Acceptance Scenarios**:

1. **Given** the check-in section active, **When** "Overview" is selected, **Then** the overview section displays and the URL reflects the change.
2. **Given** the URL points to settings, **When** the page loads, **Then** the settings section is active.
3. **Given** multiple section switches, **When** browser Back is pressed, **Then** the previous section activates.
4. **Given** an invalid URL reference, **When** the page loads, **Then** the default section (check-in) activates.
5. **Given** any active section, **When** viewed, **Then** exactly one section control is visually selected and exactly one panel is visible.

---

#### US-17: Loading Historical Entries (P2)

A user loads a past check-in from the overview or history calendar into the check-in form. The context indicator shows the entry's date. Saving creates a new entry for today rather than overwriting the historical one.

**Why this priority**: Reviewing past entries is a core interaction for self-reflection.

**Independent Test**: Can be tested by selecting overview rows and history cells.

**Acceptance Scenarios**:

1. **Given** an entry from 3 days ago, **When** its row in the overview is selected, **Then** the check-in form fills with that entry's data and the view switches to check-in.
2. **Given** a loaded historical entry, **When** the context indicator is viewed, **Then** it shows the entry's date and time.
3. **Given** a historical entry loaded, **When** Save is activated, **Then** a new entry for today is created (the old one is not overwritten).
4. **Given** an entry with weather data, **When** it is loaded, **Then** the weather component shows the entry's recorded weather (not current weather).

---

### P3 — Optional & Utility

#### US-18: Settings Export, Import, and Reset (P3)

A user exports settings as a file, imports them on another device, or resets to defaults.

**Why this priority**: Settings portability supports multi-device usage without accounts.

**Independent Test**: Can be tested by exporting settings, modifying, re-importing, and resetting.

**Acceptance Scenarios**:

1. **Given** custom settings, **When** Export is activated, **Then** a JSON file downloads (without weather coordinates for privacy).
2. **Given** an exported settings file, **When** importing, **Then** all settings apply immediately.
3. **Given** a corrupt settings file, **When** importing, **Then** an error message shows and current settings are unchanged.
4. **Given** any settings state, **When** Reset is activated and confirmed, **Then** all settings revert to defaults.

---

#### US-19: Quick Actions (P3)

A user configures reusable action phrases in settings (add/remove) and uses them as clickable shortcuts during check-in that append text to the action field.

**Why this priority**: Quick actions speed up the check-in flow with one-click entry.

**Independent Test**: Can be tested by adding/removing actions in settings and using shortcuts on the check-in form.

**Acceptance Scenarios**:

1. **Given** default quick actions exist, **When** the check-in form is viewed with the action field visible, **Then** action shortcuts appear near the action field.
2. **Given** shortcuts displayed, **When** one is activated, **Then** the shortcut's text appends to the action field.
3. **Given** the quick actions editor in settings, **When** a new action is typed and confirmed, **Then** the action appears in the list.
4. **Given** a quick action in the editor list, **When** remove is activated, **Then** the action is removed.
5. **Given** custom actions saved, **When** returning to the check-in form, **Then** the shortcuts reflect the custom list.

---

#### US-20: Weather Integration (P3)

The weather component fetches and displays current conditions based on the configured location. Weather data is cached for 1 hour. When the fetch fails, an error state displays. Weather data is attached to each saved entry.

**Why this priority**: Weather context enriches check-in data with environmental conditions that may influence mood.

**Independent Test**: Can be tested with mocked API responses for success, failure, and cache scenarios.

**Acceptance Scenarios**:

1. **Given** a valid weather location configured, **When** the page loads, **Then** the weather component shows temperature (°C), weather icon, description, and location name.
2. **Given** a cached weather response less than 1 hour old, **When** reloading, **Then** no API call is made and cached data displays.
3. **Given** the weather API is unreachable, **When** the page loads, **Then** the component displays an error state ("Weather unavailable") without crashing the app.
4. **Given** weather disabled in settings, **When** the check-in is viewed, **Then** the weather component is hidden.
5. **Given** a check-in is saved, **When** examining the entry, **Then** the current weather data (temperature, description, location) is attached to the entry.

---

#### US-21: Weather Location / Geocoding (P3)

A user changes the weather location in settings by entering a city name. The application converts the city name to geographic coordinates and stores the result.

**Why this priority**: Geocoding bridges user-friendly city names to API-compatible coordinates.

**Independent Test**: Can be tested by entering valid and invalid city names and verifying coordinate resolution.

**Acceptance Scenarios**:

1. **Given** weather location set to "Amsterdam", **When** saving settings, **Then** coordinates resolve to approximately 52.37°N, 4.90°E and the location name is stored.
2. **Given** a nonexistent city name, **When** saving settings, **Then** a warning appears and coordinates remain unchanged.
3. **Given** location changed from "Amsterdam" to "Berlin", **When** saving, **Then** previous weather cache clears and new coordinates are stored.

---

#### US-22: Demo Data Generation (P3)

A user generates demonstration entries to explore the app's features without manually entering data.

**Why this priority**: Demo data helps new users understand features quickly.

**Independent Test**: Can be tested by generating demo data and verifying entries appear.

**Acceptance Scenarios**:

1. **Given** an empty app, **When** "Generate demo data" is activated, **Then** approximately 30 entries are created spread over 90 days.
2. **Given** demo data generated, **When** the overview is viewed, **Then** entries appear with varied emotions, energy levels, and mood values.
3. **Given** existing entries, **When** demo data is generated, **Then** the demo entries are added without deleting existing ones.

---

#### US-23: Clear All Data (P3)

A user clears all local data after confirmation.

**Why this priority**: Data clearing is a necessary privacy action.

**Independent Test**: Can be tested by activating "Clear all data" and confirming.

**Acceptance Scenarios**:

1. **Given** entries and settings exist, **When** "Clear all local data" is activated and confirmed, **Then** all app data is removed and the app reloads in its default state.
2. **Given** the clear action, **When** cancelling the confirmation, **Then** nothing is deleted.

---

## Functional Requirements

### Check-in Form

- **FR-001**: App MUST provide a check-in form with fields for thoughts, core feeling, body signals (with optional body note), energy levels (with optional energy note), mood assessment, action, and optional note.
- **FR-002**: App MUST support saving a check-in entry to persistent local storage, creating new entries or updating existing ones for the same day.
- **FR-003**: App MUST support multiple entries per day with unique timestamp-based keys.
- **FR-004**: App MUST validate that at least one mood input (core feeling or mood assessment) is selected before saving, unless both mood components are disabled.
- **FR-005**: App MUST display a context indicator showing whether the current form is a new check-in, today's entry, or a historical entry.
- **FR-006**: App MUST provide a "New check-in" function that clears the form completely.
- **FR-007**: App MUST prevent duplicate entries from rapid activation of the save function (disable on activation, re-enable after completion or failure).

### Emotion Identification

- **FR-008**: App MUST provide a mechanism for selecting a core feeling from a structured set of emotions, supplemented with a free-text field for additional feelings.
- **FR-009**: App MUST support 5 emotion variants: ACT (8 emotions), Plutchik (8), Ekman (6), Junto (6), Extended (12), each with defined emotions and colors.
- **FR-010**: App MUST support switching between emotion variants.
- **FR-011**: App MUST clearly confirm the selected emotion and display the emotion name.

### Body Signals

- **FR-012**: App MUST provide a mechanism for selecting body zones, with 26 selectable zones covering the full body (head, neck, chest, abdomen, shoulders, upper arms, elbows, forearms, hands, hips, upper legs, knees, lower legs, feet, upper back, lower back).
- **FR-013**: App MUST support multi-select toggle behavior on body zones (activate to select, activate again to deselect).
- **FR-014**: App MUST display selected body zones as translated names in the current language.

### Energy Monitoring

- **FR-015**: App MUST support three energy levels (physical, mental, emotional/social) each with a range of 0–100%.
- **FR-016**: App MUST support direct level selection and predefined shortcut values (0, 25, 50, 75, 100).
- **FR-017**: App MUST visually distinguish each energy level with color differentiation.

### Mood Assessment

- **FR-018**: App MUST provide a 10×10 mood assessment grid with bilingual labels (100 unique moods per language), color-coded positions, and axis labels (energy high/low, valence negative/positive).
- **FR-019**: App MUST store mood selections as energy (1–10) and valence (1–10) values.

### Historical Overview

- **FR-020**: App MUST display saved entries in a paginated overview with dynamic columns based on component visibility.
- **FR-021**: App MUST support sorting by any column header (toggle ascending/descending).
- **FR-022**: App MUST support full-text search across all entry fields.
- **FR-023**: App MUST support date range filtering (All, Today, Last 7 days, Last 2 weeks, Last month, Last 3 months).
- **FR-024**: App MUST support pagination with navigation controls (First, Previous, Next, Last) and configurable rows per page.
- **FR-025**: App MUST allow selecting an entry from the overview to load it into the check-in form.

### Data Portability

- **FR-026**: App MUST support bulk export of entries as JSON.
- **FR-027**: App MUST support per-entry export as JSON.
- **FR-028**: App MUST support import of entries from JSON with overwrite/skip-duplicates choice (matched by entry ID). Entries with different IDs are always added, even if they share a date key with existing entries.
- **FR-029**: App MUST support entry deletion with confirmation dialog.
- **FR-030**: App MUST support settings export (excluding weather coordinates for privacy) and import as JSON.
- **FR-031**: App MUST support settings reset to defaults with confirmation.

### Settings

- **FR-032**: App MUST provide configurable settings for: default language, theme, default emotion variant, energy emotional label, rows per page, max characters in overview cells, weather location, and 10 component visibility toggles.
- **FR-033**: App MUST persist all settings across page reloads.
- **FR-034**: App MUST provide a quick actions editor allowing users to add and remove action phrases.
- **FR-035**: App MUST display quick action shortcuts on the check-in form that append their text to the action field when activated.

### Weather

- **FR-036**: App MUST fetch weather data based on configured coordinates and display temperature, weather icon, description, and location.
- **FR-037**: App MUST cache weather data for 1 hour to avoid redundant API calls.
- **FR-038**: App MUST geocode city names to geographic coordinates.
- **FR-039**: App MUST handle weather fetch errors gracefully with a visible error state rather than silent failure.
- **FR-040**: App MUST attach current weather data to each saved entry.

### Visualization

- **FR-041**: App MUST display a daily summary showing today's check-in status, streak count, total entries, and a 7-day mood history.
- **FR-042**: App MUST display a 28-day history calendar with color-coded cells and 5 switchable view modes (core feeling, mood assessment, physical/mental/emotional energy).
- **FR-043**: App MUST allow selecting history calendar cells to load entries into the check-in form. When a day has multiple entries, the most recent entry loads.

### Navigation

- **FR-044**: App MUST support 4 sections (Check-in, Overview, Settings, Info) with URL-based routing and browser back/forward navigation.
- **FR-045**: App MUST persist the active section across page reloads.

### Theme and Language

- **FR-046**: App MUST support 3 themes (Light, Dark, System) with immediate visual effect.
- **FR-047**: App MUST support 2 languages (English, Dutch) with instant text update (no page reload).
- **FR-048**: All user-facing strings MUST be available in both English and Dutch.

### Data Integrity

- **FR-049**: App MUST normalize all entries on load with defensive handling of missing fields and wrong types, filling defaults where needed.
- **FR-050**: App MUST generate a unique ID for entries missing one.
- **FR-051**: App MUST escape user-supplied strings rendered into the interface to prevent cross-site scripting (XSS).

### Utilities

- **FR-052**: App MUST generate approximately 30 demo entries spread over 90 days with randomized data when the user activates "Generate demo data".
- **FR-053**: App MUST clear all local data and reload in default state when the user confirms "Clear all data".

---

## Non-Functional Requirements

### Privacy and Security

- **NFR-001**: All user data MUST remain on the user's device. No personal data may be transmitted to any server, analytics service, or third-party endpoint.
- **NFR-002**: The sole permitted network request is the optional weather fetch, which sends only geographic coordinates — never user-generated content.
- **NFR-003**: No cookies, tracking pixels, or analytics scripts are permitted.
- **NFR-004**: All user input rendered into the interface MUST be escaped to prevent cross-site scripting (XSS).

### Internationalization

- **NFR-005**: Every user-facing string MUST be available in both English and Dutch.
- **NFR-006**: Language switching MUST be instant with no page reload.

### Accessibility

- **NFR-007**: Interactive elements MUST use correct semantic roles, labels, and keyboard support.
- **NFR-008**: Color MUST NOT be the sole means of conveying information — text labels or patterns MUST accompany color-coded elements.
- **NFR-009**: Theme support MUST maintain sufficient contrast ratios.

### Performance

- **NFR-010**: The app MUST load and become interactive within 2 seconds.
- **NFR-011**: All user interactions MUST respond within 200 milliseconds.

### Browser Compatibility

- **NFR-012**: The app MUST work in any modern browser (Chrome, Firefox, Safari, Edge) supporting local storage and network requests.

### Resilience

- **NFR-013**: Storage writes MUST gracefully degrade when storage quota is exceeded (no crash, informative feedback).

---

## Edge Cases

- **Storage quota exceeded**: Saving when quota is exceeded must not crash the app; an informative message appears.
- **Empty states everywhere**: Overview with no entries shows empty-state message; summary shows "Not checked in today"; history shows neutral/gray cells.
- **Extremely long text**: Notes with 10,000+ characters are accepted without the application hanging.
- **Special characters in text fields**: HTML entities and script tags are safely escaped and displayed as literal text (XSS prevention).
- **Rapid double-activation of save**: Does not create duplicate entries. The save function is disabled immediately upon activation and re-enabled after completion or failure.
- **Multiple entries per day**: 5+ entries on the same day each get unique timestamp-based keys and correct ordering.
- **Date boundary**: Creating an entry at 23:59 and another at 00:01 produces entries on two different date keys.
- **Page out of bounds**: Navigating to a page beyond the available range clamps to the last valid page.
- **Empty search after filter**: Clearing search after applying a date filter retains the date filter.
- **Import with extra/missing fields**: Imported entries with unknown fields are ignored; missing fields are filled with defaults.
- **Settings import with unknown keys**: Unknown settings keys are ignored; missing keys are filled with defaults.
- **Save validation without mood selection**: Validation catches the missing mood and shows a warning (when mood components are enabled).
- **All components disabled then re-enabled**: Re-enabling shows components correctly without stale state.
- **Browser back/forward across sections**: Navigation correctly updates the active section.
- **Invalid URL on load**: Default section (check-in) activates.
- **Concurrent tabs**: Two browser tabs open with the app; changes in one tab do not auto-sync to the other (no conflicts expected).

---

## Key Entities

- **Check-in Entry**: A timestamped record containing thoughts, core feeling, emotion variant, custom feelings, body signals, body note, energy levels (physical, mental, emotional — each 0–100 or null), energy note, mood position (energy 1–10, valence 1–10 or null), action, note, weather data, and a derived mood category. Each entry has a unique ID and timestamp-based key. Multiple entries per day are supported.

- **Settings**: User preferences controlling the app experience: default language, theme, default emotion variant, rows per page, max characters in overview cells, energy label for third dimension, weather location (name + coordinates), quick actions (list of phrases), and 10 component visibility toggles (weather, thoughts, core feeling, body signals, physical/mental/emotional energy, mood assessment, actions, note).

- **Weather Cache**: Cached weather data per location with a timestamp for expiry (1 hour TTL).

- **Overview State**: Persisted table state including search term, active filter, sort column, sort direction, and current page.

- **Emotion Variant**: A named configuration containing an array of emotion labels and corresponding colors. Five variants: ACT (8), Plutchik (8), Ekman (6), Junto (6), Extended (12).

- **Mood Grid**: A 10×10 bilingual matrix of mood labels (100 per language) with corresponding position colors. Energy axis (vertical, high→low, rows 1–10) and valence axis (horizontal, negative→positive, columns 1–10). The canonical labels are:

  **English (rows top→bottom = high energy→low energy, columns left→right = negative→positive)**:

  | | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  |---|---|---|---|---|---|---|---|---|---|---|
  | **10** | Furious | Panicked | Stressed | Nervous | Shocked | Surprised | Cheerful | Festive | Excited | Ecstatic |
  | **9** | Pissed | Irate | Frustrated | Tense | Bewildered | Hyper | Upbeat | Motivated | Inspired | Delighted |
  | **8** | Indignant | Afraid | Angry | Anxious | Restless | Energized | Lively | Elated | Optimistic | Enthusiastic |
  | **7** | Fearful | Worried | Concerned | Irritated | Annoyed | Pleased | Focused | Happy | Proud | Moved |
  | **6** | Aversion | Uneasy | Worried | Uncomfortable | Touched | Cheerful | Joyful | Hopeful | Playful | Happy |
  | **5** | Disgusted | Gloomy | Disappointed | Sad | Apathetic | At ease | Compliant | Content | Loving | Fulfilled |
  | **4** | Pessimistic | Grumpy | Discouraged | Sorrowful | Bored | Calm | Safe | Satisfied | Grateful | Touched |
  | **3** | Alienated | Miserable | Lonely | Defeated | Tired | Relaxed | Meditative | Peaceful | Blessed | Balanced |
  | **2** | Despondent | Depressed | Sullen | Exhausted | Depleted | Gentle | Thoughtful | Tranquil | Comfortable | Carefree |
  | **1** | Desperate | Hopeless | Desolate | Burned out | Drained | Sleepy | Content | Serene | Cozy | Serene |

  **Dutch (Nederlands)**:

  | | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  |---|---|---|---|---|---|---|---|---|---|---|
  | **10** | Woedend | In paniek | Gestrest | Zenuwachtig | Geschokt | Verrast | Vrolijk | Feestelijk | Opgewonden | Extatisch |
  | **9** | Pissig | Driftig | Gefrustreerd | Gespannen | Verbijsterd | Hyper | Opgewekt | Gemotiveerd | Geïnspireerd | Verrukt |
  | **8** | Verbolgen | Bang | Boos | Nerveus | Rusteloos | Opgeladen | Levendig | Opgetogen | Optimistisch | Enthousiast |
  | **7** | Angstig | Ongerust | Bezorgd | Geïrriteerd | Geërgerd | Verheugd | Gefocust | Blij | Trots | Ontroerd |
  | **6** | Aversie | Onrustig | Bezorgd | Ongemakkelijk | Geraakt | Monter | Vreugdevol | Hoopvol | Speels | Gelukkig |
  | **5** | Walgend | Somber | Teleurgesteld | Verdrietig | Apathisch | Op je gemak | Meegaand | Content | Liefdevol | Vervuld |
  | **4** | Pessimistisch | Chagrijnig | Ontmoedigd | Bedroefd | Verveeld | Kalm | Veilig | Tevreden | Dankbaar | Bewogen |
  | **3** | Vervreemd | Ellendig | Eenzaam | Verslagen | Moe | Ontspannen | Meditatief | Vredig | Gezegend | In balans |
  | **2** | Moedeloos | Depressief | Nors | Uitgeput | Leeg | Mild | Bedachtzaam | Rustig | Comfortabel | Zorgeloos |
  | **1** | Wanhopig | Hopeloos | Troosteloos | Opgebrand | Leeggezogen | Slaperig | Voldaan | Serene | Knus | Serene |

- **Mood Score Map**: A mapping from emotion names to a classification (positive, mixed, negative) used for color-coding and mood categorization in history views.

- **Body Zones**: 26 named zones covering the full body: head, neck, chest, abdomen, left/right shoulder, left/right upper arm, left/right elbow, left/right forearm, left/right hand, left/right hip, left/right upper leg, left/right knee, left/right lower leg, left/right foot, upper back, lower back.

---

## Success Criteria

- **SC-001**: Users can complete a full check-in (all components) in under 3 minutes.
- **SC-002**: The app loads and is interactive within 2 seconds.
- **SC-003**: All 23 user stories are fully functional and independently testable.
- **SC-004**: Every user-facing string is available in both English and Dutch with instant switching.
- **SC-005**: All 26 body signal zones are selectable and toggle correctly.
- **SC-006**: All 5 emotion variants function correctly with the proper emotion count, colors, and labels.
- **SC-007**: The 10×10 mood assessment grid displays all 100 bilingual labels correctly in both languages.
- **SC-008**: Entries persist across page reloads with zero data loss.
- **SC-009**: Import/export round-trips produce identical data — export then import results in the same entries.
- **SC-010**: Dark, light, and system themes all render with sufficient contrast and unbroken layouts.
- **SC-011**: Weather data is cached for 1 hour and auto-refreshes after expiry.
- **SC-012**: No user data leaves the device — only weather requests with coordinates are permitted.
- **SC-013**: Code injection in any text field is safely escaped and displayed as literal text.
- **SC-014**: The app runs without external runtime dependencies or build steps.

---

## Assumptions

- The application targets modern browsers (Chrome, Firefox, Safari, Edge) — no legacy browser support needed.
- Local storage is available and has at least 5MB capacity (standard browser default).
- The weather API is free, requires no API key, and is the only permitted external service.
- Weather is an optional component — the application MUST work fully offline when weather is disabled.
- The application is designed for personal use on a single device — no multi-device synchronization, no user accounts.
- When switching emotion variants, the previous selection is cleared (variants are not interchangeable).
- Quick action defaults are language-specific.
- Date/time-based keys are based on the local timezone of the device.
- Demo data generation creates random but realistic entries across emotions, energy levels, and weather.
- The body figure zone names use English identifiers internally regardless of display language.
