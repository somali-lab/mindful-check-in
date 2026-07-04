import { describe, expect, it } from 'vitest';
import { quadrantSeeds } from '../i18n/translations';
import { emptyQuadrant, mergeQuadrant, QUADRANT_KEYS } from './quadrant';

describe('mergeQuadrant', () => {
  it('returns an empty quadrant for non-object input', () => {
    expect(mergeQuadrant(null)).toEqual(emptyQuadrant());
    expect(mergeQuadrant('nope')).toEqual(emptyQuadrant());
    expect(mergeQuadrant(42)).toEqual(emptyQuadrant());
  });

  it('reads plain strings (seeds / pre-strike-through data) as not-done items', () => {
    const q = mergeQuadrant({ internalFrom: ['worry'], externalTo: ['walk', 'check-in'] });
    expect(q.internalFrom).toEqual([{ text: 'worry', done: false }]);
    expect(q.externalTo).toEqual([
      { text: 'walk', done: false },
      { text: 'check-in', done: false },
    ]);
    expect(q.internalTo).toEqual([]);
    expect(q.externalFrom).toEqual([]);
  });

  it('keeps { text, done } items and coerces done to boolean', () => {
    const q = mergeQuadrant({
      internalFrom: [
        { text: 'overcome', done: true },
        { text: 'open', done: 0 },
        { text: 'sloppy' }, // done missing → false
      ],
    });
    expect(q.internalFrom).toEqual([
      { text: 'overcome', done: true },
      { text: 'open', done: false },
      { text: 'sloppy', done: false },
    ]);
  });

  it('drops invalid items and ignores non-array panels and unknown fields', () => {
    const q = mergeQuadrant({
      internalFrom: ['ok', 42, null, '  ', { done: true }, { text: '' }],
      internalTo: 'not an array',
      bogus: ['y'],
    });
    expect(q.internalFrom).toEqual([{ text: 'ok', done: false }]);
    expect(q.internalTo).toEqual([]);
  });

  it('coerces the compass values and migrates a legacy center string', () => {
    expect(mergeQuadrant({ internalFrom: ['x'] }).values).toEqual([]); // pre-compass data
    expect(mergeQuadrant({ values: ['Calm', 7, '  ', 'Health'] }).values).toEqual([
      'Calm',
      'Health',
    ]);
    // The centre-circle era stored one string; it becomes the first value.
    expect(mergeQuadrant({ center: '  my family  ' }).values).toEqual(['my family']);
    expect(mergeQuadrant({ center: '' }).values).toEqual([]);
    // An explicit values array wins over a lingering center field.
    expect(mergeQuadrant({ values: ['A'], center: 'B' }).values).toEqual(['A']);
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

  it('coerces cleanly into not-done items at the boundary', () => {
    for (const lang of ['en', 'nl'] as const) {
      const q = mergeQuadrant(quadrantSeeds[lang]);
      for (const key of QUADRANT_KEYS) {
        expect(q[key]).toEqual(quadrantSeeds[lang][key].map((text) => ({ text, done: false })));
      }
    }
  });
});
