/* Mindful Check-in v4 – Core: Bus, Store, I18n, Helpers, Normalization */
(function () {
  "use strict";
  var MCI = window.MCI = window.MCI || {};

  // ════════════════════════════════════════════
  //  EVENT BUS
  // ════════════════════════════════════════════
  var _handlers = {};

  MCI.on = function (event, fn) {
    if (!_handlers[event]) _handlers[event] = [];
    _handlers[event].push(fn);
  };

  MCI.off = function (event, fn) {
    var list = _handlers[event];
    if (!list) return;
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i] === fn) list.splice(i, 1);
    }
  };

  MCI.emit = function (event, data) {
    var list = _handlers[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      try { list[i](data); } catch (e) { console.error("[MCI Bus]", event, e); }
    }
  };

  // ════════════════════════════════════════════
  //  STORE
  // ════════════════════════════════════════════
  var KEYS = {
    entries:      "local-mood-tracker-entries",
    settings:     "local-mood-tracker-settings",
    language:     "local-mood-tracker-language",
    activeTab:    "local-mood-tracker-active-tab",
    overviewUI:   "local-mood-tracker-overview-ui",
    weatherCache: "local-mood-tracker-weather-cache"
  };

  MCI.KEYS = KEYS;

  // ── Shared thresholds for energy/mood scoring (67/34 split) ──
  MCI.THRESHOLDS = { high: 67, mid: 34 };

  // ── Locale mapping for Intl APIs ──
  var LOCALE_MAP = { en: "en-US", nl: "nl-NL" };
  MCI.getLocale = function () {
    return LOCALE_MAP[MCI.lang] || "en-US";
  };

  MCI.get = function (key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback !== undefined ? fallback : null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("[MCI Store] Read/parse failed for key:", key, e);
      return fallback !== undefined ? fallback : null;
    }
  };

  MCI.put = function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) {
      console.error("[MCI Store] Write failed for key:", key, e);
      MCI.banner && MCI.banner(MCI.t ? MCI.t("storageWriteError") || "Could not save data — storage may be full." : "Could not save data.", "warning");
      return false;
    }
  };

  MCI.del = function (key) {
    try { localStorage.removeItem(key); } catch (e) { console.error("[MCI Store] Delete failed for key:", key, e); }
  };

  // ── Default settings ──
  MCI.defaultSettings = function () {
    var lang = MCI.get(KEYS.language, "en");
    var t = MCI.strings && MCI.strings[lang] ? MCI.strings[lang] : {};
    return {
      defaultLanguage: "en",
      theme: "system",
      defaultWheelType: "act",
      rowsPerPage: 7,
      overviewMaxChars: 120,
      toastDuration: 4,
      energyEmotionalLabel: "social",
      weatherLocation: "Amsterdam",
      weatherCoords: null,
      isDefaultQuickActions: true,
      quickActions: t.defaultQuickActions || ["Take a 30-minute walk during lunch break","Take a 10-minute break every 2 hours","Book a massage appointment","Drink more water throughout the day","Go to bed 30 minutes earlier tonight","Plan a moment of relaxation this week","Share how I'm feeling with someone I trust"],
      components: {
        weather: true, thoughts: true, coreFeeling: true, bodySignals: true,
        energyPhysical: true, energyMental: true, energyEmotional: true,
        moodMatrix: true, actions: true, note: true
      },
      reminderEnabled: false,
      reminderInterval: 120,
      reminderDays: [1, 2, 3, 4, 5],
      reminderStartHour: 8,
      reminderEndHour: 18,
      reminderCustomTitle: "",
      reminderCustomBody: ""
    };
  };

  MCI.loadSettings = function () {
    var raw = MCI.get(KEYS.settings, null);
    var defs = MCI.defaultSettings();
    if (!raw || typeof raw !== "object") return defs;
    var out = {};
    for (var k in defs) {
      if (!defs.hasOwnProperty(k)) continue;
      if (k === "components") {
        out.components = {};
        for (var ck in defs.components) {
          if (!defs.components.hasOwnProperty(ck)) continue;
          out.components[ck] = raw.components && raw.components[ck] !== undefined ? !!raw.components[ck] : defs.components[ck];
        }
      } else {
        out[k] = raw[k] !== undefined ? raw[k] : defs[k];
      }
    }
    return out;
  };

  var _settingsSaveSource = null;

  MCI.getSettingsSaveSource = function () { return _settingsSaveSource; };

  MCI.saveSettings = function (settings, source) {
    _settingsSaveSource = source || null;
    MCI.put(KEYS.settings, settings);
    MCI.emit("settings:changed", settings);
    _settingsSaveSource = null;
  };

  // ── Entry normalization (fill missing fields with defaults) ──
  MCI.normalize = function (entry) {
    if (!entry || typeof entry !== "object") entry = {};
    var o = {};

    o.id = entry.id || MCI.uid();
    o.thoughts = entry.thoughts || "";
    o.coreFeeling = entry.coreFeeling || "";
    o.wheelType = entry.wheelType || "act";
    o.customFeelings = entry.customFeelings || "";

    var rawE = entry.energy;
    if (rawE && typeof rawE === "object") {
      o.energy = {
        physical: typeof rawE.physical === "number" ? rawE.physical : null,
        mental:   typeof rawE.mental   === "number" ? rawE.mental   : null,
        emotional:typeof rawE.emotional=== "number" ? rawE.emotional: null
      };
    } else {
      o.energy = { physical: null, mental: null, emotional: null };
    }
    o.energyNote = entry.energyNote || "";

    o.bodySignals = Array.isArray(entry.bodySignals) ? entry.bodySignals.slice() : [];
    o.bodyNote = entry.bodyNote || "";

    o.moodRow = entry.moodRow != null ? entry.moodRow : -1;
    o.moodCol = entry.moodCol != null ? entry.moodCol : -1;
    o.moodLabel = entry.moodLabel || "";
    o.moodColor = entry.moodColor || "";

    o.actions = entry.actions || "";
    o.note = entry.note || "";

    if (entry.weather && typeof entry.weather === "object") {
      o.weather = {
        temperature: entry.weather.temperature,
        weathercode: entry.weather.weathercode,
        windspeed: entry.weather.windspeed,
        description: entry.weather.description || "",
        location: entry.weather.location || ""
      };
    } else {
      o.weather = null;
    }

    o.moodScore = entry.moodScore || 2;
    o.updatedAt = entry.updatedAt || new Date().toISOString();
    return o;
  };

  // ── Entry cache (invalidated on save/delete) ──
  var _entriesCache = null;

  MCI.loadEntries = function () {
    if (!_entriesCache) {
      var raw = MCI.get(KEYS.entries, {});
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
      var parsed = {};
      for (var k in raw) {
        if (!raw.hasOwnProperty(k)) continue;
        parsed[k] = MCI.normalize(raw[k]);
      }
      _entriesCache = parsed;
    }
    /* shallow copy so callers cannot corrupt the cache */
    var copy = {};
    for (var c in _entriesCache) {
      if (_entriesCache.hasOwnProperty(c)) copy[c] = _entriesCache[c];
    }
    return copy;
  };

  MCI.saveEntry = function (dateKey, entry) {
    _entriesCache = null;
    var all = MCI.get(KEYS.entries, {}) || {};
    entry.updatedAt = new Date().toISOString();
    all[dateKey] = entry;
    MCI.put(KEYS.entries, all);
    MCI.emit("entry:saved", { key: dateKey, entry: entry });
  };

  MCI.deleteEntry = function (dateKey) {
    _entriesCache = null;
    var all = MCI.get(KEYS.entries, {}) || {};
    delete all[dateKey];
    MCI.put(KEYS.entries, all);
    MCI.emit("entry:deleted", { key: dateKey });
  };

  MCI.saveAllEntries = function (entries) {
    _entriesCache = null;
    MCI.put(KEYS.entries, entries);
    MCI.emit("entries:changed");
  };

  // ════════════════════════════════════════════
  //  I18N
  // ════════════════════════════════════════════
  MCI.lang = "en";

  MCI.t = function (key, params) {
    var dict = MCI.strings && MCI.strings[MCI.lang] ? MCI.strings[MCI.lang] : {};
    var str = dict[key] !== undefined ? dict[key] : key;
    if (!str) str = key;
    if (str === key && MCI.lang !== "en" && MCI.strings && MCI.strings.en) {
      str = MCI.strings.en[key] !== undefined ? MCI.strings.en[key] : key;
    }
    if (params) {
      for (var p in params) {
        if (params.hasOwnProperty(p)) {
          str = str.replace(new RegExp("\\{" + p + "\\}", "g"), params[p]);
        }
      }
    }
    return str;
  };

  MCI.setLang = function (lang) {
    MCI.lang = lang;
    MCI.put(KEYS.language, lang);
    var els = document.querySelectorAll("[data-t]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var k = el.getAttribute("data-t");
      if (k) el.textContent = MCI.t(k);
    }
    var phs = document.querySelectorAll("[data-t-placeholder]");
    for (var j = 0; j < phs.length; j++) {
      var pk = phs[j].getAttribute("data-t-placeholder");
      if (pk) phs[j].placeholder = MCI.t(pk);
    }
    var arias = document.querySelectorAll("[data-t-aria]");
    for (var a = 0; a < arias.length; a++) {
      var ak = arias[a].getAttribute("data-t-aria");
      if (ak) arias[a].setAttribute("aria-label", MCI.t(ak));
    }
    MCI.emit("language:changed", lang);
  };

  // ════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════
  MCI.esc = function (str) {
    if (typeof str !== "string") return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  MCI.emotionLabel = function (id) {
    if (!id) return "";
    var tKey = "em" + id.charAt(0).toUpperCase() + id.slice(1);
    return MCI.t(tKey) || id;
  };

  MCI.uid = function () {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
  };

  MCI.formatDate = function (d) {
    if (!(d instanceof Date)) d = new Date(d);
    var y = d.getFullYear();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + day;
  };

  MCI.formatTime = function (d) {
    if (!(d instanceof Date)) d = new Date(d);
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  };

  MCI.todayKey = function () {
    return MCI.formatDate(new Date());
  };

  MCI.timestampKey = function () {
    var n = new Date();
    return MCI.formatDate(n) + "_" +
      ("0" + n.getHours()).slice(-2) +
      ("0" + n.getMinutes()).slice(-2) +
      ("0" + n.getSeconds()).slice(-2) +
      ("00" + n.getMilliseconds()).slice(-3);
  };

  MCI.dateFromKey = function (key) {
    if (!key) return null;
    var parts = key.substring(0, 10).split("-");
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    if (key.length > 10) {
      var rest = key.substring(11);
      d.setHours(+(rest.substring(0, 2)) || 0, +(rest.substring(2, 4)) || 0, +(rest.substring(4, 6)) || 0);
    }
    return d;
  };

  MCI.download = function (data, filename) {
    var json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  MCI.readFile = function (file, cb) {
    var reader = new FileReader();
    reader.onload = function (e) {
      /* c8 ignore start -- catch only fires if cb() throws */
      try {
        cb(null, e.target.result);
      } catch (err) {
        cb(err, null);
      }
      /* c8 ignore stop */
    };
    /* c8 ignore next -- FileReader error untestable in E2E */
    reader.onerror = function () { cb(new Error("Read failed"), null); };
    reader.readAsText(file);
  };

  MCI.debounce = function (fn, delay) {
    var timer = null;
    return function () {
      var ctx = this, args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; fn.apply(ctx, args); }, delay);
    };
  };

  MCI.hasLightBackground = function (hexColor) {
    var hex = String(hexColor).replace("#", "");
    if (hex.length !== 6) return false;
    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);
    var luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
    return luminance > 170;
  };

  // Toast notification helper
  var _toastDuration = 4000;
  MCI.on("settings:changed", function (s) {
    _toastDuration = ((s && s.toastDuration) || 4) * 1000;
  });

  MCI.banner = function (msg, type) {
    var container = document.getElementById("toast-container");
    if (!container) return;
    var cls = type === "warning" ? "toast--warning" : "toast--success";
    var toast = document.createElement("div");
    toast.className = "toast " + cls;
    toast.textContent = msg;
    container.appendChild(toast);
    var duration = _toastDuration;
    // trigger enter animation
    setTimeout(function () { toast.classList.add("toast--visible"); }, 10);
    // auto-dismiss
    setTimeout(function () {
      toast.classList.remove("toast--visible");
      toast.classList.add("toast--exit");
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  };

  /* ── DRY helper: subscribe to all data-change events at once ── */
  MCI.onDataChange = function (fn) {
    var events = ["entry:saved", "entry:deleted", "entries:changed", "language:changed", "settings:changed"];
    for (var i = 0; i < events.length; i++) MCI.on(events[i], fn);
  };

  /* ── DRY helper: wire a container so clicking [data-entry-key] loads that entry ── */
  MCI.bindEntryClick = function (containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.addEventListener("click", function (e) {
      var cell = e.target.closest("[data-entry-key]");
      if (!cell) return;
      var key = cell.getAttribute("data-entry-key");
      var entries = MCI.loadEntries();
      if (entries[key]) {
        MCI.emit("entry:request-load", { key: key, entry: entries[key] });
      }
    });
  };
})();
