/* @ds-bundle: {"format":3,"namespace":"StoryForgeDesignSystem_99b946","components":[{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"CharacterCard","sourcePath":"components/data-display/CharacterCard.jsx"},{"name":"Chip","sourcePath":"components/data-display/Chip.jsx"},{"name":"ProgressBar","sourcePath":"components/data-display/ProgressBar.jsx"},{"name":"StatCard","sourcePath":"components/data-display/StatCard.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Spinner","sourcePath":"components/feedback/Spinner.jsx"},{"name":"Loading","sourcePath":"components/feedback/Spinner.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TagChips","sourcePath":"components/forms/TagChips.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Toggle","sourcePath":"components/forms/Toggle.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"assets/icons.js":"fbd46f664c7b","components/data-display/Avatar.jsx":"37edd7399908","components/data-display/Badge.jsx":"9103d82a09c0","components/data-display/Card.jsx":"558cc65dbc68","components/data-display/CharacterCard.jsx":"ade93ade4454","components/data-display/Chip.jsx":"6a6f263755d8","components/data-display/ProgressBar.jsx":"848de81126da","components/data-display/StatCard.jsx":"3ad7a5c8ce3f","components/feedback/EmptyState.jsx":"e885362b7fbe","components/feedback/Modal.jsx":"461650aa1242","components/feedback/Spinner.jsx":"8253e59e8f08","components/feedback/Toast.jsx":"50a1b06d85d8","components/forms/Button.jsx":"3674baa1fea2","components/forms/IconButton.jsx":"e08c4e612cae","components/forms/Input.jsx":"c63efadabc24","components/forms/Select.jsx":"7aecd4a840c5","components/forms/TagChips.jsx":"aa9af5e11c56","components/forms/Textarea.jsx":"f64d5c208196","components/forms/Toggle.jsx":"8c31a9a1be15","components/navigation/Breadcrumb.jsx":"bb97ddf928bf","components/navigation/NavItem.jsx":"a115bc7d740c","components/navigation/Tabs.jsx":"bf7fb877801a","ui_kits/storyforge/AppShell.jsx":"f74753536a3f","ui_kits/storyforge/app.jsx":"1e22d2074d03","ui_kits/storyforge/data.js":"e841c84d1cd3","ui_kits/storyforge/helpers.jsx":"1a12f3ca92d1","ui_kits/storyforge/index-view.jsx":"b771447f71cb","ui_kits/storyforge/screens.jsx":"ab88ba8ab729"},"inlinedExternals":[],"unexposedExports":[{"name":"initialsOf","sourcePath":"components/data-display/Avatar.jsx"},{"name":"toneOf","sourcePath":"components/data-display/Avatar.jsx"}]} */

