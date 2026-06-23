/* Mindful Check-in v4 – Emotion Wheel (Herontwerp: muted donut, external labels, pill tabs) */
(function () {
  "use strict";
  var MCI = window.MCI;
  var Data = MCI.Data;
  var SVGNS = "http://www.w3.org/2000/svg";

  var _svg, _display, _select, _tabs, _picked = "";

  var CENTER = 180, RO = 100, RI = 60, LABEL_R = 118;

  function polar(cx, cy, r, a) {
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function ringPath(a0, a1, ri, ro) {
    var oS = polar(CENTER, CENTER, ro, a0), oE = polar(CENTER, CENTER, ro, a1);
    var iE = polar(CENTER, CENTER, ri, a1), iS = polar(CENTER, CENTER, ri, a0);
    var large = (a1 - a0) > Math.PI ? 1 : 0;
    return "M " + oS.x.toFixed(2) + " " + oS.y.toFixed(2) +
      " A " + ro + " " + ro + " 0 " + large + " 1 " + oE.x.toFixed(2) + " " + oE.y.toFixed(2) +
      " L " + iE.x.toFixed(2) + " " + iE.y.toFixed(2) +
      " A " + ri + " " + ri + " 0 " + large + " 0 " + iS.x.toFixed(2) + " " + iS.y.toFixed(2) + " Z";
  }

  function el(name, attrs) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }

  function drawWheel(variant) {
    /* c8 ignore next -- SVG always present */
    if (!_svg) return;
    /* c8 ignore next -- act variant always exists */
    var config = Data.wheels[variant] || Data.wheels.act;
    var emotions = config.emotions, colors = config.colors, n = emotions.length;
    var frag = document.createDocumentFragment();
    _svg.innerHTML = "";
    /* start at top (12 o'clock) */
    var offset = -Math.PI / 2;

    for (var i = 0; i < n; i++) {
      var a0 = offset + (i * 2 * Math.PI) / n;
      var a1 = offset + ((i + 1) * 2 * Math.PI) / n;
      var mid = (a0 + a1) / 2;
      var emId = emotions[i].id;
      var label = MCI.t(emotions[i].tKey) || /* c8 ignore next */ emId;
      var isSelected = _picked === emId;

      var path = el("path", {
        d: ringPath(a0, a1, RI, RO),
        fill: colors[i % colors.length],
        "class": "emotion-segment" + (isSelected ? " is-selected" : ""),
        "data-em": emId,
        "data-index": String(i),
        "data-total": String(n),
        role: "button",
        tabindex: "0",
        "aria-label": label
      });
      /* pop selected segment outward slightly */
      if (isSelected) {
        var d = polar(0, 0, 6, mid);
        path.style.transform = "translate(" + d.x.toFixed(2) + "px," + d.y.toFixed(2) + "px)";
      }
      frag.appendChild(path);

      /* external horizontal label */
      var lp = polar(CENTER, CENTER, LABEL_R, mid);
      var cos = Math.cos(mid);
      var anchor = cos > 0.25 ? "start" : (cos < -0.25 ? "end" : "middle");
      var t = el("text", {
        x: lp.x.toFixed(1),
        y: lp.y.toFixed(1),
        "class": "wheel-ext-label" + (isSelected ? " is-selected" : ""),
        "text-anchor": anchor,
        "dominant-baseline": "middle"
      });
      t.textContent = label;
      frag.appendChild(t);
    }

    /* center readout */
    if (_picked) {
      var sub = el("text", { x: CENTER, y: CENTER - 11, "class": "wheel-center-sub", "text-anchor": "middle", "dominant-baseline": "middle" });
      sub.textContent = (MCI.t(config.labelKey) || "").toUpperCase();
      frag.appendChild(sub);
      var main = el("text", { x: CENTER, y: CENTER + 9, "class": "wheel-center-main", "text-anchor": "middle", "dominant-baseline": "middle" });
      main.textContent = MCI.emotionLabel(_picked);
      frag.appendChild(main);
    } else {
      var hint = el("text", { x: CENTER, y: CENTER, "class": "wheel-center-empty", "text-anchor": "middle", "dominant-baseline": "middle" });
      hint.textContent = MCI.t("pickWheel") || "";
      frag.appendChild(hint);
    }

    _svg.classList.toggle("has-selection", Boolean(_picked));
    _svg.appendChild(frag);
    updateDisplay();
  }

  function buildTabs() {
    /* c8 ignore next -- tabs slot present in check-in */
    if (!_tabs) return;
    var cur = _select ? _select.value : "act";
    _tabs.innerHTML = "";
    var keys = ["act", "plutchik", "ekman", "junto", "extended"];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      /* c8 ignore next -- all keys exist */
      if (!Data.wheels[key]) continue;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wheel-pill" + (key === cur ? " is-active" : "");
      btn.setAttribute("data-wheel", key);
      btn.textContent = MCI.t(Data.wheels[key].labelKey) || key;
      _tabs.appendChild(btn);
    }
  }

  function updateDisplay() {
    /* c8 ignore next -- display element always present */
    if (!_display) return;
    if (!_picked) {
      _display.textContent = MCI.t("emotionNone");
      _display.classList.add("is-empty");
      return;
    }
    _display.classList.remove("is-empty");
    _display.textContent = MCI.emotionLabel(_picked);
  }

  function selectEmotion(emId) {
    _picked = _picked === emId ? "" : emId;
    /* c8 ignore next -- _select always present */
    drawWheel(_select ? _select.value : "act");
    MCI.emit("wheel:selected", _picked);
  }

  function setVariant(variant) {
    /* c8 ignore next -- _select always present */
    if (_select) _select.value = variant;
    buildTabs();
    drawWheel(variant);
  }

  MCI.Wheel = {
    init: function () {
      _svg = document.getElementById("wheel-svg");
      _display = document.getElementById("wheel-display");
      _select = document.getElementById("sel-wheel");
      _tabs = document.getElementById("wheel-tabs");

      /* c8 ignore next -- SVG element always present */
      if (!_svg) return;

      _svg.addEventListener("click", function (e) {
        var seg = e.target.closest("[data-em]");
        if (seg) selectEmotion(seg.getAttribute("data-em"));
      });
      _svg.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          var seg = e.target.closest("[data-em]");
          if (seg) { e.preventDefault(); selectEmotion(seg.getAttribute("data-em")); }
        }
      });

      /* pill tabs change the variant (kept in the hidden #sel-wheel for state) */
      /* c8 ignore next -- tabs slot present in check-in */
      if (_tabs) {
        _tabs.addEventListener("click", function (e) {
          var pill = e.target.closest("[data-wheel]");
          if (!pill) return;
          var key = pill.getAttribute("data-wheel");
          /* c8 ignore next -- _select always present */
          if (_select) _select.value = key;
          _picked = "";
          buildTabs();
          drawWheel(key);
          MCI.emit("wheel:selected", "");
        });
      }

      /* c8 ignore next 2 -- select element always present (kept for state/back-compat) */
      if (_select) {
        _select.addEventListener("change", function () {
          _picked = "";
          buildTabs();
          drawWheel(_select.value);
          MCI.emit("wheel:selected", "");
        });
      }

      /* c8 ignore next 2 -- reset button always present */
      var resetBtn = document.getElementById("whl-btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          _picked = "";
          /* c8 ignore next -- _select always present */
          drawWheel(_select ? _select.value : "act");
          /* c8 ignore next 2 -- custom field always present */
          var customFld = document.getElementById("fld-custom");
          if (customFld) customFld.value = "";
          MCI.emit("wheel:selected", "");
        });
      }

      MCI.on("language:changed", function () {
        buildTabs();
        /* c8 ignore next -- _select always present */
        drawWheel(_select ? _select.value : "act");
      });
      MCI.on("settings:changed", function (s) {
        /* c8 ignore next -- settings always has type and _select always present */
        if (s && s.defaultWheelType && _select && _select.value !== s.defaultWheelType) {
          _select.value = s.defaultWheelType;
          buildTabs();
          drawWheel(s.defaultWheelType);
        }
      });

      var settings = MCI.loadSettings();
      /* c8 ignore next -- _select always present */
      if (_select && settings.defaultWheelType) _select.value = settings.defaultWheelType;
      buildTabs();
      /* c8 ignore next -- _select always present */
      drawWheel(_select ? _select.value : "act");
    },

    setPicked: function (emId) {
      _picked = emId || /* c8 ignore next */ "";
      /* c8 ignore next -- _select always present */
      drawWheel(_select ? _select.value : "act");
    },

    setVariant: setVariant,

    getPicked: function () { return _picked; }
  };
})();
