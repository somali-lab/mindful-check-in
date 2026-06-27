import { describe, expect, it } from 'vitest';
import { formatDate } from './datetime';
import { normalize } from './entry';
import { buildHeatmapData, computeStats, entrySpanDays, weekStripDays } from './stats';
import type { EntryMap } from './types';

const keyDaysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

describe('computeStats', () => {
  it('returns empty defaults for no entries', () => {
    expect(computeStats({})).toEqual({
      total: 0,
      streak: 0,
      avgScore: '—',
      topEmotionId: '',
      hasTodayEntry: false,
    });
  });

  it('aggregates total, average, most-frequent emotion and today flag', () => {
    const entries: EntryMap = {
      [keyDaysAgo(0)]: normalize({ coreFeeling: 'joy', moodScore: 3 }),
      [keyDaysAgo(1)]: normalize({ coreFeeling: 'joy', moodScore: 1 }),
      [keyDaysAgo(2)]: normalize({ coreFeeling: 'sadness', moodScore: 2 }),
    };
    const s = computeStats(entries);
    expect(s.total).toBe(3);
    expect(s.avgScore).toBe('2.0'); // (3 + 1 + 2) / 3
    expect(s.topEmotionId).toBe('joy'); // appears twice
    expect(s.hasTodayEntry).toBe(true);
    expect(s.streak).toBe(3); // three consecutive days back from today
  });

  it('reports no today entry (and zero streak) when the newest is yesterday', () => {
    const s = computeStats({ [keyDaysAgo(1)]: normalize({ coreFeeling: 'joy' }) });
    expect(s.hasTodayEntry).toBe(false);
    expect(s.streak).toBe(0);
    expect(s.avgScore).toBe('2.0'); // normalize defaults moodScore to 2
  });
});

describe('weekStripDays', () => {
  it('returns 7 days oldest→today with scores and a today flag', () => {
    const entries: EntryMap = {
      [keyDaysAgo(0)]: normalize({ moodScore: 3 }),
      [keyDaysAgo(3)]: normalize({ moodScore: 1 }),
    };
    const days = weekStripDays(entries);
    expect(days).toHaveLength(7);
    expect(days[0]?.date.getTime()).toBeLessThan(days[6]?.date.getTime() ?? 0);
    expect(days[6]?.isToday).toBe(true);
    expect(days[6]?.score).toBe(3); // today's entry
    expect(days[3]?.score).toBe(1); // entry from 3 days ago (index 6 - 3)
    expect(days[5]?.score).toBe(0); // no entry that day
  });
});

describe('buildHeatmapData', () => {
  it('builds a 28-day grid with aligned spacers and entry lookups', () => {
    const entries: EntryMap = { [keyDaysAgo(0)]: normalize({ moodScore: 3 }) };
    const hm = buildHeatmapData(entries);
    expect(hm.days).toHaveLength(28);
    expect(hm.leadingSpacers).toBeGreaterThanOrEqual(0);
    expect(hm.leadingSpacers).toBeLessThanOrEqual(6);

    const last = hm.days[27];
    expect(last?.isToday).toBe(true);
    expect(last?.entry).not.toBeNull();
    expect(last?.entryKey).toBe(keyDaysAgo(0));
    expect(last?.label).toMatch(/^\d{2}$/);

    const first = hm.days[0];
    expect(first?.entry).toBeNull(); // 27 days ago — no entry
    expect(first?.entryKey).toBeNull();
  });
});

describe('entrySpanDays', () => {
  it('is null with fewer than two entries', () => {
    expect(entrySpanDays({})).toBeNull();
    expect(entrySpanDays({ [keyDaysAgo(0)]: normalize({}) })).toBeNull();
  });

  it('measures whole days between the earliest and latest entry', () => {
    const span = entrySpanDays({
      [keyDaysAgo(0)]: normalize({}),
      [keyDaysAgo(5)]: normalize({}),
    });
    expect(span).toBe(5);
  });

  it('rounds a same-day span (two timestamped keys) down to 0', () => {
    const span = entrySpanDays({
      '2026-04-12_080000000': normalize({}),
      '2026-04-12_180000000': normalize({}),
    });
    expect(span).toBe(0);
  });
});
