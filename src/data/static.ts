// Static data: emotion wheels, mood grid, weather codes, body zones.
// Pure data + two deterministic generators — no DOM, no side effects.
import type { WheelType } from '../core/types';
import type { StringKey } from '../i18n/translations';

export interface WheelEmotion {
  id: string;
  tKey: StringKey;
}
export interface Wheel {
  labelKey: StringKey;
  emotions: WheelEmotion[];
  colors: string[];
}

export const wheels: Record<WheelType, Wheel> = {
  act: {
    labelKey: 'wheelACT',
    emotions: [
      { id: 'joy', tKey: 'emJoy' },
      { id: 'serenity', tKey: 'emSerenity' },
      { id: 'love', tKey: 'emLove' },
      { id: 'acceptance', tKey: 'emAcceptance' },
      { id: 'sadness', tKey: 'emSadness' },
      { id: 'melancholy', tKey: 'emMelancholy' },
      { id: 'anger', tKey: 'emAnger' },
      { id: 'aggression', tKey: 'emAggression' },
    ],
    colors: [
      '#d6a85c',
      '#9aa86a',
      '#cf9aa6',
      '#93aab5',
      '#8593ad',
      '#9c92b0',
      '#c47158',
      '#c98a5a',
    ],
  },
  plutchik: {
    labelKey: 'wheelPlutchik',
    emotions: [
      { id: 'joy', tKey: 'emJoy' },
      { id: 'trust', tKey: 'emTrust' },
      { id: 'fear', tKey: 'emFear' },
      { id: 'surprise', tKey: 'emSurprise' },
      { id: 'sadness', tKey: 'emSadness' },
      { id: 'disgust', tKey: 'emDisgust' },
      { id: 'anger', tKey: 'emAnger' },
      { id: 'anticipation', tKey: 'emAnticipation' },
    ],
    colors: [
      '#d6a85c',
      '#8fb39a',
      '#7f7ba2',
      '#d9bd72',
      '#8593ad',
      '#a7a86a',
      '#c47158',
      '#cf9a6b',
    ],
  },
  ekman: {
    labelKey: 'wheelEkman',
    emotions: [
      { id: 'joy', tKey: 'emJoy' },
      { id: 'sadness', tKey: 'emSadness' },
      { id: 'anger', tKey: 'emAnger' },
      { id: 'fear', tKey: 'emFear' },
      { id: 'surprise', tKey: 'emSurprise' },
      { id: 'disgust', tKey: 'emDisgust' },
    ],
    colors: ['#d6a85c', '#8593ad', '#c47158', '#7f7ba2', '#d9bd72', '#a7a86a'],
  },
  junto: {
    labelKey: 'wheelJunto',
    emotions: [
      { id: 'love', tKey: 'emLove' },
      { id: 'joy', tKey: 'emJoy' },
      { id: 'surprise', tKey: 'emSurprise' },
      { id: 'anger', tKey: 'emAnger' },
      { id: 'sadness', tKey: 'emSadness' },
      { id: 'fear', tKey: 'emFear' },
    ],
    colors: ['#cf9aa6', '#d6a85c', '#d9bd72', '#c47158', '#8593ad', '#7f7ba2'],
  },
  extended: {
    labelKey: 'wheelExtended',
    emotions: [
      { id: 'joy', tKey: 'emJoy' },
      { id: 'love', tKey: 'emLove' },
      { id: 'trust', tKey: 'emTrust' },
      { id: 'surprise', tKey: 'emSurprise' },
      { id: 'curiosity', tKey: 'emCuriosity' },
      { id: 'anticipation', tKey: 'emAnticipation' },
      { id: 'anxiety', tKey: 'emAnxiety' },
      { id: 'fear', tKey: 'emFear' },
      { id: 'sadness', tKey: 'emSadness' },
      { id: 'disgust', tKey: 'emDisgust' },
      { id: 'anger', tKey: 'emAnger' },
      { id: 'shame', tKey: 'emShame' },
    ],
    colors: [
      '#d6a85c',
      '#cf9aa6',
      '#8fb39a',
      '#d9bd72',
      '#7fa6a6',
      '#cf9a6b',
      '#9a8fb0',
      '#7f7ba2',
      '#8593ad',
      '#a7a86a',
      '#c47158',
      '#b1906f',
    ],
  },
};

