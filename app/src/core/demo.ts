// Demo data generator: 30 days of random but valid check-ins (each coreFeeling
// belongs to its wheelType). Returns a fresh EntryMap the caller merges in.
import { bodyZones, moodColors, moodLabels, wheels } from '../data/static';
import { lang } from '../i18n';
import { formatDate, pad2 } from './datetime';
import { normalize } from './entry';
import { computeMoodScore } from './scoring';
import type { Entry, EntryMap, WheelType } from './types';

const THOUGHTS = [
  'Feeling good about today',
  'Worried about work deadline',
  'Had a nice walk',
  'Feeling tired but content',
  'Grateful for small things',
  'Need more rest',
  'Excited about weekend plans',
  'Peaceful morning routine',
  'Happy after exercise',
  'Reflecting on the week',
];
const ACTIONS = [
  'Meditation',
  'Walk outside',
  'Deep breathing',
  'Journaling',
  'Exercise',
  'Read a book',
  'Stretching',
  'Music',
];

const WHEEL_KEYS = Object.keys(wheels) as WheelType[];
const WHEEL_EMOTION_IDS: Record<string, string[]> = {};
for (const key of WHEEL_KEYS) {
  WHEEL_EMOTION_IDS[key] = wheels[key].emotions.map((e) => e.id);
}

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)] as T;

function subset<T>(arr: T[], min: number, max: number): T[] {
  const n = randInt(min, max);
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0] as T);
  }
  return out;
}

function generateEntry(): Entry {
  const wheelType = pick(WHEEL_KEYS);
  const coreFeeling = pick(WHEEL_EMOTION_IDS[wheelType] ?? ['joy']);
  const moodRow = randInt(0, 9);
  const moodCol = randInt(0, 9);
  const labels = moodLabels[lang.get()] || moodLabels.en;
  const partial: Partial<Entry> = {
    thoughts: pick(THOUGHTS),
    wheelType,
    coreFeeling,
    bodySignals: subset(bodyZones, 0, 4),
    energy: { physical: randInt(0, 100), mental: randInt(0, 100), emotional: randInt(0, 100) },
    moodRow,
    moodCol,
    moodLabel: labels[moodRow]?.[moodCol] ?? '',
    moodColor: moodColors[moodRow]?.[moodCol] ?? '',
    actions: subset(ACTIONS, 1, 3).join(', '),
  };
  partial.moodScore = computeMoodScore(partial);
  return normalize(partial);
}

/** 30 days of demo entries (1–2 per day), keyed by timestamped date key. */
export function generateDemoEntries(): EntryMap {
  const out: EntryMap = {};
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const perDay = randInt(1, 2);
    for (let p = 0; p < perDay; p++) {
      const h = randInt(7, 22);
      const m = randInt(0, 59);
      date.setHours(h, m, 0, 0);
      const key = `${formatDate(date)}_${pad2(h)}${pad2(m)}00000`;
      out[key] = generateEntry();
    }
  }
  return out;
}
