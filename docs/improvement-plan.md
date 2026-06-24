# Mindful Check-in — Improvement Plan

**Created**: 2026-06-24
**Status**: Active — Workstreams 1 (tests + reminders coverage) & 2 (docs) done + CI added; Workstream 4 mostly done (week-strip + tier-threshold dedup, mood/reminder i18n, energy guard, T138 key fix); remaining W4: `checkin.js` god-module split + date-key helper + Checkin-exception doc (2026-06-24)
**Scope**: Architectural consistency, SOLID/DRY/SoC, test relevance, documentation & agent files.

This plan is the output of a full review of `src/` (~4,575 LoC JS, ~4,058 LoC CSS), the Playwright suite (~6,475 LoC across 30 specs), the docs, and the `.claude` / `.github` config.

---

## Verdict

The **runtime architecture is sound** for a no-build vanilla-JS app. The debt is concentrated in three areas: a test suite that is both **bloated and broken**, documentation that had **drifted out of sync** with the code, and **localized DRY/SoC debt** in the largest modules. None of it is structural rot.

## What is healthy (keep doing)

- **Event bus + Store abstraction is clean.** `localStorage.*` appears *only* in `core.js`'s Store layer. Across the 11 feature modules there are **zero** event-bus violations.
- **ES5 constraint fully honored** — no ES6 syntax anywhere in `src/lib|modules|data|boot.js`. The `.claude/hooks/check-es5.sh` PostToolUse hook actively enforces it.
- **Shared computation centralized** in `compute.js` / `core.js` (streak, moodScore, stats, heatmap data, `esc`, date helpers).
- **i18n discipline is real** — `translations.js` has perfect EN/NL parity (302 keys each).

---

## ✅ Resolved (2026-06-24) — the test suite is green again

**Now: `346 passed` (chromium + mobile-chrome) with CI guarding push/PR to `main`.** This was originally the critical finding: a clean `main` ran **343 passed, ~44 failed** — **stale selectors / stale expected strings**, not app bugs (the app worked; the tests rotted):

| Failing spec | Stale reference | Current reality |
|---|---|---|
| `energy-meters.spec.js`, `checkin.spec.js` T006, `component-visibility.spec.js` | `.energy-meter[data-energy-type]`, vertical click positions | Meters render `.nrg-row` / `.nrg-track` / `.nrg-seg` (horizontal segmented bar) |
| `quick-actions.spec.js` T107/T108 | `#ci-chips .quick-action-chip` | `checkin.js` renders `.ci-act-pill` |
| `language.spec.js` T084–T086 | `[data-t="homeGreeting"]` = "How are you today?" | Greeting redesigned (T087/T088 still pass — switching works) |
| `checkin.spec.js` smoke | title / `[data-route="checkin"]` expectations | drifted |
| `emotion-wheel.spec.js`, `body-signals.spec.js`, `edge-cases.spec.js`, `weather.spec.js`, several `branch-coverage-*` | various stale DOM selectors | — |

