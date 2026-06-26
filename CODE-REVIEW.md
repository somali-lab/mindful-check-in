# Code review & improvement proposal — `app/` (TypeScript rebuild)

**Scope:** the rebuilt application under `app/` (~5,750 LOC TypeScript, no framework, Vite + Biome + Vitest).
**Method:** three independent layer reviews (core/data/i18n/config · infra/state/tests · ui/composition), with the
headline correctness claims re-verified by hand against the code and the ES5 reference app.
**Status of the app:** 384/384 Playwright + 44 Vitest green; boots clean from `file://`. The findings below are about
*internal quality*, not failing behaviour — nothing here is blocking the Phase-6 cutover, but several items are worth
doing before or shortly after it.

> **Verification note.** One agent-flagged "high" bug — `calculateStreak` undercounting on days with 2+ entries — was
> checked by hand and is **not** a bug: the duplicate same-day key falls through both branches (`kDay === cDay` false,
> `kDay < cDay` false) and is harmlessly skipped, so the streak is correct. It is intentionally **excluded** from the
> list below. The remaining findings were spot-checked at the quoted `file:line`.

---

## 1. Executive summary

The foundation is genuinely good: a clean functional core, a tiny correct reactive `signal`/`store` as a single source
of truth, a swappable `Repository`, strict TS that the code mostly honours, and an XSS-safe DOM-construction style. The
weaknesses are concentrated in three places:

1. **A missing shared-utility layer** → the same ~10 routines are copy-pasted across components (the single
   highest-value refactor).
2. **Trust-boundary validation gaps** → persisted/imported/fetched JSON is sometimes cast straight into typed objects.
3. **A few concrete defects** → a dead home-heatmap click, an ignored `toastDuration` setting, and dead `onChange`
   plumbing.

A prioritized roadmap is in §6.

---

## 2. What's done well (keep doing this)

- **Functional core is real.** `scoring`, `stats`, `color`, `reminders`, `types` are pure and import no DOM/storage.
- **`signal`/`store`.** Minimal, `Object.is`-deduped, copy-on-notify (safe unsubscribe mid-emit), returns an
  unsubscribe fn, all mutations funnel through persist-then-notify.
- **Repository pattern.** Clean interface with a real in-memory double for tests.
- **Offline-first I/O.** Weather/notifications degrade to null/no-op on failure.
- **XSS-safe DOM.** Overwhelmingly `createElement`/`textContent`; `innerHTML` only for clearing (`= ''`) and two
  internal-numeric SVGs.
- **i18n discipline.** `data-t*` + `t()` with EN fallback; only a couple of stray hardcoded strings.
- **Clean cross-view channel.** `entryLoadRequest` keeps overview/history from reaching into the form.

---

## 3. Concrete defects (fix these)

| # | Sev | Location | Defect | Fix |
|---|-----|----------|--------|-----|
| D1 | **High** | `ui/home/home.ts:140` | Home 28-day heatmap cells get `data-entry-key` but **no click handler** is wired, so they look loadable but do nothing. The ES5 app wired this (`home.js:213 bindEntryClick`); this is a parity regression. | Add a `#renderHeatmap` container click → `requestEntryLoad(key)`, mirroring `history.ts:41` / `overview.ts:119`. |
| D2 | **Med** | `ui/toast.ts:4,18` | `DURATION = 2600` is hardcoded; the persisted **`toastDuration`** setting (collected & saved via `cfg-toast`) has no effect. | Pass duration into `showToast` from `store.settings.get().toastDuration * 1000`, or remove the dead setting + UI control. Pick one. |
| D3 | **Med** | `ui/checkin/wheel.ts` (`onChange`) | The orchestrator constructs `new WheelComponent(store, () => {})` and reads `this.#wheel.picked` at save; the `onChange` param + its 3 call sites are dead plumbing. | Remove the `onChange` parameter and its calls. |
| D4 | **Med** | `state/store.ts:39-42,60-63` | `saveEntry`/`saveSettings` ignore `repo.write`'s boolean. On localStorage quota exhaustion the in-memory signal updates but the write failed → **silent data loss on reload**. | Check the return; on `false` surface a warning toast (and consider a dirty/unsaved marker). |
| D5 | **Med** | `core/datetime.ts:23-36` | `dateFromKey` never validates parts; a malformed key yields an **Invalid Date** (not `null`), silently corrupting `computeSwing`/`entrySpanDays`. | Validate `parts.length === 3` + finite numbers (or `Number.isNaN(d.getTime())`) and return `null`. |
| D6 | Low | `ui/checkin/chips.ts:142` | `aria-label="remove"` is a hardcoded English string (violates the no-hardcoded-UI-text rule). | Use `t('remove')`; add to EN+NL. |
| D7 | Low | `ui/overview/overview.ts:139-143` | `#confirmDelete` passes the same key `deleteConfirm` as both title and body. | Add a distinct body key. |
| D8 | Low | `infra/notifications.ts:21` | `icon: 'favicon.ico'` — the app ships `favicon.svg`; path also assumes a base URL. | Verify the asset name; derive from base or drop the icon. |

