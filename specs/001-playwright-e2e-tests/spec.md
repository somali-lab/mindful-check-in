# Feature Specification: Comprehensive Playwright E2E Test Suite

**Feature Branch**: `001-playwright-e2e-tests`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Build a very extensive set of Playwright tests covering all possibilities and functionalities. Optional component visibility combinations, happy paths, unhappy paths, edge cases — better too much than too little."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Check-in Happy Path (Priority: P1)

A user opens the app, fills in every check-in component (thoughts, emotion wheel, body signals, energy meters, mood matrix, action, note), saves the entry, and sees confirmation.

**Why this priority**: The check-in form is the core feature of the app. If this flow breaks, the app is unusable.

**Independent Test**: Can be fully tested by filling every field and clicking Save; verify data appears in localStorage and the success banner shows.

**Acceptance Scenarios**:

1. **Given** a fresh app with no entries, **When** the user fills all fields and clicks Save, **Then** a success message appears and the entry is stored in localStorage.
2. **Given** an existing entry for today, **When** the user modifies fields and clicks Save, **Then** the existing entry is updated (not duplicated).
3. **Given** an existing entry for today, **When** the user clicks "New check-in", fills fields, and saves, **Then** a second timestamped entry is created for the same day.
4. **Given** all fields filled, **When** Save completes, **Then** the summary card updates to show today's check-in time, the 7-day heatmap reflects the new entry, and the streak counter increments if applicable.

---

### User Story 2 - Emotion Wheel Variants (Priority: P1)

A user switches between all five emotion wheel types (ACT, Plutchik, Ekman, Junto, Extended) and selects emotions from each.

**Why this priority**: The emotion wheel is one of two mood inputs required for saving. All variants must render and respond correctly.

**Independent Test**: Can be tested by changing the wheel type selector and clicking segments on each variant.

**Acceptance Scenarios**:

1. **Given** the ACT wheel is active, **When** the user selects "joy", **Then** the segment highlights and the display shows "joy".
2. **Given** any wheel variant, **When** the user clicks reset, **Then** no emotion is selected and the display clears.
3. **Given** the Ekman wheel (6 segments), **When** switching to Extended (12 segments), **Then** the wheel redraws with 12 segments and no previous selection carries over.
4. **Given** a saved entry with wheelType "plutchik" and emotion "trust", **When** loading that entry, **Then** the wheel switches to Plutchik and "trust" is highlighted.
5. **Given** each of the 5 variants, **When** each segment is clicked, **Then** the correct emotion name displays for all segments across all variants.

---

### User Story 3 - Body Signals Interaction (Priority: P1)

A user clicks body parts on the interactive SVG figure to mark where they feel physical sensations.

**Why this priority**: Body signals are a core data capture component with 26+ interactive zones.

**Independent Test**: Can be tested by clicking body parts and verifying the selection display updates.

**Acceptance Scenarios**:

1. **Given** no body parts selected, **When** the user clicks "chest", **Then** the chest zone highlights and "Chest" appears in the signals display.
2. **Given** "chest" is selected, **When** the user clicks "chest" again, **Then** it deselects and disappears from the display.
3. **Given** multiple parts selected (head, chest, left-hand), **When** the user clicks reset, **Then** all selections clear.
4. **Given** 5 body parts selected, **When** saving and re-loading the entry, **Then** the same 5 parts are highlighted.
5. **Given** the body signals component, **When** all 26+ zones are clicked one by one, **Then** each toggles correctly without affecting others.

---

### User Story 4 - Energy Meters (Priority: P1)

A user sets physical, mental, and emotional/social energy by clicking the energy meter bars at various heights.

**Why this priority**: Energy meters are a core data capture component with three sub-meters.

**Independent Test**: Can be tested by clicking meter areas and checking the displayed percentage.

**Acceptance Scenarios**:

