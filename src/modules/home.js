/* Mindful Check-in v4 – Home / Dashboard (v3-style bento page) */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _swingDays = 28; /* selected mood-swings window */

  function render() {
    var entries = MCI.loadEntries();
    var keys = Object.keys(entries);
    var total = keys.length;

    /* ── compute stats via shared helper ── */
    var stats = MCI.computeStats(entries);
    var streak = stats.streak;
    var hasTodayEntry = stats.hasTodayEntry;
    var avgScore = stats.avgScore;

    /* ── populate stats ── */
    var elStreak = document.getElementById("home-streak");
    var elTotal = document.getElementById("home-total");
    var elAvg = document.getElementById("home-avg");
    var elStatus = document.getElementById("home-status");

    if (elStreak) elStreak.textContent = streak;
    if (elTotal) elTotal.textContent = total;
    if (elAvg) elAvg.textContent = avgScore;
    if (elStatus) {
      elStatus.textContent = hasTodayEntry
        ? (MCI.t("summaryDone") || "Today\u2019s check-in done")
        : (MCI.t("summaryPending") || "No check-in yet today");
    }

    /* ── 28-day heatmap ── */
    var heatEl = document.getElementById("home-heatmap");
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
        cls += "has-entry home-heat-" + MCI.scoreTier(day.entry.moodScore || 2);
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

    /* ── mood swings ── */
    renderSwings(entries);
  }

  /* Spread-based mood swings: a 0-100 score plus a sparkline of the trajectory,
     for both the emotion wheel and the mood matrix, over the chosen window. */
  function renderSwings(entries) {
    renderSwingCard(entries, "wheel", "home-swing-wheel-score", "home-swing-wheel-spark", "home-swing-wheel-sub");
    /* matrix has two axes; the shared count sub hangs off the valence row */
    renderSwingCard(entries, "valence", "home-swing-valence-score", "home-swing-valence-spark", "home-swing-matrix-sub");
    renderSwingCard(entries, "arousal", "home-swing-arousal-score", "home-swing-arousal-spark", null);
  }

  function renderSwingCard(entries, source, scoreId, sparkId, subId) {
    var data = MCI.computeSwing(entries, source, _swingDays);
    var scoreEl = document.getElementById(scoreId);
    var sparkEl = document.getElementById(sparkId);
    var subEl = document.getElementById(subId);

    if (scoreEl) scoreEl.textContent = data.score == null ? "—" : data.score;
    if (sparkEl) sparkEl.innerHTML = sparkSvg(data.series, data.min, data.max);
    if (subEl) {
      subEl.textContent = data.score == null
        ? (MCI.t("swingNoData") || "Not enough data yet")
        : (MCI.t("swingBasis") || "{count} check-ins").replace("{count}", data.count);
    }
  }

  /* Tiny inline sparkline (stretches to card width). Long windows are
     down-sampled into buckets so the line stays legible. */
  function sparkSvg(series, min, max) {
    if (!series || series.length < 2) return "";
    var pts = series, MAX = 48;
    if (pts.length > MAX) {
      var bucketed = [], size = pts.length / MAX;
      for (var b = 0; b < MAX; b++) {
        var s = Math.floor(b * size), en = Math.floor((b + 1) * size), sum = 0, n = 0;
        for (var j = s; j < en; j++) { sum += pts[j]; n++; }
        bucketed.push(n ? sum / n : pts[s]);
      }
      pts = bucketed;
    }
    var W = 100, H = 32, pad = 2, range = (max - min) || 1;
    var step = pts.length > 1 ? (W - 2 * pad) / (pts.length - 1) : 0;
    var d = "";
    for (var i = 0; i < pts.length; i++) {
      var x = pad + i * step;
      var y = pad + (1 - (pts[i] - min) / range) * (H - 2 * pad);
      d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">'
      + '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="1.5" '
      + 'stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }

  /* Build the circular streak progress ring (SVG markup). */
  function ringSvg(streak) {
    var target = 7, R = 30, C = 2 * Math.PI * R;
    var ratio = Math.max(0, Math.min(1, target > 0 ? streak / target : 0));
    var off = C * (1 - ratio);
    var label = (MCI.t("homeDays") || "days").toUpperCase();
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

  /* Render the 7-day "this week" heat strip (shared markup with Dashboard). */
  function renderWeek(entries) {
    var el = document.getElementById("home-week");
    if (!el) return;
    el.innerHTML = MCI.weekStripHtml(entries);
  }


  MCI.Home = {
    init: function () {
      render();

      /* Click heatmap cell → load entry in checkin tab */
      MCI.bindEntryClick("home-heatmap");

      /* CTA button → navigate to checkin */
      var ctaBtn = document.getElementById("home-btn-checkin");
      if (ctaBtn) {
        ctaBtn.addEventListener("click", function () {
          MCI.emit("navigate:route", "checkin");
        });
      }

      /* mood-swings window selector */
      var periodSel = document.getElementById("home-swing-period");
      if (periodSel) {
        periodSel.addEventListener("change", function () {
          var v = parseInt(periodSel.value, 10);
          _swingDays = isNaN(v) ? 28 : v;
          renderSwings(MCI.loadEntries());
        });
      }

      MCI.onDataChange(function () { render(); });
    }
  };
})();
