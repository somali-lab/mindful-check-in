import { describe, expect, it } from 'vitest';
import { normalize } from './entry';

describe('normalize', () => {
  it('fills defaults for an empty/null entry', () => {
    const n = normalize(null);
    expect(n.thoughts).toBe('');
    expect(n.coreFeeling).toBe('');
    expect(n.wheelType).toBe('act');
    expect(n.energy).toEqual({ physical: null, mental: null, emotional: null });
    expect(n.bodySignals).toEqual([]);
    expect(n.moodRow).toBe(-1);
    expect(n.moodScore).toBe(2);
    expect(typeof n.id).toBe('string');
  });

  it('copies a provided body-signals array (no aliasing)', () => {
    const source = ['head', 'chest'];
    const n = normalize({ bodySignals: source });
    expect(n.bodySignals).toEqual(source);
    expect(n.bodySignals).not.toBe(source);
  });

  it('preserves explicit zero/false-y numeric fields', () => {
    const n = normalize({ moodRow: 0, moodCol: 0 });
    expect(n.moodRow).toBe(0);
    expect(n.moodCol).toBe(0);
  });

  it('falls back to act for an unknown wheelType (P2)', () => {
    expect(normalize({ wheelType: 'bogus' as never }).wheelType).toBe('act');
    expect(normalize({ wheelType: 'plutchik' }).wheelType).toBe('plutchik');
  });

  it('drops non-numeric weather fields instead of trusting them (P2)', () => {
    const n = normalize({
      weather: {
        temperature: 'warm' as never,
        weathercode: 3,
        windspeed: null as never,
        description: '',
        location: '',
      },
    });
    expect(n.weather?.temperature).toBeUndefined();
    expect(n.weather?.weathercode).toBe(3);
    expect(n.weather?.windspeed).toBeUndefined();
  });
});
