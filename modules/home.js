/* Mindful Check-in v4 – Home / Dashboard (v3-style bento page) */
(function () {
  "use strict";
  var MCI = window.MCI;

  function render() {
    var entries = MCI.loadEntries();
    var keys = Object.keys(entries);
    var total = keys.length;

    /* ── compute stats via shared helper ── */
    var stats = MCI.computeStats(entries);
    var streak = stats.streak;
    var hasTodayEntry = stats.hasTodayEntry;
    var avgScore = stats.avgScore;
    var topEmotion = stats.topEmotion;

    /* ── populate stats ── */
    var elStreak = document.getElementById("home-streak");
    var elTotal = document.getElementById("home-total");
    var elAvg = document.getElementById("home-avg");
    var elMood = document.getElementById("home-mood");
    var elStatus = document.getElementById("home-status");

    /* c8 ignore start -- DOM elements always exist in full page */
    if (elStreak) elStreak.textContent = streak;
    if (elTotal) elTotal.textContent = total;
    if (elAvg) elAvg.textContent = avgScore;
    if (elMood) elMood.textContent = topEmotion;
    if (elStatus) {
      elStatus.textContent = hasTodayEntry
        ? (MCI.t("summaryDone") || /* c8 ignore next */ "Today\u2019s check-in done")
        : (MCI.t("summaryPending") || /* c8 ignore next */ "No check-in yet today");
    }
    /* c8 ignore stop */

    /* ── 28-day heatmap ── */
    var heatEl = document.getElementById("home-heatmap");
    /* c8 ignore next -- heatmap element always present */
    if (!heatEl) return;

    var heatData = MCI.buildHeatmapData(entries);
    var html = "";

    /* Day-of-week headers */
    for (var h = 0; h < 7; h++) {
      html += '<div class="home-heat-header">' + heatData.dayNames[h] + '</div>';
    }

    /* Leading empty cells to align first day to correct weekday column */
    for (var p = 0; p < heatData.leadingSpacers; p++) {
      html += '<div class="home-heat-cell home-heat-spacer"></div>';
    }

    for (var i = 0; i < heatData.days.length; i++) {
      var day = heatData.days[i];
      var cls = "home-heat-cell ";
      if (day.entry) {
        cls += "has-entry ";
        var score = day.entry.moodScore || 2;
        if (score >= 3) cls += "home-heat-high";
        else if (score >= 2) cls += "home-heat-mid";
        else cls += "home-heat-low";
      } else {
        cls += "home-heat-empty";
      }
      if (day.isToday) cls += " home-heat-today";

      html += '<div class="' + cls + '"'
        + (day.entryKey ? ' data-entry-key="' + MCI.esc(day.entryKey) + '"' : '')
        + ' title="' + MCI.esc(day.dayKey) + '">'
        + day.label + '</div>';
    }
    heatEl.innerHTML = html;
  }

  MCI.Home = {
    init: function () {
      render();

      /* Click heatmap cell → load entry in checkin tab */
      MCI.bindEntryClick("home-heatmap");

      /* CTA button → navigate to checkin */
      var ctaBtn = document.getElementById("home-btn-checkin");
      /* c8 ignore next -- CTA button always present */
      if (ctaBtn) {
        ctaBtn.addEventListener("click", function () {
          MCI.emit("navigate:route", "checkin");
        });
      }

      MCI.onDataChange(function () { render(); });
    }
  };
})();
