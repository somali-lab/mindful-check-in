# Tasks: Comprehensive Playwright E2E Test Suite

**Input**: Design documents from `/specs/001-playwright-e2e-tests/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: This feature IS a test suite — every task produces test code. Tests are explicitly requested by the user.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Tests live in `tests/` at repository root
- Spec files: `tests/<feature>.spec.js`
- Shared helpers: `tests/fixtures/helpers.js`
- Config: `tests/playwright.config.js`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Playwright config, and shared test fixtures

- [ ] T001 Create `tests/package.json` with `@playwright/test` and `serve` as devDependencies in tests/package.json
- [ ] T002 Create Playwright config with webServer (serve parent dir on port 3000), baseURL, Chromium project, fullyParallel in tests/playwright.config.js
- [ ] T003 Create shared test helpers module with `injectEntries`, `injectSettings`, `mockWeatherAPI`, `createTestEntry`, `clearAppState`, `navigateToTab`, `getLocalStorageEntries`, `getLocalStorageSettings`, visibility presets (all-on, all-off, mood-only, energy-only, no-weather, single-energy, text-only) in tests/fixtures/helpers.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Install dependencies and verify basic infrastructure works

- [ ] T004 Run `npm install` in tests/ directory and `npx playwright install chromium` to verify setup works
- [ ] T005 Create a smoke test that loads the app, verifies the title is "Mindful Check-in", and the check-in tab is visible in tests/checkin.spec.js (first test in the file)

**Checkpoint**: `npx playwright test` runs successfully with the smoke test passing

---

## Phase 3: User Story 1 — Check-in Happy Path (Priority: P1) 🎯 MVP

**Goal**: Verify the complete check-in flow — fill all fields, save, update, create additional entry

**Independent Test**: Run `npx playwright test checkin.spec.js` — all core save/update/new-checkin scenarios pass

### Implementation for User Story 1

- [ ] T006 [US1] Write test: fresh app, fill all fields (thoughts, select emotion, click body parts, set energy meters, select mood cell, type action, type note), click Save, verify success banner appears and entry exists in localStorage in tests/checkin.spec.js
- [ ] T007 [US1] Write test: existing entry for today, modify thoughts field, click Save, verify entry is updated (not duplicated) in localStorage in tests/checkin.spec.js
- [ ] T008 [US1] Write test: existing entry for today, click "New check-in", fill fields, Save, verify a second timestamped entry key exists (`YYYY-MM-DD_HHMMSSmmm`) in tests/checkin.spec.js
- [ ] T009 [US1] Write test: after Save, verify summary card updates — "Checked in at" text appears, streak counter shows 1, total count shows 1 in tests/checkin.spec.js
- [ ] T010 [US1] Write test: verify context pill shows "New · not saved yet" before save, shows entry date after save in tests/checkin.spec.js

**Checkpoint**: User Story 1 fully functional — `npx playwright test checkin.spec.js` passes

---

## Phase 4: User Story 2 — Emotion Wheel Variants (Priority: P1)

**Goal**: Verify all 5 emotion wheel types render correctly with segment selection and reset

**Independent Test**: Run `npx playwright test emotion-wheel.spec.js`

### Implementation for User Story 2

- [ ] T011 [P] [US2] Write test: ACT wheel active, click "joy" segment, verify segment highlights and display shows "joy" in tests/emotion-wheel.spec.js
- [ ] T012 [P] [US2] Write test: select emotion, click reset button, verify no emotion selected and display clears in tests/emotion-wheel.spec.js
- [ ] T013 [P] [US2] Write test: switch from Ekman (6 segments) to Extended (12 segments), verify wheel redraws with 12 segments and no selection carries over in tests/emotion-wheel.spec.js
- [ ] T014 [P] [US2] Write test: inject saved entry with wheelType "plutchik" and emotion "trust", load entry, verify wheel switches to Plutchik and "trust" highlights in tests/emotion-wheel.spec.js
- [ ] T015 [P] [US2] Write parameterized tests for all 5 variants (ACT/Plutchik/Ekman/Junto/Extended): switch to each, click each segment, verify correct emotion name displays in tests/emotion-wheel.spec.js

**Checkpoint**: Emotion wheel tests pass for all 5 variants

---

## Phase 5: User Story 3 — Body Signals Interaction (Priority: P1)

**Goal**: Verify all 26+ body part zones toggle correctly, reset works, and selections persist

**Independent Test**: Run `npx playwright test body-signals.spec.js`

### Implementation for User Story 3

- [ ] T016 [P] [US3] Write test: click "chest" zone, verify it highlights (has is-selected class) and "Chest" text appears in signals display in tests/body-signals.spec.js
- [ ] T017 [P] [US3] Write test: click "chest" to select, click again to deselect, verify deselection removes highlight and display text in tests/body-signals.spec.js
- [ ] T018 [P] [US3] Write test: select multiple parts (head, chest, left-hand), click reset, verify all selections clear in tests/body-signals.spec.js
- [ ] T019 [P] [US3] Write test: select 5 body parts, save entry, reload entry, verify same 5 parts re-highlight in tests/body-signals.spec.js
- [ ] T020 [P] [US3] Write parameterized test: iterate all 26+ body part zones, click each one individually, verify each toggles on/off without affecting others in tests/body-signals.spec.js

**Checkpoint**: Body signals tests pass for all zones

---

## Phase 6: User Story 4 — Energy Meters (Priority: P1)

**Goal**: Verify energy meters respond to clicks, scale labels, reset, and boundary values

**Independent Test**: Run `npx playwright test energy-meters.spec.js`

### Implementation for User Story 4

- [ ] T021 [P] [US4] Write test: click near top of physical energy meter, verify fill shows approximately 90–100% and display updates in tests/energy-meters.spec.js
- [ ] T022 [P] [US4] Write test: click scale label "75" on mental meter, verify fill jumps to 75% in tests/energy-meters.spec.js
- [ ] T023 [P] [US4] Write test: set all three meters, click reset, verify all return to null and displays clear in tests/energy-meters.spec.js
- [ ] T024 [P] [US4] Write test: set energy to 30/60/90, save, reload entry, verify meters display 30/60/90 in tests/energy-meters.spec.js
- [ ] T025 [P] [US4] Write test: click scale label "0" (boundary), verify 0% fill; click "100", verify 100% fill in tests/energy-meters.spec.js

**Checkpoint**: Energy meter tests pass for all 3 meters + boundaries

---

## Phase 7: User Story 5 — Mood Matrix Grid (Priority: P1)

**Goal**: Verify 10×10 mood grid cell selection, label display, reset, and persistence

**Independent Test**: Run `npx playwright test mood-matrix.spec.js`

### Implementation for User Story 5

- [ ] T026 [P] [US5] Write test: click cell (energy=8, valence=9), verify display shows positive mood label and "E 8/10, V 9/10" in tests/mood-matrix.spec.js
- [ ] T027 [P] [US5] Write test: select mood cell, click reset, verify selection clears in tests/mood-matrix.spec.js
- [ ] T028 [P] [US5] Write test: save entry with mood grid selection, reload, verify same cell re-highlights in tests/mood-matrix.spec.js
- [ ] T029 [P] [US5] Write test: click multiple cells sequentially, verify only last selection is active in tests/mood-matrix.spec.js
- [ ] T030 [P] [US5] Write test: click corner cells (1,1), (1,10), (10,1), (10,10) to verify boundary labels render correctly in tests/mood-matrix.spec.js

**Checkpoint**: Mood matrix tests pass for selection, reset, and boundaries

---

## Phase 8: User Story 6 — Save Validation (Priority: P1)

**Goal**: Verify mood requirement logic under all component visibility configurations

**Independent Test**: Run `npx playwright test save-validation.spec.js`

### Implementation for User Story 6

- [ ] T031 [P] [US6] Write test: both core feeling and mood matrix enabled, neither selected, click Save, verify warning message appears and no entry saved in tests/save-validation.spec.js
- [ ] T032 [P] [US6] Write test: only core feeling enabled, select feeling, Save, verify success in tests/save-validation.spec.js
- [ ] T033 [P] [US6] Write test: only mood matrix enabled, select cell, Save, verify success in tests/save-validation.spec.js
- [ ] T034 [P] [US6] Write test: both mood inputs disabled in settings, Save, verify success without mood requirement in tests/save-validation.spec.js
- [ ] T035 [P] [US6] Write test: core feeling selected + mood matrix NOT selected, Save, verify success (only one needed) in tests/save-validation.spec.js

**Checkpoint**: Save validation tests cover all visibility-dependent rules

---

## Phase 9: User Story 7 — Component Visibility Toggles (Priority: P2)

**Goal**: Verify each of the 10 component toggles hides/shows its section correctly

**Independent Test**: Run `npx playwright test component-visibility.spec.js`

### Implementation for User Story 7

- [ ] T036 [US7] Write test: disable weather in settings, save, verify weather widget hidden on check-in tab in tests/component-visibility.spec.js
- [ ] T037 [US7] Write parameterized test: for each of 10 component toggles, disable individually, verify its section disappears and no JS errors occur in tests/component-visibility.spec.js
- [ ] T038 [US7] Write test: disable all components except thoughts, save check-in (no mood required), verify entry saves successfully in tests/component-visibility.spec.js
- [ ] T039 [US7] Write test: disable all 3 energy types, verify entire energy panel is hidden in tests/component-visibility.spec.js
- [ ] T040 [US7] Write test: disable core feeling, view 28-day history, verify "Core feeling" mode button is absent from mode selector in tests/component-visibility.spec.js
- [ ] T041 [US7] Write test: hide component, load entry with data for that component, verify data preserved in localStorage and visible in overview table in tests/component-visibility.spec.js

---

## Phase 10: User Story 8 — Visibility Combination Matrix (Priority: P2)

**Goal**: Verify correct behavior under key preset combinations of enabled/disabled components

**Independent Test**: Run `npx playwright test component-visibility.spec.js` (tests added to same file)

### Implementation for User Story 8

- [ ] T042 [P] [US8] Write test: all-on preset — fill all fields, save, verify all data in localStorage and overview in tests/component-visibility.spec.js
- [ ] T043 [P] [US8] Write test: all-off preset — verify save works without error (no mood required) in tests/component-visibility.spec.js
- [ ] T044 [P] [US8] Write test: mood-only preset — select emotion, save, verify only mood fields populated in tests/component-visibility.spec.js
- [ ] T045 [P] [US8] Write test: energy-only preset — verify only energy panel with all 3 meters visible in tests/component-visibility.spec.js
- [ ] T046 [P] [US8] Write test: single-energy preset (mental only) — verify only mental meter visible, physical and emotional hidden in tests/component-visibility.spec.js
- [ ] T047 [P] [US8] Write test: text-only preset — verify no interactive visualizations (wheel, body, grid) visible in tests/component-visibility.spec.js

**Checkpoint**: 7 visibility presets tested with form behavior, save behavior, and data display

---

## Phase 11: User Story 9 — Overview Table and Sorting (Priority: P2)

**Goal**: Verify table rendering, column visibility, and sorting by all sortable columns

**Independent Test**: Run `npx playwright test overview-table.spec.js`

### Implementation for User Story 9

- [ ] T048 [P] [US9] Write test: inject 30 entries, navigate to overview, verify table renders with rows and pagination in tests/overview-table.spec.js
- [ ] T049 [P] [US9] Write test: default sort is date descending, click date header, verify sort flips to ascending in tests/overview-table.spec.js
- [ ] T050 [P] [US9] Write test: click "Core Feeling" header, verify entries sort alphabetically by emotion name in tests/overview-table.spec.js
- [ ] T051 [P] [US9] Write test: set sort state, switch tabs and return, verify sort state persists via localStorage in tests/overview-table.spec.js
- [ ] T052 [P] [US9] Write test: hide components in settings, verify corresponding overview columns are absent in tests/overview-table.spec.js
- [ ] T053 [P] [US9] Write parameterized test: sort by each sortable column (date, coreFeeling, thoughts, bodySignals, energyPhysical, energyMental, energyEmotional, moodMatrix, actions), verify order changes in tests/overview-table.spec.js

**Checkpoint**: Overview table tests pass for all sort columns and column visibility

---

## Phase 12: User Story 10 — Overview Search and Filtering (Priority: P2)

**Goal**: Verify search, date filters, and notes-only checkbox

**Independent Test**: Run `npx playwright test overview-search-filter.spec.js`

### Implementation for User Story 10

- [ ] T054 [P] [US10] Write test: inject entries with "walk" in action, search "walk", verify only matching entries appear in tests/overview-search-filter.spec.js
- [ ] T055 [P] [US10] Write test: inject entries across months, select "Last 7 days" filter, verify only recent entries shown in tests/overview-search-filter.spec.js
- [ ] T056 [P] [US10] Write test: search "xyz" with no matches, verify empty-state message displays in tests/overview-search-filter.spec.js
- [ ] T057 [P] [US10] Write test: check "Only with notes" checkbox, verify only entries with non-empty note/action/bodyNote/energyNote/customFeelings shown in tests/overview-search-filter.spec.js
- [ ] T058 [P] [US10] Write test: type search text, then clear search field, verify all entries reappear in tests/overview-search-filter.spec.js
- [ ] T059 [P] [US10] Write test: verify all 5 date filter options (All, Today, Last 7 days, Last 2 weeks, Last month, Last 3 months) filter correctly in tests/overview-search-filter.spec.js

**Checkpoint**: Search and filter tests pass for all filter modes

---

## Phase 13: User Story 11 — Overview Pagination (Priority: P2)

**Goal**: Verify page navigation buttons and boundary states

**Independent Test**: Run `npx playwright test overview-pagination.spec.js`

### Implementation for User Story 11

- [ ] T060 [P] [US11] Write test: inject 30 entries with 7 rows per page, verify "Page 1 of 5", Previous/First disabled on page 1 in tests/overview-pagination.spec.js
- [ ] T061 [P] [US11] Write test: click Next from page 1, verify page 2 loads and all nav buttons enabled in tests/overview-pagination.spec.js
- [ ] T062 [P] [US11] Write test: navigate to last page, verify Next/Last disabled in tests/overview-pagination.spec.js
- [ ] T063 [P] [US11] Write test: from page 3, click First, verify page 1 loads in tests/overview-pagination.spec.js
- [ ] T064 [P] [US11] Write test: search reduces results to 1 page, verify all pagination buttons disabled in tests/overview-pagination.spec.js

**Checkpoint**: Pagination tests pass for all boundary states

---

## Phase 14: User Story 12 — Entry Export and Import (Priority: P2)

**Goal**: Verify bulk export, single export, and import flows with merge modes

**Independent Test**: Run `npx playwright test export-import.spec.js`

### Implementation for User Story 12

- [ ] T065 [P] [US12] Write test: inject 10 entries, click Export, verify download event fires and JSON file contains all entries in tests/export-import.spec.js
- [ ] T066 [P] [US12] Write test: import valid JSON into empty app, verify all entries appear in overview in tests/export-import.spec.js
- [ ] T067 [P] [US12] Write test: import with overlapping entries, choose "overwrite" in confirm dialog, verify entries updated in tests/export-import.spec.js
- [ ] T068 [P] [US12] Write test: import with overlapping entries, choose "skip" in confirm dialog, verify duplicates skipped and count message shows in tests/export-import.spec.js
- [ ] T069 [P] [US12] Write test: import invalid JSON file, verify error message displays and no data changes in tests/export-import.spec.js
- [ ] T070 [P] [US12] Write test: click per-row export button, verify single entry downloads as JSON in tests/export-import.spec.js

**Checkpoint**: Export/import tests pass for all merge modes and error cases

---

## Phase 15: User Story 13 — Entry Deletion (Priority: P2)

**Goal**: Verify delete with confirm and cancel paths

**Independent Test**: Run `npx playwright test entry-deletion.spec.js`

### Implementation for User Story 13

- [ ] T071 [P] [US13] Write test: click delete button on entry row, accept confirm dialog, verify entry removed from table and localStorage in tests/entry-deletion.spec.js
- [ ] T072 [P] [US13] Write test: click delete button, dismiss confirm dialog, verify nothing changes in tests/entry-deletion.spec.js
- [ ] T073 [P] [US13] Write test: today's entry loaded in form, delete it from overview, verify form resets and hydrates next available entry in tests/entry-deletion.spec.js

**Checkpoint**: Deletion tests pass for confirm/cancel/active-entry scenarios

---

## Phase 16: User Story 14 — Settings Configuration (Priority: P2)

**Goal**: Verify all settings fields persist and apply correctly

**Independent Test**: Run `npx playwright test settings.spec.js`

### Implementation for User Story 14

- [ ] T074 [P] [US14] Write test: change theme to "Dark", save settings, verify `data-theme` attribute changes to "dark" in tests/settings.spec.js
- [ ] T075 [P] [US14] Write test: set rows per page to 5, save, navigate to overview with 30 entries, verify 5 rows per page in tests/settings.spec.js
- [ ] T076 [P] [US14] Write test: set max chars to 30, save, verify overview cells truncated at 30 characters with "…" in tests/settings.spec.js
- [ ] T077 [P] [US14] Write test: set energy emotional label to "Social", save, verify third energy meter label reads "Social" in tests/settings.spec.js
- [ ] T078 [P] [US14] Write test: set default wheel to "Extended", save, navigate to check-in, verify Extended wheel renders in tests/settings.spec.js
- [ ] T079 [P] [US14] Write test: change settings, save, reload page, verify settings persisted across reload in tests/settings.spec.js

**Checkpoint**: All settings fields tested for apply + persist

---

## Phase 17: User Story 17 — Theme Switching (Priority: P2)

**Goal**: Verify light/dark/system themes with persistence

**Independent Test**: Run `npx playwright test theme.spec.js`

### Implementation for User Story 17

- [ ] T080 [P] [US17] Write test: click dark theme button, verify `data-theme="dark"` and background color changes in tests/theme.spec.js
- [ ] T081 [P] [US17] Write test: click system theme button, emulate dark color scheme, verify dark theme applies in tests/theme.spec.js
- [ ] T082 [P] [US17] Write test: select theme, verify selected button has `is-selected` class, others do not in tests/theme.spec.js
- [ ] T083 [P] [US17] Write test: set dark theme, reload page, verify dark theme persists in tests/theme.spec.js

**Checkpoint**: Theme switching tests pass for all 3 theme modes

---

## Phase 18: User Story 18 — Language Switching (Priority: P2)

**Goal**: Verify EN/NL toggle with instant UI update and persistence

**Independent Test**: Run `npx playwright test language.spec.js`

### Implementation for User Story 18

- [ ] T084 [P] [US18] Write test: click "NL" button, verify key `[data-i18n]` elements show Dutch text (e.g., "Overzicht", "Instellingen") without page reload in tests/language.spec.js
- [ ] T085 [P] [US18] Write test: switch to NL then back to EN, verify English text restores in tests/language.spec.js
- [ ] T086 [P] [US18] Write test: set language to NL, reload page, verify Dutch persists in tests/language.spec.js
- [ ] T087 [P] [US18] Write test: NL active, view mood matrix, verify mood labels in Dutch in tests/language.spec.js
- [ ] T088 [P] [US18] Write test: EN active, view body signals, verify body part names in English in tests/language.spec.js

**Checkpoint**: Language tests pass for both languages with persistence

---

## Phase 19: User Story 21 — Summary Card (Priority: P2)

**Goal**: Verify today status, streak, total count, and 7-day heatmap

**Independent Test**: Run `npx playwright test summary.spec.js`

### Implementation for User Story 21

- [ ] T089 [P] [US21] Write test: no entries, verify summary shows "Not checked in today yet" and streak is 0 in tests/summary.spec.js
- [ ] T090 [P] [US21] Write test: save check-in today, verify "Checked in at: [time]" appears with streak of 1 in tests/summary.spec.js
- [ ] T091 [P] [US21] Write test: inject entries on 5 consecutive days, verify streak shows 5 in tests/summary.spec.js
- [ ] T092 [P] [US21] Write test: inject entries on scattered days, verify 7-day heatmap cells colored by mood score in tests/summary.spec.js
- [ ] T093 [P] [US21] Write test: inject 10 entries, verify total count displays "10" in tests/summary.spec.js

**Checkpoint**: Summary card tests pass for all display scenarios

---

## Phase 20: User Story 22 — 28-Day History Calendar (Priority: P2)

**Goal**: Verify history grid rendering, mode switching, and cell click navigation

**Independent Test**: Run `npx playwright test history.spec.js`

### Implementation for User Story 22

- [ ] T094 [P] [US22] Write test: inject entries over past 28 days, verify 4×7 grid renders with colored cells in tests/history.spec.js
- [ ] T095 [P] [US22] Write test: "Core feeling" mode, entry with "joy" emotion, verify cell has positive/green color class in tests/history.spec.js
- [ ] T096 [P] [US22] Write test: switch to "Physical energy" mode, verify colors reflect energy levels (≥67 green, 34–66 orange, ≤33 red) in tests/history.spec.js
- [ ] T097 [P] [US22] Write test: click history cell with entry, verify entry loads into check-in form in tests/history.spec.js
- [ ] T098 [P] [US22] Write test: disable core feeling in settings, verify "Core feeling" mode button absent from mode selector in tests/history.spec.js

**Checkpoint**: History calendar tests pass for all modes and interactions

---

## Phase 21: User Story 27 — Loading Historical Entries (Priority: P2)

**Goal**: Verify loading entries from overview rows and history calendar

**Independent Test**: Run `npx playwright test entry-loading.spec.js`

### Implementation for User Story 27

- [ ] T099 [P] [US27] Write test: inject entry from 3 days ago, click its overview row, verify form fills with entry data and tab switches to check-in in tests/entry-loading.spec.js
- [ ] T100 [P] [US27] Write test: load historical entry, verify context pill shows entry date and time in tests/entry-loading.spec.js
- [ ] T101 [P] [US27] Write test: load historical entry, click Save, verify new entry for today created (not overwriting old) in tests/entry-loading.spec.js
- [ ] T102 [P] [US27] Write test: load entry with weather data, verify weather widget shows recorded weather (not current) in tests/entry-loading.spec.js

**Checkpoint**: Entry loading tests pass for overview and history sources

---

## Phase 22: User Story 15 — Settings Export and Import (Priority: P3)

**Goal**: Verify settings portability (export/import/reset)

**Independent Test**: Run `npx playwright test settings-portability.spec.js`

### Implementation for User Story 15

- [ ] T103 [P] [US15] Write test: set custom settings, click Export, verify JSON file downloads (without weather coordinates) in tests/settings-portability.spec.js
- [ ] T104 [P] [US15] Write test: import valid settings JSON, verify all settings apply immediately in tests/settings-portability.spec.js
- [ ] T105 [P] [US15] Write test: import corrupt/invalid settings file, verify error message and settings unchanged in tests/settings-portability.spec.js
- [ ] T106 [P] [US15] Write test: click Reset, accept confirm dialog, verify defaults restored in tests/settings-portability.spec.js

**Checkpoint**: Settings portability tests pass

---

## Phase 23: User Story 16 — Quick Actions (Priority: P3)

**Goal**: Verify quick action editor and chip click behavior

**Independent Test**: Run `npx playwright test quick-actions.spec.js`

### Implementation for User Story 16

- [ ] T107 [P] [US16] Write test: default quick actions, navigate to check-in with action field visible, verify chips render below textarea in tests/quick-actions.spec.js
- [ ] T108 [P] [US16] Write test: click a chip, verify chip text appends to action textarea in tests/quick-actions.spec.js
- [ ] T109 [P] [US16] Write test: in settings editor, type new action and press Enter, verify action appears in list in tests/quick-actions.spec.js
- [ ] T110 [P] [US16] Write test: click × on existing action, verify it removes from list in tests/quick-actions.spec.js
- [ ] T111 [P] [US16] Write test: save custom actions, navigate to check-in, verify chips reflect custom list in tests/quick-actions.spec.js

**Checkpoint**: Quick actions editor and chip tests pass

---

## Phase 24: User Story 19 + 20 — Weather Widget and Geocoding (Priority: P3)

**Goal**: Verify weather rendering with mocked API, caching, error handling, and geocoding

**Independent Test**: Run `npx playwright test weather.spec.js`

### Implementation for User Stories 19+20

- [ ] T112 [P] [US19] Write test: mock weather API success, load page, verify widget shows temperature, icon, description, location in tests/weather.spec.js
- [ ] T113 [P] [US19] Write test: inject weather cache (< 1h old), load page, verify no API call made and cached data displays in tests/weather.spec.js
- [ ] T114 [P] [US19] Write test: mock weather API failure (500), load page, verify app doesn't crash and widget handles error gracefully in tests/weather.spec.js
- [ ] T115 [P] [US19] Write test: disable weather in settings, verify widget hidden on check-in tab in tests/weather.spec.js
- [ ] T116 [P] [US19] Write test: save check-in with mocked weather, verify weather data attached to entry in localStorage in tests/weather.spec.js
- [ ] T117 [P] [US20] Write test: mock geocoding API, change location to "Berlin" in settings, save, verify coordinates update in tests/weather.spec.js
- [ ] T118 [P] [US20] Write test: mock geocoding API with empty results for nonsense city, save settings, verify warning appears in tests/weather.spec.js

**Checkpoint**: Weather tests pass with mocked API responses

---

## Phase 25: User Story 23 — Tab Navigation and URL Hash Routing (Priority: P3)

**Goal**: Verify tab switching, hash routing, and browser history

**Independent Test**: Run `npx playwright test tab-navigation.spec.js`

### Implementation for User Story 23

- [ ] T119 [P] [US23] Write test: click "Overview" tab, verify overview panel visible and URL hash is `#overview` in tests/tab-navigation.spec.js
- [ ] T120 [P] [US23] Write test: navigate to page with hash `#settings`, verify settings tab active in tests/tab-navigation.spec.js
- [ ] T121 [P] [US23] Write test: switch tabs multiple times, use browser Back, verify previous tab activates in tests/tab-navigation.spec.js
- [ ] T122 [P] [US23] Write test: navigate to invalid hash `#nonexistent`, verify default check-in tab activates in tests/tab-navigation.spec.js
- [ ] T123 [P] [US23] Write test: any tab active, verify exactly one tab button has `is-selected` and one panel visible in tests/tab-navigation.spec.js