1. **Given** physical energy meter at null, **When** the user clicks near the top of the meter, **Then** the fill shows approximately 90–100% and the display updates.
2. **Given** mental energy meter at 50%, **When** the user clicks a scale label "75", **Then** the fill jumps to 75%.
3. **Given** all three meters set, **When** reset is clicked, **Then** all three return to null and displays clear.
4. **Given** energy values set to 30/60/90, **When** saving and reloading, **Then** the meters show 30/60/90 respectively.

---

### User Story 5 - Mood Matrix Grid (Priority: P1)

A user selects a cell on the 10×10 mood matrix grid and sees the corresponding mood label.

**Why this priority**: The mood matrix is the second mood input option (alternative to core feeling) and covers 100 mood labels.

**Independent Test**: Can be tested by clicking grid cells and verifying mood label, energy, and valence values.

**Acceptance Scenarios**:

1. **Given** no mood selected, **When** clicking cell (energy=8, valence=9), **Then** the display shows a positive mood label and "E 8/10, V 9/10".
2. **Given** mood grid selected, **When** reset is clicked, **Then** the selection clears and "No mood selected" displays.
3. **Given** a mood grid selection, **When** saving and reloading, **Then** the same cell re-highlights.
4. **Given** the grid, **When** clicking multiple cells sequentially, **Then** only the last selection is active.

---

### User Story 6 - Save Validation (Priority: P1)

The app enforces that at least one mood input (core feeling or mood matrix) is provided before allowing save, depending on which components are enabled.

**Why this priority**: Save validation prevents empty entries and is the gate for data persistence.

**Independent Test**: Can be tested by attempting to save with no mood data selected and verifying the warning.

**Acceptance Scenarios**:

1. **Given** both core feeling and mood matrix enabled but neither selected, **When** Save is clicked, **Then** a warning message appears and no entry is saved.
2. **Given** only core feeling enabled and a feeling selected, **When** Save is clicked, **Then** the entry saves successfully.
3. **Given** only mood matrix enabled and a cell selected, **When** Save is clicked, **Then** the entry saves successfully.
4. **Given** both core feeling and mood matrix disabled in settings, **When** Save is clicked, **Then** the entry saves without requiring mood input.
5. **Given** core feeling selected but mood matrix not selected, **When** Save is clicked, **Then** the entry saves (only one is needed).

---

### User Story 7 - Component Visibility Toggles (Priority: P2)

A user hides and shows optional check-in components via Settings and the UI adapts accordingly.

**Why this priority**: Component visibility is a key personalization feature; hidden components must not break form logic or data persistence.

**Independent Test**: Can be tested by toggling each component off/on in settings and verifying the check-in form adapts.

**Acceptance Scenarios**:

1. **Given** weather is enabled, **When** the user disables it in Settings and saves, **Then** the weather widget disappears from the check-in tab.
2. **Given** all components are enabled, **When** each is individually disabled, **Then** its section disappears from the check-in tab, and no errors occur.
3. **Given** all components are disabled except thoughts, **When** saving a check-in (no mood required since both mood inputs are off), **Then** the entry saves successfully.
4. **Given** all three energy types are disabled, **When** viewing the check-in tab, **Then** the entire energy panel is hidden.
5. **Given** core feeling is disabled, **When** viewing 28-day history, **Then** the "Core feeling" mode button is absent from the mode selector.
6. **Given** a component is hidden, **When** data previously saved for that component is loaded, **Then** the hidden component's data is preserved (not deleted) and visible in the overview table.

---

### User Story 8 - Visibility Combination Matrix (Priority: P2)

The app functions correctly under various combinations of enabled/disabled components — including all-on, all-off, and common subsets.

**Why this priority**: Combinations of optional components can trigger hidden bugs in layout, validation, and data persistence.

**Independent Test**: Can be tested by configuring specific component visibility presets and verifying form behavior, save behavior, and data display.

**Acceptance Scenarios**:

1. **Given** all 10 component toggles on, **When** filling and saving a check-in, **Then** all data persists and displays in the overview.
2. **Given** all 10 component toggles off, **When** filling just thoughts (which has no dedicated toggle but is always accessible as an input), **Then** save works without error if both mood inputs are disabled.
3. **Given** only core feeling and thoughts, **When** selecting an emotion and saving, **Then** only those fields are populated in the entry.
4. **Given** only mood matrix and actions, **When** selecting a mood cell, adding an action, and saving, **Then** only those fields are populated.
5. **Given** only one energy type (mental) enabled, **When** setting mental energy and saving, **Then** the energy panel shows only the mental meter.
6. **Given** body signals off but energy on, **When** the check-in form renders, **Then** the body figure SVG is hidden but the energy panel displays correctly.

---

### User Story 9 - Overview Table Rendering and Sorting (Priority: P2)

A user views the overview table with entries, sorts by different columns, and sees correct ordering.

**Why this priority**: The overview is the primary way to review historical data with sort, search, and pagination.

**Independent Test**: Can be tested by generating demo data and sorting by each column header.

**Acceptance Scenarios**:

1. **Given** 30 entries exist, **When** viewing the overview tab, **Then** a table displays with rows, pagination showing page count, and sorted by date descending by default.
2. **Given** the table sorted by date descending, **When** clicking the date header, **Then** the sort flips to ascending.
3. **Given** the overview, **When** clicking the "Core Feeling" header, **Then** entries sort alphabetically by emotion name.
4. **Given** sort state is set, **When** switching tabs and returning, **Then** the sort state persists.
5. **Given** hidden components in settings, **When** viewing the overview, **Then** columns for hidden components are absent.

---

### User Story 10 - Overview Search and Filtering (Priority: P2)

A user searches entries by keyword and filters by date range.

**Why this priority**: Search and filter are essential for finding specific past entries in larger datasets.

**Independent Test**: Can be tested by typing search terms and selecting filter options, verifying row counts.

**Acceptance Scenarios**:

1. **Given** entries containing "walk" in the action field, **When** searching for "walk", **Then** only matching entries appear.
2. **Given** entries exist across multiple months, **When** selecting "Last 7 days" filter, **Then** only entries within the last week appear.
3. **Given** search text "xyz" with no matching entries, **When** searching, **Then** an empty-state message displays.
4. **Given** search active, **When** the search field is cleared, **Then** all entries reappear.

---

### User Story 11 - Overview Pagination (Priority: P2)

A user navigates through pages of entries using First, Previous, Next, Last buttons.

**Why this priority**: Pagination is essential for usability with many entries.

**Independent Test**: Can be tested with 30+ entries and a rows-per-page setting of 5.

**Acceptance Scenarios**:

1. **Given** 30 entries with 7 rows per page, **When** viewing page 1, **Then** "Page 1 of 5" displays and Previous/First are disabled.
2. **Given** page 1, **When** clicking Next, **Then** page 2 loads and all four navigation buttons are enabled.
3. **Given** the last page, **When** viewing it, **Then** Next/Last buttons are disabled.
4. **Given** page 3, **When** clicking First, **Then** page 1 loads.
5. **Given** a search that reduces results to one page, **When** filtering, **Then** all pagination buttons are disabled.

---

### User Story 12 - Entry Export and Import (Priority: P2)

A user exports all entries as JSON and imports them back, choosing between overwrite and skip-duplicates.

**Why this priority**: Data portability and backup are critical for user trust (constitution principle III).

**Independent Test**: Can be tested by exporting, clearing data, and re-importing.

**Acceptance Scenarios**:

1. **Given** 10 entries exist, **When** clicking Export, **Then** a JSON file downloads containing all entries.
2. **Given** an exported file, **When** importing into an empty app, **Then** all entries appear.
3. **Given** existing entries that overlap with the import file, **When** importing and choosing "overwrite", **Then** matching entries are updated.
4. **Given** existing entries that overlap, **When** importing and choosing "skip", **Then** duplicates are skipped and a count message shows how many were added/skipped.
5. **Given** an invalid JSON file, **When** importing, **Then** an error message displays and no data changes.
6. **Given** a single entry, **When** clicking the per-row export button, **Then** that single entry downloads as JSON.

