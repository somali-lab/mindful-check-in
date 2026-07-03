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
    internalFrom: [
      'Ruminating (esp. about loved ones) → no influence',
      '"Oh, I can go on a bit longer" (picking up work that isn\'t yours)',
      'Putting out fires',
      'Losing the overview',
      'Reduced concentration',
      'Short fuse / irritation',
      '"Oh shit, how will today go?"',
    ],
    internalTo: [
      'Less tired → waking up rested',
      'Effective',
      'Mental calm',
      '"Not mine" (circle of influence)',
      'Recognising the limits of helpfulness — also with emotions',
      'Letting emotions in (welcoming them)',
      'Positive feeling',
      '"If it doesn\'t work, it doesn\'t work"',
    ],
    externalFrom: [
      'Reading fiction',
      'Pushing on',
      '"Holding the ball under water"',
      'Working in the evening',
      'Avoiding negative consequences (→ can put it down again)',
      'Making lists',
      'Yawning a lot when getting up',
    ],
    externalTo: [
      'Short recovery moments: cycling, gaming, walking, playing with the cats',
      'Going to bed on time',
      'Leaving the sweets',
      'Expressing emotions / being moved — verbally and non-verbally',
      'Doing check-in moments',
    ],
  },
  nl: {
    internalFrom: [
      'Piekeren (m.n. om de naasten) → geen invloed',
      '"Oh, kan nog wel even" (werk pakken dat niet van jou is)',
      'Brandjes blussen',
      'Overzicht kwijtraken',
      '−/− concentratie',
      'Kort lontje / irritatie',
      '"Oh shit, hoe vandaag?"',
    ],
    internalTo: [
      'Minder moe → uitgerust wakker',
      'Effectief',
      'Mentale rust',
      '"Niet van mij" (cirkel van invloed)',
      'Grenzen van hulpvaardigheid (h)erkennen — ook m.b.t. emoties',
      'Emoties toelaten (/verwelkomen)',
      'Positief gevoel',
      '"Gaat het niet, dan gaat het niet"',
    ],
    externalFrom: [
      'Fictieve boeken lezen',
      'Doorgaan',
      '"Bal onder water"',
      "'s Avonds werken",
      'Vermijden van negatieve consequenties (→ kan het ook weer wegleggen)',
      'Lijstjes maken',
      'Veelal gapen bij opstaan',
    ],
    externalTo: [
      'Korte herstelmomenten: o.a. fietsen, gamen, wandelen, met katten spelen',
      'Op tijd naar bed',
      'Snoep laten liggen',
      'Emoties uiten / geraakt zijn — o.a. verbaal als non-verbaal',
      'Incheckmomenten doen',
    ],
  },
};