export const moodScores: Record<string, number> = {
  joy: 3,
  serenity: 3,
  love: 3,
  acceptance: 3,
  trust: 3,
  happiness: 3,
  contentment: 3,
  excitement: 3,
  pride: 3,
  gratitude: 3,
  curiosity: 3,
  surprise: 2,
  anticipation: 2,
  melancholy: 2,
  anxiety: 2,
  sadness: 1,
  anger: 1,
  aggression: 1,
  fear: 1,
  disgust: 1,
  shame: 1,
  guilt: 1,
};

export const zoneKeys: Record<string, StringKey> = {
  head: 'zoneHead',
  neck: 'zoneNeck',
  chest: 'zoneChest',
  abdomen: 'zoneAbdomen',
  'left-shoulder': 'zoneLeftShoulder',
  'right-shoulder': 'zoneRightShoulder',
  'left-upper-arm': 'zoneLeftUpperArm',
  'right-upper-arm': 'zoneRightUpperArm',
  'left-elbow': 'zoneLeftElbow',
  'right-elbow': 'zoneRightElbow',
  'left-forearm': 'zoneLeftForearm',
  'right-forearm': 'zoneRightForearm',
  'left-hand': 'zoneLeftHand',
  'right-hand': 'zoneRightHand',
  'left-hip': 'zoneLeftHip',
  'right-hip': 'zoneRightHip',
  'left-upper-leg': 'zoneLeftUpperLeg',
  'right-upper-leg': 'zoneRightUpperLeg',
  'left-knee': 'zoneLeftKnee',
  'right-knee': 'zoneRightKnee',
  'left-lower-leg': 'zoneLeftLowerLeg',
  'right-lower-leg': 'zoneRightLowerLeg',
  'left-foot': 'zoneLeftFoot',
  'right-foot': 'zoneRightFoot',
  'upper-back': 'zoneUpperBack',
  'lower-back': 'zoneLowerBack',
};

/** Body-signal zone ids, in display order — derived from {@link zoneKeys} (single source). */
export const bodyZones: string[] = Object.keys(zoneKeys);

export interface MoodLabels {
  en: string[][];
  nl: string[][];
}

