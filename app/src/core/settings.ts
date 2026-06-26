import { defaultQuickActions, type Lang } from '../i18n';
import type { WheelType } from './types';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type LogoChoice = 'mindful' | 'cat' | 'wolf';

export interface ComponentVisibility {
  weather: boolean;
  thoughts: boolean;
  coreFeeling: boolean;
  bodySignals: boolean;
  energyPhysical: boolean;
  energyMental: boolean;
  energyEmotional: boolean;
  moodMatrix: boolean;
  actions: boolean;
  note: boolean;
}

export interface WeatherCoords {
  lat: number;
  lon: number;
  name: string;
}

export interface Settings {
  defaultLanguage: Lang;
  theme: ThemeChoice;
  logo: LogoChoice;
  defaultWheelType: WheelType;
  rowsPerPage: number;
  overviewMaxChars: number;
  toastDuration: number;
  energyEmotionalLabel: string;
  weatherLocation: string;
  weatherCoords: WeatherCoords | null;
  isDefaultQuickActions: boolean;
  quickActions: string[];
  components: ComponentVisibility;
  reminderEnabled: boolean;
  reminderInterval: number;
  reminderDays: number[];
  reminderStartHour: number;
  reminderEndHour: number;
  reminderCustomTitle: string;
  reminderCustomBody: string;
}

export function defaultSettings(forLang?: Lang): Settings {
  return {
    defaultLanguage: 'en',
    theme: 'system',
    logo: 'wolf',
    defaultWheelType: 'act',
    rowsPerPage: 7,
    overviewMaxChars: 120,
    toastDuration: 4,
    energyEmotionalLabel: 'social',
    weatherLocation: 'Amsterdam',
    weatherCoords: null,
    isDefaultQuickActions: true,
    quickActions: defaultQuickActions(forLang),
    components: {
      weather: true,
      thoughts: true,
      coreFeeling: true,
      bodySignals: true,
      energyPhysical: true,
      energyMental: true,
      energyEmotional: true,
      moodMatrix: true,
      actions: true,
      note: true,
    },
    reminderEnabled: false,
    reminderInterval: 120,
    reminderDays: [1, 2, 3, 4, 5],
    reminderStartHour: 8,
    reminderEndHour: 18,
    reminderCustomTitle: '',
    reminderCustomBody: '',
  };
}

/**
 * Merge a stored (possibly partial/untrusted) settings object over the defaults.
 * Each field is coerced to the type of its default (numbers must be finite,
 * arrays keep only same-typed elements, booleans are forced) so a corrupt or
 * hand-edited import can't smuggle a wrong-typed value into a typed `Settings`.
 * `components` is merged per flag; the retired `logo3` value migrates to `wolf`.
 */
export function mergeSettings(raw: unknown): Settings {
  const defs = defaultSettings();
  if (!raw || typeof raw !== 'object') return defs;
  const r = raw as Record<string, unknown>;

  const out = { ...defs };
  const outRec = out as unknown as Record<string, unknown>;
  const defsRec = defs as unknown as Record<string, unknown>;

  for (const key of Object.keys(defs)) {
    if (key === 'components') continue;
    const def = defsRec[key];
    const val = r[key];
    if (val === undefined) continue;

    if (Array.isArray(def)) {
      if (!Array.isArray(val)) continue;
      const numeric = typeof (def as unknown[])[0] === 'number';
      outRec[key] = numeric
        ? val.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
        : val.filter((v): v is string => typeof v === 'string');
    } else if (typeof def === 'number') {
      if (typeof val === 'number' && Number.isFinite(val)) outRec[key] = val;
    } else if (typeof def === 'boolean') {
      outRec[key] = Boolean(val);
    } else if (typeof def === 'string') {
      if (typeof val === 'string') outRec[key] = val;
    } else if (val === null || typeof val === 'object') {
      // object-valued field (weatherCoords): accept null or a plain object.
      outRec[key] = val;
    }
  }

  const rawComponents = (r.components ?? {}) as Record<string, unknown>;
  const components = { ...defs.components };
  for (const flag of Object.keys(defs.components) as (keyof ComponentVisibility)[]) {
    if (rawComponents[flag] !== undefined) components[flag] = Boolean(rawComponents[flag]);
  }
  out.components = components;

  if ((out.logo as string) === 'logo3') out.logo = 'wolf';
  return out;
}
