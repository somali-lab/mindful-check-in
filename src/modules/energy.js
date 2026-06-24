/* Mindful Check-in v4 – Energy Meters (percentage-based, ported from original) */
(function () {
  "use strict";
  var MCI = window.MCI;

  var METERS = [
    { key: "physical", fld: "energyPhysical", labelKey: "energyPhysical" },
    { key: "mental",   fld: "energyMental",   labelKey: "energyMental" },
    { key: "emotional", fld: "energyEmotional", labelKey: "energyEmotional" }
  ];

  var _values = { physical: null, mental: null, emotional: null };
  var _slot, _display;

  function getEmotionalLabel(settings) {
    var labelMap = {
      emotionalSocial: "energyEmotionalSocial",
      emotional: "energyEmotional",
      social: "energySocial"
    };
    var setting = settings.energyEmotionalLabel || "emotionalSocial";
    return labelMap[setting] || "energyEmotional";
  }

  var SEGMENTS = 20;

  function buildMeters() {
    _slot = document.getElementById("energy-slot");
    /* c8 ignore next -- slot always present */
    if (!_slot) return;

    var settings = MCI.loadSettings();
    var html = "";

    for (var m = 0; m < METERS.length; m++) {
      var mt = METERS[m];
      if (settings.components && settings.components[mt.fld] === false) continue;

      /* compact bar label; the emotional channel honours the configured
         third-label setting (Emotional / Social / Emotional + Social) */
      var labelKey = mt.key === "emotional" ? getEmotionalLabel(settings) : mt.labelKey;
      var lbl = MCI.t(labelKey) || mt.key;
      var val = _values[mt.key];
      var hasVal = typeof val === "number";
      var pct = hasVal ? val : 0;
      var filled = Math.round((pct * SEGMENTS) / 100);

      /* horizontal segmented bar: label · segments · value */
      html += '<div class="nrg-row" data-energy-type="' + mt.key + '" data-meter="' + mt.key + '">';
      html += '<div class="nrg-label">' + MCI.esc(lbl) + '</div>';
      html += '<div class="nrg-track" data-meter="' + mt.key + '" data-energy-type="' + mt.key + '">';
      for (var s = 1; s <= SEGMENTS; s++) {
        html += '<span class="nrg-seg' + (s <= filled ? " is-on" : "") +
          '" data-meter="' + mt.key + '" data-seg="' + s + '"></span>';
      }
      html += '</div>';
      html += '<div class="nrg-val' + (hasVal ? "" : " is-empty") + '" data-meter="' + mt.key + '">' +
        (hasVal ? pct + "%" : "–") + '</div>';
      html += '</div>'; /* /nrg-row */
    }

    _slot.innerHTML = html;
    updateDisplay();
  }

  function updateDisplay() {
    _display = document.getElementById("energy-display");
    /* c8 ignore next -- display always present */
    if (!_display) return;
    var settings = MCI.loadSettings();
    var parts = [];
    if (settings.components.energyPhysical !== false && typeof _values.physical === "number") {
      parts.push(MCI.t("energyPhysical") + ": " + _values.physical + "%");
    }
    if (settings.components.energyMental !== false && typeof _values.mental === "number") {
      parts.push(MCI.t("energyMental") + ": " + _values.mental + "%");
    }
    if (settings.components.energyEmotional !== false && typeof _values.emotional === "number") {
      var emotLabel = MCI.t(getEmotionalLabel(settings));
      parts.push(emotLabel + ": " + _values.emotional + "%");
    }
    if (parts.length === 0) {
      _display.textContent = MCI.t("energyNone") || /* c8 ignore next */ "";
      _display.classList.add("is-empty");
    } else {
      _display.textContent = parts.join(" \u00b7 ");
      _display.classList.remove("is-empty");
    }
  }

  function handleClick(e) {
    /* click a specific segment → snap value to that segment */
    var seg = e.target.closest(".nrg-seg");
    if (seg) {
      var segKey = seg.getAttribute("data-meter");
      var idx = parseInt(seg.getAttribute("data-seg"), 10);
      if (segKey && !isNaN(idx)) {
        setMeter(segKey, Math.round((idx * 100) / SEGMENTS));
      }
      return;
    }

    /* click anywhere on the track → value from horizontal position */
    var track = e.target.closest(".nrg-track");
    if (!track) return;
    var key = track.getAttribute("data-meter");
    if (!key) return;
    var rect = track.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    var val = Math.max(0, Math.min(100, Math.round(pct * 100)));
    setMeter(key, val);
  }

  function setMeter(key, val) {
    _values[key] = val;
    /* update segment fill for this row */
    var row = _slot.querySelector('.nrg-row[data-energy-type="' + key + '"]');
    if (row) {
      var filled = Math.round((val * SEGMENTS) / 100);
      var segs = row.querySelectorAll(".nrg-seg");
      for (var i = 0; i < segs.length; i++) {
        if (i < filled) segs[i].classList.add("is-on");
        else segs[i].classList.remove("is-on");
      }
      var valEl = row.querySelector(".nrg-val");
      if (valEl) { valEl.textContent = val + "%"; valEl.classList.remove("is-empty"); }
    }

    updateDisplay();
    MCI.emit("energy:set", { key: key, value: val });
  }

  MCI.Energy = {
    init: function () {
      buildMeters();
      _slot = document.getElementById("energy-slot");
      /* c8 ignore next -- slot always present */
      if (_slot) _slot.addEventListener("click", handleClick);

      /* c8 ignore next 2 -- reset button always present */
      var resetBtn = document.getElementById("nrg-btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          _values = { physical: null, mental: null, emotional: null };
          buildMeters();
      /* c8 ignore next 2 -- note field always present */
      var noteEl = document.getElementById("fld-energy-note");
      if (noteEl) noteEl.value = "";
          MCI.emit("energy:set", null);
        });
      }

      MCI.on("language:changed", function () { buildMeters(); });
      MCI.on("settings:changed", function () { buildMeters(); });
    },

    setValues: function (obj) {
      if (obj) {
        _values.physical = typeof obj.physical === "number" ? obj.physical : null;
        _values.mental = typeof obj.mental === "number" ? obj.mental : null;
        _values.emotional = typeof obj.emotional === "number" ? obj.emotional : null;
      } else {
        _values.physical = null;
        _values.mental = null;
        _values.emotional = null;
      }
      buildMeters();
    },

    /* c8 ignore next 2 -- getter used by checkin collect */
    getValues: function () {
      return { physical: _values.physical, mental: _values.mental, emotional: _values.emotional };
    }
  };
})();