**Checkpoint**: Tab navigation tests pass including hash routing and history

---

## Phase 26: User Story 24 + 25 — Demo Data and Clear All (Priority: P3)

**Goal**: Verify demo data generation and clear all data

**Independent Test**: Run `npx playwright test info-tools.spec.js`

### Implementation for User Stories 24+25

- [ ] T124 [P] [US24] Write test: empty app, navigate to Info tab, click "Generate demo data", verify 30 entries created in localStorage in tests/info-tools.spec.js
- [ ] T125 [P] [US24] Write test: after demo data, navigate to overview, verify entries appear with varied data in tests/info-tools.spec.js
- [ ] T126 [P] [US24] Write test: existing entries present, generate demo data, verify demo entries added without deleting existing in tests/info-tools.spec.js
- [ ] T127 [P] [US25] Write test: inject entries and settings, click "Clear all local data", accept confirm, verify all localStorage keys removed in tests/info-tools.spec.js
- [ ] T128 [P] [US25] Write test: click "Clear all local data", dismiss confirm dialog, verify no data deleted in tests/info-tools.spec.js

**Checkpoint**: Info tools tests pass for demo generation and data clearing

---

## Phase 27: User Story 26 — Data Normalization and Migration (Priority: P3)

**Goal**: Verify backwards compatibility with legacy data formats

