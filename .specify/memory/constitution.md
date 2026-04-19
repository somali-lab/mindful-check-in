<!--
  Sync Impact Report
  ─────────────────────────────────
  Version change: 1.0.0 → 2.3.0 (MAJOR+MINOR)
  Rationale: namespace correction (App → MCI), added event-driven
  module architecture principle, rewrote Technology Constraints
  and Development Workflow to match actual implementation.
  2.1.0: added local web server allowance to Principle II and
  Technology Constraints.
  2.2.0: added Principle VII (Testability & Observability) and
  testing workflow details.
  2.3.0: added Principle VIII (Local AI Integration) with
  session reflection, trend analysis, action suggestions,
  period summaries, and guardrails. Updated Principle I with
  localhost LLM exception. Added Local AI to Technology
  Constraints.
  Modified principles:
    - I. Privacy-First & Local-Only — added localhost LLM
      exception clause
    - II. Zero Build, Zero Dependencies — App → MCI namespace ref;
      added explicit local web server clause
    - III. Defensive Data Handling — App.* → MCI.* API refs
    - IV. Internationalization as Default — App.t → MCI.t
  Added sections:
    - VI. Event-Driven Module Architecture (new principle)
    - VII. Testability & Observability (new principle)
    - VIII. Local AI Integration (new principle)
  Removed sections: none
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
    - .specify/templates/spec-template.md ✅ no changes needed
    - .specify/templates/tasks-template.md ✅ no changes needed
  Follow-up TODOs: none
-->

# Standalone Browser App Constitution

## Scope

This constitution defines the architectural principles and
process rules for standalone web applications that run entirely
in the browser. It is derived from the Mindful Check-in
implementation and applies to every project that adopts it.

Where this document says "the app" it means any application
governed by this constitution. Project-specific details (app
namespace, localStorage key prefix, supported languages) are
defined in the project's own `architecture.md`.

## Core Principles

### I. Privacy-First & Local-Only

All user data MUST remain on the user's device. The app MUST
NOT transmit personal data to any server, analytics service,
or third-party endpoint.

- No cookies, no tracking pixels, no analytics scripts.
- No server-side component — the app is a set of static files.
- `localStorage` is the only persistence layer; no IndexedDB,
  no remote sync.
- Optional network requests (e.g. weather APIs) MUST send only
  non-personal parameters (coordinates, codes) — never
  user-generated content.
- **Exception — local AI**: Requests to a user-controlled LLM
  running on `localhost` MAY include user-generated content
  (entries, notes, moods) because the data never leaves the
  device. See Principle VIII.
- Users MUST be able to disable any network-dependent component
  for fully offline operation.

**Rationale**: Personal tools require absolute trust that data
is never shared. Privacy by architecture eliminates the need
for privacy policies, consent banners, and server hardening.

### II. Zero Build, Zero Dependencies

The app MUST run by opening `index.html` in any modern browser.
No bundler, transpiler, package manager, or build step is
permitted at runtime.

- All JavaScript MUST be vanilla ES5-compatible IIFEs attached
  to a single global namespace (`window.<NS>`).
- All CSS MUST be plain CSS using custom properties — no
  preprocessors.
- External runtime dependencies (libraries, frameworks) are
  forbidden.
- Cache-busting versioning (`?v=X.Y.Z`) on asset URLs is the
  sole deployment mechanism.
- Features that require an HTTP origin (e.g. `fetch` to local
  files, Web Workers, Service Workers) MAY depend on a local
  static file server (e.g. `npx serve`). Such features MUST
  explicitly document this requirement and MUST degrade
  gracefully when opened via `file://`.

**Rationale**: Simplicity lowers the barrier to contribution,
guarantees long-term maintainability, and eliminates toolchain
rot. Any contributor with a text editor and a browser can work
on the project.

### III. Defensive Data Handling

Every data path — read, write, import, normalize — MUST be
defensively validated.

- The normalize function MUST handle missing fields, wrong
  types, and legacy key names without throwing.
- User-supplied strings rendered into HTML MUST be escaped
  (e.g. via an `esc()` helper) to prevent XSS.
- Import flows MUST offer the user a choice between overwrite
  and skip-duplicates — never silently discard data.
