# Implementation Plan: Comprehensive Playwright E2E Test Suite

**Branch**: `001-playwright-e2e-tests` | **Date**: 2026-04-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-playwright-e2e-tests/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a comprehensive Playwright E2E test suite covering all app tabs (Check-in, Overview, Settings, Info), all interactive components (emotion wheel variants, body signals SVG, energy meters, mood matrix, quick actions), component visibility combinations, data persistence, import/export flows, theme/language switching, weather widget (mocked), and edge cases including XSS prevention, localStorage limits, and data migration. Tests run against the static app served locally with no changes to application source code.

## Technical Context

**Language/Version**: JavaScript (ES2020+ for test files; app under test is ES5)  
**Primary Dependencies**: @playwright/test (dev-only), static file server (npx serve)  
**Storage**: Browser localStorage (tested via page.evaluate)  
**Testing**: Playwright Test runner with JavaScript test files  
**Target Platform**: Chromium (primary), optional Firefox/WebKit  
**Project Type**: E2E test suite for static web application  
**Performance Goals**: Full suite completes in under 5 minutes  
**Constraints**: No app source code modifications; weather API mocked via route interception; dev-only dependency (not shipped to users)  
**Scale/Scope**: 200+ test cases across 10+ test files covering 27 user stories and 30 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Privacy-First & Local-Only | ✅ PASS | Tests do NOT transmit user data. Weather tests use mocked API responses via Playwright route interception. |
| II. Zero Build, Zero Dependencies | ⚠️ JUSTIFIED DEVIATION | Playwright is a **dev-only** dependency (not shipped to users). The app itself remains zero-dependency. Tests live in a separate `tests/` directory with their own `package.json`. The app continues to run by opening `index.html`. |
| III. Defensive Data Handling | ✅ PASS | Tests actively verify XSS escaping, data normalization, import validation, and localStorage quota handling. |
| IV. Internationalization as Default | ✅ PASS | Tests verify both EN and NL translations render correctly on language switch. |
| V. Accessibility & Semantic HTML | ✅ PASS | Tests verify ARIA roles, tab navigation, and keyboard interactions. |

**Gate result**: PASS (one justified deviation for dev-only dependency).

## Project Structure

### Documentation (this feature)

```text
specs/001-playwright-e2e-tests/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
tests/
├── package.json                    # Playwright dev dependency
├── playwright.config.js            # Playwright config (baseURL, webServer, projects)
├── fixtures/
│   └── helpers.js                  # Shared test helpers (inject entries, mock weather, configure settings)
├── checkin.spec.js                 # US1: Check-in happy path, save, update, new check-in
├── emotion-wheel.spec.js           # US2: All 5 wheel variants, segment selection, reset
├── body-signals.spec.js            # US3: Body part toggle, multi-select, reset, persistence
├── energy-meters.spec.js           # US4: Click-to-set, scale labels, reset, boundary values
├── mood-matrix.spec.js             # US5: Grid cell selection, label display, reset
├── save-validation.spec.js         # US6: Mood required validation, visibility-dependent rules
├── component-visibility.spec.js    # US7+8: Individual toggles, combination presets, layout integrity
├── overview-table.spec.js          # US9: Table rendering, sorting by all columns, column visibility
├── overview-search-filter.spec.js  # US10: Search, date filters, notes-only checkbox
├── overview-pagination.spec.js     # US11: Page navigation, boundary states, rows-per-page
├── export-import.spec.js           # US12: Bulk export, single export, import merge modes
├── entry-deletion.spec.js          # US13: Delete confirm/cancel, active entry deletion
├── settings.spec.js                # US14: All settings fields, persistence across reload
├── settings-portability.spec.js    # US15: Settings export/import/reset
├── quick-actions.spec.js           # US16: Add/remove actions, chip click behavior
├── theme.spec.js                   # US17: Light/dark/system, persistence, CSS property changes
├── language.spec.js                # US18: EN/NL toggle, instant update, persistence
├── weather.spec.js                 # US19+20: Mocked API, caching, geocoding, widget rendering
├── summary.spec.js                 # US21: Today status, streak, total, heatmap
├── history.spec.js                 # US22: 28-day grid, mode switching, cell clicks
├── tab-navigation.spec.js          # US23: Tab buttons, hash routing, browser back/forward
├── info-tools.spec.js              # US24+25: Demo data generation, clear all data
├── data-migration.spec.js          # US26: Legacy field normalization, backwards compatibility
├── entry-loading.spec.js           # US27: Load from overview/history, context pill, save behavior
└── edge-cases.spec.js              # Cross-cutting edge cases: XSS, long text, rapid clicks, storage limits
```

**Structure Decision**: Tests live in a top-level `tests/` directory with their own `package.json` to isolate dev dependencies from the zero-dependency app. Each spec file maps to one or two user stories for clear traceability.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dev-only `package.json` in `tests/` | Playwright requires npm installation | Manual browser testing is unreliable and unscalable; Playwright is dev-only and never shipped to users |
