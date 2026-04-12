/* Mindful Check-in v4 – Body Signals */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _activeZones = {};
  var _display, _svg;

  function toggle(zoneId) {
    if (_activeZones[zoneId]) {
      delete _activeZones[zoneId];
    } else {
      _activeZones[zoneId] = true;
    }
    repaint();
    MCI.emit("body:toggled", getList());
  }

  function repaint() {
    if (!_svg) return;
    var all = _svg.querySelectorAll(".bz");
    for (var i = 0; i < all.length; i++) {
      var zId = all[i].getAttribute("data-zone");
      all[i].classList.toggle("is-on", !!_activeZones[zId]);
    }
    showDisplay();
  }

  function showDisplay() {
    if (!_display) return;
    var list = getList();
    if (list.length === 0) {
      _display.textContent = MCI.t("bodyNone") || "No body signals selected";
      _display.classList.add("is-empty");
      return;
    }
    _display.classList.remove("is-empty");
    var labels = [];
    for (var i = 0; i < list.length; i++) {
      var key = MCI.Data.zoneKeys[list[i]];
      labels.push(key ? MCI.t(key) : list[i]);
    }
    _display.textContent = labels.join(", ");
  }

  function getList() {
    var arr = [];
    for (var z = 0; z < MCI.Data.bodyZones.length; z++) {
      if (_activeZones[MCI.Data.bodyZones[z]]) arr.push(MCI.Data.bodyZones[z]);
    }
    return arr;
  }

  MCI.Body = {
    init: function () {
      _svg = document.getElementById("body-svg");
      _display = document.getElementById("body-display");
      if (!_svg) return;

      _svg.addEventListener("click", function (e) {
        var bz = e.target.closest(".bz");
        if (bz) toggle(bz.getAttribute("data-zone"));
      });

      var resetBtn = document.getElementById("bdy-btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          _activeZones = {};
          repaint();
          var noteEl = document.getElementById("fld-body-note");
          if (noteEl) noteEl.value = "";
          MCI.emit("body:toggled", []);
        });
      }

      MCI.on("language:changed", function () { showDisplay(); });

      repaint();
    },

    setZones: function (arr) {
      _activeZones = {};
      if (arr && arr.length) {
        for (var i = 0; i < arr.length; i++) _activeZones[arr[i]] = true;
      }
      repaint();
    },

    getZones: function () { return getList(); }
  };
})();