**Independent Test**: Run `npx playwright test data-migration.spec.js`

### Implementation for User Story 26

- [ ] T129 [P] [US26] Write test: inject entry with `gedachten` field instead of `thoughts`, load app, verify field migrated to `thoughts` and displays correctly in tests/data-migration.spec.js
- [ ] T130 [P] [US26] Write test: inject entry with `energy: 75` (single number), load app, verify normalizes to `{ physical: 75, mental: null, emotional: null }` in tests/data-migration.spec.js
- [ ] T131 [P] [US26] Write test: inject entry without `id` field, load app, verify UUID auto-generated in tests/data-migration.spec.js
- [ ] T132 [P] [US26] Write test: inject entry with `moodmeter` field instead of `moodGrid`, load app, verify mood data normalizes in tests/data-migration.spec.js
- [ ] T133 [P] [US26] Write test: inject entry with `lichaamsignalen` instead of `bodySignals`, load app, verify field migrates in tests/data-migration.spec.js

**Checkpoint**: Data migration tests pass for all legacy field formats

---

## Phase 28: Edge Cases and Cross-Cutting Concerns (Priority: P3)

**Goal**: Verify XSS prevention, long text, rapid clicks, storage limits, multiple entries per day, and other edge cases

**Independent Test**: Run `npx playwright test edge-cases.spec.js`

