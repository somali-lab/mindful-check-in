// Debug/test bridge: exposes the pure core + static data on window.MCI so the
// existing Playwright unit specs (core-units.spec.js) can call them in-page.
// Deliberately exposes only pure functions + read-only data — no store handle,
// so there is no global mutation surface.
import { hasLightBackground } from '../../core/color';
import { dateFromKey, formatDate } from '../../core/datetime';
import { normalize } from '../../core/entry';
import {
  calculateStreak,
  computeMoodScore,
  computeSwing,
  energyTier,
  scoreTier,
  swingTier,
  valenceTier,
} from '../../core/scoring';
import {
  bodyZones,
  moodColors,
  moodLabels,
  moodScores,
  weatherCodes,
  wheels,
  zoneKeys,
} from '../../data/static';
import { t } from '../../i18n';

declare global {
  interface Window {
    MCI?: unknown;
  }
}

export function exposeBridge(): void {
  window.MCI = {
    normalize,
    computeMoodScore,
    calculateStreak,
    hasLightBackground,
    dateFromKey,
    formatDate,
    t,
    scoreTier,
    energyTier,
    valenceTier,
    swingTier,
    computeSwing,
    Data: { wheels, moodScores, moodLabels, weatherCodes, bodyZones, zoneKeys, moodColors },
  };
}
