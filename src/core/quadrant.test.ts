import { describe, expect, it } from 'vitest';
import { quadrantSeeds } from '../i18n/translations';
import { emptyQuadrant, isQuadrantEmpty, mergeQuadrant, QUADRANT_KEYS } from './quadrant';

describe('isQuadrantEmpty', () => {
  it('is true for a fresh empty board and false once anything is on it', () => {
    expect(isQuadrantEmpty(emptyQuadrant())).toBe(true);
    expect(
      isQuadrantEmpty({ ...emptyQuadrant(), externalTo: [{ text: 'Walk', done: false }] }),
    ).toBe(false);
    expect(isQuadrantEmpty(mergeQuadrant(quadrantSeeds.nl))).toBe(false);
  });
});

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

  it('migrates retired centre-hub data (values list, center string) into quadrant 1', () => {
    expect(mergeQuadrant({ internalFrom: ['x'] }).internalTo).toEqual([]); // nothing legacy
    expect(mergeQuadrant({ values: ['Calm', 7, '  ', 'Health'] }).internalTo).toEqual([
      { text: 'Calm', done: false },
      { text: 'Health', done: false },
    ]);
    expect(mergeQuadrant({ center: 'my family' }).internalTo).toEqual([
      { text: 'my family', done: false },
    ]);
    // Values merge after existing items, without duplicating identical text.
    const q = mergeQuadrant({ internalTo: ['Calm', 'Rest'], values: ['Calm', 'Health'] });
    expect(q.internalTo.map((i) => i.text)).toEqual(['Calm', 'Rest', 'Health']);
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
