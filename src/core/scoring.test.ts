import { describe, expect, it } from 'vitest';
import { formatDate } from './datetime';
import { normalize } from './entry';
import {
  calculateStreak,
  computeMoodScore,
  computeSwing,
  energyTier,
  scoreTier,
  swingTier,
  valenceTier,
} from './scoring';
import type { EntryMap } from './types';

const keyDaysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

describe('computeMoodScore', () => {
  it('returns neutral (2) when there is no signal', () => {
    expect(computeMoodScore(normalize(null))).toBe(2);
  });

  it('reflects a positive emotion, high valence and high energy', () => {
    expect(
      computeMoodScore({
        coreFeeling: 'joy',
        moodCol: 9,
        energy: { physical: 90, mental: 90, emotional: 90 },
      }),
    ).toBe(3);
  });
});

describe('calculateStreak', () => {
  it('counts consecutive days back from today', () => {
    const entries: EntryMap = {};
    for (let i = 0; i < 3; i++) entries[keyDaysAgo(i)] = normalize({ coreFeeling: 'joy' });
    expect(calculateStreak(entries)).toBe(3);
  });

  it('is 0 when there is no entry for today', () => {
    const entries: EntryMap = { [keyDaysAgo(2)]: normalize({ coreFeeling: 'joy' }) };
    expect(calculateStreak(entries)).toBe(0);
  });
});

describe('tiers', () => {
  it('map values to coarse tiers', () => {
    expect([scoreTier(3), scoreTier(2), scoreTier(1)]).toEqual(['high', 'mid', 'low']);
    expect([energyTier(67), energyTier(34), energyTier(33)]).toEqual(['high', 'mid', 'low']);
    expect([valenceTier(6), valenceTier(4), valenceTier(3)]).toEqual(['high', 'mid', 'low']);
    expect([0, 20, 40, 55, 70, 90].map(swingTier)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('computeSwing', () => {
  it('is 0 for a perfectly stable mood and 100 at the extremes', () => {
    const stable: EntryMap = {};
    const swingy: EntryMap = {};
    const matrix: EntryMap = {};
    const ids = ['joy', 'sadness']; // wheel valence 3 and 1
    for (let i = 0; i < 6; i++) {
      const k = keyDaysAgo(i);
      stable[k] = normalize({ coreFeeling: 'joy' });
      swingy[k] = normalize({ coreFeeling: ids[i % 2] ?? 'sadness' });
      matrix[k] = normalize({ moodRow: i % 2 === 0 ? 9 : 0, moodCol: i % 2 === 0 ? 0 : 9 });
    }
    expect(computeSwing(stable, 'wheel', 28).score).toBe(0);
    expect(computeSwing(swingy, 'wheel', 28).score).toBe(100);
    expect(computeSwing(matrix, 'valence', 28).score).toBe(100);
    expect(computeSwing(matrix, 'arousal', 28).score).toBe(100);
  });

  it('is null below two data points and respects the window', () => {
    const one: EntryMap = { [keyDaysAgo(0)]: normalize({ coreFeeling: 'joy' }) };
    const windowed: EntryMap = {
      [keyDaysAgo(0)]: normalize({ moodRow: 5, moodCol: 5 }),
      [keyDaysAgo(1)]: normalize({ moodRow: 5, moodCol: 5 }),
      [keyDaysAgo(60)]: normalize({ moodRow: 5, moodCol: 9 }),
    };
    const onResult = computeSwing(one, 'wheel', 28);
    expect(onResult.score).toBeNull();
    expect(onResult.count).toBe(1);
    expect(computeSwing(windowed, 'valence', 7).count).toBe(2);
  });
});
