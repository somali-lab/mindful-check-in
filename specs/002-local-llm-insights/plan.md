# Implementation Plan: Local LLM Insights

**Branch**: `002-local-llm-insights` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-local-llm-insights/spec.md`

## Summary

Integrate a locally-running LLM (Ollama) into Mindful Check-in to provide reflective insights on check-in data. Four analysis modes: single-entry reflection, multi-entry trend analysis, action suggestions based on history, and period summaries. All processing stays on `localhost`. Responses are ephemeral by default; users may save individual insights to a dedicated store, optionally linked to a specific entry. Configuration (endpoint, model, temperature) is managed in Settings with connection testing and model discovery.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES5-compatible IIFEs, `"use strict"`)
**Primary Dependencies**: None (zero runtime dependencies). Ollama HTTP API on localhost as external integration target.
**Storage**: `localStorage` — existing keys for entries/settings, plus 1 new key for saved AI insights
**Testing**: Playwright E2E tests (ES2020+ test code)
**Target Platform**: Any modern browser with `localStorage`, `fetch`, inline SVG. Local web server required for AI features (CORS).
**Project Type**: Static browser app (single `index.html` entry point)
**Performance Goals**: Single-entry reflection < 15 seconds; connection test < 5 seconds
**Constraints**: ES5-only app code, zero runtime dependencies, localhost-only LLM communication, ~4000 token budget per request
**Scale/Scope**: Single user, all data in localStorage, 1 new module + 1 new data file + settings extensions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Privacy-First & Local-Only | ✅ PASS | LLM on localhost only (FR-021). User-generated content sent only to localhost per Principle I exception. No cloud endpoints. |
| II. Zero Build, Zero Dependencies | ✅ PASS | No new runtime dependencies. Uses `fetch` to localhost. Requires local web server — documented in spec (Assumptions). |
| III. Defensive Data Handling | ✅ PASS | All LLM output escaped via `MCI.esc()` (FR-013). localStorage writes with try/catch. Saved insights in separate key. |
| IV. Internationalization as Default | ✅ PASS | All UI text via `MCI.t()` (FR-017). Prompt templates per language in data file (FR-016/FR-018). |
| V. Accessibility & Semantic HTML | ✅ PASS | AI response area, buttons, status indicators will use ARIA labels. Disclaimer text-based. |
| VI. Event-Driven Module Architecture | ✅ PASS | New `MCI.AI` module as self-contained IIFE. Listens to bus events. No direct cross-module calls. |
| VII. Testability & Observability | ✅ PASS | Tagged console logging (`[MCI AI]`). E2E tests for all user stories. |
| VIII. Local AI Integration | ✅ PASS | This feature directly implements Principle VIII. All guardrails from constitution are encoded as FRs. |

**Gate result**: PASS — no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-local-llm-insights/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Ollama API contract)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
data/
  static.js              — (existing) Add MCI.Data.aiPrompts for prompt templates
  translations.js        — (existing) Add EN + NL keys for all AI UI text
modules/
  ai.js                  — (new) MCI.AI module: LLM communication, analysis orchestration, insight storage
css/
  ai.css                 — (new) Styles for AI response area, status indicator, insights overview
index.html               — (existing) Add AI response panel, insights overview section, settings AI section
boot.js                  — (existing) Add MCI.AI.init() call
lib/
  core.js                — (existing) Add KEYS.aiInsights constant
tests/
  ai-insights.spec.js    — (new) E2E tests for all 6 user stories
```

**Structure Decision**: Follows existing single-project flat structure. One new module (`ai.js`), one new stylesheet (`ai.css`), one new test file. All prompt templates in existing `data/static.js`. All translations in existing `data/translations.js`.

## Complexity Tracking

No constitution violations — section not applicable.