(() => {

const __ds_ns = (window.StoryForgeDesignSystem_99b946 = window.StoryForgeDesignSystem_99b946 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/icons.js
try { (() => {
/* StoryForge icon set — monochrome line-style SVG icons (the "Forge" set
 * lifted verbatim from the product's SF.Icons module).
 *
 * Every icon is a 24×24 viewBox, fill:none, stroke:currentColor, stroke-width
 * 1.6, round caps/joins — so it inherits colour from its container and aligns
 * cleanly in flex rows. Usage:
 *
 *   <span class="...">${SFIcons.svg('users', 18)}</span>   // returns markup string
 *   SFIcons.names()  ->  ['home','world','users', …]
 *
 * Exposed as window.SFIcons (plain script) and as an ES export. */
(function (root) {
  'use strict';

  var PATHS = {
    home: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    world: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 3 2.6 14 0 17M12 3.5c-2.6 3-2.6 14 0 17"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19c.6-3 3-4.5 6-4.5s5.4 1.5 6 4.5"/><circle cx="17" cy="7" r="2.4" opacity="0.55"/><path d="M16 13.5c2.6 0 4.5 1.4 5 4" opacity="0.55"/>',
    link: '<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 11l8-4M8 13l8 4"/>',
    scenes: '<rect x="3.5" y="6" width="17" height="13" rx="2"/><path d="M3.5 9.5h17M7.5 6v3.5M12 6v3.5M16.5 6v3.5"/>',
    location: '<path d="M12 21s-7-7-7-12a7 7 0 1 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="9.5" r="2.5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
    book: '<path d="M4 4.5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"/><path d="M20 4.5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z" opacity="0.55"/>',
    loreScroll: '<path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    note: '<path d="M5 3.5h10l4 4v13H5z"/><path d="M15 3.5v4h4"/><path d="M8 12h8M8 15.5h6" opacity="0.6"/>',
    chapters: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 7h8M8 11h8M8 15h5" opacity="0.7"/>',
    plot: '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>',
    heartPulse: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/><path d="M3.5 12.5H8l1-2 2 4.5 2-5 1.2 2.5h4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    expand: '<path d="M8 4H6a2 2 0 0 0-2 2v2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/>',
    edit: '<path d="M16.5 4.5a2.12 2.12 0 0 1 3 3L8 19l-4 1 1-4z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sparkle: '<path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z"/>',
    gear: '<circle cx="12" cy="12" r="2.6"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>'
  };
  function svg(name, size) {
    var paths = PATHS[name];
    if (!paths) {
      return '';
    }
    var s = size || 18;
    return '<svg class="sf-icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' + 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' + 'aria-hidden="true" focusable="false">' + paths + '</svg>';
  }
  function names() {
    return Object.keys(PATHS);
  }
  var api = {
    svg: svg,
    names: names,
    PATHS: PATHS
  };
  root.SFIcons = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : this);
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/icons.js", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = 8;

/** Up to two initials: "Elara Voss" → EV, "Bram" → B. */
function initialsOf(name) {
  const t = String(name || '').trim();
  if (!t) return '?';
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Stable walnut tone slot from a seed (id or name). */
function toneOf(seed) {
  const s = String(seed || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = hash * 31 + s.charCodeAt(i) | 0;
  return Math.abs(hash) % TONES;
}

/**
 * Avatar — a circular initials/photo badge in a deterministic walnut tone.
 * Same name → same colour across reloads (hash-based, no inline colour).
 */
function Avatar({
  name,
  src,
  seed,
  size = 'md',
  tone,
  className = '',
  ...rest
}) {
  const t = tone === undefined ? toneOf(seed || name) : tone;
  const classes = ['sf-avatar', `sf-avatar--${size}`, src ? '' : `sf-avatar-tone-${t}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: classes,
    title: name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name || ''
  }) : initialsOf(name));
}
Object.assign(__ds_scope, { initialsOf, toneOf, Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — a small pill that classifies an entity's importance (main /
 * supporting / minor) or status. Copper = main, green = supporting, walnut =
 * minor.
 */
function Badge({
  variant = 'main',
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['sf-badge', `sf-badge--${variant}`, className].filter(Boolean).join(' ')
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the base surface: parchment fill, soft walnut border, 10px radius.
 * `clickable` adds the copper hover edge; `add` makes it the solid-copper
 * "create" ingot. Use Card.Title / Card.Meta / Card.Actions for the standard
 * anatomy, or pass arbitrary children.
 */
function Card({
  clickable,
  add,
  className = '',
  children,
  ...rest
}) {
  const classes = ['sf-card', clickable ? 'sf-card--clickable' : '', add ? 'sf-card--add' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: classes
  }, rest), children);
}
Card.Title = function CardTitle({
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['sf-card__title', className].filter(Boolean).join(' ')
  }, rest), children);
};
Card.Meta = function CardMeta({
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['sf-card__meta', className].filter(Boolean).join(' ')
  }, rest), children);
};
Card.Actions = function CardActions({
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['sf-card__actions', className].filter(Boolean).join(' ')
  }, rest), children);
};
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/CharacterCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CharacterCard — the canonical roster card: avatar | name+role | importance
 * badge. Built on Card; clickable by default. The avatar tone is derived from
 * the id (or name).
 */
function CharacterCard({
  id,
  name,
  role,
  importance = 'main',
  avatar,
  onClick,
  className = '',
  ...rest
}) {
  const badgeLabel = importance.charAt(0).toUpperCase() + importance.slice(1);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['sf-card', 'sf-card--clickable', 'sf-character-card', className].filter(Boolean).join(' '),
    onClick: onClick
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: avatar,
    seed: id || name,
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sf-character-card__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-card__title"
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "sf-card__meta"
  }, role || 'No role assigned')), /*#__PURE__*/React.createElement("div", {
    className: "sf-character-card__side"
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: importance
  }, badgeLabel)));
}
Object.assign(__ds_scope, { CharacterCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/CharacterCard.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Chip — a small pill for tags and selectable filters. Quiet by default;
 * selected = copper-tinted fill; add = dashed outline for "create new".
 */
function Chip({
  selected,
  add,
  className = '',
  children,
  ...rest
}) {
  const classes = ['sf-chip', selected ? 'sf-chip--selected' : '', add ? 'sf-chip--add' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: classes
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Chip.jsx", error: String((e && e.message) || e) }); }

// components/data-display/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ProgressBar — a thin copper meter. Give it value/max (or a 0–100 percent).
 * tone "dim" uses walnut for secondary metrics, "success" uses green.
 */
function ProgressBar({
  value = 0,
  max = 100,
  tone,
  size,
  className = '',
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, max ? value / max * 100 : value));
  const track = ['sf-progress', size === 'thin' ? 'sf-progress--thin' : '', size === 'thick' ? 'sf-progress--thick' : '', className].filter(Boolean).join(' ');
  const fill = ['sf-progress__fill', tone ? `sf-progress__fill--${tone}` : ''].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: track,
    role: "progressbar",
    "aria-valuenow": Math.round(pct),
    "aria-valuemin": 0,
    "aria-valuemax": 100
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: fill,
    style: {
      width: pct + '%'
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatCard — a single overview metric: tiny uppercase label, big Lora value,
 * optional sub-line. Used in the project overview and story-health screens.
 */
function StatCard({
  label,
  value,
  sub,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['sf-stat', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__value"
  }, value), sub != null ? /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__sub"
  }, sub) : null);
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
/**
 * EmptyState — the centred editorial block shown when a collection is empty:
 * Lora title, walnut explanatory text, optional action. Dashed parchment frame.
 */
function EmptyState({
  title,
  children,
  action,
  fullRow,
  className = ''
}) {
  const classes = ['sf-empty', fullRow ? 'sf-empty--full-row' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: classes
  }, title ? /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__title"
  }, title) : null, children != null ? /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__text"
  }, children) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, action) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/**
 * Modal — a centred dialog over a blurred paper-dark scrim. Lora title, walnut
 * body (preserves \n), right-aligned action row. Pass `open` to toggle; clicking
 * the backdrop or pressing Escape calls onClose.
 */
function Modal({
  open = true,
  title,
  children,
  actions,
  onClose,
  className = ''
}) {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "sf-modal-overlay",
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: ['sf-modal', className].filter(Boolean).join(' '),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === 'string' ? title : undefined
  }, title ? /*#__PURE__*/React.createElement("div", {
    className: "sf-modal__title"
  }, title) : null, children != null ? /*#__PURE__*/React.createElement("div", {
    className: "sf-modal__body"
  }, children) : null, actions ? /*#__PURE__*/React.createElement("div", {
    className: "sf-modal__actions"
  }, actions) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Spinner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Spinner — a copper-topped ring that rotates. Use inside Loading (centred in a
 * panel) or inline. Diameter via `size`.
 */
function Spinner({
  size = 24,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['sf-spinner', className].filter(Boolean).join(' '),
    style: {
      width: size,
      height: size
    },
    role: "status",
    "aria-label": "Loading"
  }, rest));
}

/** Loading — a Spinner centred in a generous block (panel-loading state). */
function Loading({
  size = 24,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sf-loading', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement(Spinner, {
    size: size
  }));
}
Object.assign(__ds_scope, { Spinner, Loading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICON = {
  success: '✓',
  error: '!',
  warn: '!',
  info: 'i'
};

/**
 * Toast — a transient confirmation that slides up bottom-right. The left icon
 * disc and border tint by tone. Render inside a `.sf-toasts` container (fixed,
 * column-reverse) to stack multiple.
 */
function Toast({
  tone = 'success',
  icon,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['sf-toast', `sf-toast--${tone}`, className].filter(Boolean).join(' '),
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "sf-toast__icon",
    "aria-hidden": "true"
  }, icon || ICON[tone] || ''), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the StoryForge action button. Primary is a solid copper fill;
 * secondary/ghost are quiet on parchment; danger is a red outline that fills on
 * hover. All share the 8px radius and Geist 13px medium label.
 */
function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = ['sf-btn', `sf-btn--${variant}`, size === 'sm' ? 'sf-btn--sm' : '', size === 'xs' ? 'sf-btn--xs' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: classes,
    disabled: disabled
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    className: "sf-btn__icon",
    "aria-hidden": "true",
    dangerouslySetInnerHTML: {
      __html: icon
    }
  }) : null, children != null ? /*#__PURE__*/React.createElement("span", null, children) : null, iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "sf-btn__icon",
    "aria-hidden": "true",
    dangerouslySetInnerHTML: {
      __html: iconRight
    }
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — a square, chromeless button carrying a single line icon. Muted
 * walnut by default, copper on hover. Used in toolbars and breadcrumb actions.
 */
function IconButton({
  icon,
  label,
  pressed,
  size = 30,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: ['sf-icon-btn', className].filter(Boolean).join(' '),
    "aria-label": label,
    title: label,
    "aria-pressed": pressed === undefined ? undefined : !!pressed,
    style: {
      width: size,
      height: size
    },
    dangerouslySetInnerHTML: typeof icon === 'string' ? {
      __html: icon
    } : undefined
  }, rest), typeof icon === 'string' ? undefined : icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — a single-line text field on parchment with a copper focus ring.
 * Pair with Label (uppercase walnut). Use size="sm" for dense rows.
 */
function Input({
  size,
  invalid,
  className = '',
  ...rest
}) {
  const classes = ['sf-input', size === 'sm' ? 'sf-input--sm' : '', invalid ? 'sf-input--invalid' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("input", _extends({
    className: classes,
    "aria-invalid": invalid || undefined
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Select — a native dropdown styled to match Input (parchment field, copper
 * focus). Pass options as {value,label} objects or render <option> children.
 */
function Select({
  options,
  value,
  invalid,
  size,
  className = '',
  children,
  ...rest
}) {
  const classes = ['sf-input', size === 'sm' ? 'sf-input--sm' : '', invalid ? 'sf-input--invalid' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("select", _extends({
    className: classes,
    value: value,
    "aria-invalid": invalid || undefined
  }, rest), Array.isArray(options) ? options.map(o => /*#__PURE__*/React.createElement("option", {
    key: String(o.value),
    value: o.value
  }, o.label)) : children);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TagChips.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TagChips — a chip-bar that reads as a single form control: each tag is a
 * removable pill and the trailing input is for typing new tags. Uncontrolled by
 * default (manages its own list); pass value+onChange to control it.
 */
function TagChips({
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Add tag…',
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const tags = isControlled ? value : internal;
  const [draft, setDraft] = React.useState('');
  const commit = next => {
    isControlled ? onChange && onChange(next) : setInternal(next);
  };
  const addTag = raw => {
    const t = raw.trim().replace(/,$/, '');
    if (!t || tags.includes(t)) {
      setDraft('');
      return;
    }
    commit([...tags, t]);
    setDraft('');
  };
  const removeTag = t => commit(tags.filter(x => x !== t));
  const onKeyDown = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sf-tag-chips",
    onClick: e => e.currentTarget.querySelector('input')?.focus()
  }, rest), tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    className: "sf-chip sf-chip--selected",
    onClick: e => {
      e.stopPropagation();
      removeTag(t);
    }
  }, t, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      marginLeft: 6,
      opacity: 0.6
    }
  }, "\xD7"))), /*#__PURE__*/React.createElement("input", {
    className: "sf-tag-chips__input",
    value: draft,
    placeholder: tags.length ? '' : placeholder,
    onChange: e => setDraft(e.target.value),
    onKeyDown: onKeyDown,
    onBlur: () => addTag(draft)
  }));
}
Object.assign(__ds_scope, { TagChips });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TagChips.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Textarea — multi-line field for narrative prose. Vertical-resize only, 1.55
 * line-height, copper focus ring. size="md" lowers the min-height for shorter
 * fields.
 */
function Textarea({
  size,
  invalid,
  className = '',
  rows = 4,
  ...rest
}) {
  const classes = ['sf-textarea', size === 'md' ? 'sf-textarea--md' : '', invalid ? 'sf-input--invalid' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("textarea", _extends({
    className: classes,
    rows: rows,
    "aria-invalid": invalid || undefined
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/forms/Toggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Toggle — an accessible on/off switch. The real checkbox is visually hidden
 * (label-wraps-input); the copper track + thumb are pure CSS. Optional trailing
 * label text.
 */
function Toggle({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ['sf-toggle', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    className: "sf-toggle__input",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "sf-toggle__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-toggle__thumb"
  })), label ? /*#__PURE__*/React.createElement("span", {
    className: "sf-toggle__label"
  }, label) : null);
}
Object.assign(__ds_scope, { Toggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Toggle.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
/**
 * Breadcrumb — the editorial trail in the top bar. Each item is a clickable
 * crumb except the last, which renders as a copper-tinted Lora pill (current).
 */
function Breadcrumb({
  items = [],
  separator = '/',
  className = ''
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: ['sf-breadcrumb__path', className].filter(Boolean).join(' '),
    "aria-label": "Breadcrumb"
  }, items.map((item, i) => {
    const isLast = i === items.length - 1;
    const label = typeof item === 'string' ? item : item.label;
    const onClick = typeof item === 'string' ? undefined : item.onClick;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'sf-breadcrumb__item' + (isLast ? ' sf-breadcrumb__item--current' : ''),
      "aria-current": isLast ? 'page' : undefined,
      onClick: isLast ? undefined : onClick
    }, label), isLast ? null : /*#__PURE__*/React.createElement("span", {
      className: "sf-breadcrumb__sep",
      "aria-hidden": "true"
    }, separator));
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * NavItem — a sidebar navigation row: line icon + label, with an active state
 * that fills soft-copper and grows the 3px copper ribbon on the left edge.
 */
function NavItem({
  icon,
  label,
  active = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: ['sf-nav__item', className].filter(Boolean).join(' '),
    "aria-selected": active
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "sf-nav__icon",
    "aria-hidden": "true",
    dangerouslySetInnerHTML: typeof icon === 'string' ? {
      __html: icon
    } : undefined
  }, typeof icon === 'string' ? undefined : icon), /*#__PURE__*/React.createElement("span", {
    className: "sf-nav__label"
  }, label));
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * Tabs — editorial underline tabs. Controlled (pass `active` + `onChange`) or
 * uncontrolled (pass `defaultActive`). Items carry an id, a label, and an
 * optional count.
 */
function Tabs({
  items = [],
  active,
  defaultActive,
  onChange,
  className = ''
}) {
  const isControlled = active !== undefined;
  const [internal, setInternal] = React.useState(defaultActive ?? (items[0] && items[0].id));
  const current = isControlled ? active : internal;
  const select = id => {
    isControlled ? onChange && onChange(id) : setInternal(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: ['sf-tabs', className].filter(Boolean).join(' '),
    role: "tablist"
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    role: "tab",
    "aria-selected": it.id === current,
    className: 'sf-tab' + (it.id === current ? ' sf-tab--active' : ''),
    onClick: () => select(it.id)
  }, it.label, it.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "sf-tab__count"
  }, it.count) : null)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storyforge/AppShell.jsx
try { (() => {
/* AppShell — sidebar + breadcrumb top bar + status bar. Wraps the active panel.
 * Exposed as window.AppShell. */

const NAV = [{
  section: 'World'
}, {
  id: 'overview',
  icon: 'home',
  label: 'Project & World'
}, {
  id: 'characters',
  icon: 'users',
  label: 'Characters'
}, {
  id: 'relationships',
  icon: 'link',
  label: 'Relationships'
}, {
  id: 'locations',
  icon: 'location',
  label: 'Locations'
}, {
  id: 'groups',
  icon: 'shield',
  label: 'Groups'
}, {
  id: 'lorebook',
  icon: 'loreScroll',
  label: 'Lorebook'
}, {
  id: 'notes',
  icon: 'note',
  label: 'Notes'
}, {
  section: 'Manuscript'
}, {
  id: 'manuscript',
  icon: 'book',
  label: 'Manuscript'
}, {
  id: 'plot',
  icon: 'plot',
  label: 'Plot'
}, {
  id: 'corkboard',
  icon: 'scenes',
  label: 'Corkboard'
}, {
  section: 'Analysis'
}, {
  id: 'timeline',
  icon: 'clock',
  label: 'Timeline'
}, {
  id: 'health',
  icon: 'heartPulse',
  label: 'Story Health'
}];
function AppShell({
  project,
  active,
  onNav,
  onHome,
  theme,
  onToggleTheme,
  crumbs,
  status,
  words,
  health,
  drawerOpen,
  onToggleDrawer,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'kit-app' + (drawerOpen ? ' kit-app--drawer' : '')
  }, /*#__PURE__*/React.createElement("aside", {
    className: "kit-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-sidebar__header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "kit-logo",
    onClick: onHome,
    title: "Back to library"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-logo__ingot"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "kit-logo__word"
  }, "StoryForge"))), /*#__PURE__*/React.createElement("nav", {
    className: "kit-sidebar__nav"
  }, NAV.map((item, i) => item.section ? /*#__PURE__*/React.createElement("div", {
    className: "sf-nav__section",
    key: 's' + i
  }, item.section) : /*#__PURE__*/React.createElement("button", {
    key: item.id,
    className: "sf-nav__item",
    "aria-selected": active === item.id,
    onClick: () => onNav(item.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-nav__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    className: "sf-nav__label"
  }, item.label)))), /*#__PURE__*/React.createElement("div", {
    className: "kit-sidebar__footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sf-nav__item",
    "aria-selected": active === 'settings',
    onClick: () => onNav('settings')
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-nav__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "gear",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    className: "sf-nav__label"
  }, "Settings")))), /*#__PURE__*/React.createElement("main", {
    className: "kit-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-breadcrumb"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "sf-breadcrumb__path"
  }, crumbs.map((c, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("button", {
    className: 'sf-breadcrumb__item' + (i === crumbs.length - 1 ? ' sf-breadcrumb__item--current' : ''),
    onClick: c.onClick
  }, c.label), i < crumbs.length - 1 ? /*#__PURE__*/React.createElement("span", {
    className: "sf-breadcrumb__sep"
  }, "/") : null))), /*#__PURE__*/React.createElement("div", {
    className: "kit-breadcrumb__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sf-icon-btn",
    title: "Switch language",
    style: {
      width: 'auto',
      padding: '0 8px',
      fontWeight: 600,
      fontSize: 13
    }
  }, "EN"), /*#__PURE__*/React.createElement("button", {
    className: "sf-icon-btn",
    onClick: onToggleTheme,
    title: "Toggle theme"
  }, theme === 'light' ? '☾' : '☀'), /*#__PURE__*/React.createElement("button", {
    className: 'sf-btn sf-btn--sm ' + (drawerOpen ? 'sf-btn--solid' : 'sf-btn--ghost'),
    onClick: onToggleDrawer,
    title: "Atelier AI"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 15
  }), " Atelier"))), /*#__PURE__*/React.createElement("div", {
    className: "kit-content"
  }, children)), /*#__PURE__*/React.createElement("aside", {
    className: "kit-drawer",
    "aria-hidden": !drawerOpen
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-drawer__hd"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-drawer__title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-spark"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 13
  })), " Atelier"), /*#__PURE__*/React.createElement("button", {
    className: "sf-icon-btn",
    onClick: onToggleDrawer,
    title: "Close",
    style: {
      width: 26,
      height: 26
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "kit-drawer__body"
  }, window.SFData.atelier.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'kit-msg kit-msg--' + m.from
  }, m.from === 'ai' ? /*#__PURE__*/React.createElement("span", {
    className: "kit-spark kit-spark--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 11
  })) : null, /*#__PURE__*/React.createElement("div", {
    className: "kit-msg__bubble"
  }, m.text)))), /*#__PURE__*/React.createElement("div", {
    className: "kit-drawer__compose"
  }, /*#__PURE__*/React.createElement("input", {
    className: "sf-input sf-input--sm",
    placeholder: "Ask Atelier about this scene\u2026"
  }), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--primary sf-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 14
  })))), /*#__PURE__*/React.createElement("footer", {
    className: "kit-statusbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-statusbar__project"
  }, project.title), /*#__PURE__*/React.createElement("span", {
    className: "kit-statusbar__counts"
  }, status), /*#__PURE__*/React.createElement("span", {
    className: "kit-statusbar__right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-status-words"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "book",
    size: 12
  }), " ", (words != null ? words : project.words).toLocaleString(), " words"), /*#__PURE__*/React.createElement("span", {
    className: 'sf-status-health sf-status-health--' + (health >= 75 ? 'good' : health >= 45 ? 'fair' : 'poor')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heartPulse",
    size: 12
  }), " ", health != null ? health : 78, "%"), /*#__PURE__*/React.createElement("span", {
    className: "sf-status-ai sf-status-ai--online"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-status-ai__dot"
  }), " Atelier AI"))));
}
window.AppShell = AppShell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storyforge/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storyforge/app.jsx
try { (() => {
/* Root — routes between the library and the app shell. Exposed render at end. */
const {
  useState: useState_,
  useEffect: useEffect_
} = React;
const PREFS_KEY = 'sf-kit-prefs-v1';
const STORE_KEY = 'sf-kit-store-v2';
const TYPES = ['characters', 'relationships', 'locations', 'groups', 'lorebook', 'notes', 'scenes'];
function loadJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}
function seedStore() {
  const s = {};
  TYPES.forEach(t => {
    s[t] = (window.SFData[t] || []).slice();
  });
  return s;
}
function App() {
  const [project, setProject] = useState_(null);
  const [active, setActive] = useState_('overview');
  const [theme, setTheme] = useState_('dark');
  const [drawer, setDrawer] = useState_(false);
  const savedPrefs = loadJSON(PREFS_KEY) || {};
  const [viewModes, setViewModes] = useState_(savedPrefs.viewModes || {
    characters: 'cards',
    relationships: 'cards',
    locations: 'split',
    groups: 'cards',
    lorebook: 'split',
    notes: 'cards',
    scenes: 'cards'
  });
  const [pageSize, setPageSize] = useState_(savedPrefs.pageSize || 6);

  // Mutable element store — reorder / delete / add persist across reloads.
  const [store, setStore] = useState_(() => loadJSON(STORE_KEY) || seedStore());
  useEffect_(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        viewModes,
        pageSize
      }));
    } catch (e) {}
  }, [viewModes, pageSize]);
  useEffect_(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (e) {}
  }, [store]);
  const setView = (type, mode) => setViewModes(v => ({
    ...v,
    [type]: mode
  }));
  const reorder = type => next => setStore(s => ({
    ...s,
    [type]: next
  }));
  const remove = type => ids => setStore(s => ({
    ...s,
    [type]: s[type].filter(it => !ids.includes(it.id))
  }));
  const add = type => item => setStore(s => ({
    ...s,
    [type]: [item, ...s[type]]
  }));
  const update = type => item => setStore(s => ({
    ...s,
    [type]: s[type].map(it => it.id === item.id ? item : it)
  }));
  const resetDemo = () => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch (e) {}
    setStore(seedStore());
  };
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next === 'light' ? 'light' : 'dark');
  };
  if (!project) {
    return /*#__PURE__*/React.createElement(ProjectLibrary, {
      onOpen: p => {
        setProject(p);
        setActive('overview');
      }
    });
  }
  const titles = {
    overview: 'Project & World',
    characters: 'Characters',
    corkboard: 'Corkboard',
    health: 'Story Health',
    relationships: 'Relationships',
    locations: 'Locations',
    groups: 'Groups',
    lorebook: 'Lorebook',
    notes: 'Notes',
    manuscript: 'Manuscript',
    plot: 'Plot',
    timeline: 'Timeline',
    settings: 'Settings'
  };

  // Common props for an index-backed screen.
  const idx = type => ({
    items: store[type],
    onReorder: reorder(type),
    onDelete: remove(type),
    onAdd: add(type),
    onUpdate: update(type),
    viewMode: viewModes[type],
    pageSize,
    lookups: {
      characters: store.characters.map(c => c.name)
    }
  });
  let screen;
  if (active === 'overview') screen = /*#__PURE__*/React.createElement(ProjectOverview, null);else if (active === 'characters') screen = /*#__PURE__*/React.createElement(CharactersScreen, idx('characters'));else if (active === 'relationships') screen = /*#__PURE__*/React.createElement(RelationshipsScreen, idx('relationships'));else if (active === 'locations') screen = /*#__PURE__*/React.createElement(LocationsScreen, idx('locations'));else if (active === 'groups') screen = /*#__PURE__*/React.createElement(GroupsScreen, idx('groups'));else if (active === 'lorebook') screen = /*#__PURE__*/React.createElement(LorebookScreen, idx('lorebook'));else if (active === 'notes') screen = /*#__PURE__*/React.createElement(NotesScreen, idx('notes'));else if (active === 'corkboard') screen = /*#__PURE__*/React.createElement(ScenesScreen, idx('scenes'));else if (active === 'plot') screen = /*#__PURE__*/React.createElement(PlotScreen, null);else if (active === 'manuscript') screen = /*#__PURE__*/React.createElement(ManuscriptScreen, null);else if (active === 'timeline') screen = /*#__PURE__*/React.createElement(TimelineScreen, null);else if (active === 'health') screen = /*#__PURE__*/React.createElement(HealthScreen, {
    store: store
  });else if (active === 'settings') screen = /*#__PURE__*/React.createElement(SettingsScreen, {
    viewModes: viewModes,
    onSetView: setView,
    pageSize: pageSize,
    onSetPageSize: setPageSize,
    onReset: resetDemo
  });else screen = /*#__PURE__*/React.createElement(Placeholder, {
    label: titles[active] || 'Coming soon'
  });
  const crumbs = [{
    label: project.title,
    onClick: () => setActive('overview')
  }, {
    label: titles[active] || ''
  }];
  const health = computeHealth(store);
  const status = store.characters.length + ' characters · ' + store.locations.length + ' locations · ' + store.scenes.length + ' scenes';
  return /*#__PURE__*/React.createElement(AppShell, {
    project: project,
    active: active,
    onNav: setActive,
    onHome: () => setProject(null),
    theme: theme,
    onToggleTheme: toggleTheme,
    crumbs: crumbs,
    status: status,
    words: health.words,
    health: health.setup,
    drawerOpen: drawer,
    onToggleDrawer: () => setDrawer(d => !d)
  }, screen);
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storyforge/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storyforge/data.js
try { (() => {
/* StoryForge demo data — "The Erasure Protocol" (the product's own seed data).
 * Exposed as window.SFData. */
window.SFData = {
  projects: [{
    id: 'p1',
    title: 'The Erasure Protocol',
    type: 'Novel',
    genre: ['Thriller', 'Mystery'],
    words: 24310,
    target: 80000,
    chapters: 12,
    updated: '2 hours ago'
  }, {
    id: 'p2',
    title: 'Saltmarsh',
    type: 'Novel',
    genre: ['Fantasy'],
    words: 61200,
    target: 95000,
    chapters: 21,
    updated: 'Yesterday'
  }, {
    id: 'p3',
    title: 'The Lantern Keepers',
    type: 'Short story',
    genre: ['Literary'],
    words: 7400,
    target: 9000,
    chapters: 3,
    updated: '4 days ago'
  }],
  world: {
    setting: 'A sprawling coastal city where old-world architecture hides cutting-edge secrets. The year is ambiguous — technology exists alongside forgotten rituals.',
    conflict: 'A shadowy organization is erasing people from existence — not killing them, but removing all evidence they ever lived.',
    mood: 'Ominous',
    hook: 'Elara wakes up to find that her sister, whom she spoke to yesterday, has never existed according to everyone else.',
    details: 'The city has three distinct districts: the Peaks (wealthy), the Wash (working class), and the Underneath (criminal underworld beneath the old canal system).'
  },
  characters: [{
    id: 'c1',
    name: 'Elara Voss',
    importance: 'main',
    role: 'Protagonist',
    personality: 'Determined, curious, impulsive',
    gender: 'Female',
    age: '28',
    wants: 'To uncover the truth about her past',
    needs: 'To forgive herself',
    wound: 'Survivor guilt from a childhood incident',
    appearance: 'Tall, dark curly hair, sharp green eyes',
    voice: 'Direct, slightly sarcastic',
    arcFrom: 'Survivor guilt from a childhood incident',
    arcTo: 'To forgive herself'
  }, {
    id: 'c2',
    name: 'Marcus Chen',
    importance: 'main',
    role: 'Deuteragonist',
    personality: 'Analytical, loyal, emotionally guarded',
    gender: 'Male',
    age: '34',
    wants: 'To protect those he loves',
    needs: 'To let people in',
    wound: 'Abandoned by his father',
    appearance: 'Athletic build, short black hair, warm brown eyes',
    voice: 'Measured, precise, occasional dry humor',
    arcFrom: 'Abandoned by his father',
    arcTo: 'To let people in'
  }, {
    id: 'c3',
    name: 'Iris Blackwood',
    importance: 'main',
    role: 'Antagonist',
    personality: 'Charismatic, ruthless, brilliant',
    gender: 'Female',
    age: '45',
    wants: 'Absolute control',
    needs: 'Recognition she never received',
    wound: 'Narcissistic tendencies from a neglectful upbringing',
    appearance: 'Elegant, silver-streaked auburn hair, piercing blue eyes',
    voice: 'Eloquent, commanding, cold when challenged',
    arcFrom: 'Narcissistic tendencies from a neglectful upbringing',
    arcTo: 'Recognition she never received'
  }, {
    id: 'c4',
    name: 'Dex Morales',
    importance: 'supporting',
    role: 'Comic Relief / Ally',
    personality: 'Witty, street-smart, unreliable',
    gender: 'Male',
    age: '26',
    wants: 'Easy money and good times',
    needs: 'A sense of belonging',
    wound: 'Deep insecurity masked by humor',
    appearance: 'Wiry, tattoos, perpetual smirk',
    voice: 'Quick, slang-heavy, deflects with jokes',
    arcFrom: 'Deep insecurity masked by humor',
    arcTo: 'A sense of belonging'
  }, {
    id: 'c5',
    name: 'Professor Yuki',
    importance: 'supporting',
    role: 'Mentor',
    personality: 'Patient, enigmatic, wise',
    gender: 'Non-binary',
    age: '62',
    wants: 'To pass on knowledge before time runs out',
    needs: 'Redemption for past mistakes',
    wound: 'A secret experiment that went wrong',
    appearance: 'Small frame, wire-rimmed glasses, kind smile',
    voice: 'Soft-spoken, riddled with metaphors',
    arcFrom: 'A secret experiment that went wrong',
    arcTo: 'Redemption for past mistakes'
  }, {
    id: 'c6',
    name: 'Raven Ortiz',
    importance: 'supporting',
    role: 'Wildcard',
    personality: 'Unpredictable, fiercely independent, observant',
    gender: 'Female',
    age: '31',
    wants: 'Freedom from obligation',
    needs: 'To trust again',
    wound: 'Betrayed by a former partner',
    appearance: 'Lean, shaved head, multiple piercings',
    voice: 'Blunt, poetic when drunk',
    arcFrom: 'Betrayed by a former partner',
    arcTo: 'To trust again'
  }, {
    id: 'c7',
    name: 'Thomas Hale',
    importance: 'minor',
    role: 'Authority Figure',
    personality: 'Bureaucratic, well-meaning, overwhelmed',
    gender: 'Male',
    age: '55',
    wants: 'A quiet life',
    needs: 'To take a stand',
    wound: 'Cowardice disguised as pragmatism',
    appearance: 'Portly, graying temples, rumpled suit',
    voice: 'Formal, hesitant',
    arcFrom: 'Cowardice disguised as pragmatism',
    arcTo: 'To take a stand'
  }],
  locations: [{
    id: 'l1',
    name: 'The Gilded Docks',
    type: 'City',
    desc: 'A crowded harbor district where legal trade and smuggling share the same piers.',
    atmosphere: 'Salt air, shouting dockhands, and lanterns reflected on black water.',
    significance: 'The first clues about the missing people are traded here for a price.',
    history: 'Expanded after the canal wars, now controlled by competing merchant families.',
    tags: ['trade', 'dangerous']
  }, {
    id: 'l2',
    name: 'Cinder Row',
    type: 'City',
    desc: 'A narrow neighborhood of ash-brick housing and hidden workshop basements.',
    atmosphere: 'Smoky chimneys, crowded alleys, constant metalworking noise.',
    significance: 'Key allies gather in secret in the back rooms of Cinder Row.',
    history: 'Rebuilt after a factory fire that was likely sabotage.',
    tags: ['working-class', 'secret-meetings']
  }, {
    id: 'l3',
    name: 'The Mirror Archives',
    type: 'Building',
    desc: 'A government record hall with mirrored vault doors and coded ledgers.',
    atmosphere: 'Cold marble floors, whispering clerks, and watchful silence.',
    significance: 'Critical records proving identity erasure are stored deep inside.',
    history: 'Originally a court annex, later converted into the city registry.',
    tags: ['bureaucracy', 'high-security']
  }, {
    id: 'l4',
    name: 'Stormglass Chapel',
    type: 'Landmark',
    desc: 'A chapel with stained glass that glows during lightning storms.',
    atmosphere: 'Incense, humming choirs, and sudden thunder rattling old beams.',
    significance: 'A safe meeting point where rivals call temporary truce.',
    history: 'Raised over ruins from an older faith tied to memory rituals.',
    tags: ['neutral-ground', 'ritual']
  }, {
    id: 'l5',
    name: 'Blackwater Tunnels',
    type: 'Region',
    desc: 'Flooded overflow channels beneath the canal system, mapped by criminal crews.',
    atmosphere: 'Cold knee-deep water and lantern-light crawling on the brick.',
    significance: 'Used to infiltrate the antagonist network unseen.',
    history: 'Constructed as overflow channels, later mapped by criminal crews.',
    tags: ['underground', 'infiltration']
  }],
  groups: [{
    id: 'g1',
    name: 'The Inkwell Society',
    type: 'Faction',
    desc: 'A clandestine network of information brokers, archivists, and whistleblowers preserving records of erased individuals.',
    purpose: 'Prevent total identity erasure by maintaining hidden archives.',
    values: 'Truth, memory, resistance.',
    reputation: 'A whispered hope among the erased.',
    members: 3,
    lead: 'Professor Yuki',
    tags: ['resistance', 'information']
  }, {
    id: 'g2',
    name: 'The Quiet Bureau',
    type: 'Faction',
    desc: 'The shadowy government agency responsible for identity erasures. Officially, it does not exist.',
    purpose: 'Erase threats to the established order by removing all record of their existence.',
    values: 'Order, control, secrecy.',
    reputation: 'A whispered name that makes officials go pale.',
    members: 2,
    lead: 'Iris Blackwood',
    tags: ['antagonist', 'government']
  }, {
    id: 'g3',
    name: 'The Undercurrent',
    type: 'Faction',
    desc: 'A loose alliance of smugglers, fixers, and underworld figures operating beneath the canal system.',
    purpose: 'Profit from chaos and provide services the law cannot.',
    values: 'Loyalty to the crew, pragmatism, survival.',
    reputation: 'Reliable, for a price.',
    members: 2,
    lead: 'Dex Morales',
    tags: ['criminal', 'underground']
  }],
  scenes: [{
    id: 's1',
    ref: '1.1',
    title: 'The harbour at low tide',
    desc: 'Elara receives a cryptic note at the docks leading her to question everything she knows.',
    mood: 'Ominous',
    pov: 'Elara',
    words: 1840,
    status: 'drafted'
  }, {
    id: 's2',
    ref: '1.2',
    title: "The analyst's burden",
    desc: "Marcus reviews classified anomalies that match Elara's claims.",
    mood: 'Tense',
    pov: 'Marcus',
    words: 1120,
    status: 'drafted'
  }, {
    id: 's3',
    ref: '2.1',
    title: 'A meeting in smoke',
    desc: 'Dex arranges a clandestine meeting in the back rooms of Cinder Row.',
    mood: 'Tense',
    pov: 'Dex',
    words: 0,
    status: 'outline'
  }, {
    id: 's4',
    ref: '2.2',
    title: 'Into the tunnels',
    desc: 'The team enters the Blackwater Tunnels seeking physical evidence of erased identities.',
    mood: 'Foreboding',
    pov: 'Marcus',
    words: 2230,
    status: 'drafted'
  }, {
    id: 's5',
    ref: '3.1',
    title: 'The mirror vault',
    desc: 'A break-in at the Mirror Archives goes wrong when the ledgers rewrite themselves.',
    mood: 'Frantic',
    pov: 'Elara',
    words: 0,
    status: 'outline'
  }, {
    id: 's6',
    ref: '3.2',
    title: 'Truce under stormglass',
    desc: 'Rivals call a fragile truce as the storm rattles the chapel beams.',
    mood: 'Uneasy',
    pov: 'Raven',
    words: 640,
    status: 'draft'
  }],
  health: {
    setup: 78,
    writing: 64,
    items: [{
      label: 'Characters have clear arcs',
      state: 'good',
      detail: '6 of 7 characters define a want, need, and wound.'
    }, {
      label: 'Locations are described',
      state: 'good',
      detail: 'All 5 locations carry atmosphere and significance.'
    }, {
      label: 'Scenes assigned to chapters',
      state: 'fair',
      detail: '2 scenes are still loose outlines.'
    }, {
      label: 'Timeline consistency',
      state: 'fair',
      detail: 'Two events share an ambiguous date.'
    }, {
      label: 'Pacing balance',
      state: 'poor',
      detail: 'Act 2 is thin — only 1 drafted scene so far.'
    }]
  },
  /* Manuscript tree: chapters → scene ids (referencing `scenes` above). */
  manuscript: [{
    id: 'ch1',
    num: 1,
    title: 'The vanishing',
    sceneIds: ['s1', 's2']
  }, {
    id: 'ch2',
    num: 2,
    title: 'Below the canals',
    sceneIds: ['s3', 's4']
  }, {
    id: 'ch3',
    num: 3,
    title: 'The mirror vault',
    sceneIds: ['s5', 's6']
  }],
  /* Prose for drafted scenes, keyed by scene id. */
  prose: {
    s1: ['The tide had pulled back to expose the harbour’s black bones — rotting pylons, a drowned bicycle, the green glint of bottles half-buried in silt. Elara waited where the note had told her to, collar up against a wind that smelled of tar and old fish.', 'She read the line again, though she had it by heart now. *Your sister is not the first. Come alone, or don’t come at all.* The handwriting was nothing she recognised, and yet her hand had known, somehow, to keep it hidden from Marcus.', 'A gull screamed once and went quiet. Somewhere past the breakwater a bell buoy tolled, patient as a clock. Elara folded the note into her pocket and stepped down onto the exposed flats, the mud closing cold around her boots.'],
    s2: ['Marcus spread the files across the table the way a surgeon lays out instruments — squared, deliberate, nothing wasted. Seven names. Seven people who, according to every record the Bureau kept, had never drawn breath.', 'And yet here were their fingerprints, lifted from objects nobody could explain owning. A wedding ring engraved to a marriage that did not exist. A library card for a borrower with no birth certificate. He pressed two fingers to the bridge of his nose and made himself look again.'],
    s4: ['The water in the Blackwater Tunnels came up to their knees, cold enough to ache. Marcus went first, his lantern throwing long shapes that crawled along the brick. Smugglers’ marks scarred every junction — chalk arrows, initials, a crude eye that meant *turn back*.', 'Behind him Elara counted doorways under her breath. Dex had sworn the ledger room was the ninth on the left, but Dex swore a great many things. The tunnel exhaled a draught that guttered the flame, and for a moment the dark pressed in complete.']
  },
  atelier: [{
    from: 'ai',
    text: 'I’ve read the harbour scene. The imagery is strong — “the harbour’s black bones” lands well. Want me to tighten the middle paragraph?'
  }, {
    from: 'user',
    text: 'What’s Elara’s motivation here, in one line?'
  }, {
    from: 'ai',
    text: 'To find proof her sister was real — and to keep that hope hidden from Marcus, because naming it aloud might make it false.'
  }],
  /* Timeline: a shared day-axis with chapter bands + scene/location/relationship points. */
  timeline: {
    maxDay: 24,
    chapters: [{
      num: 1,
      title: 'The vanishing',
      min: 1,
      max: 4
    }, {
      num: 2,
      title: 'Below the canals',
      min: 4,
      max: 14
    }, {
      num: 3,
      title: 'The mirror vault',
      min: 14,
      max: 22
    }],
    scenes: [{
      label: 'The harbour at low tide',
      day: 1
    }, {
      label: 'The analyst’s burden',
      day: 3
    }, {
      label: 'A meeting in smoke',
      day: 5
    }, {
      label: 'Into the tunnels',
      day: 12
    }, {
      label: 'The mirror vault',
      day: 16
    }, {
      label: 'Truce under stormglass',
      day: 21
    }],
    locations: [{
      label: 'The Gilded Docks',
      day: 1
    }, {
      label: 'Cinder Row',
      day: 4
    }, {
      label: 'The Mirror Archives',
      day: 14
    }, {
      label: 'Stormglass Chapel',
      day: 21
    }],
    relationships: [{
      label: 'Elara & Marcus',
      min: 2,
      max: 16,
      points: [2, 16]
    }, {
      label: 'Elara & Iris',
      min: 14,
      max: 14,
      points: [14]
    }]
  },
  /* Relationships: bonds between characters. */
  relationships: [{
    id: 'r1',
    a: 'Elara Voss',
    b: 'Marcus Chen',
    type: 'Allies',
    dynamic: 'Wary partners who become each other’s anchor. Marcus believes the evidence; Elara believes her gut. Together they cover both.',
    strength: 'Strong'
  }, {
    id: 'r2',
    a: 'Elara Voss',
    b: 'Iris Blackwood',
    type: 'Adversaries',
    dynamic: 'The hunter and the architect of the erasures. Iris sees Elara as a loose thread; Elara sees Iris as the proof her sister was taken.',
    strength: 'Defining'
  }, {
    id: 'r3',
    a: 'Dex Morales',
    b: 'Raven Ortiz',
    type: 'Uneasy crew',
    dynamic: 'Old partners in the Undercurrent who fell out over a job. They still work together, but neither turns their back on the other.',
    strength: 'Tense'
  }, {
    id: 'r4',
    a: 'Professor Yuki',
    b: 'Elara Voss',
    type: 'Mentor & student',
    dynamic: 'Yuki knows more about the erasures than they admit — guilt and care braided into every lesson they give Elara.',
    strength: 'Warm'
  }, {
    id: 'r5',
    a: 'Iris Blackwood',
    b: 'Thomas Hale',
    type: 'Leverage',
    dynamic: 'Iris keeps Hale compliant with a secret from his past. He resents it; he obeys it.',
    strength: 'Coercive'
  }],
  /* Plot: a three-act beat sheet. */
  plot: [{
    id: 'a1',
    act: 'Act I',
    name: 'Setup',
    beats: [{
      id: 'b1',
      beat: 'Hook',
      scene: 'The harbour at low tide',
      note: 'Elara gets the note; the world quietly tilts.',
      done: true
    }, {
      id: 'b2',
      beat: 'Inciting incident',
      scene: 'The vanishing',
      note: 'Her sister has never existed — to anyone but her.',
      done: true
    }, {
      id: 'b3',
      beat: 'First threshold',
      scene: 'A meeting in smoke',
      note: 'She accepts the Undercurrent’s help and crosses into the Underneath.',
      done: false
    }]
  }, {
    id: 'a2',
    act: 'Act II',
    name: 'Confrontation',
    beats: [{
      id: 'b4',
      beat: 'Rising action',
      scene: 'Into the tunnels',
      note: 'Hard proof exists in the Blackwater — and it can be destroyed.',
      done: true
    }, {
      id: 'b5',
      beat: 'Midpoint',
      scene: 'The mirror vault',
      note: 'The ledgers rewrite themselves as they’re read. The truth is alive.',
      done: false
    }, {
      id: 'b6',
      beat: 'All is lost',
      scene: '—',
      note: 'Marcus is compromised; Elara is alone with a memory no one shares.',
      done: false
    }]
  }, {
    id: 'a3',
    act: 'Act III',
    name: 'Resolution',
    beats: [{
      id: 'b7',
      beat: 'Climax',
      scene: '—',
      note: 'Elara forces the Bureau to choose: erase her too, or be seen.',
      done: false
    }, {
      id: 'b8',
      beat: 'Truce',
      scene: 'Truce under stormglass',
      note: 'Rivals hold a fragile line under the storm.',
      done: false
    }, {
      id: 'b9',
      beat: 'Resolution',
      scene: '—',
      note: 'What does Elara keep — her sister, or her own forgetting?',
      done: false
    }]
  }],
  /* Notes: the writer’s loose ideas, research and reminders. */
  notes: [{
    id: 'n1',
    title: 'Ending options',
    kind: 'Idea',
    updated: '2 hours ago',
    body: 'Three ways the erasure reveal could land: (1) Elara restores her sister but forgets her own past; (2) the Archives burn and memory becomes oral again; (3) Iris wins, and the last chapter is narrated by someone the reader has never met.'
  }, {
    id: 'n2',
    title: 'Canal geography',
    kind: 'Research',
    updated: 'Yesterday',
    body: 'Map the Underneath: which tunnels flood at high tide, where the Undercurrent stores contraband, and how Cinder Row’s basements connect to the old overflow channels.'
  }, {
    id: 'n3',
    title: 'Name consistency: Voss',
    kind: 'Todo',
    updated: '3 days ago',
    body: 'Confirm the sister’s surname is spelled the same everywhere. Decide whether she is older or younger than Elara — it changes the survivor-guilt weight.'
  }, {
    id: 'n4',
    title: 'Act 2 pacing',
    kind: 'Reminder',
    updated: '4 days ago',
    body: 'Act 2 is thin — only one drafted scene. Add a setback at the Mirror Archives before the tunnels, or the midpoint lands flat.'
  }, {
    id: 'n5',
    title: 'Epigraph candidates',
    kind: 'Idea',
    updated: 'Last week',
    body: 'Looking for a short quote about memory and erasure for the title page. Something cold and clerical, to contrast the warmth of the prose.'
  }],
  /* Lorebook: worldbuilding entries with trigger keywords + activation status. */
  lorebook: [{
    id: 'lb1',
    title: 'Identity Erasure',
    constant: true,
    enabled: true,
    order: 10,
    keywords: ['erasure', 'erased', 'vanish', 'Quiet Bureau'],
    tags: ['core', 'mechanic'],
    content: 'The Bureau does not kill. It **un-writes** — pulling every thread a person ever left in the world until the cloth forgets the pattern. Birth records, photographs, debts, the memory of a face: all of it loosened, one strand at a time, until even those who loved them cannot say why the name aches.',
    notes: 'Erasure is gradual, not instant — there is a window where fragments survive (a ring, a fingerprint) and where one person’s stubborn memory can anchor the truth.'
  }, {
    id: 'lb2',
    title: 'The Mirror Archives',
    constant: false,
    enabled: true,
    order: 20,
    keywords: ['archives', 'ledgers', 'records', 'registry'],
    tags: ['location', 'high-security'],
    content: 'A government record hall with mirrored vault doors and coded ledgers. The deepest vaults hold the proof of who has been erased — written in an ink that rewrites itself when read by the wrong eyes.',
    notes: ''
  }, {
    id: 'lb3',
    title: 'Memory Rituals',
    constant: false,
    enabled: true,
    order: 30,
    keywords: ['ritual', 'stormglass', 'remembrance', 'chapel'],
    tags: ['lore', 'faith'],
    content: 'Before the Bureau, an older faith kept memory as a sacrament. Its rites survive only at Stormglass Chapel, where the congregation speaks the names of the lost during lightning so the thunder cannot drown them out.',
    notes: ''
  }, {
    id: 'lb4',
    title: 'The Three Districts',
    constant: true,
    enabled: true,
    order: 40,
    keywords: ['Peaks', 'Wash', 'Underneath', 'districts', 'city'],
    tags: ['setting'],
    content: 'The city wears its hierarchy as geography: **the Peaks** (old money, old families), **the Wash** (the working tide that keeps it running), and **the Underneath** — the criminal world threaded through the drowned canal system below.',
    notes: ''
  }, {
    id: 'lb5',
    title: 'The Forgotten',
    constant: false,
    enabled: false,
    order: 50,
    keywords: ['forgotten', 'ghosts', 'half-erased'],
    tags: ['faction', 'mystery'],
    content: 'People caught mid-erasure: they still breathe, but hold no record, no identity — living ghosts most citizens cannot quite remember meeting. They gather where the city does not look.',
    notes: 'Draft entry — disabled until Act 3 reveals them.'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storyforge/data.js", error: String((e && e.message) || e) }); }

// ui_kits/storyforge/helpers.jsx
try { (() => {
/* Shared UI-kit helpers: Icon, Avatar, initials/tone. Exposed on window. */
const {
  useState
} = React;
function Icon({
  name,
  size = 18,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: window.SFIcons.svg(name, size)
    }
  });
}
function initials(name) {
  const t = String(name || '').trim();
  if (!t) return '?';
  const p = t.split(/\s+/);
  return (p.length === 1 ? p[0][0] : p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function tone(seed) {
  const s = String(seed || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return Math.abs(h) % 8;
}
function uid() {
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function Avatar({
  name,
  seed,
  size = 38
}) {
  const fs = size <= 30 ? 12 : size <= 40 ? 14 : size <= 48 ? 16 : 22;
  return /*#__PURE__*/React.createElement("span", {
    className: 'sf-avatar sf-avatar-tone-' + tone(seed || name),
    style: {
      width: size,
      height: size,
      fontSize: fs
    },
    title: name
  }, initials(name));
}
Object.assign(window, {
  Icon,
  Avatar,
  initials,
  tone,
  uid
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storyforge/helpers.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storyforge/index-view.jsx
try { (() => {
/* ElementIndex — the reusable index surface for any element type.
 *
 * Layouts (per type in Settings, flippable on the spot):
 *   • cards — paginated grid; first two tiles are New / Import action cards.
 *             Multi-select + delete, drag-and-drop reorder, ↑/↓ arrows, page size.
 *   • split — list-beside-detail, with a switch back to cards.
 *
 * New / Edit / Import open an INLINE EDITOR PANE (never a modal) with a pinned
 * Cancel / Save bar — the detail pane's Edit button calls ctx.onEdit().
 *
 * Props: type, title, items, getId, getName, viewMode, pageSize,
 *   onReorder(items), onDelete(ids), onAdd(item), onUpdate(item),
 *   renderCardBody(item), renderRow(item, active), renderDetail(item, ctx),
 *   addLabel, importLabel, newForm {title, icon, fields, build(values, orig)},
 *   importForm {title, hint, placeholder, build(text)}.
 *
 * Exposed as window.ElementIndex.
 */
const {
  useState: useIdxState,
  useEffect: useIdxEffect,
  useRef: useIdxRef
} = React;
function ElementIndex(props) {
  const {
    type,
    title,
    items,
    getId,
    getName,
    viewMode = 'cards',
    pageSize: defaultPageSize = 6,
    onReorder,
    onDelete,
    onAdd,
    onUpdate,
    renderCardBody,
    renderRow,
    renderDetail,
    addLabel = 'New',
    importLabel = 'Import',
    newForm,
    importForm,
    lookups = {},
    searchText
  } = props;
  const [mode, setMode] = useIdxState(viewMode);
  const [query, setQuery] = useIdxState('');
  const [page, setPage] = useIdxState(0);
  const [pageSize, setPageSize] = useIdxState(defaultPageSize);
  const [selectMode, setSelectMode] = useIdxState(false);
  const [selected, setSelected] = useIdxState(() => new Set());
  const [activeId, setActiveId] = useIdxState(items[0] ? getId(items[0]) : null);
  const dragId = useIdxRef(null);
  const [overId, setOverId] = useIdxState(null);
  const [editor, setEditor] = useIdxState(null); // null | 'new' | 'edit' | 'import'
  const [form, setForm] = useIdxState({});
  const [editing, setEditing] = useIdxState(null);
  const [importText, setImportText] = useIdxState('');
  const [editorTab, setEditorTab] = useIdxState(0);
  const [confirmCancel, setConfirmCancel] = useIdxState(false);
  const [toast, setToast] = useIdxState(null);
  useIdxEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);
  const toastEl = toast ? /*#__PURE__*/React.createElement("div", {
    className: "sf-toasts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-toast sf-toast--success"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-toast__icon"
  }, "\u2713"), /*#__PURE__*/React.createElement("span", null, toast))) : null;

  // Keyboard: Esc cancels the editor (with discard guard), Cmd/Ctrl+S saves.
  const kbd = useIdxRef({});
  useIdxEffect(() => {
    const onKey = e => {
      if (!kbd.current.editor) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        kbd.current.cancel();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        kbd.current.save();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  useIdxEffect(() => {
    setMode(viewMode);
  }, [viewMode]);
  useIdxEffect(() => {
    setPageSize(defaultPageSize);
  }, [defaultPageSize]);

  // Filter by the search query (searchText(item) supplies the haystack).
  const q = query.trim().toLowerCase();
  const filtered = q ? items.filter(it => (searchText ? searchText(it) : getName(it) || '').toLowerCase().includes(q)) : items;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  if (safePage !== page) setPage(safePage);
  const start = safePage * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const toggleSel = id => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const clearSel = () => {
    setSelected(new Set());
    setSelectMode(false);
  };
  const deleteSel = () => {
    const n = selected.size;
    onDelete(Array.from(selected));
    clearSel();
    setToast(n + (n === 1 ? ' item' : ' items') + ' deleted');
  };
  const move = (id, dir) => {
    const idx = items.findIndex(it => getId(it) === id);
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(idx, 1);
    next.splice(to, 0, it);
    onReorder(next);
  };
  const onDrop = targetId => {
    const from = items.findIndex(it => getId(it) === dragId.current);
    const to = items.findIndex(it => getId(it) === targetId);
    if (from < 0 || to < 0 || from === to) {
      dragId.current = null;
      setOverId(null);
      return;
    }
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onReorder(next);
    dragId.current = null;
    setOverId(null);
  };

  // ── Inline editor (New / Edit / Import) ──
  const groups = newForm && newForm.tabs ? newForm.tabs : [{
    id: 'main',
    label: '',
    fields: newForm && newForm.fields || [{
      key: 'name',
      label: 'Name',
      required: true
    }]
  }];
  const fields = groups.reduce((a, g) => a.concat(g.fields), []);
  const buildItem = newForm && newForm.build || ((v, orig) => ({
    ...(orig || {}),
    id: orig ? orig.id : uid(),
    name: v.name
  }));
  const editorIcon = newForm && newForm.icon || 'note';
  const openNew = () => {
    setForm({});
    setEditing(null);
    setEditorTab(0);
    setEditor('new');
  };
  const openImport = () => {
    setImportText('');
    setEditor('import');
  };
  const openEdit = item => {
    const f = {};
    fields.forEach(fl => {
      f[fl.key] = fl.get ? fl.get(item) : item[fl.key] != null ? String(item[fl.key]) : '';
    });
    setForm(f);
    setEditing(item);
    setEditorTab(0);
    setEditor('edit');
  };
  const closeEditor = () => {
    setEditor(null);
    setEditing(null);
  };
  const formValid = fields.every(f => !f.required || (form[f.key] || '').trim());
  const saveForm = () => {
    if (!formValid) return;
    const item = buildItem(form, editing);
    if (editing) {
      onUpdate(item);
      setActiveId(getId(item));
      setToast('Saved changes');
    } else {
      onAdd(item);
      setPage(0);
      setActiveId(getId(item));
      setToast(getName(item) + ' created');
    }
    closeEditor();
  };
  const saveImport = () => {
    const build = importForm && importForm.build || (t => ({
      id: uid(),
      name: (t.split('\n')[0] || 'Imported').trim()
    }));
    const item = build(importText);
    onAdd(item);
    setPage(0);
    setActiveId(getId(item));
    setToast('Imported');
    closeEditor();
  };
  const deleteEditing = () => {
    if (editing) {
      onDelete([getId(editing)]);
      closeEditor();
      setToast('Deleted');
    }
  };

  // Renders one field control (label + input/textarea/select).
  const renderField = f => /*#__PURE__*/React.createElement("div", {
    className: "sf-form-group",
    key: f.key
  }, /*#__PURE__*/React.createElement("label", {
    className: 'sf-label' + (f.required ? ' sf-label--required' : '')
  }, f.label), f.type === 'textarea' ? /*#__PURE__*/React.createElement("textarea", {
    className: "sf-textarea sf-textarea--md",
    rows: f.rows || 3,
    placeholder: f.placeholder || '',
    value: form[f.key] || '',
    onChange: e => setForm(s => ({
      ...s,
      [f.key]: e.target.value
    }))
  }) : f.type === 'select' ? /*#__PURE__*/React.createElement("select", {
    className: "sf-input",
    value: form[f.key] || '',
    onChange: e => setForm(s => ({
      ...s,
      [f.key]: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Choose\u2026"), (f.optionsFrom ? lookups[f.optionsFrom] || [] : f.options || []).map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))) : /*#__PURE__*/React.createElement("input", {
    className: "sf-input",
    type: "text",
    placeholder: f.placeholder || '',
    value: form[f.key] || '',
    onChange: e => setForm(s => ({
      ...s,
      [f.key]: e.target.value
    }))
  }));
  // Groups consecutive half-width fields into 2-col rows; `full` fields stand alone.
  const fieldRows = flds => {
    const rows = [];
    let buf = [];
    const flush = () => {
      if (buf.length) {
        rows.push(buf);
        buf = [];
      }
    };
    flds.forEach(f => {
      if (f.full) {
        flush();
        rows.push([f]);
      } else {
        buf.push(f);
        if (buf.length === 2) flush();
      }
    });
    flush();
    return rows;
  };

  // ── EDITOR PANE ── (takes over the content area; no modal)
  if (editor) {
    const isImport = editor === 'import';
    const heading = isImport ? importForm ? importForm.title : 'Import' : editor === 'edit' ? getName(editing) : newForm ? newForm.title : 'New ' + title;
    const eyebrow = isImport ? 'Import' : editor === 'edit' ? 'Editing' : 'New';
    const group = groups[Math.min(editorTab, groups.length - 1)];
    const showTabs = !isImport && groups.length > 1;
    const isDirty = isImport ? !!importText.trim() : editing ? fields.some(f => (form[f.key] || '') !== (f.get ? f.get(editing) : editing[f.key] != null ? String(editing[f.key]) : '')) : fields.some(f => (form[f.key] || '').trim());
    const statusText = isImport ? importText.trim() ? 'Ready to import' : 'Nothing pasted yet' : editing ? isDirty ? 'Unsaved changes' : 'No changes' : isDirty ? 'Draft — not saved' : 'Empty draft';
    const onCancel = () => {
      isDirty ? setConfirmCancel(true) : closeEditor();
    };
    const saveDisabled = isImport ? !importText.trim() : !formValid || editing && !isDirty;
    kbd.current = {
      editor: true,
      cancel: onCancel,
      save: () => {
        if (!saveDisabled) isImport ? saveImport() : saveForm();
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "kit-editor"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-editor__scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sf-hero",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sf-hero__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: isImport ? 'expand' : editorIcon,
      size: 20
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "sf-hero-eyebrow"
    }, eyebrow), /*#__PURE__*/React.createElement("div", {
      className: "sf-hero__title"
    }, heading || 'New ' + title)))), showTabs ? /*#__PURE__*/React.createElement("div", {
      className: "sf-tabs kit-editor__tabs"
    }, groups.map((g, i) => /*#__PURE__*/React.createElement("button", {
      key: g.id,
      className: 'sf-tab' + (i === editorTab ? ' sf-tab--active' : ''),
      onClick: () => setEditorTab(i)
    }, g.label))) : null, /*#__PURE__*/React.createElement("div", {
      className: "sf-form-section kit-editor__section"
    }, isImport ? /*#__PURE__*/React.createElement("div", {
      className: "sf-form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "sf-label"
    }, "Paste"), /*#__PURE__*/React.createElement("p", {
      className: "sf-input-help",
      style: {
        marginBottom: 8
      }
    }, importForm ? importForm.hint : 'Paste your data. The first line becomes the title (mock import).'), /*#__PURE__*/React.createElement("textarea", {
      className: "sf-textarea",
      rows: 8,
      placeholder: importForm && importForm.placeholder || 'Paste here…',
      value: importText,
      onChange: e => setImportText(e.target.value),
      autoFocus: true
    })) : fieldRows(group.fields).map((row, i) => row.length === 2 ? /*#__PURE__*/React.createElement("div", {
      className: "sf-form-row",
      key: i
    }, row.map(renderField)) : renderField(row[0])))), /*#__PURE__*/React.createElement("div", {
      className: "kit-editor__bar"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-editor__status"
    }, /*#__PURE__*/React.createElement("span", {
      className: 'kit-editor__dot' + (isDirty ? ' kit-editor__dot--on' : '')
    }), statusText), editor === 'edit' ? /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--danger",
      onClick: deleteEditing
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 14
    }), " Delete") : null, /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--secondary",
      onClick: onCancel
    }, "Cancel"), isImport ? /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--primary",
      disabled: saveDisabled,
      onClick: saveImport
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14
    }), " Import") : /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--primary",
      disabled: saveDisabled,
      onClick: saveForm
    }, editor === 'edit' ? 'Save changes' : 'Create')), confirmCancel ? /*#__PURE__*/React.createElement("div", {
      className: "sf-modal-overlay",
      onClick: e => {
        if (e.target === e.currentTarget) setConfirmCancel(false);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sf-modal",
      role: "dialog",
      "aria-modal": "true",
      style: {
        minWidth: 300
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sf-modal__title"
    }, "Discard changes?"), /*#__PURE__*/React.createElement("div", {
      className: "sf-modal__body"
    }, "You have unsaved edits. Leaving now will lose them."), /*#__PURE__*/React.createElement("div", {
      className: "sf-modal__actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--secondary",
      onClick: () => setConfirmCancel(false)
    }, "Keep editing"), /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--danger",
      onClick: () => {
        setConfirmCancel(false);
        closeEditor();
      }
    }, "Discard")))) : null);
  }

  // ── Shared view switch ──
  const ViewSwitch = () => /*#__PURE__*/React.createElement("div", {
    className: "kit-seg kit-seg--sm"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'kit-seg__btn' + (mode === 'cards' ? ' kit-seg__btn--active' : ''),
    onClick: () => setMode('cards'),
    title: "Card index"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "home",
    size: 13
  })), /*#__PURE__*/React.createElement("button", {
    className: 'kit-seg__btn' + (mode === 'split' ? ' kit-seg__btn--active' : ''),
    onClick: () => setMode('split'),
    title: "List & detail"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chapters",
    size: 13
  })));

  // Not in the editor anymore — let keyboard shortcuts fall through.
  kbd.current = {
    editor: false
  };
  const SearchBox = () => /*#__PURE__*/React.createElement("div", {
    className: "kit-idx-search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-idx-search__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14
  })), /*#__PURE__*/React.createElement("input", {
    className: "kit-idx-search__input",
    type: "text",
    placeholder: 'Search ' + title.toLowerCase() + '…',
    value: query,
    onChange: e => {
      setQuery(e.target.value);
      setPage(0);
    }
  }), query ? /*#__PURE__*/React.createElement("button", {
    className: "kit-idx-search__clear",
    onClick: () => setQuery(''),
    title: "Clear"
  }, "\xD7") : null);
  const emptyBlock = /*#__PURE__*/React.createElement("div", {
    className: "sf-empty kit-idx-empty"
  }, q ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__title"
  }, "No matches"), /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__text"
  }, "Nothing in ", title.toLowerCase(), " matches \u201C", query, "\u201D."), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary sf-btn--sm",
    style: {
      marginTop: 6
    },
    onClick: () => setQuery('')
  }, "Clear search")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__title"
  }, "Nothing here yet"), /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__text"
  }, newForm && newForm.emptyHint || 'Add your first ' + title.toLowerCase().replace(/s$/, '') + ' to begin.'), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--primary sf-btn--sm",
    style: {
      marginTop: 6
    },
    onClick: openNew
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), " ", addLabel)));

  // ── CARDS MODE ──
  if (mode === 'cards') {
    return /*#__PURE__*/React.createElement("div", {
      className: "kit-scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-idx-bar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-idx-bar__title"
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 24
      }
    }, title), /*#__PURE__*/React.createElement("span", {
      className: "kit-sub"
    }, q ? filtered.length + ' of ' + items.length : items.length + ' ' + (items.length === 1 ? 'item' : 'items'))), /*#__PURE__*/React.createElement("div", {
      className: "kit-idx-bar__tools"
    }, /*#__PURE__*/React.createElement(SearchBox, null), selectMode ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "kit-idx-selinfo"
    }, selected.size, " selected"), /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--danger sf-btn--sm",
      disabled: !selected.size,
      onClick: deleteSel
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 13
    }), " Delete"), /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--ghost sf-btn--sm",
      onClick: clearSel
    }, "Done")) : /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--ghost sf-btn--sm",
      onClick: () => setSelectMode(true)
    }, "Select"), /*#__PURE__*/React.createElement("label", {
      className: "kit-idx-pagesize"
    }, "Per page", /*#__PURE__*/React.createElement("select", {
      className: "sf-input sf-input--sm",
      value: pageSize,
      onChange: e => {
        setPageSize(Number(e.target.value));
        setPage(0);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: 4
    }, "4"), /*#__PURE__*/React.createElement("option", {
      value: 6
    }, "6"), /*#__PURE__*/React.createElement("option", {
      value: 9
    }, "9"), /*#__PURE__*/React.createElement("option", {
      value: 12
    }, "12"))), /*#__PURE__*/React.createElement(ViewSwitch, null))), /*#__PURE__*/React.createElement("div", {
      className: "sf-card-grid kit-idx-grid"
    }, safePage === 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "sf-card kit-idx-action kit-idx-action--add",
      onClick: openNew
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-idx-action__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      className: "kit-idx-action__label"
    }, addLabel)), /*#__PURE__*/React.createElement("button", {
      className: "sf-card kit-idx-action",
      onClick: openImport
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-idx-action__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "expand",
      size: 18
    })), /*#__PURE__*/React.createElement("span", {
      className: "kit-idx-action__label"
    }, importLabel))) : null, pageItems.map(item => {
      const id = getId(item);
      const gIdx = items.findIndex(it => getId(it) === id);
      const isSel = selected.has(id);
      return /*#__PURE__*/React.createElement("div", {
        key: id,
        className: 'sf-card kit-idx-card' + (isSel ? ' kit-idx-card--sel' : '') + (overId === id ? ' kit-idx-card--over' : ''),
        draggable: true,
        onDragStart: () => {
          dragId.current = id;
        },
        onDragOver: e => {
          e.preventDefault();
          if (overId !== id) setOverId(id);
        },
        onDragEnd: () => {
          dragId.current = null;
          setOverId(null);
        },
        onDrop: e => {
          e.preventDefault();
          onDrop(id);
        },
        onClick: () => {
          selectMode ? toggleSel(id) : (setActiveId(id), setMode('split'));
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "kit-idx-card__ctrls"
      }, selectMode ? /*#__PURE__*/React.createElement("span", {
        className: 'kit-idx-check' + (isSel ? ' kit-idx-check--on' : '')
      }, isSel ? '✓' : '') : /*#__PURE__*/React.createElement("span", {
        className: "kit-idx-handle",
        title: "Drag to reorder"
      }, "\u22EE\u22EE"), /*#__PURE__*/React.createElement("span", {
        className: "kit-idx-arrows",
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement("button", {
        className: "kit-idx-arrow",
        disabled: gIdx === 0,
        onClick: () => move(id, -1),
        title: "Move up"
      }, "\u2191"), /*#__PURE__*/React.createElement("button", {
        className: "kit-idx-arrow",
        disabled: gIdx === items.length - 1,
        onClick: () => move(id, 1),
        title: "Move down"
      }, "\u2193"))), renderCardBody(item));
    })), filtered.length === 0 ? emptyBlock : null, pageCount > 1 ? /*#__PURE__*/React.createElement("div", {
      className: "kit-idx-pager"
    }, /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--ghost sf-btn--sm",
      disabled: safePage === 0,
      onClick: () => setPage(safePage - 1)
    }, "\u2190 Prev"), /*#__PURE__*/React.createElement("span", {
      className: "kit-idx-pager__info"
    }, "Page ", safePage + 1, " of ", pageCount), /*#__PURE__*/React.createElement("button", {
      className: "sf-btn sf-btn--ghost sf-btn--sm",
      disabled: safePage >= pageCount - 1,
      onClick: () => setPage(safePage + 1)
    }, "Next \u2192")) : null, toastEl);
  }

  // ── SPLIT MODE ──
  const active = filtered.find(it => getId(it) === activeId) || filtered[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-idx-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-idx-splitbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-idx-splitbar__title"
  }, title, " \xB7 ", q ? filtered.length + ' of ' + items.length : items.length), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SearchBox, null), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--ghost sf-btn--sm",
    onClick: openNew
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), " ", addLabel), /*#__PURE__*/React.createElement(ViewSwitch, null))), /*#__PURE__*/React.createElement("div", {
    className: "kit-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-split__list"
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "kit-split-empty"
  }, q ? 'No matches for “' + query + '”' : 'Nothing here yet') : filtered.map(item => {
    const id = getId(item);
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      className: 'sf-split-row' + (active && id === getId(active) ? ' sf-split-row--active' : ''),
      onClick: () => setActiveId(id)
    }, renderRow(item, active && id === getId(active)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-split__main"
  }, active ? renderDetail(active, {
    onEdit: () => openEdit(active)
  }) : /*#__PURE__*/React.createElement("div", {
    className: "sf-empty kit-idx-empty",
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__title"
  }, q ? 'No matches' : 'Nothing here yet'), /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__text"
  }, q ? 'Try a different search.' : newForm && newForm.emptyHint || 'Add your first ' + title.toLowerCase().replace(/s$/, '') + '.'), !q ? /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--primary sf-btn--sm",
    style: {
      marginTop: 6
    },
    onClick: openNew
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), " ", addLabel) : null))), toastEl);
}
window.ElementIndex = ElementIndex;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storyforge/index-view.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storyforge/screens.jsx
try { (() => {
/* StoryForge UI-kit screens. Exposed on window. */
const {
  useState: useS
} = React;

/* ── Project library (landing) ── */
function ProjectLibrary({
  onOpen
}) {
  const D = window.SFData;
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 28
    }
  }, "Your projects"), /*#__PURE__*/React.createElement("p", {
    className: "kit-sub"
  }, "Three works in progress. Pick up where you left off.")), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--primary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15
  }), " New project")), /*#__PURE__*/React.createElement("div", {
    className: "sf-card-grid",
    style: {
      marginTop: 22
    }
  }, D.projects.map(p => {
    const pct = Math.min(100, Math.round(p.words / p.target * 100));
    return /*#__PURE__*/React.createElement("div", {
      className: "sf-card sf-card--clickable",
      key: p.id,
      onClick: () => onOpen(p)
    }, /*#__PURE__*/React.createElement("div", {
      className: "sf-card__title",
      style: {
        fontSize: 17
      }
    }, p.title), /*#__PURE__*/React.createElement("div", {
      className: "sf-card__meta"
    }, p.type, " \xB7 ", p.genre.join(', ')), /*#__PURE__*/React.createElement("div", {
      className: "kit-progress"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: pct + '%'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "kit-card-foot"
    }, /*#__PURE__*/React.createElement("span", null, p.words.toLocaleString(), " / ", p.target.toLocaleString(), " words"), /*#__PURE__*/React.createElement("span", null, p.chapters, " ch \xB7 ", p.updated)));
  }), /*#__PURE__*/React.createElement("div", {
    className: "sf-card sf-card--add"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-card__title"
  }, "New project"), /*#__PURE__*/React.createElement("div", {
    className: "sf-card__meta"
  }, "Begin a fresh manuscript & world"))));
}

/* ── Project & World overview ── */
function ProjectOverview() {
  const D = window.SFData,
    w = D.world;
  const pct = Math.round(D.projects[0].words / D.projects[0].target * 100);
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow"
  }, "Novel \xB7 Thriller, Mystery"), /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, "The Erasure Protocol"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit"), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--primary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 15
  }), " Ask Atelier"))), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__label"
  }, "Words"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__value"
  }, "24,310"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__sub"
  }, pct, "% of 80,000")), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__label"
  }, "Characters"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__value"
  }, "7"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__sub"
  }, "3 main \xB7 3 supporting")), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__label"
  }, "Locations"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__value"
  }, "5"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__sub"
  }, "2 cities \xB7 1 region")), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__label"
  }, "Story health"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__value"
  }, "78%"), /*#__PURE__*/React.createElement("div", {
    className: "sf-stat__sub"
  }, "Good"))), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '24px 0 12px'
    }
  }, "The world"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Setting"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, w.setting)), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Central conflict"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, w.conflict)), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "The hook \xB7 Mood: ", w.mood), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, w.hook)), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Districts & detail"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, w.details))));
}

/* ── Character detail pane (shared by split mode) ── */
function characterDetail(c, ctx) {
  const label = l => l.charAt(0).toUpperCase() + l.slice(1);
  const rels = {
    c1: [['Marcus Chen', 'Ally · deuteragonist'], ['Iris Blackwood', 'Adversary']],
    c2: [['Elara Voss', 'Ally · protagonist']],
    c3: [['Elara Voss', 'Adversary'], ['Thomas Hale', 'Leverage over']]
  }[c.id] || [];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      paddingTop: 'var(--sf-sp-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'sf-avatar sf-avatar-tone-' + tone(c.id),
    style: {
      width: 44,
      height: 44,
      fontSize: 16
    }
  }, initials(c.name)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'baseline',
      marginTop: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: 'sf-badge sf-badge--' + c.importance
  }, label(c.importance)), /*#__PURE__*/React.createElement("span", {
    className: "sf-hero__role"
  }, "\u201C", c.voice, "\u201D")))), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary",
    onClick: () => ctx.onEdit()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit")), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar",
    style: {
      padding: '12px 0 4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, c.role), /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, c.gender), /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, "Age ", c.age)), /*#__PURE__*/React.createElement("div", {
    className: "kit-detail-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Personality"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, c.personality)), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Appearance"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, c.appearance)), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Wants"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, c.wants)), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Needs"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, c.needs)), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Wound / flaw"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, c.wound))), /*#__PURE__*/React.createElement("aside", {
    className: "kit-aside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label"
  }, "Character arc"), /*#__PURE__*/React.createElement("div", {
    className: "kit-arc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-arc__cap"
  }, "From"), /*#__PURE__*/React.createElement("div", {
    className: "kit-arc__state"
  }, c.arcFrom), /*#__PURE__*/React.createElement("div", {
    className: "kit-arc__rule"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plot",
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-arc__cap"
  }, "To"), /*#__PURE__*/React.createElement("div", {
    className: "kit-arc__state"
  }, c.arcTo)), /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label",
    style: {
      marginTop: 16
    }
  }, "Relationships"), rels.length ? rels.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-rel sf-detail-rel--row",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-rel__name"
  }, r[0]), /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-rel__kind"
  }, "\u2014 ", r[1]))) : /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__empty"
  }, "No relationships mapped yet."))));
}

/* ── Characters (index: cards or split) ── */
function CharactersScreen({
  items,
  onReorder,
  onDelete,
  onAdd,
  onUpdate,
  viewMode,
  pageSize,
  lookups
}) {
  const label = l => l.charAt(0).toUpperCase() + l.slice(1);
  return /*#__PURE__*/React.createElement(ElementIndex, {
    type: "characters",
    title: "Characters",
    items: items,
    getId: c => c.id,
    getName: c => c.name,
    searchText: c => [c.name, c.role, c.importance, c.personality].join(" "),
    viewMode: viewMode,
    pageSize: pageSize,
    onReorder: onReorder,
    onDelete: onDelete,
    onAdd: onAdd,
    onUpdate: onUpdate,
    lookups: lookups,
    addLabel: "New character",
    importLabel: "Import card",
    newForm: {
      title: 'New character',
      icon: 'users',
      tabs: [{
        id: 'basic',
        label: 'Basic',
        fields: [{
          key: 'importance',
          label: 'Importance',
          type: 'select',
          options: ['main', 'supporting', 'minor']
        }, {
          key: 'name',
          label: 'Name',
          required: true,
          placeholder: 'Elara Voss'
        }, {
          key: 'role',
          label: 'Role',
          placeholder: 'Protagonist'
        }, {
          key: 'gender',
          label: 'Gender',
          placeholder: 'Female'
        }, {
          key: 'age',
          label: 'Age',
          placeholder: '28'
        }, {
          key: 'personality',
          label: 'Personality',
          type: 'textarea',
          rows: 4,
          full: true
        }, {
          key: 'wound',
          label: 'Wound / flaw',
          type: 'textarea',
          rows: 4,
          full: true
        }, {
          key: 'wants',
          label: 'Wants',
          type: 'textarea',
          rows: 3
        }, {
          key: 'needs',
          label: 'Needs',
          type: 'textarea',
          rows: 3
        }]
      }, {
        id: 'details',
        label: 'Details & arc',
        fields: [{
          key: 'appearance',
          label: 'Appearance',
          type: 'textarea',
          rows: 4
        }, {
          key: 'voice',
          label: 'Voice',
          type: 'textarea',
          rows: 4
        }, {
          key: 'arcFrom',
          label: 'Arc — from',
          placeholder: 'Survivor guilt'
        }, {
          key: 'arcTo',
          label: 'Arc — to',
          placeholder: 'Self-forgiveness'
        }]
      }, {
        id: 'summary',
        label: 'Summary',
        fields: [{
          key: 'aiSummary',
          label: 'AI summary',
          type: 'textarea',
          rows: 8,
          full: true,
          placeholder: 'A short, spoiler-aware synopsis of this character for AI context…'
        }]
      }, {
        id: 'persona',
        label: 'Persona',
        fields: [{
          key: 'greeting',
          label: 'Greeting',
          type: 'textarea',
          rows: 4
        }, {
          key: 'alternateGreetings',
          label: 'Alternate greetings',
          type: 'textarea',
          rows: 4
        }, {
          key: 'exampleDialogues',
          label: 'Example dialogues',
          type: 'textarea',
          rows: 5,
          full: true
        }, {
          key: 'systemPrompt',
          label: 'System prompt',
          type: 'textarea',
          rows: 4,
          full: true
        }]
      }],
      build: (v, orig) => ({
        ...(orig || {}),
        id: orig ? orig.id : uid(),
        name: v.name,
        role: v.role || 'Unassigned',
        importance: v.importance || 'supporting',
        gender: v.gender || '',
        age: v.age || '',
        personality: v.personality || '',
        wound: v.wound || '',
        wants: v.wants || '',
        needs: v.needs || '',
        appearance: v.appearance || '',
        voice: v.voice || '',
        arcFrom: v.arcFrom || '',
        arcTo: v.arcTo || '',
        aiSummary: v.aiSummary || '',
        greeting: v.greeting || '',
        alternateGreetings: v.alternateGreetings || '',
        exampleDialogues: v.exampleDialogues || '',
        systemPrompt: v.systemPrompt || ''
      })
    },
    importForm: {
      title: 'Import character card',
      hint: 'Paste a character card or bio. The first line becomes the name (mock import).',
      build: t => ({
        id: uid(),
        name: (t.split('\n')[0] || 'Imported').trim().slice(0, 50),
        role: 'Imported',
        importance: 'supporting',
        personality: t.trim(),
        appearance: '',
        wants: '',
        needs: '',
        wound: '',
        gender: '',
        age: '',
        voice: '',
        arcFrom: '',
        arcTo: ''
      })
    },
    renderCardBody: c => /*#__PURE__*/React.createElement("div", {
      className: "kit-elc"
    }, /*#__PURE__*/React.createElement("span", {
      className: 'sf-avatar sf-avatar-tone-' + tone(c.id),
      style: {
        width: 38,
        height: 38,
        fontSize: 14
      }
    }, initials(c.name)), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__title"
    }, c.name), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__meta"
    }, c.role)), /*#__PURE__*/React.createElement("span", {
      className: 'sf-badge sf-badge--' + c.importance
    }, label(c.importance))),
    renderRow: c => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: 'sf-split-row__avatar sf-avatar-tone-' + tone(c.id)
    }, initials(c.name)), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__title"
    }, c.name), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__meta"
    }, c.role)), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__aside--tag"
    }, label(c.importance))),
    renderDetail: characterDetail
  });
}

/* ── Location detail + index ── */
function locationDetail(l, ctx) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      paddingTop: 'var(--sf-sp-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-el-tile"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "location",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow"
  }, l.type), /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, l.name))), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary",
    onClick: () => ctx.onEdit()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit")), /*#__PURE__*/React.createElement("div", {
    className: "kit-detail-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Description"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, l.desc)), l.atmosphere ? /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Atmosphere"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, l.atmosphere)) : null, l.significance ? /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Significance"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, l.significance)) : null, l.history ? /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "History"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, l.history)) : null), /*#__PURE__*/React.createElement("aside", {
    className: "kit-aside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label"
  }, "Tags"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar"
  }, l.tags.map(t => /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip",
    key: t
  }, t))))));
}
function LocationsScreen({
  items,
  onReorder,
  onDelete,
  onAdd,
  onUpdate,
  viewMode,
  pageSize,
  lookups
}) {
  return /*#__PURE__*/React.createElement(ElementIndex, {
    type: "locations",
    title: "Locations",
    items: items,
    getId: l => l.id,
    getName: l => l.name,
    searchText: l => [l.name, l.type, l.desc, (l.tags || []).join(" ")].join(" "),
    viewMode: viewMode,
    pageSize: pageSize,
    onReorder: onReorder,
    onDelete: onDelete,
    onAdd: onAdd,
    onUpdate: onUpdate,
    lookups: lookups,
    addLabel: "New location",
    importLabel: "Import map",
    newForm: {
      title: 'New location',
      icon: 'location',
      tabs: [{
        id: 'basic',
        label: 'Basic',
        fields: [{
          key: 'name',
          label: 'Name',
          required: true,
          placeholder: 'The Gilded Docks'
        }, {
          key: 'type',
          label: 'Type',
          type: 'select',
          options: ['City', 'Building', 'Landmark', 'Region', 'Wilderness']
        }, {
          key: 'desc',
          label: 'Description',
          type: 'textarea',
          full: true
        }, {
          key: 'tags',
          label: 'Tags',
          full: true,
          placeholder: 'trade, dangerous',
          get: l => (l.tags || []).join(', ')
        }]
      }, {
        id: 'details',
        label: 'Details',
        fields: [{
          key: 'atmosphere',
          label: 'Atmosphere',
          type: 'textarea',
          rows: 3,
          full: true
        }, {
          key: 'significance',
          label: 'Significance',
          type: 'textarea',
          rows: 3,
          full: true
        }, {
          key: 'history',
          label: 'History',
          type: 'textarea',
          rows: 3,
          full: true
        }]
      }],
      build: (v, orig) => ({
        ...(orig || {}),
        id: orig ? orig.id : uid(),
        name: v.name,
        type: v.type || 'Place',
        desc: v.desc || '',
        tags: (v.tags || '').split(',').map(k => k.trim()).filter(Boolean),
        atmosphere: v.atmosphere || '',
        significance: v.significance || '',
        history: v.history || ''
      })
    },
    importForm: {
      title: 'Import location',
      hint: 'Paste a description. The first line becomes the name (mock import).',
      build: t => ({
        id: uid(),
        name: (t.split('\n')[0] || 'Imported').trim().slice(0, 50),
        type: 'Place',
        desc: t.trim(),
        tags: []
      })
    },
    renderCardBody: l => /*#__PURE__*/React.createElement("div", {
      className: "kit-elc"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "location",
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__title"
    }, l.name), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__meta"
    }, l.type, " \xB7 ", l.tags.join(', ')))),
    renderRow: l => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile kit-el-tile--sm"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "location",
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__title"
    }, l.name), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__meta"
    }, l.type))),
    renderDetail: locationDetail
  });
}

/* ── Group detail + index ── */
function groupDetail(g, ctx) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      paddingTop: 'var(--sf-sp-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-el-tile"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow"
  }, g.type), /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, g.name))), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary",
    onClick: () => ctx.onEdit()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit")), /*#__PURE__*/React.createElement("div", {
    className: "kit-detail-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Description"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, g.desc)), g.purpose ? /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Purpose"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, g.purpose)) : null, g.values ? /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Values"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, g.values)) : null, g.reputation ? /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Reputation"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, g.reputation)) : null, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Members"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, g.members, " \xB7 led by ", g.lead))), /*#__PURE__*/React.createElement("aside", {
    className: "kit-aside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label"
  }, "Tags"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar"
  }, g.tags.map(t => /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip",
    key: t
  }, t))))));
}
function GroupsScreen({
  items,
  onReorder,
  onDelete,
  onAdd,
  onUpdate,
  viewMode,
  pageSize,
  lookups
}) {
  return /*#__PURE__*/React.createElement(ElementIndex, {
    type: "groups",
    title: "Groups",
    items: items,
    getId: g => g.id,
    getName: g => g.name,
    searchText: g => [g.name, g.type, g.desc, g.lead, (g.tags || []).join(" ")].join(" "),
    viewMode: viewMode,
    pageSize: pageSize,
    onReorder: onReorder,
    onDelete: onDelete,
    onAdd: onAdd,
    onUpdate: onUpdate,
    lookups: lookups,
    addLabel: "New group",
    importLabel: "Import",
    newForm: {
      title: 'New group',
      icon: 'shield',
      tabs: [{
        id: 'basic',
        label: 'Basic',
        fields: [{
          key: 'name',
          label: 'Name',
          required: true,
          placeholder: 'The Inkwell Society'
        }, {
          key: 'type',
          label: 'Type',
          type: 'select',
          options: ['Faction', 'Organization', 'Family', 'Order']
        }, {
          key: 'desc',
          label: 'Description',
          type: 'textarea',
          full: true
        }, {
          key: 'lead',
          label: 'Leader',
          placeholder: 'Professor Yuki'
        }, {
          key: 'tags',
          label: 'Tags',
          placeholder: 'resistance, information',
          get: g => (g.tags || []).join(', ')
        }]
      }, {
        id: 'details',
        label: 'Details',
        fields: [{
          key: 'purpose',
          label: 'Purpose',
          type: 'textarea',
          rows: 3,
          full: true
        }, {
          key: 'values',
          label: 'Values',
          type: 'textarea',
          rows: 3,
          full: true
        }, {
          key: 'reputation',
          label: 'Reputation',
          type: 'textarea',
          rows: 3,
          full: true
        }]
      }],
      build: (v, orig) => ({
        ...(orig || {}),
        id: orig ? orig.id : uid(),
        name: v.name,
        type: v.type || 'Faction',
        desc: v.desc || '',
        lead: v.lead || '—',
        tags: (v.tags || '').split(',').map(k => k.trim()).filter(Boolean),
        purpose: v.purpose || '',
        values: v.values || '',
        reputation: v.reputation || '',
        members: orig ? orig.members : 0
      })
    },
    importForm: {
      title: 'Import group',
      hint: 'Paste a description. The first line becomes the name (mock import).',
      build: t => ({
        id: uid(),
        name: (t.split('\n')[0] || 'Imported').trim().slice(0, 50),
        type: 'Faction',
        desc: t.trim(),
        members: 0,
        lead: '—',
        tags: []
      })
    },
    renderCardBody: g => /*#__PURE__*/React.createElement("div", {
      className: "kit-elc"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__title"
    }, g.name), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__meta"
    }, g.type, " \xB7 ", g.members, " members"))),
    renderRow: g => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile kit-el-tile--sm"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__title"
    }, g.name), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__meta"
    }, g.members, " members"))),
    renderDetail: groupDetail
  });
}

/* ── Settings (per-type view mode + pagination) ── */
function SettingsScreen({
  viewModes,
  onSetView,
  pageSize,
  onSetPageSize,
  onReset
}) {
  const TYPES = [['characters', 'Characters', 'users'], ['relationships', 'Relationships', 'link'], ['locations', 'Locations', 'location'], ['groups', 'Groups', 'shield'], ['lorebook', 'Lorebook', 'loreScroll'], ['notes', 'Notes', 'note'], ['scenes', 'Scenes', 'scenes']];
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-page-head",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24
    }
  }, "Settings"), /*#__PURE__*/React.createElement("p", {
    className: "kit-sub"
  }, "Choose how each element type is laid out."))), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '4px 0 12px'
    }
  }, "Element layout"), /*#__PURE__*/React.createElement("div", {
    className: "kit-set-list"
  }, TYPES.map(([id, label, icon]) => /*#__PURE__*/React.createElement("div", {
    className: "kit-set-row",
    key: id
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-set-row__name"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-el-tile kit-el-tile--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14
  })), " ", label), /*#__PURE__*/React.createElement("div", {
    className: "kit-seg"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'kit-seg__btn' + (viewModes[id] === 'cards' ? ' kit-seg__btn--active' : ''),
    onClick: () => onSetView(id, 'cards')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "home",
    size: 13
  }), " Cards"), /*#__PURE__*/React.createElement("button", {
    className: 'kit-seg__btn' + (viewModes[id] === 'split' ? ' kit-seg__btn--active' : ''),
    onClick: () => onSetView(id, 'split')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chapters",
    size: 13
  }), " List + detail"))))), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '24px 0 12px'
    }
  }, "Pagination"), /*#__PURE__*/React.createElement("div", {
    className: "kit-set-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-set-row__name"
  }, "Cards per page"), /*#__PURE__*/React.createElement("div", {
    className: "kit-seg"
  }, [4, 6, 9, 12].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    className: 'kit-seg__btn' + (pageSize === n ? ' kit-seg__btn--active' : ''),
    onClick: () => onSetPageSize(n)
  }, n)))), /*#__PURE__*/React.createElement("p", {
    className: "kit-sub",
    style: {
      marginTop: 12,
      maxWidth: 520
    }
  }, "The card index also has its own per-page selector and a layout switch, so you can override these defaults on any screen without coming back here."), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '24px 0 12px'
    }
  }, "Demo data"), /*#__PURE__*/React.createElement("div", {
    className: "kit-set-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-set-row__name"
  }, "Restore the seed project"), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--danger sf-btn--sm",
    onClick: onReset
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 13
  }), " Reset demo data")), /*#__PURE__*/React.createElement("p", {
    className: "kit-sub",
    style: {
      marginTop: 12,
      maxWidth: 520
    }
  }, "Adds, deletes and reordering are saved to this browser. Reset to bring back the original cast, locations and scenes."));
}

/* ── Scenes / Corkboard (index: cards or split) ── */
const MOOD_TONE = {
  Ominous: 'minor',
  Tense: 'accent',
  Foreboding: 'minor',
  Frantic: 'danger',
  Uneasy: 'accent'
};
function sceneDetail(s, ctx) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      paddingTop: 'var(--sf-sp-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-el-tile"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scenes",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow"
  }, "Scene ", s.ref, " \xB7 ", s.pov, " \xB7 ", s.mood), /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, s.title))), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary",
    onClick: () => ctx.onEdit()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit")), /*#__PURE__*/React.createElement("div", {
    className: "kit-detail-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Summary"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, s.desc))), /*#__PURE__*/React.createElement("aside", {
    className: "kit-aside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label"
  }, "At a glance"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'sf-badge sf-badge--' + (MOOD_TONE[s.mood] || 'minor')
  }, s.mood), /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, "POV ", s.pov), /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, s.words ? s.words.toLocaleString() + ' words' : 'Outline')))));
}
function ScenesScreen({
  items,
  onReorder,
  onDelete,
  onAdd,
  onUpdate,
  viewMode,
  pageSize,
  lookups
}) {
  return /*#__PURE__*/React.createElement(ElementIndex, {
    type: "scenes",
    title: "Corkboard",
    items: items,
    getId: s => s.id,
    getName: s => s.title,
    searchText: s => [s.title, s.ref, s.pov, s.mood, s.desc].join(" "),
    viewMode: viewMode,
    pageSize: pageSize,
    onReorder: onReorder,
    onDelete: onDelete,
    onAdd: onAdd,
    onUpdate: onUpdate,
    lookups: lookups,
    addLabel: "New scene",
    importLabel: "Import",
    newForm: {
      title: 'New scene',
      icon: 'scenes',
      tabs: [{
        id: 'basic',
        label: 'Basic',
        fields: [{
          key: 'title',
          label: 'Scene title',
          required: true,
          placeholder: 'A meeting in smoke'
        }, {
          key: 'pov',
          label: 'POV character',
          type: 'select',
          optionsFrom: 'characters'
        }, {
          key: 'mood',
          label: 'Mood',
          type: 'select',
          options: ['Ominous', 'Tense', 'Foreboding', 'Frantic', 'Uneasy']
        }, {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['outline', 'draft', 'drafted']
        }]
      }, {
        id: 'summary',
        label: 'Summary',
        fields: [{
          key: 'desc',
          label: 'Summary',
          type: 'textarea',
          rows: 6,
          full: true
        }]
      }],
      build: (v, orig) => ({
        ...(orig || {}),
        id: orig ? orig.id : uid(),
        ref: orig ? orig.ref : '—',
        title: v.title,
        desc: v.desc || '',
        mood: v.mood || 'Tense',
        pov: v.pov || '—',
        words: orig ? orig.words : 0,
        status: v.status || 'outline'
      })
    },
    importForm: {
      title: 'Import scene',
      hint: 'Paste scene text. The first line becomes the title (mock import).',
      build: t => ({
        id: uid(),
        ref: '—',
        title: (t.split('\n')[0] || 'Imported scene').trim().slice(0, 60),
        desc: '',
        mood: 'Tense',
        pov: '—',
        words: t.trim().split(/\s+/).length,
        status: 'draft'
      })
    },
    renderCardBody: s => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "kit-scene__top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-scene__ref"
    }, s.ref), /*#__PURE__*/React.createElement("span", {
      className: 'sf-badge sf-badge--' + (MOOD_TONE[s.mood] || 'minor')
    }, s.mood)), /*#__PURE__*/React.createElement("div", {
      className: "sf-card__title",
      style: {
        fontSize: 15,
        marginTop: 6
      }
    }, s.title), /*#__PURE__*/React.createElement("div", {
      className: "kit-scene__desc"
    }, s.desc || 'No summary yet.'), /*#__PURE__*/React.createElement("div", {
      className: "kit-scene__foot"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-detail-scene__pov"
    }, s.pov), /*#__PURE__*/React.createElement("span", {
      className: "kit-scene__words"
    }, s.words ? s.words.toLocaleString() + ' words' : 'Outline'))),
    renderRow: s => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile kit-el-tile--sm"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "scenes",
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__title"
    }, s.title), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__meta"
    }, s.ref, " \xB7 ", s.pov)), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__aside--tag"
    }, s.mood)),
    renderDetail: sceneDetail
  });
}

/* ── Story Health (computed live from the store) ── */
function computeHealth(store) {
  const chars = store.characters || [];
  const locs = store.locations || [];
  const scenes = store.scenes || [];
  const groups = store.groups || [];

  // Setup: cast arcs, described locations, scenes assigned, world depth.
  const arced = chars.filter(c => (c.wants || '').trim() && (c.needs || '').trim() && (c.wound || '').trim()).length;
  const describedLocs = locs.filter(l => (l.desc || '').trim().length > 20).length;
  const outlineScenes = scenes.filter(s => s.status === 'outline').length;
  const draftedScenes = scenes.filter(s => s.words > 0).length;
  const arcPct = chars.length ? arced / chars.length : 0;
  const locPct = locs.length ? describedLocs / locs.length : 0;
  const scenePct = scenes.length ? (scenes.length - outlineScenes) / scenes.length : 0;
  const worldPct = Math.min(1, (chars.length >= 3 ? 0.4 : chars.length * 0.13) + (groups.length >= 2 ? 0.3 : groups.length * 0.15) + (locs.length >= 3 ? 0.3 : locs.length * 0.1));
  const setup = Math.round((arcPct + locPct + scenePct + worldPct) / 4 * 100);

  // Writing: drafted scenes + word target.
  const words = scenes.reduce((n, s) => n + (s.words || 0), 0);
  const draftPct = scenes.length ? draftedScenes / scenes.length : 0;
  const wordPct = Math.min(1, words / 80000);
  const writing = Math.round((draftPct * 0.6 + wordPct * 0.4) * 100);
  const band = pct => pct >= 0.75 ? 'good' : pct >= 0.45 ? 'fair' : 'poor';
  const items = [{
    label: 'Characters have clear arcs',
    state: band(arcPct),
    detail: arced + ' of ' + chars.length + ' characters define a want, need, and wound.'
  }, {
    label: 'Locations are described',
    state: band(locPct),
    detail: describedLocs + ' of ' + locs.length + ' locations carry real detail.'
  }, {
    label: 'Scenes are fleshed out',
    state: band(scenePct),
    detail: outlineScenes ? outlineScenes + ' scene' + (outlineScenes === 1 ? ' is' : 's are') + ' still a loose outline.' : 'Every scene has moved past outline.'
  }, {
    label: 'Drafting progress',
    state: band(draftPct),
    detail: draftedScenes + ' of ' + scenes.length + ' scenes drafted · ' + words.toLocaleString() + ' words.'
  }, {
    label: 'World is populated',
    state: band(worldPct),
    detail: chars.length + ' characters · ' + groups.length + ' groups · ' + locs.length + ' locations.'
  }];
  return {
    setup,
    writing,
    words,
    items
  };
}
function HealthScreen({
  store
}) {
  const H = computeHealth(store);
  const Gauge = ({
    pct,
    label,
    sub
  }) => /*#__PURE__*/React.createElement("div", {
    className: "kit-gauge"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-gauge__ring",
    style: {
      background: `conic-gradient(var(--sf-accent) ${pct * 3.6}deg, var(--sf-surface-2) 0)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-gauge__hole"
  }, pct, /*#__PURE__*/React.createElement("span", null, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "kit-gauge__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "kit-gauge__sub"
  }, sub));
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-page-head",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24
    }
  }, "Story health"), /*#__PURE__*/React.createElement("p", {
    className: "kit-sub"
  }, "Where the manuscript is strong \u2014 and where it needs work. Updates as you edit.")), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 15
  }), " Suggest fixes")), /*#__PURE__*/React.createElement("div", {
    className: "kit-gauges"
  }, /*#__PURE__*/React.createElement(Gauge, {
    pct: H.setup,
    label: "Setup",
    sub: "World, cast & structure"
  }), /*#__PURE__*/React.createElement(Gauge, {
    pct: H.writing,
    label: "Writing",
    sub: H.words.toLocaleString() + ' of 80,000 words'
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-checklist"
  }, H.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "kit-check",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: 'kit-check__dot kit-check__dot--' + it.state
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-check__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-check__label"
  }, it.label), /*#__PURE__*/React.createElement("div", {
    className: "kit-check__detail"
  }, it.detail)), /*#__PURE__*/React.createElement("span", {
    className: 'kit-check__tag kit-check__tag--' + it.state
  }, it.state)))));
}

