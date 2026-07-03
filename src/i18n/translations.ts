// UI strings (EN + NL), aggregated from one module per screen/domain under
// ./strings/. Any new user-facing string must be added to BOTH language blocks
// of the matching domain module — tsc guards key parity via the merged type.
import { body } from './strings/body';
import { checkin } from './strings/checkin';
import { emotions } from './strings/emotions';
import { home } from './strings/home';
import { info } from './strings/info';
import { overview } from './strings/overview';
import { quadrant } from './strings/quadrant';
import { settings } from './strings/settings';
import { shell } from './strings/shell';

export { quadrantSeeds } from './strings/quadrant';

export type Lang = 'en' | 'nl';

export const strings = {
  en: {
    ...shell.en,
    ...emotions.en,
    ...body.en,
    ...checkin.en,
    ...home.en,
    ...overview.en,
    ...quadrant.en,
    ...settings.en,
    ...info.en,
  },
  nl: {
    ...shell.nl,
    ...emotions.nl,
    ...body.nl,
    ...checkin.nl,
    ...home.nl,
    ...overview.nl,
    ...quadrant.nl,
    ...settings.nl,
    ...info.nl,
  },
} as const;

export type StringKey = keyof (typeof strings)['en'];

// Seed values for settings.quickActions. Not part of `strings`: they are copied
// into the user's stored settings once (not looked up live via t()), but they
// are language content, so they live in the i18n layer with the other EN/NL text.
// This module is pure data — importing it does not pull in the lang signal.
export const defaultQuickActions: Record<Lang, readonly string[]> = {
  en: [
    'Walk',
    'Meditate',
    'Call a friend',
    'Early night',
    'Breathing',
    'Journal',
    'Stretch',
    'Go outside',
  ],
  nl: [
    'Wandeling',
    'Mediteren',
    'Vriend bellen',
    'Vroeg slapen',
    'Ademhaling',
    'Journaling',
    'Stretchen',
    'Naar buiten',
  ],
};
