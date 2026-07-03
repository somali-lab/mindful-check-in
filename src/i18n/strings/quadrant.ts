// Change-quadrant view: tab, axis/panel labels and editor strings.
// Both languages side by side — a new key must be added to BOTH blocks.
import type { Quadrant } from '../../core/quadrant';

export const quadrant = {
  en: {
    tabQuadrant: 'Quadrant',
    quadrantTitle: 'Change quadrant',
    quadrantIntro:
      'What are you moving away from, and what are you working towards — inside (thoughts, feelings) and outside (behaviour)? Edit the items so the board becomes yours.',
    quadrantInternalFrom: 'Internal · away from',
    quadrantInternalTo: 'Internal · towards',
    quadrantExternalFrom: 'External · away from',
    quadrantExternalTo: 'External · towards',
    quadrantAdd: 'Add an item…',
    quadrantAddBtn: 'Add',
    quadrantEmpty: 'Nothing here yet.',
    ariaQuadrantEdit: 'Edit item',
  },
  nl: {
    tabQuadrant: 'Kwadrant',
    quadrantTitle: 'Veranderkwadrant',
    quadrantIntro:
      'Waar wil je vanaf, en waar wil je naartoe — van binnen (gedachten, gevoelens) en van buiten (gedrag)? Bewerk de items zodat het bord van jou wordt.',
    quadrantInternalFrom: 'Intern · vanaf',
    quadrantInternalTo: 'Intern · naartoe',
    quadrantExternalFrom: 'Extern · vanaf',
    quadrantExternalTo: 'Extern · naartoe',
    quadrantAdd: 'Item toevoegen…',
    quadrantAddBtn: 'Toevoegen',
    quadrantEmpty: 'Nog niets.',
    ariaQuadrantEdit: 'Item bewerken',
  },
} as const;

// First-use example items (deletable/overwritable), seeded in the active
// language when no quadrant has been stored yet. Stored user data afterwards.
export const quadrantSeeds: Record<'en' | 'nl', Quadrant> = {
  en: {
    internalFrom: ['Worrying about things outside my control', '"I can keep going a bit longer"'],
    internalTo: ['Waking up rested', 'Letting feelings be there'],
    externalFrom: ['Working late into the evening', 'Pushing on without breaks'],
    externalTo: ['Short recovery moments during the day', 'Doing a check-in'],
  },
  nl: {
    internalFrom: ['Piekeren over dingen buiten mijn invloed', '"Ik kan nog wel even door"'],
    internalTo: ['Uitgerust wakker worden', 'Gevoelens er laten zijn'],
    externalFrom: ["'s Avonds doorwerken", 'Doorgaan zonder pauzes'],
    externalTo: ['Korte herstelmomenten op de dag', 'Een check-in doen'],
  },
};