/* ── Manuscript editor (chapter tree + prose surface) ── */
function ManuscriptScreen() {
  const D = window.SFData;
  const [sceneId, setSceneId] = useS('s1');
  const scene = D.scenes.find(s => s.id === sceneId);
  const prose = D.prose[sceneId];
  const totalWords = D.scenes.reduce((n, s) => n + s.words, 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-ms-tree"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-list-head",
    style: {
      padding: '4px 6px 10px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Manuscript"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      textTransform: 'none',
      letterSpacing: 0
    }
  }, totalWords.toLocaleString(), " words")), D.manuscript.map(ch => /*#__PURE__*/React.createElement("div", {
    className: "kit-ms-chapter",
    key: ch.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-ms-chapter__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-ms-num"
  }, ch.num), /*#__PURE__*/React.createElement("span", {
    className: "kit-ms-chapter__title"
  }, ch.title)), /*#__PURE__*/React.createElement("div", {
    className: "kit-ms-scenes"
  }, ch.sceneIds.map(sid => {
    const s = D.scenes.find(x => x.id === sid);
    const drafted = s.words > 0;
    return /*#__PURE__*/React.createElement("button", {
      key: sid,
      className: 'kit-ms-scene' + (sid === sceneId ? ' kit-ms-scene--active' : ''),
      onClick: () => setSceneId(sid)
    }, /*#__PURE__*/React.createElement("span", {
      className: 'kit-ms-dot' + (drafted ? ' kit-ms-dot--done' : '')
    }), /*#__PURE__*/React.createElement("span", {
      className: "kit-ms-scene__title"
    }, s.title), /*#__PURE__*/React.createElement("span", {
      className: "kit-ms-scene__words"
    }, drafted ? s.words.toLocaleString() : '—'));
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "kit-ms-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-ms-doc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow",
    style: {
      marginBottom: 6
    }
  }, "Scene ", scene.ref, " \xB7 ", scene.pov, " \xB7 ", scene.mood), /*#__PURE__*/React.createElement("h1", {
    className: "kit-ms-title"
  }, scene.title), /*#__PURE__*/React.createElement("div", {
    className: "sf-tabs",
    style: {
      margin: '14px 0 4px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "sf-tab sf-tab--active"
  }, "Write"), /*#__PURE__*/React.createElement("button", {
    className: "sf-tab"
  }, "Notes"), /*#__PURE__*/React.createElement("button", {
    className: "sf-tab"
  }, "History")), prose ? /*#__PURE__*/React.createElement("div", {
    className: "kit-prose"
  }, prose.map((para, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    dangerouslySetInnerHTML: {
      __html: para.replace(/\*(.+?)\*/g, '<em>$1</em>')
    }
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "sf-empty",
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__title"
  }, "This scene is still an outline"), /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__text"
  }, scene.desc), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--primary",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Start drafting"))), /*#__PURE__*/React.createElement("div", {
    className: "kit-ms-foot"
  }, /*#__PURE__*/React.createElement("span", null, scene.words ? scene.words.toLocaleString() + ' words in this scene' : 'Outline'), /*#__PURE__*/React.createElement("span", {
    className: "kit-ms-foot__save"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-status-ai__dot",
    style: {
      background: 'var(--sf-success)'
    }
  }), " Saved"))));
}