---

### User Story 13 - Entry Deletion (Priority: P2)

A user deletes an individual entry from the overview table.

**Why this priority**: Users must be able to remove entries they no longer want.

**Independent Test**: Can be tested by clicking delete on an entry and confirming.

**Acceptance Scenarios**:

1. **Given** an entry in the overview, **When** clicking the delete button and confirming, **Then** the entry is removed from the table and localStorage.
2. **Given** an entry in the overview, **When** clicking delete and cancelling, **Then** nothing changes.
3. **Given** today's entry is loaded in the form, **When** deleting it from the overview, **Then** the check-in form resets and hydrates the next available today entry (or clears).

---

### User Story 14 - Settings Configuration (Priority: P2)

A user configures all available settings and they persist and apply correctly.

**Why this priority**: Settings control the entire app experience — theme, language, component visibility, display preferences.

**Independent Test**: Can be tested by changing each setting, saving, and refreshing the page.

**Acceptance Scenarios**:

1. **Given** default settings, **When** changing the theme to "Dark" and saving, **Then** the `data-theme` attribute updates and the dark color scheme applies.
2. **Given** rows per page set to 5, **When** saving and viewing the overview, **Then** only 5 rows appear per page.
3. **Given** max chars set to 30, **When** viewing the overview, **Then** long text cells are truncated to 30 characters with "…".
4. **Given** the energy emotional label set to "Social", **When** viewing the check-in tab, **Then** the third energy meter label reads "Social".
5. **Given** the default wheel set to "Extended", **When** opening the check-in tab fresh, **Then** the emotion wheel uses the Extended variant.

---

### User Story 15 - Settings Export and Import (Priority: P3)

A user exports settings as JSON and imports them on another device/browser.

**Why this priority**: Settings portability supports multi-device usage without accounts.

**Independent Test**: Can be tested by exporting settings, modifying them, and re-importing.

**Acceptance Scenarios**:

1. **Given** custom settings, **When** clicking Export, **Then** a JSON file downloads (without weather coordinates for privacy).
2. **Given** an exported settings file, **When** importing, **Then** all settings apply immediately.
3. **Given** a corrupt/invalid settings file, **When** importing, **Then** an error message shows and current settings are unchanged.
4. **Given** default settings, **When** clicking Reset, **Then** all settings revert to defaults and a confirmation was required beforehand.

---

### User Story 16 - Quick Actions (Priority: P3)

A user configures quick action chips in settings and uses them during check-in.

**Why this priority**: Quick actions speed up the check-in flow with one-click phrases.

**Independent Test**: Can be tested by adding/removing quick actions in settings and clicking chips on the check-in tab.

**Acceptance Scenarios**:

1. **Given** default quick actions, **When** viewing the check-in tab with the action field visible, **Then** action chips appear below the action textarea.
2. **Given** chips displayed, **When** clicking a chip, **Then** the chip's text appends to the action textarea.
3. **Given** the settings quick actions editor, **When** typing a new action and pressing Enter, **Then** the action appears in the list.
4. **Given** a quick action in the editor list, **When** clicking the × button, **Then** the action is removed.
5. **Given** custom actions saved, **When** returning to the check-in tab, **Then** the chips reflect the custom list.

---

### User Story 17 - Theme Switching (Priority: P2)

A user switches between Light, Dark, and System themes.

**Why this priority**: Theme support is a constitution requirement (principle V) and affects readability.

**Independent Test**: Can be tested by clicking each theme button and verifying CSS custom properties change.

**Acceptance Scenarios**:

1. **Given** light theme active, **When** clicking the dark theme button, **Then** the `data-theme` attribute changes to "dark" and background colors update.
2. **Given** system theme active, **When** the OS is set to dark mode, **Then** the app renders in dark colors.
3. **Given** any theme, **When** the selected theme button is inspected, **Then** it has the `is-selected` class.
4. **Given** theme set to dark, **When** reloading the page, **Then** the dark theme persists.

