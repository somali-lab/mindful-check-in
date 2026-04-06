(function () {
  "use strict";
  window.App = window.App || {};

  var STORAGE_KEY = "local-mood-tracker-entries";
  var LANGUAGE_KEY = "local-mood-tracker-language";
  var SETTINGS_KEY = "local-mood-tracker-settings";
  var ACTIVE_TAB_KEY = "local-mood-tracker-active-tab";
  var OVERVIEW_UI_KEY = "local-mood-tracker-overview-ui";

  App.getDefaultSettings = function () {
    return window.MINDFUL_CHECKIN_DEFAULT_SETTINGS || {
      defaultLanguage: App.FALLBACK_LANGUAGE,
      theme: "system",
      defaultWheelType: "act",
      rowsPerPage: 7,
      overviewMaxChars: 120,
      energyEmotionalLabel: "social",
      weatherLocation: "Amsterdam",
      weatherCoords: { lat: 52.3676, lon: 4.9041, name: "Amsterdam" },
      quickActions: [], // Intentionally empty — normalizeSettings fills language-specific defaults via getDefaultQuickActions(lang)
      components: {
        weather: true, thoughts: true, coreFeeling: true, bodySignals: true,
        energyPhysical: true, energyMental: true, energyEmotional: true,
        moodMatrix: true, actions: true, note: true,
      },
    };
  };

  App.getDefaultQuickActions = function (lang) {
    var t = window.MINDFUL_CHECKIN_TRANSLATIONS;
    if (t && t.settings && t.settings.quickActions && t.settings.quickActions.defaults) {
      var defaults = t.settings.quickActions.defaults;
      return (defaults[lang] || defaults[App.FALLBACK_LANGUAGE] || []).slice();
    }
    return [];
  };

  App.normalizeMoodGrid = function (rawMoodGrid) {
    if (!rawMoodGrid || typeof rawMoodGrid !== "object") {
      return null;
    }
    var energy = Number(rawMoodGrid.energy);
    var valence = Number(rawMoodGrid.valence);
    if (!Number.isFinite(energy) || !Number.isFinite(valence)) {
      return null;
    }
    return {
      energy: Math.min(10, Math.max(1, Math.round(energy))),
      valence: Math.min(10, Math.max(1, Math.round(valence))),
    };
  };

  App.normalizeEntry = function (rawEntry) {
    if (!rawEntry || typeof rawEntry !== "object") {
      return {
        thoughts: "", selectedEmotion: null, customFeelings: "",
        energy: { physical: null, mental: null, emotional: null },
        bodySignals: [], bodyNote: "", energyNote: "", action: "",
        note: "", moodGrid: null, mood: null, updatedAt: null,
      };
    }

    var normalizedEnergy;
    if (rawEntry.energy && typeof rawEntry.energy === "object" && !Array.isArray(rawEntry.energy)) {
      normalizedEnergy = {
        physical: typeof rawEntry.energy.physical === "number" ? rawEntry.energy.physical : null,
        mental: typeof rawEntry.energy.mental === "number" ? rawEntry.energy.mental : null,
        emotional: typeof rawEntry.energy.emotional === "number" ? rawEntry.energy.emotional : null,
      };
    } else if (typeof rawEntry.energy === "number") {
      normalizedEnergy = { physical: rawEntry.energy, mental: null, emotional: null };
    } else if (typeof rawEntry.energie === "number") {
      normalizedEnergy = { physical: rawEntry.energie, mental: null, emotional: null };
    } else {
      normalizedEnergy = { physical: null, mental: null, emotional: null };
    }

    var rawMoodGrid = rawEntry.moodGrid || rawEntry.emotion_grid || rawEntry.moodmeter || null;
    var normalizedMoodGrid = App.normalizeMoodGrid(rawMoodGrid);
    var fallbackMoodGrid = (!normalizedMoodGrid && rawMoodGrid && typeof rawMoodGrid === "object" && typeof rawMoodGrid.text === "string")
      ? { text: rawMoodGrid.text }
      : null;

    return {
      thoughts: rawEntry.thoughts || rawEntry.gedachten || "",
      selectedEmotion: rawEntry.selectedEmotion || rawEntry.feelings || rawEntry.gevoelens || null,
      customFeelings: rawEntry.customFeelings || rawEntry.custom_feelings || rawEntry.eigen_gevoelens || "",
      energy: normalizedEnergy,
      bodySignals: Array.isArray(rawEntry.bodySignals) ? rawEntry.bodySignals
        : Array.isArray(rawEntry.body_signals) ? rawEntry.body_signals
        : Array.isArray(rawEntry.lichaamsignalen) ? rawEntry.lichaamsignalen : [],
      bodyNote: rawEntry.bodyNote || rawEntry.body || rawEntry.lichaam || "",
      energyNote: rawEntry.energyNote || "",
      action: rawEntry.action || rawEntry.actie || "",
      note: rawEntry.note || "",
      moodGrid: normalizedMoodGrid || fallbackMoodGrid,
      mood: rawEntry.mood || null,
      weather: rawEntry.weather || null,
      updatedAt: rawEntry.updatedAt || rawEntry.timestamp || null,
    };
  };

  App.migrateEntries = function (parsedValue) {
    if (!parsedValue || typeof parsedValue !== "object") {
      return { entries: {}, changed: false };
    }
    var changed = false;
    var migrated = {};
    Object.entries(parsedValue).forEach(function (pair) {
      var entryKey = pair[0];
      var rawEntry = pair[1];
      if (!rawEntry || typeof rawEntry !== "object") {
        migrated[entryKey] = rawEntry;
        return;
      }
      var nextEntry = Object.assign({}, rawEntry);
      var rawMoodGrid = rawEntry.moodGrid || rawEntry.emotion_grid || rawEntry.moodmeter || null;
      var normalizedMoodGrid = App.normalizeMoodGrid(rawMoodGrid);
      if (normalizedMoodGrid) {
        nextEntry.moodGrid = normalizedMoodGrid;
        if (JSON.stringify(rawEntry.moodGrid) !== JSON.stringify(normalizedMoodGrid)) {
          changed = true;
        }
      }
      if (Object.prototype.hasOwnProperty.call(nextEntry, "emotion_grid")) {
        delete nextEntry.emotion_grid;
        changed = true;
      }
      if (Object.prototype.hasOwnProperty.call(nextEntry, "moodmeter")) {
        delete nextEntry.moodmeter;
        changed = true;
      }
      if (!nextEntry.id) {
        nextEntry.id = App.generateId();
        changed = true;
      }
      migrated[entryKey] = nextEntry;
    });
    return { entries: migrated, changed: changed };
  };

  App.cloneSettings = function (settings) {
    return {
      defaultLanguage: settings.defaultLanguage,
      theme: settings.theme || "system",
      defaultWheelType: settings.defaultWheelType || "act",
      rowsPerPage: settings.rowsPerPage,
      overviewMaxChars: settings.overviewMaxChars,
      energyEmotionalLabel: settings.energyEmotionalLabel || "social",
      weatherLocation: settings.weatherLocation || "",
      weatherCoords: settings.weatherCoords || null,
      quickActions: Array.isArray(settings.quickActions) ? settings.quickActions.slice() : [],
      components: Object.assign({}, settings.components),
    };
  };

  App.normalizeSettings = function (rawSettings) {
    var normalized = App.cloneSettings(App.getDefaultSettings());
    if (!rawSettings || typeof rawSettings !== "object") {
      return normalized;
    }
    if (rawSettings.defaultLanguage === "en" || rawSettings.defaultLanguage === "nl") {
      normalized.defaultLanguage = rawSettings.defaultLanguage;
    }
    if (rawSettings.theme === "light" || rawSettings.theme === "dark" || rawSettings.theme === "system") {
      normalized.theme = rawSettings.theme;
    }
    var validWheels = ["act", "plutchik", "ekman", "junto", "extended"];
    if (rawSettings.defaultWheelType && validWheels.indexOf(rawSettings.defaultWheelType) !== -1) {
      normalized.defaultWheelType = rawSettings.defaultWheelType;
    }
    if (typeof rawSettings.rowsPerPage === "number" && Number.isFinite(rawSettings.rowsPerPage)) {
      normalized.rowsPerPage = Math.min(100, Math.max(5, Math.round(rawSettings.rowsPerPage)));
    }
    if (typeof rawSettings.overviewMaxChars === "number" && Number.isFinite(rawSettings.overviewMaxChars)) {
      normalized.overviewMaxChars = Math.min(500, Math.max(20, Math.round(rawSettings.overviewMaxChars)));
    }
    var validEmoLabels = ["emotionalSocial", "emotional", "social"];
    if (rawSettings.energyEmotionalLabel && validEmoLabels.indexOf(rawSettings.energyEmotionalLabel) !== -1) {
      normalized.energyEmotionalLabel = rawSettings.energyEmotionalLabel;
    }
    if (typeof rawSettings.weatherLocation === "string") {
      normalized.weatherLocation = rawSettings.weatherLocation.trim();
    }
    if (rawSettings.weatherCoords && typeof rawSettings.weatherCoords === "object"
        && typeof rawSettings.weatherCoords.lat === "number" && typeof rawSettings.weatherCoords.lon === "number") {
      normalized.weatherCoords = { lat: rawSettings.weatherCoords.lat, lon: rawSettings.weatherCoords.lon, name: rawSettings.weatherCoords.name || "" };
    }
    if (Array.isArray(rawSettings.quickActions)) {
      normalized.quickActions = rawSettings.quickActions
        .filter(function (item) { return typeof item === "string" && item.trim().length > 0; })
        .map(function (item) { return item.trim(); });
    }
    if (normalized.quickActions.length === 0) {
      normalized.quickActions = App.getDefaultQuickActions(normalized.defaultLanguage);
    }
    if (rawSettings.components && typeof rawSettings.components === "object") {
      Object.keys(normalized.components).forEach(function (key) {
        if (typeof rawSettings.components[key] === "boolean") {
          normalized.components[key] = rawSettings.components[key];
        }
      });
    }
    return normalized;
  };

  App.loadEntries = function () {
    var savedValue = localStorage.getItem(STORAGE_KEY);
    if (!savedValue) {
      return {};
    }
    try {
      var parsedValue = JSON.parse(savedValue);
      if (typeof parsedValue !== "object" || parsedValue === null) {
        return {};
      }
      var migration = App.migrateEntries(parsedValue);
      if (migration.changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migration.entries));
      }
      return migration.entries;
    } catch (error) {
      console.warn("Could not read saved entries.", error);
      return {};
    }
  };

  App.saveEntries = function (entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  App.loadLanguage = function (defaultLanguage) {
    var saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "nl" || saved === "en") {
      return saved;
    }
    if (defaultLanguage === "nl" || defaultLanguage === "en") {
      return defaultLanguage;
    }
    return App.FALLBACK_LANGUAGE;
  };

  App.saveLanguage = function (lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  App.loadSettings = function () {
    var savedValue = localStorage.getItem(SETTINGS_KEY);
    if (!savedValue) {
      return App.normalizeSettings(App.getDefaultSettings());
    }
    try {
      var parsed = JSON.parse(savedValue);
      return App.normalizeSettings(parsed);
    } catch (error) {
      console.warn("Could not read saved settings.", error);
      return App.cloneSettings(App.getDefaultSettings());
    }
  };

  App.saveSettings = function (settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  };

  App.loadActiveTab = function (validTabs) {
    var hash = location.hash.replace("#", "");
    if (hash && validTabs.has(hash)) {
      return hash;
    }
    var saved = localStorage.getItem(ACTIVE_TAB_KEY);
    if (saved && validTabs.has(saved)) {
      return saved;
    }
    return "checkin";
  };

  App.saveActiveTab = function (tabName) {
    localStorage.setItem(ACTIVE_TAB_KEY, tabName);
  };

  App.loadOverviewUiState = function () {
    var fallback = { search: "", filter: "all", withNotesOnly: false, sortKey: "date", sortDir: "desc" };
    var savedValue = localStorage.getItem(OVERVIEW_UI_KEY);
    if (!savedValue) {
      return fallback;
    }
    try {
      var parsed = JSON.parse(savedValue);
      if (!parsed || typeof parsed !== "object") {
        return fallback;
      }
      var allowedFilters = new Set(["all", "today", "last7", "last14", "lastMonth", "last3Months"]);
      var next = Object.assign({}, fallback);
      if (typeof parsed.search === "string") next.search = parsed.search;
      if (typeof parsed.filter === "string" && allowedFilters.has(parsed.filter)) next.filter = parsed.filter;
      if (typeof parsed.withNotesOnly === "boolean") next.withNotesOnly = parsed.withNotesOnly;
      if (typeof parsed.sortKey === "string" && parsed.sortKey) next.sortKey = parsed.sortKey;
      if (parsed.sortDir === "asc" || parsed.sortDir === "desc") next.sortDir = parsed.sortDir;
      return next;
    } catch (error) {
      return fallback;
    }
  };

  App.saveOverviewUiState = function () {
    var dom = App.dom;
    var payload = {
      search: String((dom.overviewSearchInput && dom.overviewSearchInput.value) || ""),
      filter: String((dom.overviewFilterSelect && dom.overviewFilterSelect.value) || "all"),
      withNotesOnly: Boolean(dom.overviewWithNotesOnlyCheckbox && dom.overviewWithNotesOnlyCheckbox.checked),
      sortKey: App.overviewSortKey,
      sortDir: App.overviewSortDir,
    };
    try {
      localStorage.setItem(OVERVIEW_UI_KEY, JSON.stringify(payload));
    } catch (_ignored) {}
  };
})();
