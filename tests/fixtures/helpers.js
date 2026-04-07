// Shared test helpers for Mindful Check-in E2E tests
// @ts-check

const ENTRIES_KEY = 'local-mood-tracker-entries';
const SETTINGS_KEY = 'local-mood-tracker-settings';
const LANGUAGE_KEY = 'local-mood-tracker-language';
const ACTIVE_TAB_KEY = 'local-mood-tracker-active-tab';
const OVERVIEW_UI_KEY = 'local-mood-tracker-overview-ui';
const WEATHER_CACHE_KEY = 'local-mood-tracker-weather-cache';
const WHEEL_TYPE_KEY = 'moodTrackerWheelType';

// ─── localStorage injection (before page load) ───

async function injectEntries(page, entries) {
  await page.addInitScript((data) => {
    localStorage.setItem('local-mood-tracker-entries', JSON.stringify(data));
  }, entries);
}

async function injectSettings(page, settings) {
  await page.addInitScript((data) => {
    localStorage.setItem('local-mood-tracker-settings', JSON.stringify(data));
  }, settings);
}

async function injectLanguage(page, lang) {
  await page.addInitScript((l) => {
    localStorage.setItem('local-mood-tracker-language', l);
  }, lang);
}

async function injectWeatherCache(page, cache) {
  await page.addInitScript((data) => {
    localStorage.setItem('local-mood-tracker-weather-cache', JSON.stringify(data));
  }, cache);
}

// ─── localStorage reading (after page interaction) ───

async function getLocalStorageEntries(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('local-mood-tracker-entries');
    return raw ? JSON.parse(raw) : {};
  });
}

async function getLocalStorageSettings(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('local-mood-tracker-settings');
    return raw ? JSON.parse(raw) : null;
  });
}

async function getLocalStorageLanguage(page) {
  return page.evaluate(() => localStorage.getItem('local-mood-tracker-language'));
}

async function clearAppState(page) {
  await page.evaluate(() => localStorage.clear());
}

// ─── Weather API mocking ───

async function mockWeatherAPI(page, weatherOverrides) {
  const defaults = {
    temperature: 14,
    weathercode: 1,
    is_day: 1,
    windspeed: 8.5,
    ...(weatherOverrides || {}),
  };
  const weatherResponse = {
    current: {
      temperature_2m: defaults.temperature,
      weather_code: defaults.weathercode,
      is_day: defaults.is_day,
      wind_speed_10m: defaults.windspeed,
    },
  };
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(weatherResponse),
    })
  );
}

async function mockWeatherAPIFailure(page) {
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 500, body: 'Server error' })
  );
}

async function mockGeocodingAPI(page, results) {
  const response = {
    results: results || [
      { name: 'Amsterdam', latitude: 52.3676, longitude: 4.9041, country: 'Netherlands' },
    ],
  };
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  );
}

async function mockGeocodingAPIEmpty(page) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    })
  );
}

// ─── Test entry factory ───

function createTestEntry(overrides) {
  return {
    id: 'test-' + Math.random().toString(36).slice(2, 10),
    thoughts: '',
    selectedEmotion: null,
    wheelType: 'act',
    customFeelings: '',
    energy: { physical: null, mental: null, emotional: null },
    bodySignals: [],
    bodyNote: '',
    energyNote: '',
    action: '',
    note: '',
    moodGrid: null,
    mood: null,
    weather: null,
    updatedAt: new Date().toISOString(),
    ...(overrides || {}),
  };
}

function createTestSettings(overrides) {
  const base = {
    defaultLanguage: 'en',
    theme: 'system',
    defaultWheelType: 'act',
    rowsPerPage: 7,
    overviewMaxChars: 120,
    energyEmotionalLabel: 'social',
    weatherLocation: 'Amsterdam',
    weatherCoords: { lat: 52.3676, lon: 4.9041, name: 'Amsterdam' },
    quickActions: ['Take a walk', 'Take breaks', 'Drink water'],
    components: {
      weather: true,
      thoughts: true,
      coreFeeling: true,
      bodySignals: true,
      energyPhysical: true,
      energyMental: true,
      energyEmotional: true,
      moodMatrix: true,
      actions: true,
      note: true,
    },
  };
  if (overrides) {
    if (overrides.components) {
      base.components = { ...base.components, ...overrides.components };
      delete overrides.components;
    }
    Object.assign(base, overrides);
  }
  return base;
}

