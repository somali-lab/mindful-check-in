# StoryForge Design System

The brand & UI system for **StoryForge** — a novelist's workshop for building
characters, worlds, and manuscripts in one place. This project is the design
source of truth: tokens, fonts, reusable React primitives, foundation specimens,
and a full interactive recreation of the product.

Consumers link **one** stylesheet — `styles.css` — which `@import`s the tokens,
the base reset, and every component class. The compiled component library is
exposed on `window.StoryForgeDesignSystem_99b946`.

---

## What is StoryForge?

StoryForge is a planning + drafting tool for fiction writers. A **project** is a
novel (or short story); inside it you build:

- **World** — Project & World overview, Characters, Relationships, Locations,
  Groups (factions/organizations), a Lorebook, and Notes.
- **Manuscript** — the Manuscript editor, a Plot outline, a Corkboard of scenes,
  and an Outliner.
- **Analysis** — a Timeline and a **Story Health** dashboard that scores how
  complete and consistent the work is.

An AI assistant ("Atelier") lives in a right-hand drawer. The app is a calm,
editorial, document-like workspace — not a flashy SaaS dashboard.

The demo content throughout this system is the product's own seed project,
**"The Erasure Protocol"** (a thriller about a bureau that erases people from
existence). Cast: Elara Voss, Marcus Chen, Iris Blackwood, Dex Morales,
Professor Yuki, Raven Ortiz, Thomas Hale.

### Sources

This system was reverse-engineered from the StoryForge codebase. Explore it to
build higher-fidelity work:

- **GitHub:** `somali-lab/story-writer` @ `main` — the `src/frontend` tree
  (vanilla JS + lit-html, CSS under `src/frontend/css/`) holds the real
  "Forge" design direction this system is lifted from; `src/backend` holds the
  domain model and the demo-seed copy.
  <https://github.com/somali-lab/story-writer>

The frontend is vanilla JS organised via `window.SF` modules and rendered with
lit-html; styling is plain CSS classes (`.sf-*`) driven by CSS custom
properties (`--sf-*`). This design system preserves those exact tokens and class
names, and adds React primitives that emit the same markup.

---

## Content fundamentals

How StoryForge writes, so generated copy sounds like the product:

- **Voice — warm, literary, second person.** The UI talks to the writer as a
  collaborator. Empty states are encouraging and specific: *"Cast the people who
  move your story. Start with your protagonist."* Never generic ("No items
  found").
- **Sentence case everywhere** for UI text — buttons, titles, menu items
  ("New character", "Story health", "Ask Atelier"). The only UPPERCASE is the
  tiny tracked **eyebrow/label** style (field labels, section headers like
  `WORLD` / `MANUSCRIPT`).
- **Titles are nouns, actions are verbs.** Panel titles: "Characters",
  "Story health". Buttons lead with a verb: "New scene", "Suggest fixes",
  "Edit".
- **Editorial, literary register.** Field bodies and narrative read like prose
  (set in Lora serif). Copy favours specific, evocative nouns over marketing
  adjectives — "The harbour at low tide", "A meeting in smoke".
