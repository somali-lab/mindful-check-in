import { describe, expect, it } from 'vitest';
import { wheels } from '../data/static';
import { generateDemoEntries } from './demo';
import type { WheelType } from './types';

// Allowed emotion ids per wheel, derived from the data the generator itself
// uses — so the test can never drift from the real wheel definitions.
const WHEEL_KEYS = Object.keys(wheels) as WheelType[];
const allowedEmotions = (type: WheelType): string[] => wheels[type].emotions.map((e) => e.id);

describe('generateDemoEntries', () => {
  it('produces at least 20 entries spanning ~30 days', () => {
    const entries = generateDemoEntries('en');
    // 30 days × 1–2 per day, so always ≥ 30 in practice; assert a safe floor.
    expect(Object.keys(entries).length).toBeGreaterThanOrEqual(20);
  });

  it('every entry has a known wheelType (en + nl)', () => {
    for (const lang of ['en', 'nl'] as const) {
      for (const [key, entry] of Object.entries(generateDemoEntries(lang))) {
        expect(
          WHEEL_KEYS,
          `${lang} entry ${key}: unknown wheelType "${entry.wheelType}"`,
        ).toContain(entry.wheelType);
      }
    }
  });

  it("every entry's coreFeeling belongs to its own wheelType", () => {
    for (const [key, entry] of Object.entries(generateDemoEntries('en'))) {
      const allowed = allowedEmotions(entry.wheelType);
      expect(
        allowed,
        `entry ${key}: coreFeeling "${entry.coreFeeling}" not in ${entry.wheelType} [${allowed}]`,
      ).toContain(entry.coreFeeling);
    }
  });

  it('uses more than one wheel type across the dataset', () => {
    const types = new Set(Object.values(generateDemoEntries('en')).map((e) => e.wheelType));
    expect(types.size, `only found: ${[...types].join(', ')}`).toBeGreaterThanOrEqual(2);
  });

  it('shows emotion variety within at least one wheel type', () => {
    const byWheel = new Map<string, Set<string>>();
    for (const entry of Object.values(generateDemoEntries('en'))) {
      const set = byWheel.get(entry.wheelType) ?? new Set<string>();
      set.add(entry.coreFeeling);
      byWheel.set(entry.wheelType, set);
    }
    const maxVariety = Math.max(...[...byWheel.values()].map((s) => s.size));
    expect(maxVariety).toBeGreaterThanOrEqual(2);
  });
});
