/* Mindful Check-in v4 – Emotion Wheel (ported from original) */
(function () {
  "use strict";
  var MCI = window.MCI;
  var Data = MCI.Data;

  var _svg, _display, _select, _picked = "";

  function drawWheel(variant) {
    if (!_svg) return;
    var config = Data.wheels[variant] || Data.wheels.act;
    var emotions = config.emotions;
    var colors = config.colors;
    var n = emotions.length;
    var centerX = 180, centerY = 180, radius = 145;
    var fragment = document.createDocumentFragment();

    _svg.innerHTML = "";

    for (var i = 0; i < n; i++) {
      var startAngle = (i * 2 * Math.PI) / n;
      var endAngle = ((i + 1) * 2 * Math.PI) / n;
      var x1 = centerX + radius * Math.cos(startAngle);
      var y1 = centerY + radius * Math.sin(startAngle);
      var x2 = centerX + radius * Math.cos(endAngle);
      var y2 = centerY + radius * Math.sin(endAngle);
      var emId = emotions[i].id;
      var label = MCI.t(emotions[i].tKey) || emId;
      var isSelected = _picked === emId;

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d",
        "M " + centerX + " " + centerY +
        " L " + x1.toFixed(2) + " " + y1.toFixed(2) +
        " A " + radius + " " + radius + " 0 0 1 " + x2.toFixed(2) + " " + y2.toFixed(2) + " Z");
      path.setAttribute("fill", colors[i % colors.length]);
      path.setAttribute("class", "emotion-segment" + (isSelected ? " is-selected" : ""));
      path.setAttribute("data-em", emId);
      path.setAttribute("data-index", String(i));
      path.setAttribute("data-total", String(n));
      path.setAttribute("role", "button");
      path.setAttribute("tabindex", "0");
      path.setAttribute("aria-label", label);

      /* Pop out selected segment */
      if (isSelected) {
        var midAngle = ((i + 0.5) * 2 * Math.PI) / n;
        var dx = Math.cos(midAngle) * 8;
        var dy = Math.sin(midAngle) * 8;
        path.style.transform = "translate(" + dx.toFixed(2) + "px, " + dy.toFixed(2) + "px)";
      }

      fragment.appendChild(path);

      /* Label text */
      var labelAngle = (startAngle + endAngle) / 2;
      var labelRadius = radius * 0.6;
      var labelX = centerX + labelRadius * Math.cos(labelAngle);
      var labelY = centerY + labelRadius * Math.sin(labelAngle);
      var rotationDeg = labelAngle * 180 / Math.PI;
      var adjustedRotation = (rotationDeg > 90 && rotationDeg < 270) ? rotationDeg + 180 : rotationDeg;

      var isLightSegment = MCI.hasLightBackground(colors[i % colors.length]);
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(labelX.toFixed(1)));
      text.setAttribute("y", String(labelY.toFixed(1)));
      text.setAttribute("class", "emotion-segment-label" + (isLightSegment ? " segment-label--light" : ""));
      text.setAttribute("transform", "rotate(" + adjustedRotation.toFixed(1) + " " + labelX.toFixed(1) + " " + labelY.toFixed(1) + ")");
      text.textContent = label;
      fragment.appendChild(text);
    }

    _svg.classList.toggle("has-selection", Boolean(_picked));
    _svg.appendChild(fragment);
    updateDisplay();
  }

  function updateDisplay() {
    if (!_display) return;
    if (!_picked) {
      _display.textContent = MCI.t("emotionNone");
      _display.classList.add("is-empty");
      return;
    }
    _display.classList.remove("is-empty");
    var label = _picked;
    var wheels = Data.wheels;
    var keys = Object.keys(wheels);
    for (var w = 0; w < keys.length; w++) {
      var ems = wheels[keys[w]].emotions;
      for (var e = 0; e < ems.length; e++) {
        if (ems[e].id === _picked) { label = MCI.t(ems[e].tKey) || _picked; break; }
      }
    }
    _display.textContent = label;
  }

  function selectEmotion(emId) {
    _picked = _picked === emId ? "" : emId;
    drawWheel(_select ? _select.value : "act");
    MCI.emit("wheel:selected", _picked);
  }

  MCI.Wheel = {
    init: function () {
      _svg = document.getElementById("wheel-svg");
      _display = document.getElementById("wheel-display");
      _select = document.getElementById("sel-wheel");

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

      if (_select) {
        _select.addEventListener("change", function () {
          _picked = "";
          drawWheel(_select.value);
          MCI.emit("wheel:selected", "");
        });
      }

      var resetBtn = document.getElementById("whl-btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          _picked = "";
          drawWheel(_select ? _select.value : "act");
          var customFld = document.getElementById("fld-custom");
          if (customFld) customFld.value = "";
          MCI.emit("wheel:selected", "");
        });
      }

      MCI.on("language:changed", function () {
        drawWheel(_select ? _select.value : "act");
      });
      MCI.on("settings:changed", function (s) {
        if (s && s.defaultWheelType && _select && _select.value !== s.defaultWheelType) {
          _select.value = s.defaultWheelType;
          drawWheel(s.defaultWheelType);
        }
      });

      var settings = MCI.loadSettings();
      if (_select && settings.defaultWheelType) _select.value = settings.defaultWheelType;
      drawWheel(_select ? _select.value : "act");
    },

    setPicked: function (emId) {
      _picked = emId || "";
      drawWheel(_select ? _select.value : "act");
    },

    setVariant: function (variant) {
      if (_select) _select.value = variant;
      drawWheel(variant);
    },

    getPicked: function () { return _picked; }
  };
})();
