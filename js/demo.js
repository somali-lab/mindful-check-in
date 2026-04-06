(function () {
  "use strict";
  window.App = window.App || {};

  App.generateDemoData = function () {
    var wheelTypes = ["act", "plutchik", "ekman", "junto", "extended"];
    var allBodyParts = ["head", "neck", "chest", "abdomen", "left-shoulder", "right-shoulder", "left-upper-arm", "right-upper-arm", "left-elbow", "right-elbow", "left-forearm", "right-forearm", "left-hand", "right-hand", "left-hip", "right-hip", "left-leg", "right-leg", "left-knee", "right-knee", "left-lower-leg", "right-lower-leg", "left-foot", "right-foot", "upper-back", "lower-back"];
    var thoughtsPool = [
      "Feeling productive today", "Had trouble sleeping", "Good meeting at work", "Worried about the deadline",
      "Enjoyed a walk outside", "Feeling a bit overwhelmed", "Great conversation with a friend", "Struggling to focus",
      "Excited about the weekend", "Feeling grateful", "Need more rest", "Headache this morning",
      "Meditation helped", "Too much screen time", "Relaxing evening", "Busy but satisfied",
      "Missing family", "Creative day", "Anxious about tomorrow", "Calm and centered",
      "Frustrated with traffic", "Lovely weather today", "Feeling isolated", "Good progress on project",
      "Stomach felt uneasy", "Energized after exercise", "Tired but happy", "Stressful news",
      "Cooked a nice meal", "Felt connected to nature",
    ];
    var actionsPool = [
      "Go for a walk", "Call a friend", "Take a break", "Drink water", "Stretch for 10 min",
      "Journal before bed", "Listen to music", "Deep breathing", "Read a book", "Early bedtime",
      "Cook something healthy", "Limit social media", "Gratitude list", "Clean the house", "",
    ];
    var notesPool = [
      "", "", "", "", "", "", "", "",
      "Short note.", "Interesting day overall.",
      "Woke up early and felt refreshed. Had a productive morning and then things slowed down in the afternoon.",
      "Not much to say today.", "Need to remember to take it easy.",
      "Had a really good deep conversation that made me think about priorities.",
      "Feeling optimistic about the coming week, lots of plans.",
      "Body felt tense all day, maybe I need to exercise more regularly.",
    ];
    var bodyNotesPool = ["", "", "", "", "", "Tension in shoulders", "Headache behind eyes", "Stomach butterflies", "Legs feel heavy", "Relaxed overall", "Tight neck", "Lower back stiff"];
    var energyNotesPool = ["", "", "", "", "", "Tired after lunch", "Good morning energy", "Drained by evening", "Coffee helped", "Steady all day", "Crashed around 3pm"];

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function randSubset(arr, maxCount) {
      var count = randInt(0, Math.min(maxCount, arr.length));
      var shuffled = arr.slice().sort(function () { return Math.random() - 0.5; });
      return shuffled.slice(0, count);
    }

    var now = new Date();
    for (var i = 0; i < 30; i++) {
      var daysAgo = randInt(0, 90);
      var date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(randInt(6, 23), randInt(0, 59), randInt(0, 59), randInt(0, 999));
      var y = date.getFullYear();
      var m = String(date.getMonth() + 1).padStart(2, "0");
      var d = String(date.getDate()).padStart(2, "0");
      var hh = String(date.getHours()).padStart(2, "0");
      var mm = String(date.getMinutes()).padStart(2, "0");
      var ss = String(date.getSeconds()).padStart(2, "0");
      var ms = String(date.getMilliseconds()).padStart(3, "0");
      var entryKey = y + "-" + m + "-" + d + "_" + hh + mm + ss + ms;

      var hasEmotion = Math.random() > 0.2;
      var hasMood = Math.random() > 0.3;
      var hasBody = Math.random() > 0.5;
      var demoWheelType = hasEmotion ? pick(wheelTypes) : null;
      var demoEmotion = demoWheelType ? pick(App.emotionWheelVariants[demoWheelType].emotions) : null;

      App.state.entries[entryKey] = {
        id: App.generateId(),
        thoughts: Math.random() > 0.3 ? pick(thoughtsPool) : "",
        selectedEmotion: demoEmotion,
        wheelType: demoWheelType,
        customFeelings: "",
        energy: {
          physical: Math.random() > 0.2 ? randInt(5, 100) : null,
          mental: Math.random() > 0.2 ? randInt(5, 100) : null,
          emotional: Math.random() > 0.2 ? randInt(5, 100) : null,
        },
        bodySignals: hasBody ? randSubset(allBodyParts, 4) : [],
        bodyNote: pick(bodyNotesPool),
        energyNote: pick(energyNotesPool),
        action: pick(actionsPool),
        note: pick(notesPool),
        moodGrid: hasMood ? { energy: randInt(1, 10), valence: randInt(1, 10) } : null,
        updatedAt: date.toISOString(),
      };
    }

    App.saveEntries(App.state.entries);
    App.renderSummary();
    App.renderHistory();
    App.renderOverview();
    if (App.dom.infoStatus) App.dom.infoStatus.textContent = App.t("info.demoGenerated");
  };
})();
