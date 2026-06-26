// Pure dashboard stats shared by the check-in summary panel and the home view.
import { dateFromKey, formatDate, todayKey } from './datetime';
import { calculateStreak } from './scoring';
import type { Entry, EntryMap } from './types';

export interface SummaryStats {
  total: number;
  streak: number;
  avgScore: string;
  topEmotionId: string;
  hasTodayEntry: boolean;
}

export function computeStats(entries: EntryMap): SummaryStats {
  const keys = Object.keys(entries);
  const today = todayKey();
  let scoreSum = 0;
  let scoreCount = 0;
  let hasTodayEntry = false;
  const counts: Record<string, number> = {};

  for (const key of keys) {
    if (key.startsWith(today)) hasTodayEntry = true;
    const e = entries[key];
    if (!e) continue;
    if (e.moodScore) {
      scoreSum += e.moodScore;
      scoreCount++;
    }
    if (e.coreFeeling) counts[e.coreFeeling] = (counts[e.coreFeeling] || 0) + 1;
  }

  let topEmotionId = '';
  let topCount = 0;
  for (const [id, n] of Object.entries(counts)) {
    if (n > topCount) {
      topCount = n;
      topEmotionId = id;
    }
  }

  return {
    total: keys.length,
    streak: calculateStreak(entries),
    avgScore: scoreCount > 0 ? (scoreSum / scoreCount).toFixed(1) : '—',
    topEmotionId,
    hasTodayEntry,
  };
}

export interface WeekDay {
  date: Date;
  score: number; // 0 = no entry that day
  isToday: boolean;
}

/** The last 7 days (oldest → today), each with its entry's mood score (0 if none). */
export function weekStripDays(entries: EntryMap): WeekDay[] {
  const keys = Object.keys(entries);
  const today = todayKey();
  const days: WeekDay[] = [];
  for (let w = 6; w >= 0; w--) {
    const date = new Date();
    date.setDate(date.getDate() - w);
    const dayKey = formatDate(date);
    const found = keys.find((k) => k.startsWith(dayKey));
    const entry = found ? entries[found] : null;
    days.push({ date, score: entry ? entry.moodScore || 2 : 0, isToday: dayKey === today });
  }
  return days;
}

export interface HeatDay {
  dayKey: string;
  label: string;
  isToday: boolean;
  entry: Entry | null;
  entryKey: string | null;
}

export interface Heatmap {
  leadingSpacers: number;
  days: HeatDay[];
}

/** 28-day calendar grid (oldest → today) with leading spacers to align Monday-first. */
export function buildHeatmapData(entries: EntryMap): Heatmap {
  const keys = Object.keys(entries);
  const today = todayKey();
  const first = new Date();
  first.setDate(first.getDate() - 27);
  const leadingSpacers = (first.getDay() + 6) % 7; // Mon = 0

  const days: HeatDay[] = [];
  for (let d = 27; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dayKey = formatDate(date);
    const entryKey = keys.find((k) => k.startsWith(dayKey)) ?? null;
    days.push({
      dayKey,
      label: `0${date.getDate()}`.slice(-2),
      isToday: dayKey === today,
      entry: entryKey ? entries[entryKey] ?? null : null,
      entryKey,
    });
  }
  return { leadingSpacers, days };
}

/** Whole days between the earliest and latest check-in, or null with < 2 entries. */
export function entrySpanDays(entries: EntryMap): number | null {
  const keys = Object.keys(entries);
  if (keys.length < 2) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const k of keys) {
    const d = dateFromKey(k);
    if (!d) continue;
    const t = d.getTime();
    if (t < min) min = t;
    if (t > max) max = t;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return Math.round((max - min) / 86_400_000);
}
