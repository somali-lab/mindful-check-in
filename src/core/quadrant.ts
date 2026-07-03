// Change quadrant: four free-text lists on the internal/external ×
// from/towards axes (a personal "moving away from → working towards" board).
// Pure domain logic; the language-dependent seed items live in the i18n layer.

export const QUADRANT_KEYS = ['internalFrom', 'internalTo', 'externalFrom', 'externalTo'] as const;
export type QuadrantKey = (typeof QUADRANT_KEYS)[number];

export type Quadrant = Record<QuadrantKey, string[]>;

export function emptyQuadrant(): Quadrant {
  return { internalFrom: [], internalTo: [], externalFrom: [], externalTo: [] };
}

/**
 * Coerce an untrusted (stored/imported) value into a valid Quadrant: each
 * panel must be an array, of which only non-empty strings are kept.
 */
export function mergeQuadrant(raw: unknown): Quadrant {
  const out = emptyQuadrant();
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  for (const key of QUADRANT_KEYS) {
    const value = r[key];
    if (!Array.isArray(value)) continue;
    out[key] = value.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
  }
  return out;
}
