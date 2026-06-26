import { moodScores } from '../data/static';
import { dateFromKey, formatDate } from './datetime';
import type { EntryMap, ScoreInput, SwingResult, SwingSource, SwingTier, Tier } from './types';

/** Consecutive days with an entry, counting back from today (0 if none today). */
export function calculateStreak(entries: EntryMap): number {
  const keys = Object.keys(entries).sort().reverse();
  let streak = 0;
  const checkDate = new Date();
  for (const key of keys) {
    const kDate = dateFromKey(key);
    if (!kDate) continue;
    const kDay = formatDate(kDate);
    const cDay = formatDate(checkDate);
    if (kDay === cDay) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (kDay < cDay) {
      break;
    }
  }
  return streak;
}

/**
 * Mood score (1–3) for an entry: the mean of whichever signals are present —
 * emotion valence, mood-grid column, and average energy. Neutral (2) if none.
 */
export function computeMoodScore(entry: ScoreInput): number {
  let total = 0;
  let count = 0;

  if (entry.coreFeeling) {
    const s = moodScores[entry.coreFeeling];
    if (s != null) {
      total += s;
      count++;
    }
  }

  if (entry.moodCol != null && entry.moodCol >= 0) {
    total += Math.round((entry.moodCol / 9) * 2 + 1);
    count++;
  }

  if (entry.energy) {
    const values = [entry.energy.physical, entry.energy.mental, entry.energy.emotional].filter(
      (v): v is number => typeof v === 'number' && v >= 0,
    );
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      total += avg >= 67 ? 3 : avg >= 34 ? 2 : 1;
      count++;
    }
  }

  if (count === 0) return 2;
  return Math.round(total / count);
}

/** A 1–3 mood score → coarse tier. */
export const scoreTier = (score: number): Tier =>
  score >= 3 ? 'high' : score >= 2 ? 'mid' : 'low';

/** A 0–100 energy value → coarse tier. */
export const energyTier = (value: number): Tier =>
  value >= 67 ? 'high' : value >= 34 ? 'mid' : 'low';

/** A mood-grid column (0–9 valence) → coarse tier. */
export const valenceTier = (moodCol: number): Tier =>
  moodCol >= 6 ? 'high' : moodCol >= 4 ? 'mid' : 'low';

/** A 0–100 swing score → 1 (very stable) … 6 (extremely variable), six even bands. */
export function swingTier(score: number): SwingTier {
  if (score >= 84) return 6;
  if (score >= 67) return 5;
  if (score >= 51) return 4;
  if (score >= 34) return 3;
  if (score >= 17) return 2;
  return 1;
}

/**
 * Mood variability over a recent window as a 0–100 spread score: the population
 * standard deviation of the per-check-in value, normalized to its theoretical max.
 * `source` selects the signal: wheel (emotion valence 1–3), valence (moodCol 0–9),
 * or arousal (9 − moodRow, 0–9). Returns score=null below two data points.
 */
export function computeSwing(entries: EntryMap, source: SwingSource, days: number): SwingResult {
  const min = source === 'wheel' ? 1 : 0;
  const max = source === 'wheel' ? 3 : 9;

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const series: number[] = [];
  for (const key of Object.keys(entries).sort()) {
    const d = dateFromKey(key);
    if (!d || d < cutoff) continue;
    const e = entries[key];
    if (!e) continue;

    let val: number;
    if (source === 'wheel') {
      const v = e.coreFeeling ? moodScores[e.coreFeeling] : undefined;
      if (v == null) continue;
      val = v;
    } else if (source === 'arousal') {
      if (typeof e.moodRow !== 'number' || e.moodRow < 0) continue;
      val = 9 - e.moodRow;
    } else {
      if (typeof e.moodCol !== 'number' || e.moodCol < 0) continue;
      val = e.moodCol;
    }
    series.push(val);
  }

  if (series.length < 2) {
    return { score: null, count: series.length, series, min, max };
  }

  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const variance = series.reduce((acc, v) => acc + (v - mean) ** 2, 0) / series.length;
  const sd = Math.sqrt(variance);
  const maxSd = (max - min) / 2; // spread is largest when values split between extremes
  const score = Math.round(Math.min(1, sd / maxSd) * 100);

  return { score, count: series.length, series, min, max };
}
