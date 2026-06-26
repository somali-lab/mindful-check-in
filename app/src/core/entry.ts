import type { Energy, Entry, EntryWeather, WheelType } from './types';

const WHEEL_TYPES: WheelType[] = ['act', 'plutchik', 'ekman', 'junto', 'extended'];
const isWheelType = (v: unknown): v is WheelType =>
  typeof v === 'string' && (WHEEL_TYPES as string[]).includes(v);
const finite = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

/** RFC4122 v4 id, native where available with a deterministic-shape fallback. */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Fill every missing field of a (possibly partial/untrusted) entry with a safe default. */
export function normalize(entry: Partial<Entry> | null | undefined): Entry {
  const e: Partial<Entry> = entry && typeof entry === 'object' ? entry : {};

  const rawE = e.energy;
  const energy: Energy =
    rawE && typeof rawE === 'object'
      ? {
          physical: typeof rawE.physical === 'number' ? rawE.physical : null,
          mental: typeof rawE.mental === 'number' ? rawE.mental : null,
          emotional: typeof rawE.emotional === 'number' ? rawE.emotional : null,
        }
      : { physical: null, mental: null, emotional: null };

  let weather: EntryWeather | null = null;
  if (e.weather && typeof e.weather === 'object') {
    weather = {
      temperature: finite(e.weather.temperature),
      weathercode: finite(e.weather.weathercode),
      windspeed: finite(e.weather.windspeed),
      description: e.weather.description || '',
      location: e.weather.location || '',
    };
  }

  return {
    id: e.id || uid(),
    thoughts: e.thoughts || '',
    coreFeeling: e.coreFeeling || '',
    wheelType: isWheelType(e.wheelType) ? e.wheelType : 'act',
    customFeelings: e.customFeelings || '',
    energy,
    energyNote: e.energyNote || '',
    bodySignals: Array.isArray(e.bodySignals) ? [...e.bodySignals] : [],
    bodyNote: e.bodyNote || '',
    moodRow: e.moodRow != null ? e.moodRow : -1,
    moodCol: e.moodCol != null ? e.moodCol : -1,
    moodLabel: e.moodLabel || '',
    moodColor: e.moodColor || '',
    actions: e.actions || '',
    note: e.note || '',
    weather,
    moodScore: e.moodScore || 2,
    updatedAt: e.updatedAt || new Date().toISOString(),
  };
}
