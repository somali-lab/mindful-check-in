// Persistence behind a small interface (Repository pattern). The app talks to
// `Repository`, never to localStorage directly — so the backing store can be
// swapped (e.g. IndexedDB) without touching the domain or state layers.

/** The five localStorage keys. Kept stable for data portability across versions. */
export const STORAGE_KEYS = {
  entries: 'local-mood-tracker-entries',
  settings: 'local-mood-tracker-settings',
  language: 'local-mood-tracker-language',
  overviewUI: 'local-mood-tracker-overview-ui',
  weatherCache: 'local-mood-tracker-weather-cache',
} as const;

export interface Repository {
  read<T>(key: string, fallback: T): T;
  write<T>(key: string, value: T): boolean;
  remove(key: string): void;
}

// ── Versioned envelope ──────────────────────────────────────────────────────
// Every value is stored as `{ v, data }` so a future shape change is a numbered
// migration instead of an ever-growing pile of coercions. Values written before
// the envelope existed are read as version 1 (they share its shape).

/** Bump when a key's stored shape changes, and add the upgrade step below. */
const SCHEMA_VERSION = 1;

/** `MIGRATIONS[n]` upgrades data of version n to version n + 1. */
const MIGRATIONS: Record<number, (data: unknown) => unknown> = {
  // None yet — version 1 is the initial versioned format.
};

function isEnvelope(value: unknown): value is { v: number; data: unknown } {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as { v?: unknown }).v === 'number' &&
    'data' in value
  );
}

function wrap(value: unknown): string {
  return JSON.stringify({ v: SCHEMA_VERSION, data: value });
}

function unwrap(parsed: unknown): unknown {
  const env = isEnvelope(parsed) ? parsed : { v: 1, data: parsed };
  let { v } = env;
  let { data } = env;
  while (v < SCHEMA_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) break;
    data = step(data);
    v += 1;
  }
  return data;
}

// ────────────────────────────────────────────────────────────────────────────

/** localStorage-backed repository. Read/parse failures degrade to the fallback. */
export class LocalStorageRepository implements Repository {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return unwrap(JSON.parse(raw)) as T;
    } catch (err) {
      console.error('[storage] read failed for', key, err);
      return fallback;
    }
  }

  write<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, wrap(value));
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
      return unwrap(JSON.parse(raw)) as T;
    } catch {
      return fallback;
    }
  }

  write<T>(key: string, value: T): boolean {
    this.#store.set(key, wrap(value));
    return true;
  }

  remove(key: string): void {
    this.#store.delete(key);
  }

  /** Test helper: seed a raw string to exercise legacy/corrupt-data paths. */
  seedRaw(key: string, raw: string): void {
    this.#store.set(key, raw);
  }
}