- `localStorage` writes MUST silently degrade (`try/catch`)
  when quota is exceeded, with a user-visible warning.

**Rationale**: Users accumulate months of personal entries.
Data loss or corruption erodes trust irreparably.

### IV. Internationalization as Default

Every user-visible string MUST be defined in a translations
file under every supported language key, resolved at runtime
via a `t(key, params)` function.

- Hard-coded UI text in HTML or JS is forbidden.
- Language switching MUST be instant (no page reload).
- The default language is configurable in Settings.
- New features MUST ship with translations for all supported
  languages before merge.

**Rationale**: Missing translations degrade the experience for
a portion of the audience; treating i18n as an afterthought
makes it exponentially harder to add later.

### V. Accessibility & Semantic HTML

Interactive elements MUST use correct ARIA roles, labels, and
keyboard semantics.

- Navigation via `role="tablist"` / `role="tab"` /
  `aria-selected` where applicable.
- SVG interactive regions MUST carry `aria-label` or visible
  text alternatives.
- Color MUST NOT be the sole means of conveying information —
  text labels or patterns MUST accompany color-coded elements.
- Theme support (light / dark / system) MUST maintain
  sufficient contrast ratios (WCAG AA minimum).

**Rationale**: Personal well-being tools must be usable by
everyone, including users with visual or motor impairments.

### VI. Event-Driven Module Architecture

Modules MUST communicate exclusively through a pub/sub event
bus. Direct cross-module calls are forbidden.

- Every JS file is a self-contained IIFE that attaches its
  public API to the app namespace (`<NS>.ModuleName`).
- Private state MUST be scoped to the IIFE — never exposed on
  the global namespace.
- Core store functions (`saveEntry`, `saveSettings`,
  `deleteEntry`, `setLang`) MUST emit well-defined events on
  mutation so subscribers react automatically.
- Modules own their own rendering. No module tells another
  module what to render.
- A boot file (`boot.js`) calls `<Module>.init()` in
  dependency order. It MUST contain zero business logic.
- **Allowed direct references**: core helpers (`t()`, `esc()`,
  store loaders), static data objects, and parent→child
  getter/setter calls within an orchestration boundary (e.g.
  a form module calling its sub-component getters).

**Rationale**: Loose coupling via events keeps modules
independently testable, replaceable, and comprehensible. It
prevents god-modules and hidden dependency chains.

### VII. Testability & Observability

Every feature MUST be verifiable through automated end-to-end
tests. The app MUST be debuggable in the browser without
special tooling.

- The project MUST maintain an E2E test suite (Playwright or
  equivalent) that runs against the app served locally.
- Test files MAY use modern JavaScript (ES2020+) — only the
  app under test is constrained to ES5.
- `console.error` and `console.warn` calls MUST be used in
  `catch` blocks and defensive paths so failures are visible
  in DevTools. Silent swallowing of errors is forbidden.
- `console.log` MAY be used during development for
  investigation; persistent debug logging SHOULD use a
  tagged prefix (e.g. `[MCI Bus]`, `[MCI Store]`) so it
  can be filtered.
- The test suite MUST run in CI-compatible headless mode and
  produce a machine-readable report.

**Rationale**: A zero-dependency static app has no server logs
or APM. The browser console is the primary diagnostic channel;
tests are the safety net against regressions.

### VIII. Local AI Integration

The app MAY integrate with a locally-running Large Language
Model (e.g. Ollama) to provide reflective insights on
check-in data. All AI processing MUST happen on the user's
own device.

- The LLM MUST run on `localhost` (e.g.
  `http://localhost:11434`). Cloud-hosted AI endpoints are
  forbidden.
- AI features MUST be entirely optional — the app MUST be
  fully functional without an LLM running.
- The user MUST explicitly trigger each analysis; the app
  MUST NOT silently send data to the LLM in the background.
- LLM configuration (model name, endpoint URL, temperature)
  MUST be user-configurable in Settings.
- The app MUST detect LLM availability and show a clear
  status indicator (connected / unavailable).

**Capabilities** (single session and multi-session):

