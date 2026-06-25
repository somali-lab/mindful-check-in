// @ts-check
// Focused unit checks for the pure compute/normalization layer (MCI.* on window).
// These replace the deleted branch-coverage suite: a handful of genuine
// edge-case assertions on logic that the behavioural specs don't exercise,
// rather than ~225 browser-driven tests written to chase a coverage number.
const { test, expect } = require('./fixtures/base');

test.describe('compute + core units', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('normalize fills defaults for an empty/null entry', async ({ page }) => {
    const n = await page.evaluate(() => MCI.normalize(null));
    expect(n.thoughts).toBe('');
    expect(n.coreFeeling).toBe('');
    expect(n.wheelType).toBe('act');
    expect(n.energy).toEqual({ physical: null, mental: null, emotional: null });
    expect(n.bodySignals).toEqual([]);
    expect(n.moodRow).toBe(-1);
    expect(n.moodScore).toBe(2);
    expect(typeof n.id).toBe('string');
  });

  test('computeMoodScore returns neutral (2) when there is no signal', async ({ page }) => {
    const s = await page.evaluate(() => MCI.computeMoodScore(MCI.normalize(null)));
    expect(s).toBe(2);
  });

  test('computeMoodScore reflects a positive emotion, high valence and high energy', async ({ page }) => {
    const s = await page.evaluate(() => MCI.computeMoodScore({
      coreFeeling: 'joy',
      moodCol: 9,
      energy: { physical: 90, mental: 90, emotional: 90 },
    }));
    expect(s).toBe(3);
  });

  test('calculateStreak counts consecutive days back from today', async ({ page }) => {
    const streak = await page.evaluate(() => {
      const fmt = (d) => MCI.formatDate(d);
      const today = new Date();
      const entries = {};
      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        entries[fmt(d)] = MCI.normalize({ coreFeeling: 'joy' });
      }
      return MCI.calculateStreak(entries);
    });
    expect(streak).toBe(3);
  });

  test('calculateStreak is 0 when there is no entry for today', async ({ page }) => {
    const streak = await page.evaluate(() => {
      const d = new Date();
      d.setDate(d.getDate() - 2); // only an entry two days ago
      const entries = {};
      entries[MCI.formatDate(d)] = MCI.normalize({ coreFeeling: 'joy' });
      return MCI.calculateStreak(entries);
    });
    expect(streak).toBe(0);
  });

  test('hasLightBackground applies a luminance threshold and rejects bad input', async ({ page }) => {
    const r = await page.evaluate(() => ({
      white: MCI.hasLightBackground('#ffffff'),
      black: MCI.hasLightBackground('#000000'),
      bad: MCI.hasLightBackground('not-a-hex'),
    }));
    expect(r.white).toBe(true);
    expect(r.black).toBe(false);
    expect(r.bad).toBe(false);
  });

  test('dateFromKey parses both date-only and timestamped keys', async ({ page }) => {
    const r = await page.evaluate(() => {
      const a = MCI.dateFromKey('2026-04-12');
      const b = MCI.dateFromKey('2026-04-12_143052123');
      return { aY: a.getFullYear(), aMonth: a.getMonth(), bH: b.getHours(), bMin: b.getMinutes() };
    });
    expect(r.aY).toBe(2026);
    expect(r.aMonth).toBe(3); // April (0-indexed)
    expect(r.bH).toBe(14);
    expect(r.bMin).toBe(30);
  });

  test('t() substitutes {params} and falls back to the raw key when missing', async ({ page }) => {
    const r = await page.evaluate(() => ({
      unknown: MCI.t('___no_such_key___'),
      withParam: MCI.t('importDone', { count: 7 }),
    }));
    expect(r.unknown).toBe('___no_such_key___');
    expect(r.withParam).toContain('7');
  });

  test('scoreTier / energyTier / valenceTier map values to coarse tiers', async ({ page }) => {
    const r = await page.evaluate(() => ({
      score: [MCI.scoreTier(3), MCI.scoreTier(2), MCI.scoreTier(1)],
      energy: [MCI.energyTier(67), MCI.energyTier(34), MCI.energyTier(33)],
      valence: [MCI.valenceTier(6), MCI.valenceTier(4), MCI.valenceTier(3)],
      swing: [0, 20, 40, 55, 70, 90].map((s) => MCI.swingTier(s)),
    }));
    expect(r.score).toEqual(['high', 'mid', 'low']);
    expect(r.energy).toEqual(['high', 'mid', 'low']);
    expect(r.valence).toEqual(['high', 'mid', 'low']);
    expect(r.swing).toEqual([1, 2, 3, 4, 5, 6]); // six even bands
  });

  test('computeSwing is 0 for a perfectly stable mood and 100 at the extremes', async ({ page }) => {
    const r = await page.evaluate(() => {
      const today = new Date();
      const stable = {}, swingy = {}, matrix = {};
      const ids = ['joy', 'sadness']; // wheel valence 3 and 1
      for (let i = 0; i < 6; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const k = MCI.formatDate(d);
        stable[k] = MCI.normalize({ coreFeeling: 'joy' });
        swingy[k] = MCI.normalize({ coreFeeling: ids[i % 2] });
        // both matrix axes swing between extremes
        matrix[k] = MCI.normalize({ moodRow: i % 2 === 0 ? 9 : 0, moodCol: i % 2 === 0 ? 0 : 9 });
      }
      return {
        stable: MCI.computeSwing(stable, 'wheel', 28).score,
        swingy: MCI.computeSwing(swingy, 'wheel', 28).score,
        valence: MCI.computeSwing(matrix, 'valence', 28).score,
        arousal: MCI.computeSwing(matrix, 'arousal', 28).score,
      };
    });
    expect(r.stable).toBe(0);
    expect(r.swingy).toBe(100);
    expect(r.valence).toBe(100);
    expect(r.arousal).toBe(100);
  });

  test('computeSwing is null below two data points and respects the window', async ({ page }) => {
    const r = await page.evaluate(() => {
      const today = new Date();
      const one = {};
      one[MCI.formatDate(today)] = MCI.normalize({ coreFeeling: 'joy' });

      const windowed = {};
      for (let i = 0; i < 2; i++) { const d = new Date(today); d.setDate(d.getDate() - i); windowed[MCI.formatDate(d)] = MCI.normalize({ moodRow: 5, moodCol: 5 }); }
      const old = new Date(today); old.setDate(old.getDate() - 60);
      windowed[MCI.formatDate(old)] = MCI.normalize({ moodRow: 5, moodCol: 9 });

      return {
        one: MCI.computeSwing(one, 'wheel', 28),
        windowCount: MCI.computeSwing(windowed, 'valence', 7).count,
      };
    });
    expect(r.one.score).toBeNull();
    expect(r.one.count).toBe(1);
    expect(r.windowCount).toBe(2); // the 60-day-old entry is outside the 7-day window
  });
});
