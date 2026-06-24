/* Mindful Check-in v4 – Mood Matrix (ported from original) */
(function () {
  "use strict";
  var MCI = window.MCI;
  var Data = MCI.Data;

  var _slot, _display, _pickedRow = -1, _pickedCol = -1;

  function buildGrid() {
    _slot = document.getElementById("mood-slot");
    if (!_slot) return;

    /* c8 ignore next -- lang always initialized */
    var lang = MCI.lang || "en";
    /* c8 ignore next -- both languages exist */
    var labels = Data.moodLabels[lang] || Data.moodLabels.en;
    var colors = Data.moodColors;

    var fragment = document.createDocumentFragment();

    /* Grid rows: row 0 (top = high energy) down to row 9 (bottom = low energy) */
    for (var r = 0; r < 10; r++) {
      for (var c = 0; c < 10; c++) {
        var picked = (_pickedRow === r && _pickedCol === c);
        var cellBgColor = colors[r][c];
        var isLight = MCI.hasLightBackground(cellBgColor);

        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "mood-cell" + (picked ? " is-selected" : "") + (isLight ? " mood-cell--light" : "");
        cell.textContent = labels[r][c];
        cell.setAttribute("data-mr", String(r));
        cell.setAttribute("data-mc", String(c));
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
        cell.style.backgroundColor = cellBgColor;

        fragment.appendChild(cell);
      }
    }

    _slot.innerHTML = "";
    _slot.appendChild(fragment);
    updateDisplay();
  }

  function updateDisplay() {
    /* c8 ignore next -- display element always present */
    if (!_display) return;
    if (_pickedRow < 0 || _pickedCol < 0) {
      _display.textContent = MCI.t("moodNone") || /* c8 ignore next */ "No mood selected";
      _display.classList.add("is-empty");
      return;
    }
    _display.classList.remove("is-empty");
    /* c8 ignore next -- lang always initialized */
    var lang = MCI.lang || "en";
    /* c8 ignore next -- both languages exist */
    var labels = Data.moodLabels[lang] || Data.moodLabels.en;
    var label = labels[_pickedRow][_pickedCol];
    _display.textContent = label + " (E " + (10 - _pickedRow) + "/10, V " + (_pickedCol + 1) + "/10)";
  }

  function pick(row, col) {
    if (_pickedRow === row && _pickedCol === col) {
      _pickedRow = -1; _pickedCol = -1;
    } else {
      _pickedRow = row; _pickedCol = col;
    }
    buildGrid();
    MCI.emit("mood:selected", getSelection());
  }

  function getSelection() {
    if (_pickedRow < 0) return null;
    /* c8 ignore next -- lang always initialized */
    var lang = MCI.lang || "en";
    /* c8 ignore next -- both languages exist */
    var labels = Data.moodLabels[lang] || Data.moodLabels.en;
    return {
      row: _pickedRow,
      col: _pickedCol,
      energy: 10 - _pickedRow,
      valence: _pickedCol + 1,
      label: labels[_pickedRow][_pickedCol],
      color: Data.moodColors[_pickedRow][_pickedCol]
    };
  }

  MCI.Mood = {
    init: function () {
      _slot = document.getElementById("mood-slot");
      _display = document.getElementById("mood-display");
      /* c8 ignore next -- slot element always present */
      if (!_slot) return;

      _slot.addEventListener("click", function (e) {
        var cell = e.target.closest(".mood-cell");
        if (!cell) return;
        pick(parseInt(cell.getAttribute("data-mr"), 10), parseInt(cell.getAttribute("data-mc"), 10));
      });
      _slot.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          var cell = e.target.closest(".mood-cell");
          if (cell) {
            e.preventDefault();
            pick(parseInt(cell.getAttribute("data-mr"), 10), parseInt(cell.getAttribute("data-mc"), 10));
          }
        }
      });

      /* c8 ignore next 2 -- reset button always present */
      var resetBtn = document.getElementById("mood-btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          _pickedRow = -1; _pickedCol = -1;
          buildGrid();
          MCI.emit("mood:selected", null);
        });
      }

      MCI.on("language:changed", function () { buildGrid(); });
      MCI.on("theme:changed", function () { buildGrid(); });

      buildGrid();
    },

    setSelection: function (row, col) {
      _pickedRow = (row != null && row >= 0) ? row : -1;
      _pickedCol = (col != null && col >= 0) ? col : -1;
      buildGrid();
    },

    getSelection: getSelection
  };
})();
