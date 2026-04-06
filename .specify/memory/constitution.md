<!--
  Sync Impact Report
  ─────────────────────────────────
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
  Modified principles: N/A (initial version)
  Added sections:
    - I. Privacy-First & Local-Only
    - II. Zero Build, Zero Dependencies
    - III. Defensive Data Handling
    - IV. Internationalization as Default
    - V. Accessibility & Semantic HTML
    - Technology Constraints
    - Development Workflow
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
    - .specify/templates/spec-template.md ✅ no changes needed
    - .specify/templates/tasks-template.md ✅ no changes needed
  Follow-up TODOs: none
-->

# Mindful Check-in Constitution

## Core Principles

### I. Privacy-First & Local-Only

All user data MUST remain on the user's device. The app MUST NOT
transmit personal data to any server, analytics service, or
third-party endpoint. The sole permitted network request is the
optional Open-Meteo weather fetch, which sends only geographic
coordinates — never user-generated content.

- No cookies, no tracking pixels, no analytics scripts.
- No server-side component — the app is a set of static files.
- `localStorage` is the only persistence layer; no IndexedDB,
  no remote sync.
- Users MUST be able to disable the weather component for fully
  offline operation.

**Rationale**: The app exists to encourage honest self-reflection.
That requires absolute trust that entries are never shared.

### II. Zero Build, Zero Dependencies

The app MUST run by opening `index.html` in any modern browser.
No bundler, transpiler, package manager, or build step is
permitted.

- All JavaScript MUST be vanilla ES5-compatible IIFEs attached
  to the global `window.App` namespace.
- All CSS MUST be plain CSS using custom properties — no
  preprocessors.
- External runtime dependencies are forbidden. The only external
  service is the optional Open-Meteo API (free, no API key).
- Cache-busting versioning (`?v=X.Y.Z`) on asset URLs is the
  sole deployment mechanism.

**Rationale**: Simplicity lowers the barrier to contribution and
guarantees long-term maintainability without toolchain rot.

### III. Defensive Data Handling

Every data path — read, write, import, normalize — MUST be
defensively validated.

- `App.normalizeEntry()` MUST handle missing fields, wrong
  types, and legacy key names without throwing.
- User-supplied strings rendered into HTML MUST be escaped via
  `App.escapeHtml()` to prevent XSS.
- Import flows MUST offer the user a choice between overwrite
  and skip-duplicates — never silently discard data.
- `localStorage` writes MUST silently degrade (try/catch) when
  quota is exceeded.

**Rationale**: Users accumulate months of personal entries.
Data loss or corruption erodes trust irreparably.

### IV. Internationalization as Default

Every user-visible string MUST be defined in `translations.js`
under both `en` and `nl` keys, resolved at runtime via
`App.t()`.

- Hard-coded UI text in HTML or JS is forbidden.
- Language switching MUST be instant (no page reload).
- The default language is configurable in Settings.
- New features MUST ship with both `en` and `nl` translations
  before merge.

**Rationale**: The app serves a bilingual audience; missing
translations degrade the experience for half the users.

### V. Accessibility & Semantic HTML

Interactive elements MUST use correct ARIA roles, labels, and
keyboard semantics.

- Tab navigation via `role="tablist"` / `role="tab"` /
  `aria-selected`.
- SVG interactive regions MUST carry `aria-label` or visible
  text alternatives.
- Color MUST NOT be the sole means of conveying information —
  text labels or patterns MUST accompany color-coded elements.
- Theme support (light / dark / system) MUST maintain
  sufficient contrast ratios (WCAG AA minimum).

**Rationale**: Mental health tools must be usable by everyone,
including users with visual or motor impairments.

## Technology Constraints

- **Runtime**: Any modern browser supporting `localStorage`,
  `fetch`, and inline SVG. `crypto.randomUUID` is used when
  available but has a `Math.random` fallback.
- **Language**: Vanilla JavaScript (ES5 IIFEs, `"use strict"`).
- **Styling**: Plain CSS with custom properties; one file per
  logical domain (base, layout, components, checkin, overview,
  settings, summary, weather, info).
- **State management**: Single global `App.state` object
  hydrated from `localStorage` on boot.
- **External services**: Open-Meteo Forecast + Geocoding APIs
  only (free, no API key, optional).
- **Data format**: JSON objects in `localStorage` keyed by date
  (`YYYY-MM-DD` or `YYYY-MM-DD_HHMMSSmmm`).

## Development Workflow

- **File organization**: HTML shell in `index.html`;
  JS modules in `js/`; CSS modules in `css/`;
  translations in `translations.js`.
- **Module pattern**: Each JS file is a self-contained IIFE
  that attaches public API methods to `window.App`.
- **Naming**: `App.<verb><Noun>()` for public functions;
  local helpers as plain `function` declarations inside the
  IIFE scope.
- **Commit hygiene**: Atomic commits with clear scope. No
  unrelated changes bundled together.
- **Quality gates**: Syntax-check JS files before committing
  (`new Function(source)` or equivalent). Verify both `en`
  and `nl` translations are present for changed keys.
- **No generated files**: The repository MUST NOT contain
  build artifacts, minified bundles, or `node_modules`.

## Governance

This constitution is the authoritative reference for
architectural and process decisions in Mindful Check-in. It
supersedes ad-hoc conventions found elsewhere in the codebase.

- **Amendments** MUST be documented with a version bump, rationale,
  and date in this file.
- **Versioning** follows Semantic Versioning:
  - MAJOR: principle removal or backward-incompatible redefinition.
  - MINOR: new principle or materially expanded guidance.
  - PATCH: clarifications, wording fixes, non-semantic changes.
- **Compliance**: Every PR and code review SHOULD verify alignment
  with these principles. Deviations MUST be justified in the PR
  description.

**Version**: 1.0.0 | **Ratified**: 2026-04-06 | **Last Amended**: 2026-04-06
