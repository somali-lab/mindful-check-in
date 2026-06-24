/* Mindful Check-in v4 – Static data: wheels, mood grid, weather codes, body zones */
(function () {
  "use strict";
  var MCI = window.MCI = window.MCI || {};
  MCI.Data = {};

  // ── Emotion Wheel Variants ──
  MCI.Data.wheels = {
    act: {
      labelKey: "wheelACT",
      emotions: [
        { id: "joy", tKey: "emJoy" },
        { id: "serenity", tKey: "emSerenity" },
        { id: "love", tKey: "emLove" },
        { id: "acceptance", tKey: "emAcceptance" },
        { id: "sadness", tKey: "emSadness" },
        { id: "melancholy", tKey: "emMelancholy" },
        { id: "anger", tKey: "emAnger" },
        { id: "aggression", tKey: "emAggression" }
      ],
      colors: ["#d6a85c","#9aa86a","#cf9aa6","#93aab5","#8593ad","#9c92b0","#c47158","#c98a5a"]
    },
    plutchik: {
      labelKey: "wheelPlutchik",
      emotions: [
        { id: "joy", tKey: "emJoy" },
        { id: "trust", tKey: "emTrust" },
        { id: "fear", tKey: "emFear" },
        { id: "surprise", tKey: "emSurprise" },
        { id: "sadness", tKey: "emSadness" },
        { id: "disgust", tKey: "emDisgust" },
        { id: "anger", tKey: "emAnger" },
        { id: "anticipation", tKey: "emAnticipation" }
      ],
      colors: ["#d6a85c","#8fb39a","#7f7ba2","#d9bd72","#8593ad","#a7a86a","#c47158","#cf9a6b"]
    },
    ekman: {
      labelKey: "wheelEkman",
      emotions: [
        { id: "joy", tKey: "emJoy" },
        { id: "sadness", tKey: "emSadness" },
        { id: "anger", tKey: "emAnger" },
        { id: "fear", tKey: "emFear" },
        { id: "surprise", tKey: "emSurprise" },
        { id: "disgust", tKey: "emDisgust" }
      ],
      colors: ["#d6a85c","#8593ad","#c47158","#7f7ba2","#d9bd72","#a7a86a"]
    },
    junto: {
      labelKey: "wheelJunto",
      emotions: [
        { id: "love", tKey: "emLove" },
        { id: "joy", tKey: "emJoy" },
        { id: "surprise", tKey: "emSurprise" },
        { id: "anger", tKey: "emAnger" },
        { id: "sadness", tKey: "emSadness" },
        { id: "fear", tKey: "emFear" }
      ],
      colors: ["#cf9aa6","#d6a85c","#d9bd72","#c47158","#8593ad","#7f7ba2"]
    },
    extended: {
      labelKey: "wheelExtended",
      emotions: [
        { id: "joy", tKey: "emJoy" },
        { id: "love", tKey: "emLove" },
        { id: "trust", tKey: "emTrust" },
        { id: "surprise", tKey: "emSurprise" },
        { id: "curiosity", tKey: "emCuriosity" },
        { id: "anticipation", tKey: "emAnticipation" },
        { id: "anxiety", tKey: "emAnxiety" },
        { id: "fear", tKey: "emFear" },
        { id: "sadness", tKey: "emSadness" },
        { id: "disgust", tKey: "emDisgust" },
        { id: "anger", tKey: "emAnger" },
        { id: "shame", tKey: "emShame" }
      ],
      colors: ["#d6a85c","#cf9aa6","#8fb39a","#d9bd72","#7fa6a6","#cf9a6b","#9a8fb0","#7f7ba2","#8593ad","#a7a86a","#c47158","#b1906f"]
    }
  };

  MCI.Data.moodScores = {
    joy: 3, serenity: 3, love: 3, acceptance: 3, trust: 3,
    happiness: 3, contentment: 3, excitement: 3, pride: 3, gratitude: 3, curiosity: 3,
    surprise: 2, anticipation: 2, melancholy: 2, anxiety: 2,
    sadness: 1, anger: 1, aggression: 1, fear: 1, disgust: 1, shame: 1, guilt: 1
  };

  // ── 26 Body Zone IDs ──
  MCI.Data.bodyZones = [
    "head","neck","chest","abdomen",
    "left-shoulder","right-shoulder",
    "left-upper-arm","right-upper-arm",
    "left-elbow","right-elbow",
    "left-forearm","right-forearm",
    "left-hand","right-hand",
    "left-hip","right-hip",
    "left-upper-leg","right-upper-leg",
    "left-knee","right-knee",
    "left-lower-leg","right-lower-leg",
    "left-foot","right-foot",
    "upper-back","lower-back"
  ];

  MCI.Data.zoneKeys = {
    "head":"zoneHead","neck":"zoneNeck","chest":"zoneChest","abdomen":"zoneAbdomen",
    "left-shoulder":"zoneLeftShoulder","right-shoulder":"zoneRightShoulder",
    "left-upper-arm":"zoneLeftUpperArm","right-upper-arm":"zoneRightUpperArm",
    "left-elbow":"zoneLeftElbow","right-elbow":"zoneRightElbow",
    "left-forearm":"zoneLeftForearm","right-forearm":"zoneRightForearm",
    "left-hand":"zoneLeftHand","right-hand":"zoneRightHand",
    "left-hip":"zoneLeftHip","right-hip":"zoneRightHip",
    "left-upper-leg":"zoneLeftUpperLeg","right-upper-leg":"zoneRightUpperLeg",
    "left-knee":"zoneLeftKnee","right-knee":"zoneRightKnee",
    "left-lower-leg":"zoneLeftLowerLeg","right-lower-leg":"zoneRightLowerLeg",
    "left-foot":"zoneLeftFoot","right-foot":"zoneRightFoot",
    "upper-back":"zoneUpperBack","lower-back":"zoneLowerBack"
  };

  // ── Mood Grid 10×10 ──
  MCI.Data.moodLabels = {
    en: [
      ["Furious", "Panicked", "Stressed", "Nervous", "Shocked", "Surprised", "Cheerful", "Festive", "Excited", "Ecstatic"],
      ["Pissed", "Irate", "Frustrated", "Tense", "Bewildered", "Hyper", "Upbeat", "Motivated", "Inspired", "Delighted"],
      ["Indignant", "Afraid", "Angry", "Anxious", "Restless", "Energized", "Lively", "Elated", "Optimistic", "Enthusiastic"],
      ["Fearful", "Worried", "Concerned", "Irritated", "Annoyed", "Pleased", "Focused", "Happy", "Proud", "Moved"],
      ["Aversion", "Uneasy", "Worried", "Uncomfortable", "Touched", "Cheerful", "Joyful", "Hopeful", "Playful", "Happy"],
      ["Disgusted", "Gloomy", "Disappointed", "Sad", "Apathetic", "At ease", "Compliant", "Content", "Loving", "Fulfilled"],
      ["Pessimistic", "Grumpy", "Discouraged", "Sorrowful", "Bored", "Calm", "Safe", "Satisfied", "Grateful", "Touched"],
      ["Alienated", "Miserable", "Lonely", "Defeated", "Tired", "Relaxed", "Meditative", "Peaceful", "Blessed", "Balanced"],
      ["Despondent", "Depressed", "Sullen", "Exhausted", "Depleted", "Gentle", "Thoughtful", "Tranquil", "Comfortable", "Carefree"],
      ["Desperate", "Hopeless", "Desolate", "Burned out", "Drained", "Sleepy", "Content", "Serene", "Cozy", "Serene"]
    ],
    nl: [
      ["Woedend", "In paniek", "Gestrest", "Zenuwachtig", "Geschokt", "Verrast", "Vrolijk", "Feestelijk", "Opgewonden", "Extatisch"],
      ["Pissig", "Driftig", "Gefrustreerd", "Gespannen", "Verbijsterd", "Hyper", "Opgewekt", "Gemotiveerd", "Geinspireerd", "Verrukt"],
      ["Verbolgen", "Bang", "Boos", "Nerveus", "Rusteloos", "Opgeladen", "Levendig", "Opgetogen", "Optimistisch", "Enthousiast"],
      ["Angstig", "Ongerust", "Bezorgd", "Geirriteerd", "Geergerd", "Verheugd", "Gefocust", "Blij", "Trots", "Ontroerd"],
      ["Aversie", "Onrustig", "Bezorgd", "Ongemakkelijk", "Geraakt", "Monter", "Vreugdevol", "Hoopvol", "Speels", "Gelukkig"],
      ["Walgend", "Somber", "Teleurgesteld", "Verdrietig", "Apathisch", "Op je gemak", "Meegaand", "Content", "Liefdevol", "Vervuld"],
      ["Pessimistisch", "Chagrijnig", "Ontmoedigd", "Bedroefd", "Verveeld", "Kalm", "Veilig", "Tevreden", "Dankbaar", "Bewogen"],
      ["Vervreemd", "Ellendig", "Eenzaam", "Verslagen", "Moe", "Ontspannen", "Meditatief", "Vredig", "Gezegend", "In balans"],
      ["Moedeloos", "Depressief", "Nors", "Uitgeput", "Leeg", "Mild", "Bedachtzaam", "Rustig", "Comfortabel", "Zorgeloos"],
      ["Wanhopig", "Hopeloos", "Troosteloos", "Opgebrand", "Leeggezogen", "Slaperig", "Voldaan", "Serene", "Knus", "Serene"]
    ]
  };

  /* Earthy "Herontwerp" mood palette — soft HSL gradient (matches the design's
     moodCellColor): hue warms left → cools right (20 → 98); upper rows are
     darker and more saturated (high energy), lower rows lighter. Generated as
     hex so the light/dark text helper (hasLightBackground) can read them. */
  MCI.Data.moodColors = (function () {
    function hslToHex(h, s, l) {
      s /= 100; l /= 100;
      var c = (1 - Math.abs(2 * l - 1)) * s;
      var hp = h / 60;
      var x = c * (1 - Math.abs((hp % 2) - 1));
      var r = 0, g = 0, b = 0;
      if (hp < 1) { r = c; g = x; }
      else if (hp < 2) { r = x; g = c; }
      else if (hp < 3) { g = c; b = x; }
      else if (hp < 4) { g = x; b = c; }
      else if (hp < 5) { r = x; b = c; }
      else { r = c; b = x; }
      var m = l - c / 2;
      function hx(v) {
        var n = Math.round((v + m) * 255);
        if (n < 0) n = 0;
        if (n > 255) n = 255;
        var str = n.toString(16);
        return str.length < 2 ? "0" + str : str;
      }
      return "#" + hx(r) + hx(g) + hx(b);
    }
    var grid = [], row, rr, cc;
    for (rr = 0; rr < 10; rr++) {
      row = [];
      for (cc = 0; cc < 10; cc++) {
        var v = cc / 9, ar = (9 - rr) / 9;
        var hue = Math.round(20 + v * 78);
        var sat = Math.round(20 + ar * 20);
        var light = Math.round(86 - ar * 24);
        row.push(hslToHex(hue, sat, light));
      }
      grid.push(row);
    }
    return grid;
  })();

  // ── WMO Weather Codes ──
  /* desc is bilingual ({ en, nl }) \u2014 Open-Meteo only returns a numeric
     weathercode, so the label is resolved locally per language. */
  MCI.Data.weatherCodes = {
    0:  { desc: { en: "Clear sky",            nl: "Onbewolkt" },                emoji: "\u2600\ufe0f" },
    1:  { desc: { en: "Mainly clear",         nl: "Overwegend helder" },        emoji: "\ud83c\udf24\ufe0f" },
    2:  { desc: { en: "Partly cloudy",        nl: "Half bewolkt" },             emoji: "\u26c5" },
    3:  { desc: { en: "Overcast",             nl: "Zwaarbewolkt" },             emoji: "\u2601\ufe0f" },
    45: { desc: { en: "Fog",                  nl: "Mist" },                     emoji: "\ud83c\udf2b\ufe0f" },
    48: { desc: { en: "Depositing rime fog",  nl: "Rijpmist" },                 emoji: "\ud83c\udf2b\ufe0f" },
    51: { desc: { en: "Light drizzle",        nl: "Lichte motregen" },          emoji: "\ud83c\udf26\ufe0f" },
    53: { desc: { en: "Moderate drizzle",     nl: "Matige motregen" },          emoji: "\ud83c\udf26\ufe0f" },
    55: { desc: { en: "Dense drizzle",        nl: "Dichte motregen" },          emoji: "\ud83c\udf27\ufe0f" },
    56: { desc: { en: "Freezing drizzle",     nl: "Aanvriezende motregen" },    emoji: "\u2744\ufe0f" },
    57: { desc: { en: "Heavy freezing drizzle", nl: "Zware aanvriezende motregen" }, emoji: "\u2744\ufe0f" },
    61: { desc: { en: "Slight rain",          nl: "Lichte regen" },             emoji: "\ud83c\udf27\ufe0f" },
    63: { desc: { en: "Moderate rain",        nl: "Matige regen" },             emoji: "\ud83c\udf27\ufe0f" },
    65: { desc: { en: "Heavy rain",           nl: "Zware regen" },              emoji: "\ud83c\udf27\ufe0f" },
    66: { desc: { en: "Freezing rain",        nl: "Aanvriezende regen" },       emoji: "\u2744\ufe0f" },
    67: { desc: { en: "Heavy freezing rain",  nl: "Zware aanvriezende regen" }, emoji: "\u2744\ufe0f" },
    71: { desc: { en: "Slight snow",          nl: "Lichte sneeuw" },            emoji: "\u2744\ufe0f" },
    73: { desc: { en: "Moderate snow",        nl: "Matige sneeuw" },            emoji: "\ud83c\udf28\ufe0f" },
    75: { desc: { en: "Heavy snow",           nl: "Zware sneeuw" },             emoji: "\ud83c\udf28\ufe0f" },
    77: { desc: { en: "Snow grains",          nl: "Sneeuwkorrels" },            emoji: "\u2744\ufe0f" },
    80: { desc: { en: "Rain showers",         nl: "Regenbuien" },               emoji: "\ud83c\udf26\ufe0f" },
    81: { desc: { en: "Moderate showers",     nl: "Matige buien" },             emoji: "\ud83c\udf27\ufe0f" },
    82: { desc: { en: "Violent showers",      nl: "Hevige buien" },             emoji: "\ud83c\udf27\ufe0f" },
    85: { desc: { en: "Snow showers",         nl: "Sneeuwbuien" },              emoji: "\ud83c\udf28\ufe0f" },
    86: { desc: { en: "Heavy snow showers",   nl: "Zware sneeuwbuien" },        emoji: "\ud83c\udf28\ufe0f" },
    95: { desc: { en: "Thunderstorm",         nl: "Onweer" },                   emoji: "\u26a1" },
    96: { desc: { en: "Thunderstorm + hail",  nl: "Onweer + hagel" },           emoji: "\u26a1" },
    99: { desc: { en: "Thunderstorm + heavy hail", nl: "Onweer + zware hagel" }, emoji: "\u26a1" }
  };
})();
