import { describe, expect, it } from 'vitest';
import { dateFromKey, formatDate, formatTime, timestampKey, todayKey } from './datetime';

describe('dateFromKey', () => {
  it('parses both date-only and timestamped keys', () => {
    const a = dateFromKey('2026-04-12');
    const b = dateFromKey('2026-04-12_143052123');
    expect(a?.getFullYear()).toBe(2026);
    expect(a?.getMonth()).toBe(3); // April (0-indexed)
    expect(b?.getHours()).toBe(14);
    expect(b?.getMinutes()).toBe(30);
  });

  it('returns null for an empty key', () => {
    expect(dateFromKey('')).toBeNull();
  });

  it('returns null for malformed keys instead of an Invalid Date (D5)', () => {
    for (const bad of ['garbage', '2026-13', 'xxxx-xx-xx', '2026-ab-12']) {
      expect(dateFromKey(bad)).toBeNull();
    }
  });
});

describe('formatDate', () => {
  it('zero-pads month and day', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('formatTime', () => {
  it('zero-pads hours and minutes', () => {
    expect(formatTime(new Date(2026, 3, 12, 9, 5))).toBe('09:05');
    expect(formatTime(new Date(2026, 3, 12, 14, 30))).toBe('14:30');
  });
});

describe('timestampKey', () => {
  it('produces a today-prefixed YYYY-MM-DD_HHMMSSmmm key', () => {
    const k = timestampKey();
    expect(k).toMatch(/^\d{4}-\d{2}-\d{2}_\d{9}$/);
    expect(k.startsWith(todayKey())).toBe(true);
  });
});
