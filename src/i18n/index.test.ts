import { afterEach, describe, expect, it } from 'vitest';
import { emotionLabel, setLang, strings, t, tDynamic, weekdayHeaders } from './index';

afterEach(() => setLang('en'));

describe('t', () => {
  it('substitutes {params} and falls back to the raw key when missing', () => {
    expect(tDynamic('___no_such_key___')).toBe('___no_such_key___');
    expect(t('importDone', { count: 7 })).toContain('7');
  });

  it('returns the active language string', () => {
    expect(t('tabOverview')).toBe('Overview');
    setLang('nl');
    expect(t('tabOverview')).toBe('Overzicht');
  });

  it('falls back to English when a key is missing in the active language', () => {
    // Translations ship at full parity, so temporarily drop a NL key to exercise
    // the NL→EN fallback branch, then restore it.
    const nl = strings.nl as Record<string, unknown>;
    const saved = nl.tabOverview;
    delete nl.tabOverview;
    try {
      setLang('nl');
      expect(t('tabOverview')).toBe('Overview'); // English fallback, not the raw key
    } finally {
      nl.tabOverview = saved;
    }
  });
});

describe('emotionLabel', () => {
  it('localizes a known emotion id in the active language', () => {
    expect(emotionLabel('joy')).toBe('Joy');
    setLang('nl');
    expect(emotionLabel('joy')).toBe('Vreugde');
  });

  it('returns an empty string for an empty id', () => {
    expect(emotionLabel('')).toBe('');
  });
});

describe('weekdayHeaders', () => {
  it('returns 7 Monday-first headers in the active language', () => {
    expect(weekdayHeaders()).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setLang('nl');
    expect(weekdayHeaders()).toEqual(['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']);
  });
});

describe('translation parity', () => {
  it('NL and EN expose exactly the same keys', () => {
    const en = Object.keys(strings.en).sort();
    const nl = Object.keys(strings.nl).sort();
    expect(nl).toEqual(en);
  });

  it('fills NL exactly where EN is filled (no half-translated keys)', () => {
    // An intentionally-blank label (e.g. moodAxisValence) is fine as long as it
    // is blank in BOTH languages; what must never happen is a key filled in one
    // language but forgotten in the other.
    const en = strings.en as Record<string, string | readonly string[]>;
    const nl = strings.nl as Record<string, string | readonly string[]>;
    const isEmpty = (v: string | readonly string[]): boolean => v.length === 0;
    for (const key of Object.keys(en)) {
      expect(isEmpty(nl[key] ?? ''), `nl.${key} emptiness differs from en.${key}`).toBe(
        isEmpty(en[key] ?? ''),
      );
    }
  });
});
