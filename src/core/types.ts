// Domain types — the shared vocabulary of the app's core.

export type WheelType = 'act' | 'plutchik' | 'ekman' | 'junto' | 'extended';

export interface Energy {
  physical: number | null;
  mental: number | null;
  emotional: number | null;
}

export interface EntryWeather {
  // Explicit `| undefined` so normalize() can write a coerced-or-undefined value
  // under exactOptionalPropertyTypes.
  temperature?: number | undefined;
  weathercode?: number | undefined;
  windspeed?: number | undefined;
  description: string;
  location: string;
}

/** A single check-in, fully normalized (see {@link normalize}). */
export interface Entry {
  id: string;
  thoughts: string;
  coreFeeling: string;
  wheelType: WheelType;
  customFeelings: string;
  energy: Energy;
  energyNote: string;
  bodySignals: string[];
  bodyNote: string;
  moodRow: number;
  moodCol: number;
  moodLabel: string;
  moodColor: string;
  actions: string;
  note: string;
  weather: EntryWeather | null;
  moodScore: number;
  updatedAt: string;
}

/** All entries, keyed by date or timestamp key (YYYY-MM-DD[_HHMMSSmmm]). */
export type EntryMap = Record<string, Entry>;

export type Tier = 'high' | 'mid' | 'low';
export type SwingTier = 1 | 2 | 3 | 4 | 5 | 6;

/** Which signal a mood-variability ("swing") computation reads. */
export type SwingSource = 'wheel' | 'valence' | 'arousal';

export interface SwingResult {
  score: number | null;
  count: number;
  series: number[];
  min: number;
  max: number;
}

/** The minimal shape {@link computeMoodScore} needs. */
export interface ScoreInput {
  coreFeeling?: string;
  moodCol?: number;
  energy?: Energy | null;
}
