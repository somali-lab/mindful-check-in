// Persistence behind a small interface (Repository pattern). The app talks to
// `Repository`, never to localStorage directly — so the backing store can be
// swapped (e.g. IndexedDB) without touching the domain or state layers.

/** The six localStorage keys. Kept stable for data portability across versions. */
export const STORAGE_KEYS = {
  entries: 'local-mood-tracker-entries',
  settings: 'local-mood-tracker-settings',
  language: 'local-mood-tracker-language',
  activeTab: 'local-mood-tracker-active-tab',
  overviewUI: 'local-mood-tracker-overview-ui',
  weatherCache: 'local-mood-tracker-weather-cache',
} as const;

export interface Repository {
  read<T>(key: string, fallback: T): T;
  write<T>(key: string, value: T): boolean;
  remove(key: string): void;
}

/** localStorage-backed repository. Read/parse failures degrade to the fallback. */
export class LocalStorageRepository implements Repository {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error('[storage] read failed for', key, err);
      return fallback;
    }
  }

  write<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('[storage] write failed for', key, err);
      return false;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error('[storage] remove failed for', key, err);
    }
  }
}

/** In-memory repository for unit tests and non-browser contexts. */
export class MemoryRepository implements Repository {
  readonly #store = new Map<string, string>();

  read<T>(key: string, fallback: T): T {
    const raw = this.#store.get(key);
    if (raw === undefined) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  write<T>(key: string, value: T): boolean {
    this.#store.set(key, JSON.stringify(value));
    return true;
  }

  remove(key: string): void {
    this.#store.delete(key);
  }

  /** Test helper: seed a raw string to exercise the corrupt-data path. */
  seedRaw(key: string, raw: string): void {
    this.#store.set(key, raw);
  }
}