**Why this matters:** the tests that assert real user-facing DOM rotted and went red, while the branch-coverage tests that poke internal `MCI.*` APIs mostly still pass (internal APIs didn't drift). That is exactly backwards from what protects users. With **no CI** to run the suite, the breakage went unnoticed.

---

## Workstream 1 — Tests (highest leverage)

The suite is 6,475 LoC for ~4,575 LoC of source. The four `branch-coverage*.spec.js` files (**2,963 LoC, ~225 tests — ~46% of the suite**) are white-box unit tests run through a full browser: `page.goto('/')` then `page.evaluate()` to poke internals (`MCI.off/emit`, override `localStorage.setItem` to throw, call `MCI.normalize`/`computeMoodScore` directly). Their headers say it: *"Target: remaining uncovered branches to reach 85%."* There is **no coverage gate** and **no CI** — so this machinery produces a vanity number with nothing behind it.

### 1a. Repair the rotted behavioral specs (do first — restores a green baseline) — ✅ done
- Map every stale selector/string in the ~44 failing tests to the current DOM and fix them. Establish **one selector convention** (prefer the readable behavioral set, e.g. `data-*` attributes that actually exist).
- The energy meters need a genuine **rewrite** (vertical → horizontal segmented bar), not a find-replace.
- Remove the `if (count > 0) { assert }` guard pattern — several "tests" assert nothing when a selector misses, so they pass even when the feature is broken.

### 1b. Delete / consolidate the coverage-chasing layer — ✅ done (4 files deleted; pure-function checks re-homed in `core-units.spec.js`)
- **Delete the 4 `branch-coverage*.spec.js` files** (2,963 LoC). Their behavioral half duplicates the named specs (overview sorting is re-tested in 3 files; `hasLightBackground` in 4); their unit half belongs in Node.
- **Re-home pure-function tests in Node** (jsdom or expose `compute`/`core` for `require`): `normalize`, `computeMoodScore`, `computeStats`, `hasLightBackground`, `formatDate`, `dateFromKey`, `uid`, `debounce`, `esc`, `t`. ~150–250 LoC replaces ~1,800 LoC of browser unit tests; also removes the `COVERAGE=1` ternary from every spec header.
- **Strip orphaned `Txxx [USyy]` names** — they trace to the deleted spec-kit (`9006271 feat(spec-kit): removed`); no reader can resolve "US27".
- **Drop the `c8 ignore` arms race** (~200 comments) — once 1b lands, most are moot; let coverage reflect reality.

### 1c. Add genuinely missing coverage — ✅ done
- ✅ Reminders settings panel — `reminders.spec.js` covers form persistence + hydration (the Notification firing itself stays out of E2E scope).
- ✅ The documented `renderHistory` crash (all history modes disabled) no longer reproduces — the shared-helper refactor + event-bus try/catch handle it. T038 now asserts the success toast instead of working around it.

**Target shape:** ~23 behavioral E2E specs (green, one selector convention) + 1 Node unit spec ≈ **~3,200 LoC vs 6,475 today**, with better real-behavior coverage and no vanity machinery.

### 1d. Add CI — ✅ done (`.github/workflows/test.yml`, push + PR to `main`)
There is no GitHub Actions workflow (`.github/workflows/` is empty), yet the README implies a comprehensive suite. Either add an action that runs Playwright + the ES5 grep on PR, or stop implying automation in the docs. Pick one.

---

## Workstream 2 — Documentation ✅ (done in this pass)

Fixed verified drift across `architecture.md`, `CLAUDE.md`, `README.md`, `.github/copilot-instructions.md`:
- Storage keys **7 → 6**; removed the non-existent `moodTrackerWheelType` key everywhere.
- Settings schema: corrected `energyEmotionalLabel` default (`social`), `weatherLocation` default (`Amsterdam`); added the omitted `logo`, `toastDuration`, `isDefaultQuickActions`, and the entire `reminder*` block.
- Events table: added the 6 missing events (`entries:changed`, `entry:request-load`, `mood:selected`, `wheel:selected`, `weather:fetched`, `navigate:route`).
- Removed the dangling `specs/` reference; fixed the wheel-data shape and the entry-key-format claim.
- Removed the phantom `build-tw-css.yml` instruction from CLAUDE.md (the file no longer exists).
- Added `reminder.js` / `section-nav.js` to the README module list; qualified the misleading "open directly as a file" claim.
- `copilot-instructions.md`: replaced stale auto-generated header (fake `backend/frontend` layout, non-existent `npm test`/`npm run lint`), fixed the wrong `normalize` description and the `MCI.Bus.on` typo.

**Remaining doc decisions:**
- Four overlapping guidance docs (CLAUDE.md, architecture.md, README testing section, copilot-instructions.md). Consider making `architecture.md` canonical, trimming README's 85-line testing section to a pointer, and deciding whether to keep `copilot-instructions.md` (delete if Copilot isn't used).
- `.vscode/settings.json` points Copilot at `.github/instructions|prompts|agents|skills` and `AGENTS.md` — none exist. Harmless (opt-in), low priority.
- README "~380 tests" and the "Built with" model names are unverified; update after Workstream 1.