// ─── Visibility presets ───

const VISIBILITY_PRESETS = {
  'all-on': {
    weather: true, thoughts: true, coreFeeling: true, bodySignals: true,
    energyPhysical: true, energyMental: true, energyEmotional: true,
    moodMatrix: true, actions: true, note: true,
  },
  'all-off': {
    weather: false, thoughts: false, coreFeeling: false, bodySignals: false,
    energyPhysical: false, energyMental: false, energyEmotional: false,
    moodMatrix: false, actions: false, note: false,
  },
  'mood-only': {
    weather: false, thoughts: false, coreFeeling: true, bodySignals: false,
    energyPhysical: false, energyMental: false, energyEmotional: false,
    moodMatrix: true, actions: false, note: false,
  },
  'energy-only': {
    weather: false, thoughts: false, coreFeeling: false, bodySignals: false,
    energyPhysical: true, energyMental: true, energyEmotional: true,
    moodMatrix: false, actions: false, note: false,
  },
  'no-weather': {
    weather: false, thoughts: true, coreFeeling: true, bodySignals: true,
    energyPhysical: true, energyMental: true, energyEmotional: true,
    moodMatrix: true, actions: true, note: true,
  },
  'single-energy': {
    weather: false, thoughts: false, coreFeeling: false, bodySignals: false,
    energyPhysical: false, energyMental: true, energyEmotional: false,
    moodMatrix: false, actions: false, note: false,
  },
  'text-only': {
    weather: false, thoughts: true, coreFeeling: false, bodySignals: false,
    energyPhysical: false, energyMental: false, energyEmotional: false,
    moodMatrix: false, actions: true, note: true,
  },
};

// ─── Navigation helpers ───

async function navigateToTab(page, tabName) {
  await page.locator(`[data-tab-target="${tabName}"]`).click();
  await page.locator(`[data-tab-panel="${tabName}"]`).waitFor({ state: 'visible' });
}

// ─── Date helpers ───

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDateKey(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Bulk entry generator (for overview/pagination tests) ───

function generateEntries(count, options) {
  const entries = {};
  const emotions = ['joy', 'sadness', 'anger', 'fear', 'trust', 'surprise'];
  const moods = ['great', 'okay', 'low'];
  for (let i = 0; i < count; i++) {
    const key = getDateKey(i);
    entries[key] = createTestEntry({
      selectedEmotion: emotions[i % emotions.length],
      mood: moods[i % moods.length],
      thoughts: `Thought for day ${i}`,
      energy: {
        physical: Math.round(Math.random() * 100),
        mental: Math.round(Math.random() * 100),
        emotional: Math.round(Math.random() * 100),
      },
      moodGrid: { energy: (i % 10) + 1, valence: ((i + 3) % 10) + 1 },
      action: i % 3 === 0 ? 'Take a walk' : '',
      note: i % 4 === 0 ? `Note for day ${i}` : '',
      updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
      ...(options || {}),
    });
  }
  return entries;
}

module.exports = {
  ENTRIES_KEY,
  SETTINGS_KEY,
  LANGUAGE_KEY,
  ACTIVE_TAB_KEY,
  OVERVIEW_UI_KEY,
  WEATHER_CACHE_KEY,
  WHEEL_TYPE_KEY,
  injectEntries,
  injectSettings,
  injectLanguage,
  injectWeatherCache,
  getLocalStorageEntries,
  getLocalStorageSettings,
  getLocalStorageLanguage,
  clearAppState,
  mockWeatherAPI,
  mockWeatherAPIFailure,
  mockGeocodingAPI,
  mockGeocodingAPIEmpty,
  createTestEntry,
  createTestSettings,
  VISIBILITY_PRESETS,
  navigateToTab,
  getTodayKey,
  getDateKey,
  generateEntries,
};