/* ── Timeline (multi-track day-axis) ── */
function TimelineScreen() {
  const T = window.SFData.timeline;
  const max = T.maxDay;
  const pos = day => (day - 0.5) / max * 100;
  const ticks = [];
  for (let d = 2; d <= max; d += 2) ticks.push(d);
  const PointRow = ({
    item,
    kind
  }) => {
    const pts = item.points || [item.day];
    const lo = Math.min(...pts),
      hi = Math.max(...pts);
    const sub = item.points ? lo === hi ? 'day ' + lo : 'day ' + lo + '–' + hi : 'day ' + item.day;
    return /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row__label"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row__head"
    }, /*#__PURE__*/React.createElement("span", {
      className: 'kit-tl-dot kit-tl-dot--' + kind
    }), /*#__PURE__*/React.createElement("span", {
      className: "kit-tl-row__title"
    }, item.label)), /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row__sub"
    }, sub)), /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-band"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-band__track"
    }), hi > lo ? /*#__PURE__*/React.createElement("div", {
      className: 'kit-tl-span kit-tl-span--' + kind,
      style: {
        left: pos(lo) + '%',
        width: pos(hi) - pos(lo) + '%'
      }
    }) : null, pts.map((p, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: 'kit-tl-pt kit-tl-pt--' + kind,
      style: {
        left: pos(p) + '%'
      },
      title: 'day ' + p
    }))));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-page-head",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24
    }
  }, "Timeline"), /*#__PURE__*/React.createElement("p", {
    className: "kit-sub"
  }, "Every chapter, scene, location and bond on one day-axis.")), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--primary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 15
  }), " Continuity check")), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-seg"
  }, /*#__PURE__*/React.createElement("button", {
    className: "kit-seg__btn kit-seg__btn--active"
  }, "Days"), /*#__PURE__*/React.createElement("button", {
    className: "kit-seg__btn"
  }, "Weeks"), /*#__PURE__*/React.createElement("button", {
    className: "kit-seg__btn",
    disabled: true
  }, "Custom")), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-toggles"
  }, [['chapters', 'Chapters'], ['scenes', 'Scenes'], ['relationships', 'Relationships'], ['locations', 'Locations']].map(([k, l]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    className: "kit-tl-toggle"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'kit-tl-dot kit-tl-dot--' + k
  }), l)))), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-axis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-axis__pad"
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-axis__region"
  }, ticks.map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    className: "kit-tl-tick",
    style: {
      left: (d - 0.5) / max * 100 + '%'
    }
  }, "d", d)))), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-section__title"
  }, "Chapters"), T.chapters.map(c => {
    const left = (c.min - 1) / max * 100;
    const width = (c.max - c.min + 1) / max * 100;
    return /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row",
      key: c.num
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row__label"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row__head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-tl-num"
    }, c.num), /*#__PURE__*/React.createElement("span", {
      className: "kit-tl-row__title"
    }, c.title)), /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-row__sub"
    }, "day ", c.min, "\u2013", c.max)), /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-band"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-band__track"
    }), /*#__PURE__*/React.createElement("div", {
      className: "kit-tl-fill",
      style: {
        left: left + '%',
        width: width + '%'
      }
    }, "d", c.min, "\u2013", c.max)));
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-section__title"
  }, "Scenes"), T.scenes.map((s, i) => /*#__PURE__*/React.createElement(PointRow, {
    key: i,
    item: s,
    kind: "scenes"
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-section__title"
  }, "Relationships"), T.relationships.map((r, i) => /*#__PURE__*/React.createElement(PointRow, {
    key: i,
    item: r,
    kind: "relationships"
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-tl-section__title"
  }, "Locations"), T.locations.map((l, i) => /*#__PURE__*/React.createElement(PointRow, {
    key: i,
    item: l,
    kind: "locations"
  }))));
}

