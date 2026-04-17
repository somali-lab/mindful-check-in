/* Mindful Check-in v4 – Dashboard */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _summarySlot, _historyGrid, _historyModes;
  var _historyMode = "core";

  /* ── summary stats ── */
  function renderSummary() {
    _summarySlot = document.getElementById("summary-slot");
    /* c8 ignore next -- summary element always present */
    if (!_summarySlot) return;

    var entries = MCI.loadEntries();
    var keys = Object.keys(entries);
    var total = keys.length;

    if (total === 0) {
      _summarySlot.innerHTML = '<p class="empty-state">' + MCI.esc(MCI.t("summaryEmpty") || /* c8 ignore next */ "No entries yet.") + '</p>';
      return;
    }

    /* compute stats via shared helper */
    var stats = MCI.computeStats(entries);
    var streak = stats.streak;
    var avgScore = stats.avgScore;
    var topEmotion = stats.topEmotion;
    var hasTodayEntry = stats.hasTodayEntry;
    var todayKey = MCI.todayKey();

    var html = '';

    /* today row */
    html += '<div class="summary-today' + (hasTodayEntry ? ' is-done' : '') + '">';
    html += '<span class="summary-today-icon">' + (hasTodayEntry ? '\u2705' : '\u2b55') + '</span>';
    html += '<span>' + MCI.esc(hasTodayEntry
      ? (MCI.t("summaryDone") || /* c8 ignore next */ "Today\u2019s check-in done")
      : (MCI.t("summaryPending") || /* c8 ignore next */ "No check-in yet today")) + '</span>';
    html += '</div>';

    /* 7-day week heatmap */
    var locale = MCI.getLocale();
    html += '<div class="summary-week">';
    for (var w = 6; w >= 0; w--) {
      var wd = new Date();
      wd.setDate(wd.getDate() - w);
      var wdk = MCI.formatDate(wd);
      var wFound = MCI.findEntryForDay(entries, keys, wdk);
      var wEntry = wFound ? wFound.entry : null;
      var wScore = wEntry ? (wEntry.moodScore || 2) : 0;
      var wClass = wScore === 0 ? "heat-empty" : wScore >= 3 ? "heat-high" : wScore >= 2 ? "heat-mid" : "heat-low";
      var wIsToday = wdk === todayKey;
      var wLabel = wd.toLocaleDateString(locale, { weekday: "short" });
      html += '<div class="heat-day' + (wIsToday ? " heat-today" : "") + '">';
      html += '<div class="heat-dot ' + wClass + '"></div>';
      html += '<span class="heat-label">' + MCI.esc(wLabel) + '</span>';
      html += '</div>';
    }
    html += '</div>';

    /* stats row */
    html += '<div class="summary-stats">';
    html += '<div class="summary-stat"><span class="summary-stat-value">' + total + '</span><span class="summary-stat-label">' + MCI.esc(MCI.t("statTotal") || /* c8 ignore next */ "Total") + '</span></div>';
    html += '<div class="summary-stat"><span class="summary-stat-value">' + streak + '</span><span class="summary-stat-label">' + MCI.esc(MCI.t("statStreak") || /* c8 ignore next */ "Streak") + '</span></div>';
    html += '<div class="summary-stat"><span class="summary-stat-value">' + avgScore + '</span><span class="summary-stat-label">' + MCI.esc(MCI.t("statAvgMood") || /* c8 ignore next */ "Avg Mood") + '</span></div>';
    html += '<div class="summary-stat"><span class="summary-stat-value">' + MCI.esc(topEmotion) + '</span><span class="summary-stat-label">' + MCI.esc(MCI.t("statTopFeeling") || /* c8 ignore next */ "Top Feeling") + '</span></div>';
    html += '</div>';

    _summarySlot.innerHTML = html;
  }

  /* ── 28-day history grid ── */
  var HISTORY_MODES = [
    { key: "core",      tKey: "histCore",      comp: "coreFeeling" },
    { key: "mood",      tKey: "histMood",      comp: "moodMatrix" },
    { key: "physical",  tKey: "modePhysical",  comp: "energyPhysical" },
    { key: "mental",    tKey: "modeMental",     comp: "energyMental" },
    { key: "emotional", tKey: "modeEmotional",  comp: "energyEmotional" }
  ];

  function renderHistoryModes() {
    _historyModes = document.getElementById("history-modes");
    /* c8 ignore next -- modes element always present */
    if (!_historyModes) return;
    var settings = MCI.loadSettings();
    var comps = settings.components || {};
    var html = "";
    for (var i = 0; i < HISTORY_MODES.length; i++) {
      var m = HISTORY_MODES[i];
      if (comps[m.comp] === false) continue;
      html += '<button type="button" class="cal-mode-btn' + (m.key === _historyMode ? " is-active" : "") + '" data-hmode="' + m.key + '">'
        + MCI.esc(MCI.t(m.tKey) || m.key) + '</button>';
    }
    _historyModes.innerHTML = html;
  }

  function renderHistoryGrid() {
    _historyGrid = document.getElementById("history-grid");
    /* c8 ignore next -- grid element always present */
    if (!_historyGrid) return;

    var entries = MCI.loadEntries();
    var heatData = MCI.buildHeatmapData(entries);
    var html = "";

    /* Day-of-week headers */
    for (var h = 0; h < 7; h++) {
      html += '<div class="cal-day-header">' + heatData.dayNames[h] + '</div>';
    }

    /* Leading spacers to align first day */
    for (var p = 0; p < heatData.leadingSpacers; p++) {
      html += '<div class="cal-cell-pad"></div>';
    }

    for (var i = 0; i < heatData.days.length; i++) {
      var day = heatData.days[i];
      var statusClass = "cal-empty";
      var tooltip = day.dayKey;

      if (day.entry) {
        statusClass = getCellClass(day.entry);
        tooltip += " \u2014 " + getCellLabel(day.entry);
      }

      var isToday = day.isToday ? " cal-today" : "";
      html += '<div class="cal-cell ' + statusClass + isToday + '"'
        + (day.entryKey ? ' data-entry-key="' + MCI.esc(day.entryKey) + '"' : '')
        + ' title="' + MCI.esc(tooltip) + '">'
        + '<span class="cal-day-num">' + day.label + '</span>'
        + '</div>';
    }

    _historyGrid.innerHTML = html;
  }

  function getCellClass(entry) {
    if (_historyMode === "core") {
      var s = entry.moodScore || 2;
      if (s >= 3) return "cal-high";
      if (s >= 2) return "cal-mid";
      return "cal-low";
    }
    if (_historyMode === "mood") {
      if (entry.moodCol >= 0) {
        var v = entry.moodCol;
        if (v >= 6) return "cal-high";
        if (v >= 4) return "cal-mid";
        return "cal-low";
      }
      return "cal-empty";
    }
    if (_historyMode === "physical") return energyCellClass(entry, "physical");
    if (_historyMode === "mental") return energyCellClass(entry, "mental");
    if (_historyMode === "emotional") return energyCellClass(entry, "emotional");
    return "cal-empty";
  }

  function energyCellClass(entry, key) {
    if (!entry.energy || typeof entry.energy[key] !== "number") return "cal-empty";
    var v = entry.energy[key];
    if (v >= MCI.THRESHOLDS.high) return "cal-high";
    if (v >= MCI.THRESHOLDS.mid) return "cal-mid";
    return "cal-low";
  }

  function getCellLabel(entry) {
    if (_historyMode === "core") return entry.coreFeeling ? MCI.emotionLabel(entry.coreFeeling) : "\u2014";
    if (_historyMode === "mood") return entry.moodLabel || "\u2014";
    if (_historyMode === "physical" || _historyMode === "mental" || _historyMode === "emotional") {
      if (entry.energy && typeof entry.energy[_historyMode] === "number") {
        return entry.energy[_historyMode] + "%";
      }
      return "\u2014";
    }
    return "\u2014";
  }

  function refresh() {
    renderSummary();
    renderHistoryModes();
    renderHistoryGrid();
  }

  MCI.Dashboard = {
    init: function () {
      refresh();

      /* mode switcher */
      var modesEl = document.getElementById("history-modes");
      if (modesEl) {
        modesEl.addEventListener("click", function (e) {
          var btn = e.target.closest("[data-hmode]");
          if (btn) {
            _historyMode = btn.getAttribute("data-hmode");
            renderHistoryModes();
            renderHistoryGrid();
          }
        });
      }

      /* click cell → load entry */
      MCI.bindEntryClick("history-grid");

      MCI.onDataChange(function () { refresh(); });
    },

    refresh: refresh
  };
})();
