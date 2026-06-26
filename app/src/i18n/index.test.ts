import { afterEach, describe, expect, it } from 'vitest';
import { defaultQuickActions, lang, setLang, strings, t } from './index';

afterEach(() => setLang('en'));

describe('t', () => {
  it('substitutes {params} and falls back to the raw key when missing', () => {
    expect(t('___no_such_key___')).toBe('___no_such_key___');
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

describe('defaultQuickActions', () => {
  it('returns the localized list', () => {
    expect(defaultQuickActions('en')).toContain('Walk');
    expect(defaultQuickActions('nl')).toContain('Wandeling');
  });

  it('tracks the active language by default', () => {
    setLang('nl');
    expect(lang.get()).toBe('nl');
    expect(defaultQuickActions()).toContain('Wandeling');
  });
});
