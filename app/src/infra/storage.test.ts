import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageRepository, MemoryRepository } from './storage';

function fakeLocalStorage(overrides: Partial<Storage> = {}): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
    ...overrides,
  } as Storage;
}

describe('MemoryRepository', () => {
  it('returns the fallback for a missing key', () => {
    const repo = new MemoryRepository();
    expect(repo.read('missing', { n: 1 })).toEqual({ n: 1 });
  });

  it('round-trips a written value', () => {
    const repo = new MemoryRepository();
    repo.write('k', { a: [1, 2], b: 'x' });
    expect(repo.read('k', null)).toEqual({ a: [1, 2], b: 'x' });
  });

  it('removes a key', () => {
    const repo = new MemoryRepository();
    repo.write('k', 1);
    repo.remove('k');
    expect(repo.read('k', 'fallback')).toBe('fallback');
  });

  it('degrades to the fallback on corrupt data', () => {
    const repo = new MemoryRepository();
    repo.seedRaw('k', '{ not json');
    expect(repo.read('k', 42)).toBe(42);
  });
});

describe('LocalStorageRepository (P3 coverage)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('round-trips a value through localStorage', () => {
    vi.stubGlobal('localStorage', fakeLocalStorage());
    const repo = new LocalStorageRepository();
    repo.write('k', { a: 1 });
    expect(repo.read('k', null)).toEqual({ a: 1 });
  });

  it('returns the fallback for a missing key and for invalid JSON', () => {
    const ls = fakeLocalStorage();
    vi.stubGlobal('localStorage', ls);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const repo = new LocalStorageRepository();
    expect(repo.read('missing', 7)).toBe(7);
    ls.setItem('bad', '{ not json');
    expect(repo.read('bad', 7)).toBe(7);
  });

  it('returns false from write when setItem throws (e.g. quota exceeded)', () => {
    vi.stubGlobal(
      'localStorage',
      fakeLocalStorage({
        setItem: () => {
          throw new DOMException('quota', 'QuotaExceededError');
        },
      }),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(new LocalStorageRepository().write('k', 1)).toBe(false);
  });
});
