// Change quadrant (ACT matrix): four free-text lists on the internal/external
// × from/towards axes, anchored by a centre — who/what matters to you (your
// values), the vantage point from which you notice which way you are moving.
// Pure domain logic; the language-dependent seed items live in the i18n layer.

export const QUADRANT_KEYS = ['internalFrom', 'internalTo', 'externalFrom', 'externalTo'] as const;
export type QuadrantKey = (typeof QUADRANT_KEYS)[number];

export type Quadrant = Record<QuadrantKey, string[]> & { center: string };

export function emptyQuadrant(): Quadrant {
  return { internalFrom: [], internalTo: [], externalFrom: [], externalTo: [], center: '' };
}

/**
 * Coerce an untrusted (stored/imported) value into a valid Quadrant: each
 * panel must be an array, of which only non-empty strings are kept; the
 * centre must be a string (missing on pre-centre data → '').
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
  if (typeof r.center === 'string') out.center = r.center.trim();
  return out;
}