---

### User Story 18 - Language Switching (Priority: P2)

A user toggles between English and Dutch and all UI text updates instantly.

**Why this priority**: Bilingual support is a constitution requirement (principle IV).

**Independent Test**: Can be tested by clicking the language toggle and verifying key UI strings change.

**Acceptance Scenarios**:

1. **Given** English active, **When** clicking "NL", **Then** all `[data-i18n]` elements update to Dutch text without page reload.
2. **Given** Dutch active, **When** clicking "EN", **Then** all elements revert to English.
3. **Given** language set to NL, **When** reloading the page, **Then** Dutch persists.
4. **Given** Dutch active, **When** viewing the mood matrix, **Then** mood labels display in Dutch.
5. **Given** English active, **When** viewing body signals, **Then** body part names are in English.

---

### User Story 19 - Weather Widget (Priority: P3)

The weather widget fetches and displays current conditions based on the configured location.

**Why this priority**: Weather is an optional component that depends on external API calls; needs testing with mocked responses.

**Independent Test**: Can be tested by mocking the Open-Meteo API and verifying widget rendering.

**Acceptance Scenarios**:

1. **Given** a valid weather location configured, **When** the page loads, **Then** the weather widget shows temperature, icon, description, and location name.
2. **Given** a cached weather response (< 1 hour old), **When** reloading, **Then** no API call is made and cached data displays.
3. **Given** the weather API is unreachable, **When** the page loads, **Then** the widget shows gracefully without crashing the app.
4. **Given** weather is disabled in component settings, **When** viewing the check-in tab, **Then** the weather widget is hidden.
5. **Given** a check-in is saved, **When** examining the entry, **Then** the current weather data is attached to the entry.

---

### User Story 20 - Weather Location Geocoding (Priority: P3)

A user changes the weather location in settings and the app geocodes the city name to coordinates.

**Why this priority**: Geocoding bridges user-friendly city names to API coordinates.

**Independent Test**: Can be tested by entering city names and verifying coordinate resolution.

**Acceptance Scenarios**:

1. **Given** weather location set to "Amsterdam", **When** saving settings, **Then** coordinates resolve to approximately 52.37°N, 4.90°E.
2. **Given** a nonexistent city name, **When** saving settings, **Then** a warning appears and coordinates remain null or previous.
3. **Given** location changed from "Amsterdam" to "Berlin", **When** saving, **Then** previous weather cache clears and new coordinates are stored.

---

### User Story 21 - Summary Card (Priority: P2)

The summary card displays today's status, 7-day heatmap, streak count, and total check-in count.

**Why this priority**: The summary provides at-a-glance insight into recent check-in behavior.

**Independent Test**: Can be tested by creating entries across multiple days and verifying summary values.

**Acceptance Scenarios**:

1. **Given** no entries exist, **When** viewing the check-in tab, **Then** the summary shows "Not checked in today yet" with no streak.
2. **Given** a check-in saved today, **When** viewing the summary, **Then** it shows "Checked in at: [time]" with a streak of 1.
3. **Given** entries on 5 consecutive days, **When** viewing the summary, **Then** the streak shows 5.
4. **Given** entries on scattered days, **When** viewing the 7-day heatmap, **Then** each day cell is colored by mood score (green/orange/red/gray).
5. **Given** 10 total entries, **When** viewing the summary, **Then** the total displays "10".

---

### User Story 22 - 28-Day History Calendar (Priority: P2)

The 28-day history calendar shows a 4-week grid with color-coded cells and mode switching.

**Why this priority**: History visualization is a primary way users track patterns over time.

**Independent Test**: Can be tested by creating entries across 28 days and switching between history modes.

**Acceptance Scenarios**:

