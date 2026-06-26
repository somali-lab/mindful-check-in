// The app's single source of truth: reactive entries + settings, persisted
// through a Repository. UI subscribes to the signals; mutations go through the
// methods here (which persist, then update the signals).
import { normalize } from '../core/entry';
import { defaultSettings, mergeSettings, type Settings } from '../core/settings';
import type { Entry, EntryMap } from '../core/types';
import { type Repository, STORAGE_KEYS } from '../infra/storage';
import { type ReadonlySignal, signal } from './signal';

export class Store {
  readonly #repo: Repository;
  readonly #entries = signal<EntryMap>({});
  readonly #settings = signal<Settings>(defaultSettings());

  constructor(repo: Repository) {
    this.#repo = repo;
    this.#settings.set(mergeSettings(this.#repo.read(STORAGE_KEYS.settings, null)));
    this.#entries.set(this.#readEntries());
  }

  get entries(): ReadonlySignal<EntryMap> {
    return this.#entries;
  }

  get settings(): ReadonlySignal<Settings> {
    return this.#settings;
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
    this.#repo.write(STORAGE_KEYS.entries, map);
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
    this.#repo.write(STORAGE_KEYS.settings, next);
    this.#settings.set(next);
  }
}