/* ── Lorebook (index: cards or split) ── */
function lorebookDetail(e, ctx) {
  const md = s => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      paddingTop: 'var(--sf-sp-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-lore-tile kit-lore-tile--lg"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "loreScroll",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow"
  }, "Lorebook entry"), /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, e.title))), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary",
    onClick: () => ctx.onEdit()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit")), /*#__PURE__*/React.createElement("div", {
    className: "kit-detail-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Triggers"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar",
    style: {
      marginTop: 2
    }
  }, e.keywords.map(k => /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip",
    key: k
  }, k)))), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Content"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body",
    dangerouslySetInnerHTML: {
      __html: md(e.content)
    }
  })), e.notes ? /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Notes"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body",
    style: {
      fontStyle: 'italic',
      color: 'var(--sf-text-muted)'
    }
  }, e.notes)) : null), /*#__PURE__*/React.createElement("aside", {
    className: "kit-aside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label"
  }, "Status"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'sf-detail-chip' + (e.enabled ? ' sf-detail-chip--solid' : '')
  }, e.enabled ? 'Enabled' : 'Disabled'), e.constant ? /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, "Constant") : null, /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, "Order ", e.order)), /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label",
    style: {
      marginTop: 14
    }
  }, "Tags"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar"
  }, e.tags.map(tg => /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip",
    key: tg
  }, tg))))));
}
function LorebookScreen({
  items,
  onReorder,
  onDelete,
  onAdd,
  onUpdate,
  viewMode,
  pageSize,
  lookups
}) {
  return /*#__PURE__*/React.createElement(ElementIndex, {
    type: "lorebook",
    title: "Lorebook",
    items: items,
    getId: e => e.id,
    getName: e => e.title,
    searchText: e => [e.title, (e.keywords || []).join(" "), (e.tags || []).join(" "), e.content].join(" "),
    viewMode: viewMode,
    pageSize: pageSize,
    onReorder: onReorder,
    onDelete: onDelete,
    onAdd: onAdd,
    onUpdate: onUpdate,
    lookups: lookups,
    addLabel: "New entry",
    importLabel: "Import lorebook",
    newForm: {
      title: 'New lorebook entry',
      icon: 'loreScroll',
      tabs: [{
        id: 'basic',
        label: 'Basic',
        fields: [{
          key: 'title',
          label: 'Title',
          required: true,
          placeholder: 'Identity Erasure'
        }, {
          key: 'order',
          label: 'Insertion order',
          placeholder: '99'
        }, {
          key: 'keywords',
          label: 'Trigger keywords',
          full: true,
          placeholder: 'erasure, vanish, Quiet Bureau',
          get: e => (e.keywords || []).join(', ')
        }, {
          key: 'content',
          label: 'Content',
          type: 'textarea',
          rows: 5,
          full: true
        }, {
          key: 'tags',
          label: 'Tags',
          placeholder: 'core, mechanic',
          get: e => (e.tags || []).join(', ')
        }, {
          key: 'status',
          label: 'Activation',
          type: 'select',
          options: ['Enabled', 'Disabled', 'Always on'],
          get: e => e.constant ? 'Always on' : e.enabled === false ? 'Disabled' : 'Enabled'
        }]
      }, {
        id: 'advanced',
        label: 'Advanced',
        fields: [{
          key: 'secondaryKeys',
          label: 'Secondary keys',
          full: true,
          placeholder: 'optional secondary triggers'
        }, {
          key: 'position',
          label: 'Position'
        }, {
          key: 'depth',
          label: 'Depth'
        }, {
          key: 'probability',
          label: 'Probability %',
          placeholder: '100'
        }]
      }, {
        id: 'notes',
        label: 'Notes',
        fields: [{
          key: 'notes',
          label: 'Notes',
          type: 'textarea',
          rows: 8,
          full: true
        }]
      }],
      build: (v, orig) => ({
        ...(orig || {}),
        id: orig ? orig.id : uid(),
        title: v.title,
        keywords: (v.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
        tags: (v.tags || '').split(',').map(k => k.trim()).filter(Boolean),
        order: Number(v.order) || (orig ? orig.order : 99),
        constant: v.status === 'Always on',
        enabled: v.status !== 'Disabled',
        content: v.content || '',
        notes: v.notes || '',
        secondaryKeys: v.secondaryKeys || '',
        position: v.position || '',
        depth: v.depth || '',
        probability: v.probability || ''
      })
    },
    importForm: {
      title: 'Import lorebook',
      hint: 'Paste a World Info / lorebook entry. The first line becomes the title (mock import).',
      build: t => ({
        id: uid(),
        title: (t.split('\n')[0] || 'Imported').trim().slice(0, 50),
        keywords: [],
        tags: ['imported'],
        constant: false,
        enabled: true,
        order: 99,
        content: t.trim(),
        notes: ''
      })
    },
    renderCardBody: e => /*#__PURE__*/React.createElement("div", {
      className: "kit-elc"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-lore-tile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "loreScroll",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__title"
    }, e.title), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__meta"
    }, e.keywords.length, " keywords", e.constant ? ' · always on' : '', !e.enabled ? ' · disabled' : '')), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__aside--tag"
    }, e.keywords.length, "K")),
    renderRow: e => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "kit-lore-tile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "loreScroll",
      size: 15
    })), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__title"
    }, e.title), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__meta"
    }, e.keywords.length, " keywords", e.constant ? ' · always on' : '', !e.enabled ? ' · disabled' : '')), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__aside--tag"
    }, e.keywords.length, "K")),
    renderDetail: lorebookDetail
  });
}