### Implementation for Edge Cases

- [ ] T134 [P] Write test: inject `<script>alert(1)</script>` into thoughts field, save, reload, verify escaped as literal text in display in tests/edge-cases.spec.js
- [ ] T135 [P] Write test: inject `<img onerror=alert(1)>` into note field, save, verify escaped via `App.escapeHtml()` in rendered output in tests/edge-cases.spec.js
- [ ] T136 [P] Write test: type 10,000+ characters in note field, save, verify no browser hang and entry persists in tests/edge-cases.spec.js
- [ ] T137 [P] Write test: double-click Save rapidly, verify only one entry created (not duplicates) in tests/edge-cases.spec.js
- [ ] T138 [P] Write test: create 5+ entries on same day, verify each gets unique timestamped key in tests/edge-cases.spec.js
- [ ] T139 [P] Write test: no entries, verify overview shows empty-state message, summary shows "Not checked in today", history all gray in tests/edge-cases.spec.js
- [ ] T140 [P] Write test: overview pagination out of bounds (page 999), verify clamps to last valid page in tests/edge-cases.spec.js
- [ ] T141 [P] Write test: clear search after applying date filter, verify filter remains active in tests/edge-cases.spec.js
- [ ] T142 [P] Write test: import entries with extra unknown fields, verify unknown fields ignored and missing fields filled with defaults in tests/edge-cases.spec.js
- [ ] T143 [P] Write test: import settings with unknown keys, verify unknown keys ignored and missing keys filled with defaults in tests/edge-cases.spec.js
- [ ] T144 [P] Write test: all components disabled then re-enabled, verify components render correctly without stale state in tests/edge-cases.spec.js
- [ ] T145 [P] Write test: verify localStorage persistence across page reload for entries, settings, language, active tab, overview UI state in tests/edge-cases.spec.js
- [ ] T146 [P] Write test: special characters `"quotes"`, `&amp;`, `<tags>` in all text fields, verify safe HTML escaping in tests/edge-cases.spec.js