1. **Given** entries over the past 28 days, **When** viewing the history, **Then** a 4×7 grid renders with color-coded cells.
2. **Given** the "Core feeling" mode active, **When** looking at a cell with emotion "joy", **Then** it shows a green/positive color.
3. **Given** mode switched to "Physical energy", **When** looking at entries, **Then** colors reflect energy levels (≥67 green, 34–66 orange, ≤33 red).
4. **Given** a cell with an entry, **When** clicking it, **Then** the entry loads into the check-in form and the tab stays on check-in.
5. **Given** disabled components, **When** viewing the mode selector, **Then** only enabled components appear as mode buttons.

---

### User Story 23 - Tab Navigation and URL Hash Routing (Priority: P3)

A user navigates between tabs using buttons and browser back/forward.

**Why this priority**: Tab navigation is the primary app navigation; hash routing supports deep linking and browser history.

**Independent Test**: Can be tested by clicking tabs and using browser navigation.

**Acceptance Scenarios**:

1. **Given** the check-in tab active, **When** clicking "Overview", **Then** the overview tab displays and the URL hash changes to `#overview`.
2. **Given** hash `#settings` in the URL, **When** loading the page, **Then** the settings tab is active.
3. **Given** multiple tab switches, **When** pressing browser Back, **Then** the previous tab activates.
4. **Given** an invalid hash like `#nonexistent`, **When** loading the page, **Then** the default tab (check-in) activates.
5. **Given** any tab active, **When** viewing, **Then** exactly one tab button has `is-selected` and exactly one panel is visible.

---

### User Story 24 - Demo Data Generation (Priority: P3)

A user generates 30 demo entries to explore the app.

**Why this priority**: Demo data helps new users understand features without manually entering data.

**Independent Test**: Can be tested by clicking "Generate demo data" and verifying entries appear.

**Acceptance Scenarios**:

1. **Given** an empty app, **When** clicking "Generate demo data" on the Info tab, **Then** 30 entries are created spread over 90 days.
2. **Given** demo data generated, **When** viewing the overview, **Then** entries appear with varied emotions, energy levels, and mood values.
3. **Given** existing entries, **When** generating demo data, **Then** the demo entries are added without deleting existing ones.

---

### User Story 25 - Clear All Data (Priority: P3)

A user clears all localStorage data from the Info tab.

**Why this priority**: Data clearing is a destructive but necessary user action for privacy.

**Independent Test**: Can be tested by clicking "Clear all data", confirming, and verifying localStorage is empty.

**Acceptance Scenarios**:

1. **Given** entries and settings exist, **When** clicking "Clear all local data" and confirming, **Then** all localStorage keys for the app are removed.
2. **Given** the clear action, **When** the user cancels the confirmation, **Then** no data is deleted.
3. **Given** data is cleared, **When** the page reloads, **Then** the app starts in its default state.

---

### User Story 26 - Data Normalization and Migration (Priority: P3)

The app correctly normalizes and migrates entries from older data formats on load.

**Why this priority**: Backwards compatibility prevents data loss for long-time users.

**Independent Test**: Can be tested by injecting legacy-format entries into localStorage and verifying normalization on load.

**Acceptance Scenarios**:

1. **Given** an entry with Dutch field name `gedachten` instead of `thoughts`, **When** loading the app, **Then** the field is migrated to `thoughts`.
2. **Given** an entry with energy as a single number (e.g., `energy: 75`), **When** loading, **Then** it normalizes to `{ physical: 75, mental: null, emotional: null }`.
3. **Given** an entry missing an `id` field, **When** loading, **Then** a UUID is auto-generated.
4. **Given** an entry with `moodmeter` instead of `moodGrid`, **When** loading, **Then** the mood data normalizes correctly.
5. **Given** an entry with `bodySignals` as `lichaamsignalen`, **When** loading, **Then** the field migrates to `bodySignals`.

---

### User Story 27 - Loading Historical Entries (Priority: P2)

A user loads a past entry from the overview or history calendar into the check-in form.

**Why this priority**: Reviewing past entries is a core interaction for self-reflection.

**Independent Test**: Can be tested by clicking an overview row or history cell and verifying form population.

**Acceptance Scenarios**:

1. **Given** an entry from 3 days ago, **When** clicking its overview row, **Then** the check-in form fills with that entry's data and the tab switches to check-in.
2. **Given** a loaded historical entry, **When** viewing the context pill, **Then** it shows the entry's date and time.
3. **Given** a historical entry loaded, **When** clicking Save, **Then** a new entry for today is created (not overwriting the old one).
4. **Given** an entry loaded with weather data, **When** viewing, **Then** the weather widget shows the entry's recorded weather (not current).

---

### Edge Cases

- **localStorage full**: Saving an entry when storage quota is exceeded silently fails without crashing.
- **Concurrent tabs**: Two browser tabs open with the app; changes in one tab do not auto-sync to the other (no conflicts).
- **Empty state everywhere**: Overview with no entries shows empty-state message; summary shows "Not checked in today"; history shows gray cells.
- **Extremely long text**: Notes with 10,000+ characters are accepted without browser hang.
- **Special characters in text fields**: HTML entities (`<script>`, `"quotes"`, `&amp;`) are escaped and display as literal text.
- **XSS prevention**: User input containing `<img onerror=alert(1)>` is safely escaped via `App.escapeHtml()`.
- **Rapid clicking**: Double-clicking Save does not create duplicate entries.
- **Multiple entries per day**: 5+ entries on the same day each get unique timestamped keys.
- **Date boundary**: Creating an entry at 23:59 and another at 00:01 produces entries on two different date keys.
- **Page out of bounds**: Navigating to page 999 when only 5 pages exist clamps to the last page.
- **Empty search after filter**: Clearing search after applying "Last 7 days" filter retains the date filter.
- **Import with extra/missing fields**: Imported entries with unknown fields are ignored; missing fields are filled with defaults.
- **Settings import with unknown keys**: Unknown settings keys are ignored; missing keys are filled with defaults.
- **Emotion wheel with no selection and save**: Validation catches the missing mood and shows a warning.
- **All components disabled then re-enabled**: Re-enabling shows components correctly without stale state.
- **Browser back/forward across tabs**: Hash routing correctly updates active tab.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Test suite MUST cover all 4 app tabs (Check-in, Overview, Settings, Info) with dedicated test files.
- **FR-002**: Test suite MUST verify all 10 component visibility toggles individually and in key combinations.
- **FR-003**: Test suite MUST verify save validation logic under all combinations of enabled/disabled mood inputs.
- **FR-004**: Test suite MUST cover all 5 emotion wheel variants with segment selection and reset.
- **FR-005**: Test suite MUST cover all 26+ body signal zones for click-to-toggle behavior.
- **FR-006**: Test suite MUST verify the 10×10 mood matrix grid cell selection, label display, and color rendering.
- **FR-007**: Test suite MUST verify energy meters at boundary values (0%, 50%, 100%) and reset.
- **FR-008**: Test suite MUST cover overview table sorting by every sortable column (date, coreFeeling, thoughts, bodySignals, energyPhysical, energyMental, energyEmotional, moodMatrix, actions).
- **FR-009**: Test suite MUST cover search (matching, no-match, clear) and date filters (all 5 ranges).
- **FR-010**: Test suite MUST verify pagination (first, prev, next, last, boundary states) with configurable rows per page.
- **FR-011**: Test suite MUST cover bulk export, single-entry export, and import flows (overwrite and skip modes).
- **FR-012**: Test suite MUST verify entry deletion with confirmation and cancellation paths.
- **FR-013**: Test suite MUST cover all settings: theme (3 values), language (2 values), wheel type (5 values), rows per page (boundary values), max chars (boundary values), energy label (3 values), weather location.
- **FR-014**: Test suite MUST verify settings export, import, and reset flows.
- **FR-015**: Test suite MUST verify quick actions add, remove, and chip-click behavior.
- **FR-016**: Test suite MUST cover theme switching (light/dark/system) with persistence across reload.
- **FR-017**: Test suite MUST cover language switching (EN/NL) with instant UI text update and persistence.
- **FR-018**: Test suite MUST verify the weather widget rendering with mocked API responses (success, failure, cached).
- **FR-019**: Test suite MUST verify the summary card (today status, streak, total count, 7-day heatmap).
- **FR-020**: Test suite MUST verify the 28-day history calendar (mode switching, cell clicks, color coding).
- **FR-021**: Test suite MUST verify tab navigation (button clicks, URL hash routing, browser back/forward, invalid hash).
- **FR-022**: Test suite MUST cover demo data generation (30 entries created, visible in overview).
- **FR-023**: Test suite MUST cover "Clear all data" with confirmation and cancellation.
- **FR-024**: Test suite MUST verify data normalization and migration of legacy field formats.
- **FR-025**: Test suite MUST verify XSS prevention: injected HTML in all text fields is escaped in rendered output.
- **FR-026**: Test suite MUST verify localStorage persistence: entries, settings, language, active tab, overview UI state survive page reload.
- **FR-027**: Test suite MUST test multiple entries per day (timestamped keys) and correct ordering.
- **FR-028**: Test suite MUST verify the context pill shows correct state for new, today, and historical entries.
- **FR-029**: Test suite MUST verify entry loading from overview row click and history calendar click.
- **FR-030**: Test suite MUST verify the "New check-in" button clears the form completely.

