import { signal } from '../state/signal';
import { type Lang, strings } from './translations';

export type { Lang, StringKey } from './translations';
export { strings } from './translations';

/** The active UI language. Subscribe to react to changes (e.g. re-render). */
export const lang = signal<Lang>('en');

type Dict = Record<string, string>;

function lookup(dict: Dict, key: string): string | undefined {
  return dict[key] || undefined;
}

/**
 * Translate `key` in the active language, substituting `{param}` placeholders.
 * Falls back to English, then to the raw key when a string is missing/empty.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const active = lang.get();
  // `|| key` so a missing OR empty-string translation falls through to the key,
  // which then triggers the English fallback below.
  let str = lookup(strings[active] as Dict, key) || key;
  if (str === key && active !== 'en') {
    str = lookup(strings.en as Dict, key) || key;
  }
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      str = str.replaceAll(`{${name}}`, String(value));
    }
  }
  return str;
}

export function setLang(next: Lang): void {
  lang.set(next);
}

/** Localized label for an emotion id (e.g. "joy" → `t('emJoy')`), falling back to the id. */
export function emotionLabel(id: string): string {
  return (id ? t(`em${id.charAt(0).toUpperCase()}${id.slice(1)}`) : '') || id;
}

// Monday-first; reuses the reminder-day labels so the weekday strings live in one place.
const WEEKDAY_KEYS = [
  'reminderDayMon',
  'reminderDayTue',
  'reminderDayWed',
  'reminderDayThu',
  'reminderDayFri',
  'reminderDaySat',
  'reminderDaySun',
] as const;

/** Monday-first short weekday headers for the heatmap grids, in the active language. */
export function weekdayHeaders(): string[] {
  return WEEKDAY_KEYS.map((k) => t(k));
}
