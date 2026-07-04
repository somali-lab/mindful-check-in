// The app's single source of truth: reactive entries + settings, persisted
// through a Repository. UI subscribes to the signals; mutations go through the
// methods here (which persist, then update the signals). The Store is also the
// only writer for the remaining storage keys (language, overview UI state) —
// components never see the Repository.
import { normalize } from '../core/entry';
import { mergeQuadrant, type Quadrant } from '../core/quadrant';
import { defaultSettings, mergeSettings, type Settings } from '../core/settings';
import type { Entry, EntryMap } from '../core/types';
import { type Lang, quadrantSeeds } from '../i18n/translations';
import { type Repository, STORAGE_KEYS } from '../infra/storage';
import { type ReadonlySignal, signal } from './signal';

export class Store {
  readonly #repo: Repository;
  readonly #entries = signal<EntryMap>({});
  readonly #settings = signal<Settings>(defaultSettings());
  readonly #quadrant = signal<Quadrant>(mergeQuadrant(null));
  // Pulses true when a persist write fails (e.g. localStorage quota); the shell
  // subscribes to surface a warning so a save isn't silently lost on reload.
  readonly #persistError = signal<boolean>(false);

  constructor(repo: Repository) {
    this.#repo = repo;
    this.#settings.set(mergeSettings(this.#repo.read(STORAGE_KEYS.settings, null)));
    this.#entries.set(this.#readEntries());
    // First use (key absent): show the example items for the stored language.
    // Not persisted until the user edits, so it stays a soft default. Both
    // paths run through mergeQuadrant (seeds are authored as plain strings).
    const rawQuadrant = this.#repo.read<unknown>(STORAGE_KEYS.quadrant, null);
    this.#quadrant.set(
      mergeQuadrant(rawQuadrant === null ? quadrantSeeds[this.loadLanguage()] : rawQuadrant),
    );
  }

  get entries(): ReadonlySignal<EntryMap> {
    return this.#entries;
  }

  get settings(): ReadonlySignal<Settings> {
    return this.#settings;
  }

  get persistError(): ReadonlySignal<boolean> {
    return this.#persistError;
  }

  get quadrant(): ReadonlySignal<Quadrant> {
    return this.#quadrant;
  }

  #flagWrite(ok: boolean): void {
    // Edge-trigger: reset then set, so identical consecutive failures still notify.
    if (!ok) {
      this.#persistError.set(false);
      this.#persistError.set(true);
    }
  }

  #readEntries(): EntryMap {
    const raw = this.#repo.read<unknown>(STORAGE_KEYS.entries, {});
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: EntryMap = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      out[key] = normalize(value as Partial<Entry>);
    }
    return out;
  }

  #persistEntries(map: EntryMap): void {
    this.#flagWrite(this.#repo.write(STORAGE_KEYS.entries, map));
    this.#entries.set(map);
  }

  saveEntry(key: string, entry: Entry): void {
    const map = { ...this.#entries.get() };
    map[key] = { ...entry, updatedAt: new Date().toISOString() };
    this.#persistEntries(map);
  }

  deleteEntry(key: string): void {
    const map = { ...this.#entries.get() };
    delete map[key];
    this.#persistEntries(map);
  }

  replaceAllEntries(map: EntryMap): void {
    this.#persistEntries({ ...map });
  }

  saveSettings(next: Settings): void {
    this.#flagWrite(this.#repo.write(STORAGE_KEYS.settings, next));
    this.#settings.set(next);
  }

  saveQuadrant(next: Quadrant): void {
    this.#flagWrite(this.#repo.write(STORAGE_KEYS.quadrant, next));
    this.#quadrant.set(next);
  }

  loadLanguage(): Lang {
    return this.#repo.read<unknown>(STORAGE_KEYS.language, 'en') === 'nl' ? 'nl' : 'en';
  }

  saveLanguage(next: Lang): void {
    this.#flagWrite(this.#repo.write(STORAGE_KEYS.language, next));
  }

  /** Persisted overview-table UI state (search/filter/sort/page); shape owned by the view. */
  loadOverviewUI<T>(fallback: T): T {
    return this.#repo.read<T>(STORAGE_KEYS.overviewUI, fallback);
  }

  saveOverviewUI(state: unknown): void {
    this.#flagWrite(this.#repo.write(STORAGE_KEYS.overviewUI, state));
  }

  /** Remove every persisted key (Info → "Clear all data"). */
  clearAllData(): void {
    for (const key of Object.values(STORAGE_KEYS)) this.#repo.remove(key);
    // Retired write-only key from before the router became purely hash-driven.
    this.#repo.remove('local-mood-tracker-active-tab');
  }
}
