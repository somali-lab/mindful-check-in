import { describe, expect, it } from 'vitest';
import { quadrantSeeds } from '../i18n/translations';
import { emptyQuadrant, mergeQuadrant, QUADRANT_KEYS } from './quadrant';

describe('mergeQuadrant', () => {
  it('returns an empty quadrant for non-object input', () => {
    expect(mergeQuadrant(null)).toEqual(emptyQuadrant());
    expect(mergeQuadrant('nope')).toEqual(emptyQuadrant());
    expect(mergeQuadrant(42)).toEqual(emptyQuadrant());
  });

  it('keeps valid panels and defaults missing ones', () => {
    const q = mergeQuadrant({ internalFrom: ['worry'], externalTo: ['walk', 'check-in'] });
    expect(q.internalFrom).toEqual(['worry']);
    expect(q.externalTo).toEqual(['walk', 'check-in']);
    expect(q.internalTo).toEqual([]);
    expect(q.externalFrom).toEqual([]);
  });

  it('filters non-string and blank items and ignores non-array panels', () => {
    const q = mergeQuadrant({
      internalFrom: ['ok', 42, null, '  ', 'also ok'],
      internalTo: 'not an array',
    });
    expect(q.internalFrom).toEqual(['ok', 'also ok']);
    expect(q.internalTo).toEqual([]);
  });

  it('ignores unknown extra fields', () => {
    const q = mergeQuadrant({ internalFrom: ['x'], bogus: ['y'] });
    expect(q).toEqual({ ...emptyQuadrant(), internalFrom: ['x'] });
  });
});

describe('quadrantSeeds', () => {
  it('provides non-empty example items for every panel in both languages', () => {
    for (const lang of ['en', 'nl'] as const) {
      for (const key of QUADRANT_KEYS) {
        expect(quadrantSeeds[lang][key].length, `${lang}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('survives the storage boundary coercion unchanged', () => {
    expect(mergeQuadrant(quadrantSeeds.en)).toEqual(quadrantSeeds.en);
    expect(mergeQuadrant(quadrantSeeds.nl)).toEqual(quadrantSeeds.nl);
  });
});
