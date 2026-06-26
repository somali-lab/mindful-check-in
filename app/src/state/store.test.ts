import { beforeEach, describe, expect, it } from 'vitest';
import { normalize } from '../core/entry';
import { MemoryRepository, STORAGE_KEYS } from '../infra/storage';
import { Store } from './store';

let repo: MemoryRepository;

beforeEach(() => {
  repo = new MemoryRepository();
});

describe('Store', () => {
  it('starts from defaults when storage is empty', () => {
    const store = new Store(repo);
    expect(store.entries.get()).toEqual({});
    expect(store.settings.get().theme).toBe('system');
  });

  it('loads and normalizes persisted entries', () => {
    repo.write(STORAGE_KEYS.entries, { '2026-01-01': { coreFeeling: 'joy' } });
    const store = new Store(repo);
    const loaded = store.entries.get()['2026-01-01'];
    expect(loaded?.coreFeeling).toBe('joy');
    expect(loaded?.moodScore).toBe(2); // normalized default
  });

  it('saves and deletes entries, persisting and notifying', () => {
    const store = new Store(repo);
    let notified = 0;
    store.entries.subscribe(() => notified++);

    store.saveEntry('2026-02-02', normalize({ coreFeeling: 'love' }));
    expect(store.entries.get()['2026-02-02']?.coreFeeling).toBe('love');
    expect(repo.read(STORAGE_KEYS.entries, {})).toHaveProperty('2026-02-02');

    store.deleteEntry('2026-02-02');
    expect(store.entries.get()['2026-02-02']).toBeUndefined();
    expect(notified).toBe(2);
  });

  it('merges stored settings over defaults and persists saves', () => {
    repo.write(STORAGE_KEYS.settings, { theme: 'dark' });
    const store = new Store(repo);
    expect(store.settings.get().theme).toBe('dark');
    expect(store.settings.get().rowsPerPage).toBe(7);

    store.saveSettings({ ...store.settings.get(), rowsPerPage: 5 });
    expect(store.settings.get().rowsPerPage).toBe(5);
    expect(
      repo.read<{ rowsPerPage: number }>(STORAGE_KEYS.settings, { rowsPerPage: 0 }).rowsPerPage,
    ).toBe(5);
  });
});