/* ── Relationships (index: cards or split) ── */
function PairAvatars({
  a,
  b,
  size = 26
}) {
  const fs = size <= 22 ? 10 : size <= 28 ? 11 : 14;
  return /*#__PURE__*/React.createElement("span", {
    className: "kit-pair"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'kit-pair__a sf-avatar-tone-' + tone(a),
    style: {
      width: size,
      height: size,
      fontSize: fs
    }
  }, initials(a)), /*#__PURE__*/React.createElement("span", {
    className: 'kit-pair__a sf-avatar-tone-' + tone(b),
    style: {
      width: size,
      height: size,
      fontSize: fs
    }
  }, initials(b)));
}
function relationshipDetail(r, ctx) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      paddingTop: 'var(--sf-sp-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement(PairAvatars, {
    a: r.a,
    b: r.b,
    size: 42
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow"
  }, r.type), /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, r.a, " & ", r.b))), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary",
    onClick: () => ctx.onEdit()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit")), /*#__PURE__*/React.createElement("div", {
    className: "kit-detail-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-cards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Dynamic"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, r.dynamic))), /*#__PURE__*/React.createElement("aside", {
    className: "kit-aside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-aside__label"
  }, "At a glance"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-chipbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip sf-detail-chip--solid"
  }, r.type), /*#__PURE__*/React.createElement("span", {
    className: "sf-detail-chip"
  }, r.strength)))));
}
function RelationshipsScreen({
  items,
  onReorder,
  onDelete,
  onAdd,
  onUpdate,
  viewMode,
  pageSize,
  lookups
}) {
  return /*#__PURE__*/React.createElement(ElementIndex, {
    type: "relationships",
    title: "Relationships",
    items: items,
    getId: r => r.id,
    getName: r => r.a + ' & ' + r.b,
    searchText: r => [r.a, r.b, r.type, r.strength, r.dynamic].join(" "),
    viewMode: viewMode,
    pageSize: pageSize,
    onReorder: onReorder,
    onDelete: onDelete,
    onAdd: onAdd,
    onUpdate: onUpdate,
    lookups: lookups,
    addLabel: "New bond",
    importLabel: "Import",
    newForm: {
      title: 'New relationship',
      icon: 'link',
      tabs: [{
        id: 'basic',
        label: 'Basic',
        fields: [{
          key: 'a',
          label: 'Character A',
          required: true,
          type: 'select',
          optionsFrom: 'characters'
        }, {
          key: 'b',
          label: 'Character B',
          required: true,
          type: 'select',
          optionsFrom: 'characters'
        }, {
          key: 'type',
          label: 'Bond',
          placeholder: 'Allies'
        }, {
          key: 'strength',
          label: 'Strength',
          type: 'select',
          options: ['Defining', 'Strong', 'Warm', 'Tense', 'Coercive', 'New']
        }]
      }, {
        id: 'dynamic',
        label: 'Dynamic',
        fields: [{
          key: 'dynamic',
          label: 'Dynamic',
          type: 'textarea',
          rows: 6,
          full: true
        }]
      }],
      build: (v, orig) => ({
        ...(orig || {}),
        id: orig ? orig.id : uid(),
        a: v.a,
        b: v.b,
        type: v.type || 'Connection',
        dynamic: v.dynamic || '',
        strength: v.strength || 'New'
      })
    },
    importForm: {
      title: 'Import relationship',
      hint: 'Paste a description. The first line is used as the bond (mock import).',
      build: t => ({
        id: uid(),
        a: 'Character A',
        b: 'Character B',
        type: (t.split('\n')[0] || 'Connection').trim().slice(0, 40),
        dynamic: t.trim(),
        strength: 'New'
      })
    },
    renderCardBody: r => /*#__PURE__*/React.createElement("div", {
      className: "kit-elc"
    }, /*#__PURE__*/React.createElement(PairAvatars, {
      a: r.a,
      b: r.b,
      size: 32
    }), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__title"
    }, r.a, " & ", r.b), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__meta"
    }, r.type))),
    renderRow: r => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PairAvatars, {
      a: r.a,
      b: r.b,
      size: 26
    }), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__title"
    }, r.a, " & ", r.b), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__meta"
    }, r.type))),
    renderDetail: relationshipDetail
  });
}

