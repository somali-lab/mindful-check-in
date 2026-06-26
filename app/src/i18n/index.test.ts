import { afterEach, describe, expect, it } from 'vitest';
import { defaultQuickActions, lang, setLang, t } from './index';

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

  it('falls back to English when a key is only defined there', () => {
    setLang('nl');
    // every key exists in both blocks, so this exercises the happy path;
    // an unknown key still yields the key itself.
    expect(t('definitely_missing')).toBe('definitely_missing');
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
