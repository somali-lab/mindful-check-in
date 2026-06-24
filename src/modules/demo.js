/* Mindful Check-in v4 – Demo Data Generator */
(function () {
  "use strict";
  var MCI = window.MCI;

  /* Pre-compute wheel variants and their emotion IDs for fast random picking */
  var _wheelKeys = Object.keys(MCI.Data.wheels);
  var _wheelEmotionIds = {};
  (function () {
    for (var w = 0; w < _wheelKeys.length; w++) {
      var ems = MCI.Data.wheels[_wheelKeys[w]].emotions;
      var ids = [];
      for (var e = 0; e < ems.length; e++) ids.push(ems[e].id);
      _wheelEmotionIds[_wheelKeys[w]] = ids;
    }
  })();

  var THOUGHTS = [
    "Feeling good about today", "Worried about work deadline", "Had a nice walk",
    "Feeling tired but content", "Grateful for small things", "Need more rest",
    "Excited about weekend plans", "Stressed about finances", "Enjoyed cooking dinner",
    "Missing old friends", "Proud of my progress", "Anxious about tomorrow",
    "Peaceful morning routine", "Overwhelmed with tasks", "Happy after exercise",
    "Reflecting on the week", "Feeling creative today", "Frustrated with traffic"
  ];
  var ACTIONS = [
    "Meditation", "Walk outside", "Deep breathing", "Journaling", "Exercise",
    "Called a friend", "Read a book", "Nap", "Stretching", "Tea break",
    "Drawing", "Music", "Cooking", "Gardening", "Yoga"
  ];
  var ZONES = MCI.Data.bodyZones;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomItem(arr) {
    return arr[randomInt(0, arr.length - 1)];
  }

  function randomSubset(arr, min, max) {
    var count = randomInt(min, max);
    var copy = arr.slice();
    var result = [];
    for (var i = 0; i < count && copy.length > 0; i++) {
      var idx = randomInt(0, copy.length - 1);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }

  function generateEntry() {
    var entry = {};
    entry.thoughts = randomItem(THOUGHTS);

    /* 1. random wheel type  2. possible emotions for it  3. random pick */
    var wheelType = randomItem(_wheelKeys);
    entry.wheelType = wheelType;
    entry.coreFeeling = randomItem(_wheelEmotionIds[wheelType]);
    entry.customFeelings = "";
    entry.bodySignals = randomSubset(ZONES, 0, 4);
    entry.bodyNote = "";
    entry.energy = {
      physical: randomInt(0, 100),
      mental: randomInt(0, 100),
      emotional: randomInt(0, 100)
    };
    entry.energyNote = "";
    entry.moodRow = randomInt(0, 9);
    entry.moodCol = randomInt(0, 9);
    var lang = MCI.lang || "en";
    var labels = MCI.Data.moodLabels[lang] || MCI.Data.moodLabels.en;
    entry.moodLabel = labels[entry.moodRow][entry.moodCol];
    entry.moodColor = MCI.Data.moodColors[entry.moodRow][entry.moodCol];
    entry.actions = randomSubset(ACTIONS, 1, 3).join(", ");
    entry.note = "";

    /* compute score via shared helper */
    entry.moodScore = MCI.computeMoodScore(entry);

    return MCI.normalize(entry);
  }

  function generateDemo() {
    if (!confirm(MCI.t("demoConfirm") || "Generate 30 days of demo data? This will add to existing entries.")) return;

    var entries = MCI.loadEntries();
    var today = new Date();
    var count = 0;

    for (var d = 29; d >= 0; d--) {
      var date = new Date(today);
      date.setDate(date.getDate() - d);
      var perDay = randomInt(1, 2);
      for (var p = 0; p < perDay; p++) {
        var h = randomInt(7, 22);
        var m = randomInt(0, 59);
        date.setHours(h, m, 0, 0);
        var key = MCI.formatDate(date) + "_"
          + ("0" + h).slice(-2)
          + ("0" + m).slice(-2)
          + "00000";
        entries[key] = generateEntry();
        count++;
      }
    }

    MCI.saveAllEntries(entries);
    MCI.banner((MCI.t("demoGenerated") || "Generated {count} demo entries.").replace("{count}", count), "success");
  }

  function clearAll() {
    if (!confirm(MCI.t("clearConfirm") || "Clear ALL data? This cannot be undone.")) return;
    if (!confirm(MCI.t("clearConfirmDouble") || "Are you really sure? All check-ins will be permanently deleted.")) return;

    var k;
    for (k in MCI.KEYS) {
      if (MCI.KEYS.hasOwnProperty(k)) MCI.del(MCI.KEYS[k]);
    }

    MCI.banner(MCI.t("clearDone") || "All data cleared. Reloading\u2026", "success");
    setTimeout(function () { location.reload(); }, 1500);
  }

  MCI.Demo = {
    init: function () {
      var demoBtn = document.getElementById("demo-btn-generate");
      if (demoBtn) demoBtn.addEventListener("click", generateDemo);

      var clearBtn = document.getElementById("demo-btn-clear");
      if (clearBtn) clearBtn.addEventListener("click", clearAll);
    }
  };
})();
