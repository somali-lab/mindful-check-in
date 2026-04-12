# Quickstart: Comprehensive Playwright E2E Test Suite

**Date**: 2026-04-07  
**Feature**: [spec.md](spec.md)

---

## Prerequisites

- Node.js (v18+)
- A terminal in the repository root

## Setup

```bash
# Navigate to the tests directory
cd tests

# Install dependencies (Playwright + serve)
npm install

# Install Playwright browsers (Chromium by default)
npx playwright install chromium
```

## Running Tests

```bash
# Run the full test suite (from tests/ directory)
npx playwright test

# Run a specific test file
npx playwright test checkin.spec.js

# Run tests matching a pattern
npx playwright test --grep "save validation"

# Run in headed mode (see the browser)
npx playwright test --headed

# Run with UI mode (interactive debugger)
npx playwright test --ui

# Run a single test by line number
npx playwright test checkin.spec.js:42
```

## Test Structure

```
tests/
├── package.json                    # Dev dependencies
├── playwright.config.js            # Test runner config
├── fixtures/
│   ├── base.js                     # Base test fixture
│   ├── coverage.js                 # Coverage fixture
│   └── helpers.js                  # Shared test helpers
├── checkin.spec.js                 # Check-in happy path tests
├── emotion-wheel.spec.js           # Emotion wheel variant tests
├── body-signals.spec.js            # Body signal SVG tests
├── energy-meters.spec.js           # Energy meter tests
├── mood-matrix.spec.js             # Mood grid tests
├── save-validation.spec.js         # Save validation logic
├── component-visibility.spec.js    # Visibility toggle tests
├── overview-table.spec.js          # Table rendering & sorting
├── overview-search-filter.spec.js  # Search & filter
├── overview-pagination.spec.js     # Pagination
├── export-import.spec.js           # Export/import flows
├── entry-deletion.spec.js          # Delete with confirm/cancel
├── entry-loading.spec.js           # Load from overview/history
├── settings.spec.js                # Settings configuration
├── settings-portability.spec.js    # Settings export/import/reset
├── quick-actions.spec.js           # Quick action editor & chips
├── theme.spec.js                   # Theme switching
├── language.spec.js                # Language switching
├── weather.spec.js                 # Weather widget (mocked API)
├── summary.spec.js                 # Summary card
├── history.spec.js                 # 28-day history calendar
├── tab-navigation.spec.js          # Tab routing & hash
├── info-tools.spec.js              # Demo data & clear all
├── demo-wheel.spec.js              # Demo data wheel type validation
├── branch-coverage.spec.js         # Edge-case branch coverage
└── edge-cases.spec.js              # XSS, long text, rapid clicks
```

## Key Patterns

### Pre-seeding localStorage

```js
const { injectEntries, createTestEntry } = require('./fixtures/helpers');

test('my test', async ({ page }) => {
  const entries = {
    '2026-04-07': createTestEntry({ coreFeeling: 'joy' }),
  };
  await injectEntries(page, entries);
  await page.goto('/');
});
```

### Mocking Weather API

```js
const { mockWeatherAPI } = require('./fixtures/helpers');

test('weather renders', async ({ page }) => {
  await mockWeatherAPI(page, { temperature: 14, weathercode: 1 });
  await page.goto('/');
});
```

### Dialog Handling

```js
// Demo generate requires confirm()
page.on('dialog', dialog => dialog.accept());
await page.click('#demo-btn-generate');

// Clear all data requires two confirm() calls — both accepted by same handler
page.on('dialog', dialog => dialog.accept());
await page.click('#demo-btn-clear');
```

## Viewing Results

```bash
# Open the HTML report after a test run
npx playwright show-report
```

## CI Integration

The suite is designed to run in CI with `CI=true` environment variable. This disables server reuse and ensures a clean start.
