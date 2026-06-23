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

    /* ── streak ring ── */
    var ringEl = document.getElementById("home-streak-ring");
    if (ringEl) ringEl.innerHTML = ringSvg(streak);

    /* ── energy today ── */
    var elEnergy = document.getElementById("home-energy");
    if (elEnergy) {
      var pct = todayEnergyPct(entries);
      elEnergy.textContent = pct == null ? "—" : pct + "%";
    }

    /* ── this-week heatmap ── */
    renderWeek(entries);
  }

  /* Build the circular streak progress ring (SVG markup). */
  function ringSvg(streak) {
    var target = 7, R = 30, C = 2 * Math.PI * R;
    var ratio = Math.max(0, Math.min(1, target > 0 ? streak / target : 0));
    var off = C * (1 - ratio);
    var label = (MCI.t("homeDays") || /* c8 ignore next */ "days").toUpperCase();
    return '<svg viewBox="0 0 80 80" width="78" height="78" aria-hidden="true">'
      + '<circle class="home-ring-track" cx="40" cy="40" r="30" fill="none" stroke-width="7"/>'
      + '<circle class="home-ring-arc" cx="40" cy="40" r="30" fill="none" stroke-width="7" stroke-linecap="round"'
      + ' stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 40 40)"/>'
      + '<text class="home-ring-num" x="40" y="46" text-anchor="middle" font-size="22">' + streak + '</text>'
      + '<text class="home-ring-label" x="40" y="58" text-anchor="middle" font-size="8.5" letter-spacing="1">' + MCI.esc(label) + '</text>'
      + '</svg>';
  }

  /* Average energy (%) of today's entry, or null when not set. */
  function todayEnergyPct(entries) {
    var keys = Object.keys(entries), tk = MCI.todayKey();
    var fields = ["physical", "mental", "emotional"];
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf(tk) !== 0) continue;
      var en = entries[keys[i]].energy || {}, sum = 0, n = 0;
      for (var f = 0; f < fields.length; f++) {
        var v = en[fields[f]];
        if (typeof v === "number") { sum += v; n++; }
      }
      return n === 0 ? null : Math.round(sum / n);
    }
    return null;
  }

  /* Render the 7-day "this week" heatmap row. */
  function renderWeek(entries) {
    var el = document.getElementById("home-week");
    /* c8 ignore next -- week element always present */
    if (!el) return;
    var keys = Object.keys(entries), tk = MCI.todayKey();
    var locale = MCI.lang === "nl" ? "nl-NL" : "en-US";
    var html = "";
    for (var w = 6; w >= 0; w--) {
      var wd = new Date();
      wd.setDate(wd.getDate() - w);
      var wdk = MCI.formatDate(wd);
      var found = MCI.findEntryForDay(entries, keys, wdk);
      var sc = found ? (found.entry.moodScore || 2) : 0;
      var cls = sc === 0 ? "heat-empty" : sc >= 3 ? "heat-high" : sc >= 2 ? "heat-mid" : "heat-low";
      var lbl = wd.toLocaleDateString(locale, { weekday: "short" });
      html += '<div class="heat-day' + (wdk === tk ? " heat-today" : "") + '">'
        + '<div class="heat-dot ' + cls + '"></div>'
        + '<span class="heat-label">' + MCI.esc(lbl) + '</span></div>';
    }
    el.innerHTML = html;
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
