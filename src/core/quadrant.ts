// Change quadrant (ACT matrix): four free-text lists on the internal/external
// × from/towards axes, anchored by a centre — who/what matters to you (your
// values), the vantage point from which you notice which way you are moving.
// Pure domain logic; the language-dependent seed items live in the i18n layer.

export const QUADRANT_KEYS = ['internalFrom', 'internalTo', 'externalFrom', 'externalTo'] as const;
export type QuadrantKey = (typeof QUADRANT_KEYS)[number];

/** One board item; `done` = struck through as overcome/achieved. */
export interface QuadrantItem {
  text: string;
  done: boolean;
}

export type Quadrant = Record<QuadrantKey, QuadrantItem[]>;

/** Authoring shape for seeds and older stored data: plain strings per panel. */
export type QuadrantSeed = Record<QuadrantKey, string[]>;

export function emptyQuadrant(): Quadrant {
  return { internalFrom: [], internalTo: [], externalFrom: [], externalTo: [] };
}

/** True when the board holds no items (e.g. after Clear board). */
export function isQuadrantEmpty(q: Quadrant): boolean {
  return QUADRANT_KEYS.every((key) => q[key].length === 0);
}

function coerceItem(value: unknown): QuadrantItem | null {
  // Pre-strike-through data stored plain strings; read them as not-done items.
  if (typeof value === 'string') {
    return value.trim() === '' ? null : { text: value, done: false };
  }
  if (value && typeof value === 'object') {
    const { text, done } = value as { text?: unknown; done?: unknown };
    if (typeof text === 'string' && text.trim() !== '') return { text, done: Boolean(done) };
  }
  return null;
}

/**
 * Coerce an untrusted (stored/imported/seed) value into a valid Quadrant:
 * panel items may be strings or { text, done } objects; anything else is
 * dropped. Two retired centre-hub shapes migrate into quadrant 1
 * (`internalTo`, who/what matters): a `values` string list (compass chips)
 * and the single `center` string that preceded it.
 */
export function mergeQuadrant(raw: unknown): Quadrant {
  const out = emptyQuadrant();
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  for (const key of QUADRANT_KEYS) {
    const value = r[key];
    if (!Array.isArray(value)) continue;
    out[key] = value.map(coerceItem).filter((v): v is QuadrantItem => v !== null);
  }
  const legacy = Array.isArray(r.values) ? r.values : [r.center];
  for (const value of legacy) {
    const item = coerceItem(value);
    if (item && !out.internalTo.some((it) => it.text === item.text)) out.internalTo.push(item);
  }
  return out;
}