/* ── Notes (index: cards or split) ── */
const NOTE_TONE = {
  Idea: 'accent',
  Research: 'minor',
  Todo: 'supporting',
  Reminder: 'main'
};
function noteDetail(n, ctx) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero",
    style: {
      paddingTop: 'var(--sf-sp-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-el-tile"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "note",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sf-hero-eyebrow"
  }, n.kind, " \xB7 ", n.updated), /*#__PURE__*/React.createElement("div", {
    className: "sf-hero__title"
  }, n.title))), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary",
    onClick: () => ctx.onEdit()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Edit")), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card sf-detail-card--full",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__label"
  }, "Note"), /*#__PURE__*/React.createElement("div", {
    className: "sf-detail-card__body"
  }, n.body)));
}
function NotesScreen({
  items,
  onReorder,
  onDelete,
  onAdd,
  onUpdate,
  viewMode,
  pageSize,
  lookups
}) {
  return /*#__PURE__*/React.createElement(ElementIndex, {
    type: "notes",
    title: "Notes",
    items: items,
    getId: n => n.id,
    getName: n => n.title,
    searchText: n => [n.title, n.kind, n.body].join(" "),
    viewMode: viewMode,
    pageSize: pageSize,
    onReorder: onReorder,
    onDelete: onDelete,
    onAdd: onAdd,
    onUpdate: onUpdate,
    lookups: lookups,
    addLabel: "New note",
    importLabel: "Import",
    newForm: {
      title: 'New note',
      icon: 'note',
      fields: [{
        key: 'title',
        label: 'Title',
        required: true,
        placeholder: 'Ending options'
      }, {
        key: 'kind',
        label: 'Kind',
        type: 'select',
        options: ['Idea', 'Research', 'Todo', 'Reminder']
      }, {
        key: 'body',
        label: 'Note',
        type: 'textarea',
        rows: 4,
        full: true
      }],
      build: (v, orig) => ({
        ...(orig || {}),
        id: orig ? orig.id : uid(),
        title: v.title,
        kind: v.kind || 'Idea',
        updated: 'just now',
        body: v.body || ''
      })
    },
    importForm: {
      title: 'Import note',
      hint: 'Paste text. The first line becomes the title (mock import).',
      build: t => ({
        id: uid(),
        title: (t.split('\n')[0] || 'Imported note').trim().slice(0, 50),
        kind: 'Idea',
        updated: 'just now',
        body: t.trim()
      })
    },
    renderCardBody: n => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "kit-elc"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "note",
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__title"
    }, n.title), /*#__PURE__*/React.createElement("div", {
      className: "kit-elc__meta"
    }, n.updated)), /*#__PURE__*/React.createElement("span", {
      className: 'sf-badge sf-badge--' + (NOTE_TONE[n.kind] || 'minor')
    }, n.kind)), /*#__PURE__*/React.createElement("div", {
      className: "kit-note-snip"
    }, n.body)),
    renderRow: n => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "kit-el-tile kit-el-tile--sm"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "note",
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__title"
    }, n.title), /*#__PURE__*/React.createElement("span", {
      className: "sf-split-row__meta"
    }, n.kind))),
    renderDetail: noteDetail
  });
}

