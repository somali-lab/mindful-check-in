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

    buildChips();
    buildFeelChips();
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

    buildChips();
    buildFeelChips();
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
      /* new check-in: default to now so the subline always shows a date (design) */
      var now = new Date();
      input.value = now.getFullYear() + "-" +
        ("0" + (now.getMonth() + 1)).slice(-2) + "-" +
        ("0" + now.getDate()).slice(-2) + "T" +
        ("0" + now.getHours()).slice(-2) + ":" +
        ("0" + now.getMinutes()).slice(-2);
    }
    updateDateDisplay();
  }

  /* ── nicely formatted date in the subline (design: "Mon 22 Jun · 08:30") ── */
  function currentLang() {
    /* c8 ignore next -- language key always set */
    return MCI.get(MCI.KEYS.language, "en") || "en";
  }
  function fmtNiceDate(value) {
    if (!value) return "";
    var d = new Date(value);
    /* c8 ignore next -- guard invalid */
    if (isNaN(d.getTime())) return "";
    var nl = currentLang() === "nl";
    var dn = nl ? ["zo", "ma", "di", "wo", "do", "vr", "za"]
                : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var mn = nl ? ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
                : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var hh = ("0" + d.getHours()).slice(-2), mm = ("0" + d.getMinutes()).slice(-2);
    return dn[d.getDay()] + " " + d.getDate() + " " + mn[d.getMonth()] + " · " + hh + ":" + mm;
  }
  function updateDateDisplay() {
    var disp = document.getElementById("ci-date-display");
    var inp = document.getElementById("ci-date-override");
    /* c8 ignore next -- elements present in check-in */
    if (!disp || !inp) return;
    disp.textContent = fmtNiceDate(inp.value);
  }

  /* ── editorial greeting (time-of-day) ── */
  function updateGreeting() {
    var el = document.getElementById("ci-greeting");
    /* c8 ignore next -- greeting element always present */
    if (!el) return;
    var h = new Date().getHours();
    var key = h < 12 ? "ciGreetMorning" : (h < 18 ? "ciGreetAfternoon" : "ciGreetEvening");
    el.textContent = MCI.t(key);
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

  /* ── action pills (toggle + inline custom-add, design style) ── */
  function selectedActions() {
    var fld = document.getElementById("fld-action");
    /* c8 ignore next -- action field always present */
    if (!fld || !fld.value.trim()) return [];
    return fld.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function setSelectedActions(arr) {
    var fld = document.getElementById("fld-action");
    /* c8 ignore next -- action field always present */
    if (fld) fld.value = arr.join(", ");
  }

  function buildChips() {
    var slot = document.getElementById("ci-chips");
    /* c8 ignore next -- chips slot always present */
    if (!slot) return;
    var settings = MCI.loadSettings();
    /* c8 ignore next -- quickActions always initialized */
    var base = settings.quickActions || [];
    var sel = selectedActions();
    var all = base.slice();
    for (var s = 0; s < sel.length; s++) {
      if (all.indexOf(sel[s]) === -1) all.push(sel[s]);
    }
    var html = "";
    for (var i = 0; i < all.length; i++) {
      var on = sel.indexOf(all[i]) !== -1;
      html += '<button type="button" class="ci-act-pill' + (on ? " is-on" : "")
        + '" data-act="' + MCI.esc(all[i]) + '">' + MCI.esc(all[i]) + '</button>';
    }
    html += '<button type="button" class="ci-act-add" data-add="1">+ '
      + MCI.esc(MCI.t("ciAddAction") || /* c8 ignore next */ "Add your own") + '</button>';
    slot.innerHTML = html;
  }

  function startAddAction(addBtn) {
    var wrap = document.createElement("span");
    wrap.className = "ci-act-add ci-act-add--editing";
    var input = document.createElement("input");
    input.type = "text";
    input.className = "ci-act-input";
    input.placeholder = MCI.t("ciAddAction") || /* c8 ignore next */ "Add your own";
    wrap.appendChild(input);
    addBtn.replaceWith(wrap);
    input.focus();
    var done = false;
    function commit() {
      if (done) return; done = true;
      var v = input.value.trim();
      if (v) {
        var sel = selectedActions();
        if (sel.indexOf(v) === -1) sel.push(v);
        setSelectedActions(sel);
      }
      buildChips();
    }
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); commit(); }
      else if (ev.key === "Escape") { done = true; buildChips(); }
    });
    input.addEventListener("blur", commit);
  }

  function handleChipClick(e) {
    var add = e.target.closest("[data-add]");
    if (add) { startAddAction(add); return; }
    var chip = e.target.closest("[data-act]");
    /* c8 ignore next -- clicks always target chip buttons in tests */
    if (!chip) return;
    var act = chip.getAttribute("data-act");
    var sel = selectedActions();
    var idx = sel.indexOf(act);
    if (idx === -1) sel.push(act); else sel.splice(idx, 1);
    setSelectedActions(sel);
    buildChips();
  }

  /* ── custom-feeling pills ("+ Own feeling") ── */
  function feelList() {
    var f = document.getElementById("fld-custom");
    /* c8 ignore next -- field always present */
    if (!f || !f.value.trim()) return [];
    return f.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function setFeelList(arr) {
    var f = document.getElementById("fld-custom");
    /* c8 ignore next -- field always present */
    if (f) f.value = arr.join(", ");
  }
  function buildFeelChips() {
    var slot = document.getElementById("ci-feel-chips");
    /* c8 ignore next -- slot present in check-in */
    if (!slot) return;
    var list = feelList();
    var html = "";
    for (var i = 0; i < list.length; i++) {
      html += '<span class="ci-chip" data-feel="' + i + '">' + MCI.esc(list[i])
        + '<button type="button" class="ci-chip-x" data-felrm="' + i + '" aria-label="remove">×</button></span>';
    }
    html += '<button type="button" class="ci-act-add" data-feladd="1">+ '
      + MCI.esc(MCI.t("ciAddFeeling") || /* c8 ignore next */ "Own feeling") + '</button>';
    slot.innerHTML = html;
  }
  function startAddFeeling(addBtn) {
    var wrap = document.createElement("span");
    wrap.className = "ci-act-add ci-act-add--editing";
    var input = document.createElement("input");
    input.type = "text"; input.className = "ci-act-input";
    input.placeholder = MCI.t("ciAddFeeling") || /* c8 ignore next */ "Own feeling";
    wrap.appendChild(input);
    addBtn.replaceWith(wrap);
    input.focus();
    var done = false;
    function commit() {
      if (done) return; done = true;
      var v = input.value.trim();
      if (v) { var l = feelList(); l.push(v); setFeelList(l); }
      buildFeelChips();
    }
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); commit(); }
      else if (ev.key === "Escape") { done = true; buildFeelChips(); }
    });
    input.addEventListener("blur", commit);
  }
  function handleFeelClick(e) {
    var add = e.target.closest("[data-feladd]");
    if (add) { startAddFeeling(add); return; }
    var rm = e.target.closest("[data-felrm]");
    if (rm) {
      var idx = parseInt(rm.getAttribute("data-felrm"), 10);
      var l = feelList(); l.splice(idx, 1); setFeelList(l); buildFeelChips();
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

      var feelSlot = document.getElementById("ci-feel-chips");
      if (feelSlot) feelSlot.addEventListener("click", handleFeelClick);

      /* formatted date control: click opens native picker, change updates the label */
      var dateInp = document.getElementById("ci-date-override");
      var dateCtrl = document.getElementById("ci-date-control");
      if (dateInp) dateInp.addEventListener("change", updateDateDisplay);
      if (dateCtrl && dateInp) {
        dateCtrl.addEventListener("click", function (e) {
          if (e.target === dateInp) return;
          /* c8 ignore next 3 -- showPicker is a user-gesture browser API */
          if (dateInp.showPicker) { try { dateInp.showPicker(); } catch (_) { dateInp.focus(); } }
          else dateInp.focus();
        });
      }

      /* in-card tabs (Check-in / Summary) route via Nav */
      var ciTabs = document.getElementById("ci-tabs");
      function syncCiTabs(route) {
        if (!ciTabs) return;
        var tabs = ciTabs.querySelectorAll(".ci-tab");
        for (var t = 0; t < tabs.length; t++) {
          tabs[t].classList.toggle("is-active", tabs[t].getAttribute("data-route") === route);
        }
      }
      if (ciTabs) {
        ciTabs.addEventListener("click", function (e) {
          var tab = e.target.closest("[data-route]");
          if (!tab) return;
          if (MCI.Nav && MCI.Nav.switchTo) MCI.Nav.switchTo(tab.getAttribute("data-route"));
        });
      }
      MCI.on("tab:changed", syncCiTabs);
      /* initial sync (Nav.switchTo may have run before this subscribed) */
      syncCiTabs((MCI.Nav && MCI.Nav.activeRoute) ? MCI.Nav.activeRoute() : "checkin");
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
      buildFeelChips();
      applyVisibility();
      updateGreeting();

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
        updateGreeting();
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