---

## 4. Cross-cutting themes (the structural work)

### 4.1 Duplication — no shared UI/utility layer  *(highest-value refactor)*
The same routines are reimplemented across components:

| Duplicated logic | Copies |
|---|---|
| `emotionLabel(id)` (capitalize → `t('em'+Id)`) | `wheel.ts:15`, `summary.ts:9`, `overview.ts:38` |
| `dayNames()` (NL/EN short days) | `home.ts:45`, `history.ts:22` |
| localized day/month arrays vs `toLocaleDateString` | `meta.ts:106` vs `home.ts:176`/`summary.ts:78` (4 sources of localized dates) |
| heatmap renderer (headers + spacers + cells) | `home.ts:116` vs `history.ts:77` (differ only in class prefix) |
| week-strip renderer | `home.ts:164` vs `summary.ts:67` |
| JSON export (`Blob`→URL→`a.click()`) + file-import (`FileReader`+parse+toast) | `info.ts:61-88` vs `settings.ts:232-257` |
| settings sub-tab nav | `info.ts:25-39` vs `settings.ts:125-140` |
| removable-tag builder (`tag`/`tag-x`) | `settings.ts:214` vs `chips.ts:127` |
| `getElementById().textContent` + `closest`-delegation idioms | ~all components |

**Proposal — introduce two small modules:**

- **`core/datetime.ts`** (extend): `dayNames(lang)`, `weekdayLabel(date, lang)`, `monthLabel(date, lang)` — one home
  for localized date strings.
- **`ui/dom.ts`** (new): `setText(id, value)`, `delegate(el, selector, handler)`, `downloadJson(filename, obj)`,
  `readJsonFile(file): Promise<unknown>`, `renderHeatmap(el, data, classPrefix)`, `renderWeekStrip(el, days, lang)`,
  `renderRemovableTags(el, items, dataAttr)`, `wireSubTabs(rootSelector)`, and a shared `emotionLabel(id)`
  (or move `emotionLabel` into i18n).

This alone removes most of the duplication and shrinks the UI layer materially.

### 4.2 Inconsistent component contracts
Components vary in ways that make the layer harder to reason about:
- **Construction:** free functions (`initTheme/initLanguage/initRouter`) vs classes; some stored as fields
  (`#wheel`…), three constructed-and-discarded (`SummaryComponent`/`HistoryComponent`/`SectionNavComponent`).
- **State location:** `energy/mood/body` hold internal state; **`wheel` keeps `variant` in the DOM `<select>`** and
  **`chips` keep the selected list in the comma-separated textarea** (brittle: a comma breaks an item).
- **Visibility ownership:** check-in components are hidden centrally by the orchestrator's `#applyVisibility`, but
  **weather hides itself** (`weather.ts:22`).
- **Reactivity:** everything auto-persists except **settings** (explicit Save) — a legitimate but undocumented
  exception.

**Proposal:** document one canonical component shape (ctor takes `store`; holds its own state; `render()`/`build()`;
visibility owned in one place; reset emits rather than reaching into sibling fields) and migrate outliers
(`wheel` variant → field, `chips` list → field state synced to the textarea on change only).

### 4.3 Trust-boundary validation gaps
Strict TS gives false confidence where untrusted JSON is cast straight through:
- `core/settings.ts:95-100` `mergeSettings` blanket-copies every raw top-level key with **no per-field coercion**
  (only `components`/`logo` are guarded) — `rowsPerPage: "x"` or `reminderDays: "mon"` flow into a typed `Settings`.
- `core/entry.ts:31-33` `normalize` rigorously guards `energy` but **waves `weather` numerics and `wheelType`** through.
- `infra/weather.ts:32-36` `getCached` dereferences `cached.ts`/`cached.data` without checking they exist (corrupt
  cache → `NaN` "fresh" → garbage `CurrentWeather`).
