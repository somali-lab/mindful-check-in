import { describe, expect, it } from 'vitest';
import { defaultSettings, mergeSettings } from './settings';

describe('defaultSettings', () => {
  it('produces the expected baseline', () => {
    const s = defaultSettings('en');
    expect(s.theme).toBe('system');
    expect(s.logo).toBe('wolf');
    expect(s.rowsPerPage).toBe(7);
    expect(s.components.weather).toBe(true);
    expect(s.reminderDays).toEqual([1, 2, 3, 4, 5]);
    expect(s.quickActions).toContain('Walk');
  });
});

describe('mergeSettings', () => {
  it('returns defaults for non-object input', () => {
    expect(mergeSettings(null).theme).toBe('system');
    expect(mergeSettings('nope').rowsPerPage).toBe(7);
  });

  it('overlays provided top-level fields', () => {
    const s = mergeSettings({ theme: 'dark', rowsPerPage: 5 });
    expect(s.theme).toBe('dark');
    expect(s.rowsPerPage).toBe(5);
    expect(s.overviewMaxChars).toBe(120); // untouched default
  });

  it('merges components per flag and coerces to boolean', () => {
    const s = mergeSettings({ components: { weather: false, note: 1 } });
    expect(s.components.weather).toBe(false);
    expect(s.components.note).toBe(true);
    expect(s.components.thoughts).toBe(true); // default kept
  });

  it('migrates the retired logo3 value to wolf', () => {
    expect(mergeSettings({ logo: 'logo3' }).logo).toBe('wolf');
  });

  it('coerces wrong-typed fields to the default type (P2)', () => {
    const s = mergeSettings({
      rowsPerPage: 'lots', // non-number → default kept
      reminderInterval: 90, // valid number → used
      reminderDays: 'mon', // non-array → default kept
      quickActions: ['Walk', 42, 'Rest'], // mixed array → strings only
    });
    expect(s.rowsPerPage).toBe(7);
    expect(s.reminderInterval).toBe(90);
    expect(s.reminderDays).toEqual([1, 2, 3, 4, 5]);
    expect(s.quickActions).toEqual(['Walk', 'Rest']);
  });
});