/* ── Plot (three-act beat sheet) ── */
function PlotScreen() {
  const acts = window.SFData.plot;
  const all = acts.flatMap(a => a.beats);
  const done = all.filter(b => b.done).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-page-head",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24
    }
  }, "Plot"), /*#__PURE__*/React.createElement("p", {
    className: "kit-sub"
  }, "The story spine \u2014 ", done, " of ", all.length, " beats drafted.")), /*#__PURE__*/React.createElement("button", {
    className: "sf-btn sf-btn--secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 15
  }), " Suggest a beat")), /*#__PURE__*/React.createElement("div", {
    className: "kit-plot"
  }, acts.map(a => /*#__PURE__*/React.createElement("div", {
    className: "kit-plot__act",
    key: a.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-plot__acthd"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-plot__actname"
  }, a.act), /*#__PURE__*/React.createElement("span", {
    className: "kit-plot__actsub"
  }, a.name)), /*#__PURE__*/React.createElement("div", {
    className: "kit-plot__beats"
  }, a.beats.map(b => /*#__PURE__*/React.createElement("div", {
    className: 'kit-plot__beat' + (b.done ? ' kit-plot__beat--done' : ''),
    key: b.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-plot__beathd"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-plot__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "kit-plot__beatname"
  }, b.beat)), /*#__PURE__*/React.createElement("div", {
    className: "kit-plot__note"
  }, b.note), /*#__PURE__*/React.createElement("div", {
    className: "kit-plot__scene"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scenes",
    size: 12
  }), b.scene === '—' ? /*#__PURE__*/React.createElement("span", {
    className: "kit-plot__scene--none"
  }, "No scene yet") : /*#__PURE__*/React.createElement("span", null, b.scene)))))))));
}

/* ── Placeholder for nav items not built out ── */
function Placeholder({
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-empty",
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__title"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "sf-empty__text"
  }, "This surface exists in the full StoryForge product. This UI kit recreates the Project & World, Characters, Corkboard and Story Health screens \u2014 switch to those in the sidebar.")));
}
Object.assign(window, {
  ProjectLibrary,
  ProjectOverview,
  CharactersScreen,
  LocationsScreen,
  GroupsScreen,
  RelationshipsScreen,
  NotesScreen,
  ScenesScreen,
  PlotScreen,
  SettingsScreen,
  HealthScreen,
  ManuscriptScreen,
  TimelineScreen,
  LorebookScreen,
  Placeholder
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storyforge/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CharacterCard = __ds_scope.CharacterCard;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.Loading = __ds_scope.Loading;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TagChips = __ds_scope.TagChips;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Toggle = __ds_scope.Toggle;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.NavItem = __ds_scope.NavItem;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
