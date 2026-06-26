import { describe, expect, it } from 'vitest';
import { MemoryRepository } from './storage';

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