- `infra/storage.ts:26` `JSON.parse(raw) as T` — interface promises a `T` it can't guarantee (acceptable, but the doc
  should say "unvalidated; callers must validate").

**Proposal:** coerce per-field in `mergeSettings` and `normalize` (numbers/arrays/enums); add a small runtime guard for
the weather cache; document the Repository's unvalidated-read contract. Consider `exactOptionalPropertyTypes` in
tsconfig to make the `?`-vs-`| null` inconsistency (types.ts) surface.

### 4.4 Subscription / listener lifecycle
Every `subscribe(...)` and `addEventListener(...)` return value is discarded — **nothing is ever torn down**. This is
**safe today** (all components are permanent singletons created once at boot; views are CSS-toggled, not unmounted), so
it's low severity — but it's a latent leak the moment a view becomes destroyable. **Proposal:** one line in the
architecture doc stating the singleton assumption; revisit if dynamic mounting is ever introduced.

### 4.5 `window.MCI` bridge surface
`ui/bridge.ts:44` exposes the live, **mutating** `store` on a global via a double `unknown` cast, framed as
"debug/test". **Proposal:** declare a typed `Window['MCI']` via `declare global`; gate the `store` handle behind a
dev/test flag so production doesn't ship a global mutation surface.

### 4.6 Magic numbers & a brittle id contract
- Unnamed literals: energy thresholds `67/34`, swing bands `84/67/51/34/17`, luminance `> 170`, grid `10`, window
  sizes `6/27/28`, `86_400_000`, scroll offsets `90/14/-2`, toast `10/300`. **Proposal:** name them near their model.
- `index.html` wires the UI by ~80 hardcoded string ids referenced across the TS layer with no registry (one id has
  already drifted: `home-swing-matrix-sub` vs the `valence` card). **Proposal:** a typed `ids.ts` const map (or
  `data-*` hooks) so references are greppable and rename-safe.

### 4.7 Accessibility
`wheel.ts:166`/`mood.ts:96` give SVG segments `role="button"` + `tabindex="0"` but only a **container `click`** handler
— focusable yet **not keyboard-operable** (worse than nothing). Heatmap/score cells convey state by colour + `title`
only. **Proposal:** add a container `keydown` (Enter/Space → select) or drop the role/tabindex; add `aria-label`s to
data cells.

### 4.8 `core/demo.ts` purity leak
`demo.ts` lives in `core` but reads the global `lang` signal and uses `Math.random()` — the one "core" file that is
neither pure nor deterministically testable. **Proposal:** take `lang` (or the label grid) and an RNG as parameters, or
move it behind a `demo`/`infra` boundary.

---

## 5. Test-quality gaps
Unit suites lean happy-path; the two riskiest behaviours are untested:
- **`signal`**: no test for unsubscribe-during-emit, re-entrant `set`, throwing listener, or multi-subscriber ordering.
- **`store`**: no write-failure (D4), corrupt-entry, `replaceAllEntries`, or `updatedAt`-stamping test.
- **`LocalStorageRepository`**: untested entirely (only the memory double is) — incl. quota-exceeded `write → false`.
- **`weather`**: no `res.ok === false` branch, no `getCached` TTL/expiry/corruption suite.
- **`i18n`**: the "EN fallback" test (`index.test.ts:18`) admits it doesn't reach the fallback branch (every key exists
  in both blocks) — structurally cannot cover what it claims.
- **`scoring`**: `computeMoodScore` has no negative/low-energy case (low end of the mapping untested).

**Proposal:** add a failing-repo double, a corrupt-data case, the signal edge-cases, and a real EN-fallback stub.

---

## 6. Prioritized roadmap

**P0 — defects (small, do before/with the cutover) — ✅ DONE (commit, 386/386 + 45 Vitest)**
- ✅ D1 home-heatmap click, ✅ D2 toast-duration, ✅ D3 remove dead `onChange`, ✅ D4 write-failure surfacing
  (`store.persistError` → toast), ✅ D5 `dateFromKey` guard (+Vitest), ✅ D6 chips `ariaRemove`, ✅ D7 distinct delete
  title, ✅ D8 notification icon → `favicon.svg`. Added a Playwright regression for D1.

