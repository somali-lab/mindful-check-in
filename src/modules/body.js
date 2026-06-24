/* Mindful Check-in v4 – Body Signals */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _activeZones = {};
  var _display, _svg;

  /* tap cycles intensity: 0 → 1 (light) → 2 (medium) → 3 (strong) → 0 */
  function toggle(zoneId) {
    var cur = _activeZones[zoneId] || 0;
    var nxt = (cur + 1) % 4;
    if (nxt === 0) delete _activeZones[zoneId];
    else _activeZones[zoneId] = nxt;
    repaint();
    MCI.emit("body:toggled", getList());
  }

  function repaint() {
    if (!_svg) return;
    var all = _svg.querySelectorAll(".bz");
    for (var i = 0; i < all.length; i++) {
      var zId = all[i].getAttribute("data-zone");
      var lvl = _activeZones[zId] || 0;
      all[i].classList.toggle("is-on", lvl > 0);
      all[i].classList.toggle("lvl-1", lvl === 1);
      all[i].classList.toggle("lvl-2", lvl === 2);
      all[i].classList.toggle("lvl-3", lvl === 3);
    }
    showDisplay();
  }

  var HEAT = { 1: "#e7c08a", 2: "#d99458", 3: "#bf6438" };

  function showDisplay() {
    if (!_display) return;
    var list = getList();
    if (list.length === 0) {
      _display.innerHTML = "";
      _display.textContent = MCI.t("bodyNone") || "No body signals selected";
      _display.classList.add("is-empty");
      return;
    }
    _display.classList.remove("is-empty");
    /* compact: intensity dot + zone name, wrapped (design) */
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var id = list[i];
      var lvl = _activeZones[id] || 2;
      var key = MCI.Data.zoneKeys[id];
      var name = key ? MCI.t(key) : id;
      html += '<span class="body-sig"><span class="body-sig-dot" style="background:'
        + HEAT[lvl] + '"></span>' + MCI.esc(name) + '</span>';
    }
    _display.innerHTML = html;
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
        /* persisted entries store zone ids only — restore at medium intensity */
        for (var i = 0; i < arr.length; i++) _activeZones[arr[i]] = 2;
      }
      repaint();
    },

    getZones: function () { return getList(); }
  };
})();
