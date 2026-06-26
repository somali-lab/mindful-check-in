import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRepository, STORAGE_KEYS } from './storage';
import { WeatherService } from './weather';

const okJson = (body: unknown): Response => ({ ok: true, json: async () => body }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WeatherService.geocode', () => {
  it('returns the first result coordinates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okJson({ results: [{ latitude: 52.37, longitude: 4.9 }] })),
    );
    const svc = new WeatherService(new MemoryRepository());
    expect(await svc.geocode('Amsterdam')).toEqual({ lat: 52.37, lon: 4.9 });
  });

  it('returns null for empty results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okJson({ results: [] })),
    );
    const svc = new WeatherService(new MemoryRepository());
    expect(await svc.geocode('Nowhere')).toBeNull();
  });

  it('returns null on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    const svc = new WeatherService(new MemoryRepository());
    expect(await svc.geocode('Amsterdam')).toBeNull();
  });
});

describe('WeatherService.fetchCurrent', () => {
  it('parses current_weather and caches it', async () => {
    const repo = new MemoryRepository();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okJson({ current_weather: { temperature: 14, weathercode: 1 } })),
    );
    const svc = new WeatherService(repo);
    const cw = await svc.fetchCurrent(52.37, 4.9);
    expect(cw?.temperature).toBe(14);
    expect(svc.getCached()?.weathercode).toBe(1);
    expect(repo.read(STORAGE_KEYS.weatherCache, null)).not.toBeNull();
  });

  it('returns null when the payload lacks current_weather', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okJson({ current: {} })),
    );
    const svc = new WeatherService(new MemoryRepository());
    expect(await svc.fetchCurrent(0, 0)).toBeNull();
  });
});

describe('WeatherService.getCached (P2 hardening)', () => {
  it('returns the cached reading while fresh', () => {
    const repo = new MemoryRepository();
    repo.write(STORAGE_KEYS.weatherCache, { ts: Date.now(), data: { temperature: 20 } });
    expect(new WeatherService(repo).getCached()?.temperature).toBe(20);
  });

  it('returns null for an expired cache entry', () => {
    const repo = new MemoryRepository();
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    repo.write(STORAGE_KEYS.weatherCache, { ts: twoHoursAgo, data: { temperature: 20 } });
    expect(new WeatherService(repo).getCached()).toBeNull();
  });

  it('returns null for a corrupt cache entry instead of garbage', () => {
    const repo = new MemoryRepository();
    repo.write(STORAGE_KEYS.weatherCache, { ts: 'soon', data: 42 });
    expect(new WeatherService(repo).getCached()).toBeNull();
  });
});