**P1 — kill duplication (highest structural value) — ✅ DONE (−111 LOC net)**
- ✅ Added `ui/dom.ts` (`setText`, `downloadJson`, `readJsonFile`, `wireSubTabs`, `renderRemovableTags`,
  `renderWeekStrip`) + `i18n.emotionLabel` + `core/datetime.weekdayHeaders`; migrated all consumers.
- ⏭️ `renderHeatmap` intentionally **not** extracted — the home vs history cell logic (score-tier vs mode-tier,
  span-wrapped vs not, `data-entry-key` vs not) differs enough that a shared version adds more indirection than it
  removes.

**P2 — harden trust boundaries & consistency — 🔶 PARTIAL**
- ✅ Per-field coercion in `mergeSettings` (numbers must be finite, arrays keep same-typed elements, booleans forced)
  + `normalize` (weather numerics dropped if non-number; `wheelType` validated → `act`); weather-cache + geocode
  guards. Added Vitest for each.
- ✅ `Entry.wheelType` typed as `WheelType`.
- ❌ `t(key: StringKey)` — **rejected**: the code builds dynamic keys (`t('em'+Id)`, `t('swingTier'+n)`), which a
  literal-union signature would break.
- ✅ `exactOptionalPropertyTypes` + `noImplicitOverride` **enabled** — blast radius was only 3 errors (fixed:
  `EntryWeather` numerics now explicit `| undefined`, one test array access).
- ✅ Component contract: `wheel` `variant` moved to an internal field (reflected to the `<select>`). **`chips` list kept
  field-canonical** — the entry's `actions`/`customFeelings` *are* comma-strings, so moving to component state wouldn't
  fix the comma model and would just add a cache that still writes back to the field (net-negative).

**P3 — polish — 🔶 PARTIAL**
- ✅ Keyboard a11y for the SVG/grid controls (Enter/Space → select on wheel segments + mood cells; verified).
- ✅ Named the scoring magic numbers (`VALENCE_MAX`, `ENERGY_HIGH/MID`, `VALENCE_HIGH/MID`, `SWING_BANDS`).
- ✅ Closed the riskiest test gaps from §5: signal unsubscribe-during-emit + re-entrant `set`, and the store
  write-failure (`persistError`) path.
- ✅ `window.MCI` bridge: dropped the mutable `store` handle entirely (no spec used it) + typed `declare global` (no
  more double-`unknown` cast) — pure functions + data only.
- ✅ Derived `bodyZones` from `zoneKeys`; aligned `package.json` version to the app's `1.0.0`.
- ✅ Closed the §5 test gaps: `LocalStorageRepository` (round-trip / fallback / quota `write→false`), weather
  `res.ok===false` (geocode + fetchCurrent), and a **real** i18n NL→EN fallback (temporarily drops a NL key).
- ✅ §4.8 `core/demo`: takes `lang` as a parameter (no global read); demo keys include the per-day index (no collision).
  `Math.random` kept — inherent to "random demo data".
- ❌ Typed `ids.ts` registry — **skipped (reasoned)**: the ~80 ids are already pinned by the Playwright suite (a rename
  breaks tests immediately, so the silent-drift risk is near-zero), and the flagged `home-swing-matrix-sub` "drift" is
  intentional (the matrix's two axes share one sub-label). Net indirection without proportional benefit.
- ⏭️ §4.4 lifecycle: documented here as a deliberate **singleton** assumption (components are created once at boot;
  views are CSS-toggled, never unmounted, so discarded unsubscribers don't leak). Revisit only if dynamic mounting is
  introduced.

**Outcome:** every review item is now either done or carries an explicit, reasoned decision. Final state: **386/386
Playwright + 59 Vitest green; `tsc` strict (incl. `exactOptionalPropertyTypes`, `noImplicitOverride`,
`noUncheckedIndexedAccess`) + Biome clean; `file://` boot clean.**

---

## 7. Tooling notes
- `tsconfig.json`: add `exactOptionalPropertyTypes` and `noImplicitOverride` (the nullability inconsistency makes the
  former valuable).
- `package.json`: add a standalone `typecheck` script; wire `biome check` into CI gating.
- `vite.config.ts:15`: the `html.replace(/\s+type="module"/g, ' defer')` regex is broad — prefer Vite's structured
  `transformIndexHtml` tag API over string surgery; reconsider whether `target: 'esnext'` is the right floor for the
  `file://` distribution.

---

*Generated from a three-agent parallel review; correctness claims re-verified against the code and the ES5 reference.
The `calculateStreak` "undercount" claim was investigated and rejected (see the verification note at the top).*