- **Session reflection**: After a check-in, analyse the
  entry and return reflective questions or observations
  (e.g. "You noted tension in your shoulders — what might
  be causing that?").
- **Trend analysis**: Over a user-selected period, identify
  recurring patterns in mood, energy, body signals, and
  emotions (e.g. "Your mental energy has been below 30% for
  5 consecutive days").
- **Action suggestions**: Based on historical data, suggest
  actions that previously correlated with improvement
  (e.g. "Last time you had this pattern, a walk helped —
  consider that again").
- **Period summary**: Generate a natural-language summary of
  a week or month of check-ins.

**Guardrails**:

- Every AI-generated response MUST be accompanied by a
  visible disclaimer stating that the LLM is not a therapist
  and the output is not medical advice.
- LLM responses are ephemeral by default. The user MAY choose
  to save individual responses ("Save insight"). Saved insights
  MUST be stored in a dedicated localStorage key, separate from
  entry data. Insights MAY optionally be linked to a specific
  entry by reference (entry key), but MUST NOT be embedded in
  or modify entry objects.
- Prompt templates MUST be defined in a dedicated data file
  (not hard-coded in modules) so they are translatable and
  auditable.
- The module MUST handle LLM errors, timeouts, and
  malformed responses gracefully — never crash the app.

**Rationale**: A local LLM turns passive data collection into
active self-reflection without sacrificing the privacy
guarantee. By keeping inference on `localhost`, the trust
model remains identical to storing data in `localStorage`.

## Technology Constraints

- **Runtime**: Any modern browser supporting `localStorage`,
  `fetch`, and inline SVG. A local static file server (e.g.
  `npx serve`) is permitted for features that require an HTTP
  origin; such features MUST be marked in their spec.
- **Language**: Vanilla JavaScript — ES5-compatible IIFEs with
  `"use strict"`. No `let`, `const`, arrow functions, template
  literals, `class`, or `import`/`export`.
- **Styling**: Plain CSS with custom properties; one file per
  logical domain.
- **State management**: `localStorage` accessed exclusively
  through a Store wrapper (`get`/`put`/`del`) with JSON
  parse/stringify and `try/catch`. No direct
  `localStorage.getItem` calls from modules.
- **External services**: Only free, keyless APIs (e.g.
  Open-Meteo). Usage MUST be optional and cacheable.
- **Local AI**: A locally-running LLM on `localhost` (e.g.
  Ollama) is a permitted integration target. Communication
  via `fetch` to `localhost` only. The app MUST NOT bundle
  or ship model weights.
- **Data format**: JSON objects in `localStorage`. Entry keys
  use a timestamp-based format (e.g. `YYYY-MM-DD_HHMMSSmmm`).

## Development Workflow

- **File organization**: HTML shell in `index.html`; core
  library in `lib/`; static data in `data/`; feature modules
  in `modules/`; stylesheets in `css/`.
- **Module pattern**: Each JS file is a self-contained IIFE
  that attaches public API methods to the app namespace.
- **Naming**: `<NS>.<ModuleName>` for public APIs;
  local helpers as plain `function` declarations inside the
  IIFE scope.
- **Commit hygiene**: Atomic commits with clear scope. No
  unrelated changes bundled together.
- **Quality gates**: Verify all supported language translations
  are present for changed keys. Run E2E tests (Playwright)
  before merge.
- **Testing**: E2E tests live in a dedicated `tests/`
  directory with their own `package.json`. Dev-only
  dependencies (Playwright, coverage tools) are permitted
  there — never in the app root.
- **No generated files**: The repository MUST NOT contain
  build artifacts, minified bundles, or `node_modules`.

## Governance

This constitution is the authoritative reference for
architectural and process decisions. It supersedes ad-hoc
conventions found elsewhere in the codebase.

- **Amendments** MUST be documented with a version bump,
  rationale, and date in this file.
- **Versioning** follows Semantic Versioning:
  - MAJOR: principle removal or backward-incompatible
    redefinition.
  - MINOR: new principle or materially expanded guidance.
  - PATCH: clarifications, wording fixes, non-semantic
    changes.
- **Compliance**: Every PR and code review SHOULD verify
  alignment with these principles. Deviations MUST be
  justified in the PR description.

**Version**: 2.3.0 | **Ratified**: 2026-04-06 | **Last Amended**: 2026-04-18
