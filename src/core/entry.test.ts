import { describe, expect, it } from 'vitest';
import { isWheelType, normalize, uid, WHEEL_TYPES } from './entry';

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

describe('isWheelType', () => {
  it('accepts exactly the five known variants', () => {
    expect(WHEEL_TYPES).toHaveLength(5);
    for (const w of WHEEL_TYPES) expect(isWheelType(w)).toBe(true);
  });

  it('rejects unknown strings and non-strings', () => {
    for (const bad of ['', 'bogus', 'ACT', 123, null, undefined, {}, []]) {
      expect(isWheelType(bad)).toBe(false);
    }
  });
});

describe('uid', () => {
  it('returns unique v4-shaped ids', () => {
    const a = uid();
    const b = uid();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(a).not.toBe(b);
  });
});