---

## Dependencies & Parallel Execution

### Story Completion Order

```
Phase 1 (Setup) ──► Phase 2 (Foundation)
                        │
                        ▼
            ┌─────────────────────────────────────────────┐
            │  Phases 3–8 (P1 stories) — can run in parallel  │
            │  US1, US2, US3, US4, US5, US6                    │
            └─────────────────────────────────────────────┘
                        │
                        ▼
            ┌─────────────────────────────────────────────┐
            │  Phases 9–21 (P2 stories) — can run in parallel │
            │  US7–14, US17–18, US21–22, US27                  │
            └─────────────────────────────────────────────┘
                        │
                        ▼
            ┌─────────────────────────────────────────────┐
            │  Phases 22–27 (P3 stories) — can run in parallel│
            │  US15–16, US19–20, US23–26                       │
            └─────────────────────────────────────────────┘
                        │
                        ▼
              Phase 28 (Edge Cases)
```

### Parallel Opportunities per Phase

- **Within P1 stories**: US2–US6 spec files can be implemented in parallel (each is an independent test file)
- **Within P2 stories**: All 10 spec files (overview-table, overview-search-filter, etc.) can be implemented in parallel
- **Within P3 stories**: All 6 spec files can be implemented in parallel
- **Within each phase**: Tasks marked `[P]` can be implemented in parallel within the same spec file

