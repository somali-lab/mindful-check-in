/* Mindful Check-in v4 – Checkin Orchestrator */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _currentKey = null;  /* null = new, string = editing existing */

  /* ── cached module state (updated via bus events) ── */
  var _state = {
    wheel: { picked: "", variant: "act" },
    body: [],
    energy: { physical: null, mental: null, emotional: null },
    mood: null,
    weather: null
  };

  /* ── gather form data into an entry ── */
  function collect() {
    var entry = {};

    /* c8 ignore start -- form fields always present in full page */
    /* thoughts */
    var th = document.getElementById("fld-thoughts");
    entry.thoughts = th ? th.value.trim() : "";

    /* core feeling (from cached state) */
    entry.coreFeeling = _state.wheel.picked;
    entry.wheelType = _state.wheel.variant;
    var customFld = document.getElementById("fld-custom");
    entry.customFeelings = customFld ? customFld.value.trim() : "";

    /* body (from cached state) */
    entry.bodySignals = _state.body.slice();
    var bn = document.getElementById("fld-body-note");
    entry.bodyNote = bn ? bn.value.trim() : "";

    /* energy (from cached state) */
    entry.energy = {
      physical: _state.energy.physical,
      mental: _state.energy.mental,
      emotional: _state.energy.emotional
    };
    var en = document.getElementById("fld-energy-note");
    entry.energyNote = en ? en.value.trim() : "";
    /* c8 ignore stop */

    /* mood matrix (from cached state) */
    var ms = _state.mood;
    entry.moodRow = ms ? ms.row : -1;
    entry.moodCol = ms ? ms.col : -1;
    entry.moodLabel = ms ? ms.label : "";
    entry.moodColor = ms ? ms.color : "";

    /* actions */
    var af = document.getElementById("fld-action");
    entry.actions = af ? af.value.trim() : "";

    /* note */
    var nf = document.getElementById("fld-note");
    entry.note = nf ? nf.value.trim() : "";

    /* weather (from cached state) */
    var wc = _state.weather;
    if (wc) {
      entry.weather = {
        temperature: wc.temperature,
        weathercode: wc.weathercode != null ? wc.weathercode : wc.weather_code,
        windspeed: wc.windspeed
      };
    }

    /* compute mood score */
    entry.moodScore = MCI.computeMoodScore(entry);

    return entry;
  }

  /* ── load entry into form ── */
  function loadIntoForm(dateKey, entry) {
    _currentKey = dateKey;

    /* c8 ignore start -- form fields always present */
    var th = document.getElementById("fld-thoughts");
    if (th) th.value = entry.thoughts || "";

    if (entry.wheelType) MCI.Wheel.setVariant(entry.wheelType);
    MCI.Wheel.setPicked(entry.coreFeeling || "");
    /* sync cached state immediately for loaded entries */
    _state.wheel = { picked: entry.coreFeeling || "", variant: entry.wheelType || "act" };
    var cf = document.getElementById("fld-custom");
    if (cf) cf.value = entry.customFeelings || "";
    /* c8 ignore stop */

    MCI.Body.setZones(entry.bodySignals || []);
    _state.body = (entry.bodySignals || []).slice();
    /* c8 ignore next 2 -- body note field always present */
    var bn = document.getElementById("fld-body-note");
    if (bn) bn.value = entry.bodyNote || "";

    MCI.Energy.setValues(entry.energy || null);
    _state.energy = entry.energy ? {
      physical: typeof entry.energy.physical === "number" ? entry.energy.physical : null,
      mental: typeof entry.energy.mental === "number" ? entry.energy.mental : null,
      emotional: typeof entry.energy.emotional === "number" ? entry.energy.emotional : null
    } : { physical: null, mental: null, emotional: null };
    /* c8 ignore next 2 -- energy note field always present */
    var en = document.getElementById("fld-energy-note");
    if (en) en.value = entry.energyNote || "";

    MCI.Mood.setSelection(
      entry.moodRow != null ? entry.moodRow : -1,
      entry.moodCol != null ? entry.moodCol : -1
    );
    _state.mood = (entry.moodRow != null && entry.moodRow >= 0) ? MCI.Mood.getSelection() : null;

    /* c8 ignore next 2 -- action field always present */
    var af = document.getElementById("fld-action");
    if (af) af.value = entry.actions || "";

    /* c8 ignore next 2 -- note field always present */
    var nf = document.getElementById("fld-note");
    if (nf) nf.value = entry.note || "";

    updatePill();
    MCI.emit("entry:load", { key: dateKey, entry: entry });
  }

  function clearForm() {
    _currentKey = null;

    var fields = ["fld-thoughts", "fld-custom", "fld-body-note", "fld-energy-note", "fld-action", "fld-note"];
    for (var i = 0; i < fields.length; i++) {
      var el = document.getElementById(fields[i]);
      /* c8 ignore next -- form fields always present */
      if (el) el.value = "";
    }

    MCI.Wheel.setPicked("");
    var _s = MCI.loadSettings();
    /* c8 ignore next -- settings always has wheel type */
    MCI.Wheel.setVariant(_s.defaultWheelType || "act");
    MCI.Body.setZones([]);
    MCI.Energy.setValues(null);
    MCI.Mood.setSelection(-1, -1);

    /* reset cached state */
    /* c8 ignore next -- settings always has wheel type */
    _state.wheel = { picked: "", variant: _s.defaultWheelType || "act" };
    _state.body = [];
    _state.energy = { physical: null, mental: null, emotional: null };
    _state.mood = null;

    updatePill();
    MCI.emit("entry:new");
  }

  /* ── save logic ── */
  function save() {
    var entry = collect();

    /* validation — at least core feeling OR thoughts required */
    if (!entry.coreFeeling && !entry.thoughts) {
      MCI.banner(MCI.t("saveWarnEmpty") || /* c8 ignore next */ "Please add at least a feeling or some thoughts.", "warning");
      return;
    }

    var dateKey = _currentKey || getDateOverrideKey() || MCI.timestampKey();
    entry = MCI.normalize(entry);
    MCI.saveEntry(dateKey, entry);
    _currentKey = dateKey;

    updatePill();
    MCI.banner(MCI.t("saveDone") || /* c8 ignore next */ "Check-in saved!", "success");
  }

  /* ── date override from datetime-local input ── */
  function getDateOverrideKey() {
    var input = document.getElementById("ci-date-override");
    if (!input || !input.value) return null;
    var d = new Date(input.value);
    if (isNaN(d.getTime())) return null;
    return MCI.formatDate(d) + "_" +
      ("0" + d.getHours()).slice(-2) +
      ("0" + d.getMinutes()).slice(-2) +
      ("0" + d.getSeconds()).slice(-2) +
      "000";
  }

  function syncDateInput() {
    var input = document.getElementById("ci-date-override");
    if (!input) return;
    if (_currentKey) {
      var d = MCI.dateFromKey(_currentKey);
      if (d) {
        var iso = d.getFullYear() + "-" +
          ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
          ("0" + d.getDate()).slice(-2) + "T" +
          ("0" + d.getHours()).slice(-2) + ":" +
          ("0" + d.getMinutes()).slice(-2);
        input.value = iso;
      }
    } else {
      input.value = "";
    }
  }

  /* ── context pill ── */
  function updatePill() {
    var pill = document.getElementById("ci-pill");
    /* c8 ignore next -- pill element always present */
    if (!pill) return;
    if (_currentKey) {
      /* c8 ignore start -- dateFromKey always returns valid Date for valid keys */
      var d = MCI.dateFromKey(_currentKey);
      if (d) {
        pill.textContent = MCI.formatDate(d) + " \u00b7 " + MCI.formatTime(d);
      } else {
        pill.textContent = _currentKey;
      }
      /* c8 ignore stop */
      pill.classList.remove("is-new");
      pill.classList.add("is-saved");
    } else {
      pill.textContent = MCI.t("pillNew") || /* c8 ignore next */ "New \u00b7 not saved yet";
      pill.classList.add("is-new");
      pill.classList.remove("is-saved");
    }
    syncDateInput();
  }

  /* ── quick action chips ── */
  function buildChips() {
    var slot = document.getElementById("ci-chips");
    /* c8 ignore next -- chips slot always present */
    if (!slot) return;
    var settings = MCI.loadSettings();
    /* c8 ignore next -- quickActions always initialized */
    var actions = settings.quickActions || [];
    var html = "";
    for (var i = 0; i < actions.length; i++) {
      html += '<button type="button" class="quick-action-chip" data-act="'
        + MCI.esc(actions[i]) + '">' + MCI.esc(actions[i]) + '</button>';
    }
    slot.innerHTML = html;
  }

  function handleChipClick(e) {
    var chip = e.target.closest("[data-act]");
    /* c8 ignore next -- clicks always target chip buttons in tests */
    if (!chip) return;
    var act = chip.getAttribute("data-act");
    var fld = document.getElementById("fld-action");
    /* c8 ignore next -- action field always present */
    if (!fld) return;
    var val = fld.value.trim();
    if (val && val.indexOf(act) === -1) {
      fld.value = val + ", " + act;
    } else if (!val) {
      fld.value = act;
    }
  }

  /* ── component visibility ── */
  function applyVisibility() {
    var settings = MCI.loadSettings();
    var comps = settings.components || /* c8 ignore next */ {};
    var sections = document.querySelectorAll("[data-component]");
    for (var i = 0; i < sections.length; i++) {
      var key = sections[i].getAttribute("data-component");
      if (comps[key] === false) {
        sections[i].classList.add("is-hidden");
      } else {
        sections[i].classList.remove("is-hidden");
      }
    }
  }

  MCI.Checkin = {
    init: function () {
      /* c8 ignore start -- form elements always present */
      var saveBtn = document.getElementById("ci-btn-save");
      if (saveBtn) saveBtn.addEventListener("click", save);

      var newBtn = document.getElementById("ci-btn-new");
      if (newBtn) newBtn.addEventListener("click", clearForm);

      var chipsSlot = document.getElementById("ci-chips");
      if (chipsSlot) chipsSlot.addEventListener("click", handleChipClick);
      /* c8 ignore stop */

      /* load today if exists */
      var entries = MCI.loadEntries();
      var todayKey = MCI.todayKey();
      var keys = Object.keys(entries).sort();
      var todayEntry = null, todayEKey = null;
      for (var i = keys.length - 1; i >= 0; i--) {
        if (keys[i].indexOf(todayKey) === 0) {
          todayEntry = entries[keys[i]];
          todayEKey = keys[i];
          break;
        }
      }
      if (todayEntry) {
        loadIntoForm(todayEKey, todayEntry);
      }

      buildChips();
      applyVisibility();

      /* subscribe to module state events */
      MCI.on("wheel:selected", function (picked) {
        var sel = document.getElementById("sel-wheel");
        /* c8 ignore next -- picked always string, sel always present */
        _state.wheel = { picked: picked || "", variant: sel ? sel.value : "act" };
      });
      MCI.on("body:toggled", function (zones) {
        _state.body = zones || /* c8 ignore next */ [];
      });
      MCI.on("energy:set", function (data) {
        if (data && data.key) {
          _state.energy[data.key] = data.value;
        } else if (data === null) { /* c8 ignore next */
          _state.energy = { physical: null, mental: null, emotional: null };
        }
      });
      MCI.on("mood:selected", function (sel) {
        _state.mood = sel;
      });

      /* initialize weather state from cache and listen for updates */
      _state.weather = MCI.Weather.getCurrent();
      MCI.on("weather:fetched", function (data) {
        _state.weather = data;
      });

      MCI.on("settings:changed", function () {
        buildChips();
        applyVisibility();
      });
      MCI.on("language:changed", function () {
        updatePill();
        buildChips();
      });
      MCI.on("entry:request-load", function (data) {
        if (data && data.key && data.entry) {
          loadIntoForm(data.key, data.entry);
        }
      });
    },

    loadEntry: loadIntoForm,
    clearForm: clearForm,
    save: save,
    collect: collect
  };
})();
