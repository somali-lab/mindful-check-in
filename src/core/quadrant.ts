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

export type Quadrant = Record<QuadrantKey, QuadrantItem[]> & { values: string[] };

/** Authoring shape for seeds and older stored data: plain strings per panel. */
export type QuadrantSeed = Record<QuadrantKey, string[]> & { values: string[] };

export function emptyQuadrant(): Quadrant {
  return { internalFrom: [], internalTo: [], externalFrom: [], externalTo: [], values: [] };
}

/** True when the board holds no items and no values (e.g. after Clear board). */
export function isQuadrantEmpty(q: Quadrant): boolean {
  return q.values.length === 0 && QUADRANT_KEYS.every((key) => q[key].length === 0);
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
 * dropped. The compass holds a list of values; data from before the chips
 * stored a single `center` string, which becomes the first value.
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
  if (Array.isArray(r.values)) {
    out.values = r.values.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
  } else if (typeof r.center === 'string' && r.center.trim() !== '') {
    out.values = [r.center.trim()];
  }
  return out;
}