---

## Workstream 3 — Agent & config files

- `.claude/` is **lean and correct** — one ES5 PostToolUse hook (exemplary), one `screenshot` skill, minimal `settings.json`. No changes needed.
- `package.json` is clean (genuinely zero deps). Minor: the `description` carries "v4/v3/v2" lineage cruft.

---

## Workstream 4 — Code (DRY / SOLID / SoC)

Architecture is fine; debt is localized. Highest value first:

| Severity | Item | Location |
|---|---|---|
| High | **`checkin.js` god module (546 LoC)** — orchestration + action chips + feeling chips + date formatting + greeting + pill + visibility. `startAddAction`/`startAddFeeling`, `buildChips`/`buildFeelChips`, `selectedActions`/`setSelectedActions` vs `feelList`/`setFeelList` are near-identical pairs. Extract a generic comma-list chip editor; split chips/date into own files. | `checkin.js:279–412` |
| ✅ done | **Duplicated 7-day week heatmap** — extracted into shared `MCI.weekStripHtml(entries)`; home + dashboard both call it. | `compute.js`, `home.js`, `dashboard.js` |
| Med | **`energy.js:72` unguarded `settings.components`** — `updateDisplay()` didn't guard while `buildMeters()` did. ✅ Fixed in this pass (defensive `var comps = settings.components || {}`). Path is unreachable in practice (loadSettings always merges components), so no test added. | `energy.js` |
| Med | **ISO/date-key string-building duplicated** — `timestampKey` (core), `getDateOverrideKey` + `syncDateInput` (checkin) hand-roll the same zero-padded format. Add a `pad2`/key-builder helper. | core + checkin |
| ✅ done | **Domain thresholds in the render layer** — extracted to `MCI.scoreTier/energyTier/valenceTier` in `compute.js`; home/dashboard/week-strip prefix the tier. | `compute.js`, `home.js`, `dashboard.js` |
| ✅ done | **Hardcoded UI string** — mood readout now uses the `moodReadout` i18n key (EN + NL). | `mood.js`, `translations.js` |
| ✅ done | **`reminder.js` Dutch fallbacks** — fallbacks and comments switched to English to match convention. | `reminder.js` |
| Low | **Doc'd Checkin exception too narrow** — `checkin.js` also calls `MCI.Nav.switchTo/activeRoute` and `MCI.Weather.getCurrent()`. Widen the documented exception or route via the bus. | `checkin.js:470,475,520` |

---

## Recommended sequencing

1. **Docs sweep** — ✅ done (this pass), zero runtime risk.
2. **Restore a green test baseline (1a)** — repair the ~44 rotted specs so the suite passes; this unblocks everything else and is a prerequisite for safe refactoring.
3. **Prune the coverage-chasing layer (1b)** + add Node unit tests.
4. **Code DRY/SoC (W4)** — extract the week-strip and chip-editor; remove now-pointless `c8 ignore`s.
5. **CI decision (1d)** — add an action or align the docs.

## Tradeoffs / risks

- **Deleting tests feels like losing coverage** — it isn't here: behaviors are covered by named specs and there's no gate. If you ever want an enforced threshold, the honest path is the small Node unit layer, not browser-driven branch poking.
- **Removing `c8 ignore` will *drop* the reported coverage %** — that's the metric becoming honest, not a regression.
- **Repairing the energy specs is a rewrite, not a rename** (the meter interaction changed) — budget for it.
- **Don't over-correct on docs** — consolidating the four guidance files is as valuable as fixing the drift.
