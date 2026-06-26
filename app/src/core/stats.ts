// Pure dashboard stats shared by the check-in summary panel and the home view.
import { formatDate, todayKey } from './datetime';
import { calculateStreak } from './scoring';
import type { EntryMap } from './types';

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