### Blocking Dependencies

- T001–T003 (Setup) blocks all other tasks
- T004–T005 (Foundation) blocks all user story tasks
- No cross-story dependencies: each spec file is self-contained with its own test fixtures

## Implementation Strategy

### MVP (Phase 1–8)

The first 8 phases deliver:
- Working Playwright infrastructure (config, helpers, fixtures)
- Complete check-in flow tested (save/update/new)
- All 5 emotion wheel variants tested
- Body signals, energy meters, mood matrix tested
- Save validation under all visibility configurations

This represents a usable, self-contained test suite for the core feature.

### Incremental Delivery

Each subsequent phase adds tests for one feature area without modifying earlier tests. Phases 9–21 (P2 stories) cover the overview table, settings, themes, language, summary, and history. Phases 22–27 (P3 stories) cover settings portability, quick actions, weather (mocked), tab navigation, demo data, and data migration. Phase 28 adds cross-cutting edge case tests.

### Test Count Summary

| Phase | Tasks | Approx Tests |
|-------|-------|-------------|
| Setup + Foundation | 5 | 1 |
| US1: Check-in Happy Path | 5 | 8 |
| US2: Emotion Wheel | 5 | 15+ |
| US3: Body Signals | 5 | 30+ |
| US4: Energy Meters | 5 | 10 |
| US5: Mood Matrix | 5 | 8 |
| US6: Save Validation | 5 | 8 |
| US7+8: Component Visibility | 12 | 20+ |
| US9: Overview Table | 6 | 15 |
| US10: Search/Filter | 6 | 10 |
| US11: Pagination | 5 | 8 |
| US12: Export/Import | 6 | 10 |
| US13: Deletion | 3 | 5 |
| US14: Settings | 6 | 10 |
| US17: Theme | 4 | 6 |
| US18: Language | 5 | 8 |
| US21: Summary | 5 | 8 |
| US22: History | 5 | 8 |
| US27: Entry Loading | 4 | 6 |
| US15: Settings Portability | 4 | 6 |
| US16: Quick Actions | 5 | 8 |
| US19+20: Weather | 7 | 10 |
| US23: Tab Navigation | 5 | 8 |
| US24+25: Info Tools | 5 | 8 |
| US26: Data Migration | 5 | 8 |
| Edge Cases | 13 | 15+ |
| **TOTAL** | **146** | **~260+** |