export const moodLabels: MoodLabels = {
  en: [
    [
      'Furious',
      'Panicked',
      'Stressed',
      'Nervous',
      'Shocked',
      'Surprised',
      'Cheerful',
      'Festive',
      'Excited',
      'Ecstatic',
    ],
    [
      'Pissed',
      'Irate',
      'Frustrated',
      'Tense',
      'Bewildered',
      'Hyper',
      'Upbeat',
      'Motivated',
      'Inspired',
      'Delighted',
    ],
    [
      'Indignant',
      'Afraid',
      'Angry',
      'Anxious',
      'Restless',
      'Energized',
      'Lively',
      'Elated',
      'Optimistic',
      'Enthusiastic',
    ],
    [
      'Fearful',
      'Worried',
      'Concerned',
      'Irritated',
      'Annoyed',
      'Pleased',
      'Focused',
      'Happy',
      'Proud',
      'Moved',
    ],
    [
      'Aversion',
      'Uneasy',
      'Worried',
      'Uncomfortable',
      'Touched',
      'Cheerful',
      'Joyful',
      'Hopeful',
      'Playful',
      'Happy',
    ],
    [
      'Disgusted',
      'Gloomy',
      'Disappointed',
      'Sad',
      'Apathetic',
      'At ease',
      'Compliant',
      'Content',
      'Loving',
      'Fulfilled',
    ],
    [
      'Pessimistic',
      'Grumpy',
      'Discouraged',
      'Sorrowful',
      'Bored',
      'Calm',
      'Safe',
      'Satisfied',
      'Grateful',
      'Touched',
    ],
    [
      'Alienated',
      'Miserable',
      'Lonely',
      'Defeated',
      'Tired',
      'Relaxed',
      'Meditative',
      'Peaceful',
      'Blessed',
      'Balanced',
    ],
    [
      'Despondent',
      'Depressed',
      'Sullen',
      'Exhausted',
      'Depleted',
      'Gentle',
      'Thoughtful',
      'Tranquil',
      'Comfortable',
      'Carefree',
    ],
    [
      'Desperate',
      'Hopeless',
      'Desolate',
      'Burned out',
      'Drained',
      'Sleepy',
      'Content',
      'Serene',
      'Cozy',
      'Serene',
    ],
  ],
  nl: [
    [
      'Woedend',
      'In paniek',
      'Gestrest',
      'Zenuwachtig',
      'Geschokt',
      'Verrast',
      'Vrolijk',
      'Feestelijk',
      'Opgewonden',
      'Extatisch',
    ],
    [
      'Pissig',
      'Driftig',
      'Gefrustreerd',
      'Gespannen',
      'Verbijsterd',
      'Hyper',
      'Opgewekt',
      'Gemotiveerd',
      'Geinspireerd',
      'Verrukt',
    ],
    [
      'Verbolgen',
      'Bang',
      'Boos',
      'Nerveus',
      'Rusteloos',
      'Opgeladen',
      'Levendig',
      'Opgetogen',
      'Optimistisch',
      'Enthousiast',
    ],
    [
      'Angstig',
      'Ongerust',
      'Bezorgd',
      'Geirriteerd',
      'Geergerd',
      'Verheugd',
      'Gefocust',
      'Blij',
      'Trots',
      'Ontroerd',
    ],
    [
      'Aversie',
      'Onrustig',
      'Bezorgd',
      'Ongemakkelijk',
      'Geraakt',
      'Monter',
      'Vreugdevol',
      'Hoopvol',
      'Speels',
      'Gelukkig',
    ],
    [
      'Walgend',
      'Somber',
      'Teleurgesteld',
      'Verdrietig',
      'Apathisch',
      'Op je gemak',
      'Meegaand',
      'Content',
      'Liefdevol',
      'Vervuld',
    ],
    [
      'Pessimistisch',
      'Chagrijnig',
      'Ontmoedigd',
      'Bedroefd',
      'Verveeld',
      'Kalm',
      'Veilig',
      'Tevreden',
      'Dankbaar',
      'Bewogen',
    ],
    [
      'Vervreemd',
      'Ellendig',
      'Eenzaam',
      'Verslagen',
      'Moe',
      'Ontspannen',
      'Meditatief',
      'Vredig',
      'Gezegend',
      'In balans',
    ],
    [
      'Moedeloos',
      'Depressief',
      'Nors',
      'Uitgeput',
      'Leeg',
      'Mild',
      'Bedachtzaam',
      'Rustig',
      'Comfortabel',
      'Zorgeloos',
    ],
    [
      'Wanhopig',
      'Hopeloos',
      'Troosteloos',
      'Opgebrand',
      'Leeggezogen',
      'Slaperig',
      'Voldaan',
      'Serene',
      'Knus',
      'Serene',
    ],
  ],
};

export interface WeatherCode {
  desc: { en: string; nl: string };
  emoji: string;
}

