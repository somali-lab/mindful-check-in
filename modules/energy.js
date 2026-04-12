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

  function buildMeters() {
    _slot = document.getElementById("energy-slot");
    /* c8 ignore next -- slot always present */
    if (!_slot) return;

    var settings = MCI.loadSettings();
    var html = "";

    for (var m = 0; m < METERS.length; m++) {
      var mt = METERS[m];
      if (settings.components && settings.components[mt.fld] === false) continue;

      var labelKey = mt.key === "emotional" ? getEmotionalLabel(settings) : mt.labelKey;
      var lbl = MCI.t(labelKey) || mt.key;
      var val = _values[mt.key];
      var pct = typeof val === "number" ? val : 0;

      html += '<div class="energy-column">';
      html += '<div class="energy-meter-row">';

      /* scale labels (percentage: 100/75/50/25/0) */
      html += '<div class="energy-scale">';
      html += '<span data-sval="100" data-meter="' + mt.key + '">100</span>';
      html += '<span data-sval="75" data-meter="' + mt.key + '">75</span>';
      html += '<span data-sval="50" data-meter="' + mt.key + '">50</span>';
      html += '<span data-sval="25" data-meter="' + mt.key + '">25</span>';
      html += '<span data-sval="0" data-meter="' + mt.key + '">0</span>';
      html += '</div>';

      /* meter column with label + bar */
      html += '<div class="energy-meter-col">';
      html += '<span class="energy-type-label">' + MCI.esc(lbl) + '</span>';
      html += '<div class="energy-meter" data-energy-type="' + mt.key + '" data-meter="' + mt.key + '">';
      html += '<div class="energy-fill" style="height:' + pct + '%"></div>';
      html += '</div>';
      html += '</div>'; /* /energy-meter-col */

      html += '</div>'; /* /energy-meter-row */
      html += '</div>'; /* /energy-column */
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
    /* handle scale number click */
    var scaleSpan = e.target.closest("[data-sval]");
    if (scaleSpan) {
      var sKey = scaleSpan.getAttribute("data-meter");
      var sVal = parseInt(scaleSpan.getAttribute("data-sval"), 10);
      if (sKey && !isNaN(sVal)) {
        setMeter(sKey, sVal);
      }
      return;
    }

    /* handle meter bar click */
    var track = e.target.closest(".energy-meter");
    if (!track) return;
    var key = track.getAttribute("data-meter");
    if (!key) return;

    var rect = track.getBoundingClientRect();
    var clickY = e.clientY - rect.top;
    var pct = 1 - (clickY / rect.height);
    var val = Math.max(0, Math.min(100, Math.round(pct * 100)));

    setMeter(key, val);
  }

  function setMeter(key, val) {
    _values[key] = val;
    /* Update fill */
    var meter = _slot.querySelector('[data-energy-type="' + key + '"]');
    if (meter) {
      var fill = meter.querySelector(".energy-fill");
      if (fill) fill.style.height = val + "%";
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