- **Numerals are precise and tabular** — "24,310 / 80,000 words", "78%".
- **First vs. second person:** the app addresses the user as *you* ("Your
  projects", "where you left off"); it never speaks as *I*. The AI is named
  ("Atelier"), not "the assistant".
- **No emoji.** Iconography is line-drawn SVG. (Unicode glyphs appear only as
  tiny functional affixes — a theme-toggle sun/moon, a breadcrumb "/".)
- **Tone:** measured and calm. Destructive copy is honest about consequences
  ("This removes the character and unlinks them from 3 scenes").

---

## Visual foundations

The direction is **"Forge" — paper + walnut + copper.**

- **Palette.** Warm and earthy, never neutral grey. Backgrounds are warm
  near-black "paper" (`#1b1611`); borders and muted text are walnut browns;
  a single **copper** accent (`#d99458`) carries every action, focus ring, active
  state, and the create affordance. Semantic colours (success/warn/danger) are
  muted so they sit on paper. **Dark Forge is the default**; a light parchment
  theme is available via `data-theme="light"` (or `"system"`).
- **Typography.** Two voices: **Lora** (serif) for *every title and piece of
  narrative prose* — the editorial soul of the product — and **Geist** (sans)
  for all UI (labels, buttons, metadata). **Fira Code** for numerals/code.
  Titles use tight negative tracking (−0.01 to −0.02em); labels use a +0.08em
  uppercase eyebrow. Tight 11→28px scale (it's a tool, not a landing page).
- **Backgrounds.** Flat warm fills only. **No gradients** except two intentional
  uses: the copper **logo ingot** and the **"create" card** (a solid copper
  ingot). No photographic hero imagery, no textures, no patterns.
- **Cards.** Parchment surface (`--sf-surface`), 1px soft walnut border, 10–12px
  radius. Hover lifts the border to full walnut + a small warm shadow. The
  "create" card inverts to a solid copper ingot. The read-only "Bible" cards
  (uppercase label + Lora body) are the workhorse for displaying narrative
  fields.
- **Borders & dividers.** Hairline walnut (`--sf-border-soft`) for internal
  separators; `--sf-border` for outer edges. Active nav/list rows get a **3px
  copper ribbon** glued to the left edge (drawn as a pseudo-element so the label
  never shifts).
- **Shadows.** Warm-tinted and reserved: `sm` for card hover, `md` for
  toasts/popovers, `lg` for modals. Most surfaces are flat (border-defined).
- **Radii.** 4 (chips/tabs) · 8 (buttons/inputs) · 12 (cards/modals) · pill
  (badges/toggles/status chips).
- **Motion.** Restrained. Three durations (150/200/400ms) of short copper fades
  and slides — **never bounce**. Toasts slide up 8px and fade in. Reduced-motion
  nulls everything.
- **Hover / press.** Quiet surfaces warm one step (`surface` → `surface-2`) and
  text brightens to copper; the primary button darkens copper
  (`accent` → `accent-dark`). No scale/press-shrink.
- **Focus.** A 2px copper outline (offset 2px) on focus-visible; form fields get
  a 3px soft-copper glow ring.
- **Transparency & blur.** Used sparingly: the modal scrim is a 55%
  paper-dark wash with a 2px blur; copper tints use `rgba(var(--sf-accent-rgb) /
  a)`.
- **Avatars.** Circular, Lora-serif initials, on one of **8 deterministic
  walnut tones** hashed from the character's id/name — stable across reloads.
- **Layout.** The app is a fixed three-region shell: a 184px sidebar (warm
  chrome), a 1fr main pane (paper) with a 52px breadcrumb bar, and a 28px status
  bar pinned to the bottom. Entity screens use a **split view** (270px list +
  scrolling detail).

---

## Iconography

- **One line-icon set**, lifted verbatim from the product (`SF.Icons`) and
  shipped here as **`assets/icons.js`** (`window.SFIcons`). Every icon is a
  24×24 viewBox, `fill:none`, `stroke:currentColor`, **stroke-width 1.6**, round
  caps/joins — so it inherits colour and aligns in flex rows. ~22 glyphs cover
  the product's nav + actions (home, world, users, link, location, shield, book,
  loreScroll, note, chapters, plot, scenes, clock, heart, heartPulse, plus,
  expand, edit, search, sparkle, gear).
- **Usage:** `SFIcons.svg('users', 18)` returns markup; `SFIcons.names()` lists
  all. The `IconButton` and `NavItem` primitives accept these strings.
- **No emoji** as iconography. No icon font. No multicolor/filled icon sets.
  When you need an icon that isn't in the set, draw it in the same 24px / 1.6px
  line style.
- **The logo mark** is a copper **ingot** — a 6–8px-radius square with a
  135° `accent → accent-dark` gradient and a white Lora "S" — set beside the
  Lora wordmark "StoryForge". Recreated in `guidelines/brand-logo.card.html`.

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link (`@import` manifest only).
- `tokens/` — `colors.css`, `themes.css`, `typography.css`, `spacing.css`,
  `motion.css`, `fonts.css`.
- `css/` — `base.css` (reset) + `components.css` → `components/{buttons, cards,
  inputs, badges, avatar, feedback, navigation, split-view}.css`.
- `assets/icons.js` — the `SFIcons` line-icon set.
- `SKILL.md` — Agent-Skills-compatible entry point.

**Components** (`window.StoryForgeDesignSystem_99b946`) — each with `.jsx`,
`.d.ts`, `.prompt.md`, and a directory `@dsCard`:
- `components/forms/` — Button, IconButton, Input, Textarea, Select, Toggle,
  TagChips
- `components/data-display/` — Card, CharacterCard, Avatar, Badge, Chip, StatCard,
  ProgressBar
- `components/feedback/` — Toast, Modal, Spinner / Loading, EmptyState
- `components/navigation/` — NavItem, Breadcrumb, Tabs

**Foundations** (`guidelines/*.card.html`) — Colors, Type, Spacing, Brand
specimen cards shown on the Design System tab.

**UI kit** (`ui_kits/storyforge/`) — an interactive recreation of the product:
project library → app shell (sidebar / breadcrumb / status bar) → Project &
World overview, Characters (split list + Bible detail), the **Manuscript editor**
(chapter tree + Lora prose surface), the **Timeline** (multi-track day-axis with
chapter bands + scene/location/relationship points), the **Lorebook** (split
list + entry detail), Corkboard, and Story Health — plus the **Atelier AI
drawer** (the right-hand assistant, toggled from the breadcrumb).
Characters, Relationships, Locations, Groups, Lorebook, Notes and Scenes
(Corkboard) all use a reusable **ElementIndex** with two interchangeable layouts
— a paginated **card index** (leading New/Import action cards that open real
create/import dialogs, multi-select + delete, drag-and-drop + ↑/↓ reorder,
adjustable page size) and the classic **list-beside-detail** — switchable per
type in **Settings** and flippable on the spot. New / Edit / Import open an
**inline editor pane** (never a modal) with a pinned Cancel / Save bar — the
type in **Settings** and flippable on the spot. The editor mirrors the product's
real forms — **Characters** has Basic / Details & arc / Summary / Persona tabs,
**Lorebook** has Basic / Advanced / Notes, **Locations** & **Groups** have
Basic / Details, **Relationships** has Basic / Dynamic, **Scenes** has
Basic / Summary — all with two-column rows, a **live Unsaved-changes status**
(Save enables only when dirty; a confirm guards Cancel), and a sticky footer
(status + **Save / Cancel / Delete**, lifted from the codebase's `EditorChrome`).
Relationship & scene character/POV fields are live dropdowns of the cast, and a
toast confirms every save / create / delete. Each index also has a **search box**
(matches name + key fields), friendly **empty states**, and keyboard shortcuts
(**Esc** cancels with a discard guard, **⌘/Ctrl+S** saves). **Story Health** and
the status-bar word-count / health % are **computed live** from the data — arcs,
described locations, drafted scenes and word count drive the gauges as you edit.
Adds,
edits, deletes and reordering persist to `localStorage` (with a Reset in
Settings). The **Plot** screen is a three-act beat sheet. Theme toggle included.
Entry: `ui_kits/storyforge/index.html`.
Theme toggle included. Entry: `ui_kits/storyforge/index.html`.

**Template** (`templates/storyforge-screen/`) — an app-shell scaffold
(sidebar + breadcrumb + status bar) that consuming projects copy to start a new
StoryForge screen; loads the system via `ds-base.js`.

---

## Notes & substitutions

- **Fonts** (Lora, Geist, Inter, Fira Code) load from **Google Fonts** via an
  `@import` in `tokens/fonts.css` — these are the product's real families, not
  substitutes. To self-host, drop `.woff2` files in `assets/fonts/` and swap the
  `@import` for local `@font-face` rules. (Because the fonts come in through an
  `@import` rather than direct `@font-face` rules, the compiler reports 0 fonts —
  expected.)