// Open-Meteo returns only a numeric WMO code; the label is resolved locally per language.
export const weatherCodes: Record<number, WeatherCode> = {
  0: { desc: { en: 'Clear sky', nl: 'Onbewolkt' }, emoji: '☀️' },
  1: { desc: { en: 'Mainly clear', nl: 'Overwegend helder' }, emoji: '🌤️' },
  2: { desc: { en: 'Partly cloudy', nl: 'Half bewolkt' }, emoji: '⛅' },
  3: { desc: { en: 'Overcast', nl: 'Zwaarbewolkt' }, emoji: '☁️' },
  45: { desc: { en: 'Fog', nl: 'Mist' }, emoji: '🌫️' },
  48: { desc: { en: 'Depositing rime fog', nl: 'Rijpmist' }, emoji: '🌫️' },
  51: { desc: { en: 'Light drizzle', nl: 'Lichte motregen' }, emoji: '🌦️' },
  53: { desc: { en: 'Moderate drizzle', nl: 'Matige motregen' }, emoji: '🌦️' },
  55: { desc: { en: 'Dense drizzle', nl: 'Dichte motregen' }, emoji: '🌧️' },
  56: { desc: { en: 'Freezing drizzle', nl: 'Aanvriezende motregen' }, emoji: '❄️' },
  57: { desc: { en: 'Heavy freezing drizzle', nl: 'Zware aanvriezende motregen' }, emoji: '❄️' },
  61: { desc: { en: 'Slight rain', nl: 'Lichte regen' }, emoji: '🌧️' },
  63: { desc: { en: 'Moderate rain', nl: 'Matige regen' }, emoji: '🌧️' },
  65: { desc: { en: 'Heavy rain', nl: 'Zware regen' }, emoji: '🌧️' },
  66: { desc: { en: 'Freezing rain', nl: 'Aanvriezende regen' }, emoji: '❄️' },
  67: { desc: { en: 'Heavy freezing rain', nl: 'Zware aanvriezende regen' }, emoji: '❄️' },
  71: { desc: { en: 'Slight snow', nl: 'Lichte sneeuw' }, emoji: '❄️' },
  73: { desc: { en: 'Moderate snow', nl: 'Matige sneeuw' }, emoji: '🌨️' },
  75: { desc: { en: 'Heavy snow', nl: 'Zware sneeuw' }, emoji: '🌨️' },
  77: { desc: { en: 'Snow grains', nl: 'Sneeuwkorrels' }, emoji: '❄️' },
  80: { desc: { en: 'Rain showers', nl: 'Regenbuien' }, emoji: '🌦️' },
  81: { desc: { en: 'Moderate showers', nl: 'Matige buien' }, emoji: '🌧️' },
  82: { desc: { en: 'Violent showers', nl: 'Hevige buien' }, emoji: '🌧️' },
  85: { desc: { en: 'Snow showers', nl: 'Sneeuwbuien' }, emoji: '🌨️' },
  86: { desc: { en: 'Heavy snow showers', nl: 'Zware sneeuwbuien' }, emoji: '🌨️' },
  95: { desc: { en: 'Thunderstorm', nl: 'Onweer' }, emoji: '⚡' },
  96: { desc: { en: 'Thunderstorm + hail', nl: 'Onweer + hagel' }, emoji: '⚡' },
  99: { desc: { en: 'Thunderstorm + heavy hail', nl: 'Onweer + zware hagel' }, emoji: '⚡' },
};

/**
 * Earthy "Herontwerp" mood palette — a soft HSL gradient rendered to hex so the
 * light/dark text helper can read luminance. Hue warms left → cools right; upper
 * rows are darker/more saturated (high energy), lower rows lighter.
 */
function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) {
    r = c;
    g = x;
  } else if (hp < 2) {
    r = x;
    g = c;
  } else if (hp < 3) {
    g = c;
    b = x;
  } else if (hp < 4) {
    g = x;
    b = c;
  } else if (hp < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const m = lN - c / 2;
  const hx = (v: number): string =>
    Math.min(255, Math.max(0, Math.round((v + m) * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

function buildMoodColors(): string[][] {
  const grid: string[][] = [];
  for (let rr = 0; rr < 10; rr++) {
    const row: string[] = [];
    for (let cc = 0; cc < 10; cc++) {
      const v = cc / 9;
      const ar = (9 - rr) / 9;
      row.push(
        hslToHex(Math.round(20 + v * 78), Math.round(20 + ar * 20), Math.round(86 - ar * 24)),
      );
    }
    grid.push(row);
  }
  return grid;
}

export const moodColors: string[][] = buildMoodColors();
