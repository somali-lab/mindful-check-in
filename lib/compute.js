/* Mindful Check-in v4 – Shared Computations: streak, moodScore, stats, heatmap */
(function () {
  "use strict";
  var MCI = window.MCI;

  /**
   * Calculate streak: consecutive days with entries from today backward.
   * @param {Object} entries - All entries keyed by dateKey
   * @returns {number} streak count
   */
  MCI.calculateStreak = function (entries) {
    var keys = Object.keys(entries).sort();
    keys.reverse();
    var streak = 0;
    var checkDate = new Date();
    for (var s = 0; s < keys.length; s++) {
      var kDate = MCI.dateFromKey(keys[s]);
      /* c8 ignore next -- date keys always valid */
      if (!kDate) continue;
      var kDay = MCI.formatDate(kDate);
      var cDay = MCI.formatDate(checkDate);
      if (kDay === cDay) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (kDay < cDay) {
        break;
      }
    }
    return streak;
  };

  /**
   * Compute mood score from an entry (1-3 scale).
   * Combines emotion score, mood grid valence, and energy average.
   * @param {Object} entry - A normalized entry
   * @returns {number} score (1, 2, or 3)
   */
  MCI.computeMoodScore = function (entry) {
    var total = 0, count = 0;

    /* emotion score */
    if (entry.coreFeeling) {
      var s = MCI.Data.moodScores[entry.coreFeeling];
      /* c8 ignore next -- score always exists for known emotions */
      if (s != null) { total += s; count++; }
    }

    /* mood grid valence (col 0 = worst, col 9 = best → normalize to 1-3) */
    if (entry.moodCol >= 0) {
      var v = Math.round((entry.moodCol / 9) * 2 + 1);
      total += v; count++;
    }

    /* energy average (0-100 scale) */
    if (entry.energy) {
      var eP = typeof entry.energy.physical === "number" ? entry.energy.physical : -1;
      var eM = typeof entry.energy.mental === "number" ? entry.energy.mental : -1;
      var eE = typeof entry.energy.emotional === "number" ? entry.energy.emotional : -1;
      var eSum = 0, eN = 0;
      if (eP >= 0) { eSum += eP; eN++; }
      if (eM >= 0) { eSum += eM; eN++; }
      if (eE >= 0) { eSum += eE; eN++; }
      if (eN > 0) {
        var avg = eSum / eN;
        var eScore = avg >= 67 ? 3 : avg >= 34 ? 2 : 1;
        total += eScore; count++;
      }
    }

    if (count === 0) return 2; /* neutral default */
    return Math.round(total / count);
  };

  /**
   * Compute summary statistics from entries.
   * @param {Object} entries - All entries keyed by dateKey
   * @returns {Object} { total, streak, avgScore, topEmotion, hasTodayEntry }
   */
  MCI.computeStats = function (entries) {
    var keys = Object.keys(entries);
    var total = keys.length;
    var todayStr = MCI.todayKey();
    var scoreSum = 0, scoreCount = 0;
    var emotionCounts = {};
    var hasTodayEntry = false;

    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf(todayStr) === 0) hasTodayEntry = true;
      var e = entries[keys[i]];
      if (e.moodScore) { scoreSum += e.moodScore; scoreCount++; }
      if (e.coreFeeling) {
        emotionCounts[e.coreFeeling] = (emotionCounts[e.coreFeeling] || 0) + 1;
      }
    }

    var avgScore = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(1) : "\u2014";
    var topEmotion = "\u2014";
    var topCount = 0;
    for (var em in emotionCounts) {
      if (emotionCounts.hasOwnProperty(em) && emotionCounts[em] > topCount) {
        topCount = emotionCounts[em];
        var tKey = "em" + em.charAt(0).toUpperCase() + em.slice(1);
        topEmotion = MCI.t(tKey) || /* c8 ignore next */ em;
      }
    }

    return {
      total: total,
      streak: MCI.calculateStreak(entries),
      avgScore: avgScore,
      topEmotion: topEmotion,
      hasTodayEntry: hasTodayEntry
    };
  };

  /**
   * Get localized day-of-week header names.
   * @returns {string[]} array of 7 short day names (Mon-Sun)
   */
  MCI.getDayNames = function () {
    return MCI.lang === "nl"
      ? ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  };

  /**
   * Find the first entry matching a given day key prefix.
   * @param {Object} entries - All entries
   * @param {string[]} keys - Entry keys to search
   * @param {string} dayKey - YYYY-MM-DD prefix to match
   * @returns {{ entry: Object, key: string } | null}
   */
  MCI.findEntryForDay = function (entries, keys, dayKey) {
    for (var k = 0; k < keys.length; k++) {
      if (keys[k].indexOf(dayKey) === 0) {
        return { entry: entries[keys[k]], key: keys[k] };
      }
    }
    return null;
  };

  /**
   * Build 28-day heatmap data (shared by Home and Dashboard).
   * @param {Object} entries - All entries keyed by dateKey
   * @returns {{ dayNames: string[], leadingSpacers: number, days: Object[] }}
   */
  MCI.buildHeatmapData = function (entries) {
    var today = new Date();
    var todayStr = MCI.formatDate(today);
    var keys = Object.keys(entries);
    var firstDate = new Date(today);
    firstDate.setDate(firstDate.getDate() - 27);
    var firstDow = (firstDate.getDay() + 6) % 7; /* Mon=0 */

    var days = [];
    for (var d = 27; d >= 0; d--) {
      var date = new Date(today);
      date.setDate(date.getDate() - d);
      var dayKey = MCI.formatDate(date);
      var found = MCI.findEntryForDay(entries, keys, dayKey);
      days.push({
        date: date,
        dayKey: dayKey,
        label: ("0" + date.getDate()).slice(-2),
        isToday: dayKey === todayStr,
        entry: found ? found.entry : null,
        entryKey: found ? found.key : null
      });
    }

    return { dayNames: MCI.getDayNames(), leadingSpacers: firstDow, days: days };
  };
})();
