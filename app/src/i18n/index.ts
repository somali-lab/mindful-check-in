import { signal } from '../state/signal';
import { type Lang, strings } from './translations';

export type { Lang, StringKey } from './translations';
export { strings } from './translations';

/** The active UI language. Subscribe to react to changes (e.g. re-render). */
export const lang = signal<Lang>('en');

type Dict = Record<string, string | readonly string[]>;

function lookup(dict: Dict, key: string): string | undefined {
  const value = dict[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Translate `key` in the active language, substituting `{param}` placeholders.
 * Falls back to English, then to the raw key when a string is missing/empty.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const active = lang.get();
  let str = lookup(strings[active] as Dict, key) ?? key;
  if (!str) str = key;
  if (str === key && active !== 'en') {
    str = lookup(strings.en as Dict, key) ?? key;
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

/** The localized default quick-action list for a language. */
export function defaultQuickActions(forLang: Lang = lang.get()): string[] {
  const value = (strings[forLang] as Dict).defaultQuickActions;
  return Array.isArray(value) ? [...value] : [];
}
