// Open-Meteo weather + geocoding client. Uses fetch (works from file:// too:
// Open-Meteo sends Access-Control-Allow-Origin: *). Caches the last reading.
import { type Repository, STORAGE_KEYS } from './storage';

export interface CurrentWeather {
  temperature?: number;
  weathercode?: number;
  windspeed?: number;
  is_day?: number;
}

export interface GeoResult {
  lat: number;
  lon: number;
}

interface WeatherCacheEntry {
  ts: number;
  data: CurrentWeather;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export class WeatherService {
  readonly #repo: Repository;

  constructor(repo: Repository) {
    this.#repo = repo;
  }

  /** The cached reading if still fresh, otherwise null. */
  getCached(): CurrentWeather | null {
    const cached = this.#repo.read<WeatherCacheEntry | null>(STORAGE_KEYS.weatherCache, null);
    if (!cached || Date.now() - cached.ts > CACHE_TTL) return null;
    return cached.data;
  }

  async geocode(location: string): Promise<GeoResult | null> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      location,
    )}&count=1`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as {
        results?: Array<{ latitude: number; longitude: number }>;
      };
      const first = data.results?.[0];
      return first ? { lat: first.latitude, lon: first.longitude } : null;
    } catch {
      return null;
    }
  }

  async fetchCurrent(lat: number, lon: number): Promise<CurrentWeather | null> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as { current_weather?: CurrentWeather };
      const cw = data.current_weather;
      if (!cw) return null;
      this.#repo.write(STORAGE_KEYS.weatherCache, { ts: Date.now(), data: cw });
      return cw;
    } catch {
      return null;
    }
  }
}