### Key Entities

- **Test Suite**: Collection of Playwright test files organized by app tab/feature area, executed against the app served locally.
- **Test Fixture**: Reusable helpers for common setup (inject entries into localStorage, mock weather API, configure settings, generate demo data).
- **Component Visibility Preset**: A named configuration of the 10 component toggles used to test visibility combinations systematically.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test suite covers 100% of the 30 functional requirements listed above, with at least one test per FR.
- **SC-002**: All tests pass on a clean checkout with no pre-existing localStorage data.
- **SC-003**: Tests complete in under 5 minutes total for the full suite on a standard development machine.
- **SC-004**: At least 200 individual test cases across all test files.
- **SC-005**: Every user-facing interaction (button click, input change, select change, SVG click) is exercised by at least one test.
- **SC-006**: At least 5 component visibility combination presets are tested (all-on, all-off, minimal-mood-only, energy-only, full-except-weather).
- **SC-007**: All edge cases listed above have at least one corresponding test.
- **SC-008**: Both English and Dutch language modes are verified in language-specific tests.
- **SC-009**: V8 code coverage is collected and reported; overall branch coverage exceeds 75% aggregate, with no individual file below 60% branches.
- **SC-010**: All tests are available to run on both desktop (Chromium) and mobile (Pixel 7 emulation) viewports via project selection.
- **SC-011**: No real external API calls are made during test runs; weather and geocoding APIs are globally mocked via `tests/fixtures/base.js`.
- **SC-012**: No ghost code remains in JS files (selectors referencing DOM elements absent from index.html).

## Assumptions

- The app is served locally via a static file server (e.g., `npx serve .`) during test runs; no build step is needed.
- Playwright will be installed as a dev dependency in the repository; this is the sole exception to the "zero dependencies" constitution principle, as it is a dev-only tool not shipped to users.
- Weather API calls will be intercepted and mocked in Playwright via a shared base fixture (`tests/fixtures/base.js`) to avoid external network dependencies and rate limiting.
- Tests run against Chromium as the primary browser plus Pixel 7 mobile emulation; cross-browser testing (Firefox, WebKit) is a nice-to-have but not required for v1.
- The test suite uses the Playwright Test runner (@playwright/test) with JavaScript test files.
- `localStorage` is manipulated directly via `page.evaluate()` for setup and assertions where appropriate.
- Code coverage is collected via monocart-reporter with V8 instrumentation when `COVERAGE=1` environment variable is set.
- No changes to the application source code are needed to support testing; tests interact with the existing DOM and localStorage interface.
- Minor incidental app improvements were made on this branch: weather fetch error display in settings (weather.js, settings.css, translations.js) and ghost code removal (withNotesOnly). These are out of scope for the test suite spec but documented here for traceability.
