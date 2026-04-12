/* Mindful Check-in v4 – Static data: wheels, mood grid, weather codes, body zones */
(function () {
  "use strict";
  /* c8 ignore next -- MCI always exists after core.js */
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
      colors: ["#f6c453","#9fd46f","#f08ac0","#8ec5e8","#80a7ee","#9a8fe0","#ef6a6a","#f28b4f"]
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
      colors: ["#f9e547","#8ed16e","#4aac6e","#2da8c2","#4168b0","#ab4fa0","#ef3f36","#f28b2c"]
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
      colors: ["#f6c453","#80a7ee","#ef6a6a","#4aac6e","#2da8c2","#ab4fa0"]
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
      colors: ["#f08ac0","#f6c453","#2da8c2","#ef6a6a","#80a7ee","#4aac6e"]
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
      colors: ["#f9e547","#f08ac0","#8ed16e","#2da8c2","#f28b2c","#9a8fe0","#80a7ee","#4aac6e","#ef6a6a","#ab4fa0","#4168b0","#c19a6b"]
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

  MCI.Data.moodColors = [
    ["#8b0000","#8b0000","#a52a2a","#dc143c","#ffb3ba","#fff8dc","#ffff99","#ffd700","#ff8c00","#ff8c00"],
    ["#8b0000","#8b0000","#a52a2a","#dc143c","#ffb3ba","#fff8dc","#ffff99","#ffd700","#ff8c00","#ff8c00"],
    ["#a52a2a","#a52a2a","#a52a2a","#dc143c","#ffb3ba","#fff8dc","#ffff99","#ffd700","#ffd700","#ffd700"],
    ["#dc143c","#dc143c","#dc143c","#dc143c","#ffb3ba","#fff8dc","#ffff99","#ffff99","#ffff99","#ffff99"],
    ["#ffb3ba","#ffb3ba","#ffb3ba","#ffb3ba","#ffb3ba","#fff8dc","#fff8dc","#fff8dc","#fff8dc","#fff8dc"],
    ["#e0f6ff","#e0f6ff","#e0f6ff","#e0f6ff","#e0f6ff","#f0fff0","#f0fff0","#f0fff0","#f0fff0","#f0fff0"],
    ["#87ceeb","#87ceeb","#87ceeb","#87ceeb","#e0f6ff","#f0fff0","#98fb98","#98fb98","#98fb98","#98fb98"],
    ["#6495ed","#6495ed","#6495ed","#87ceeb","#e0f6ff","#f0fff0","#98fb98","#228b22","#228b22","#228b22"],
    ["#4169e1","#4169e1","#6495ed","#87ceeb","#e0f6ff","#f0fff0","#98fb98","#228b22","#006400","#006400"],
    ["#4169e1","#4169e1","#6495ed","#87ceeb","#e0f6ff","#f0fff0","#98fb98","#228b22","#006400","#006400"]
  ];

  // ── WMO Weather Codes ──
  MCI.Data.weatherCodes = {
    0:  { desc: "Clear sky",           emoji: "\u2600\ufe0f" },
    1:  { desc: "Mainly clear",        emoji: "\ud83c\udf24\ufe0f" },
    2:  { desc: "Partly cloudy",       emoji: "\u26c5" },
    3:  { desc: "Overcast",            emoji: "\u2601\ufe0f" },
    45: { desc: "Fog",                 emoji: "\ud83c\udf2b\ufe0f" },
    48: { desc: "Depositing rime fog", emoji: "\ud83c\udf2b\ufe0f" },
    51: { desc: "Light drizzle",       emoji: "\ud83c\udf26\ufe0f" },
    53: { desc: "Moderate drizzle",    emoji: "\ud83c\udf26\ufe0f" },
    55: { desc: "Dense drizzle",       emoji: "\ud83c\udf27\ufe0f" },
    56: { desc: "Freezing drizzle",    emoji: "\u2744\ufe0f" },
    57: { desc: "Heavy freezing drizzle", emoji: "\u2744\ufe0f" },
    61: { desc: "Slight rain",         emoji: "\ud83c\udf27\ufe0f" },
    63: { desc: "Moderate rain",       emoji: "\ud83c\udf27\ufe0f" },
    65: { desc: "Heavy rain",          emoji: "\ud83c\udf27\ufe0f" },
    66: { desc: "Freezing rain",       emoji: "\u2744\ufe0f" },
    67: { desc: "Heavy freezing rain", emoji: "\u2744\ufe0f" },
    71: { desc: "Slight snow",         emoji: "\u2744\ufe0f" },
    73: { desc: "Moderate snow",       emoji: "\ud83c\udf28\ufe0f" },
    75: { desc: "Heavy snow",          emoji: "\ud83c\udf28\ufe0f" },
    77: { desc: "Snow grains",         emoji: "\u2744\ufe0f" },
    80: { desc: "Rain showers",        emoji: "\ud83c\udf26\ufe0f" },
    81: { desc: "Moderate showers",    emoji: "\ud83c\udf27\ufe0f" },
    82: { desc: "Violent showers",     emoji: "\ud83c\udf27\ufe0f" },
    85: { desc: "Snow showers",        emoji: "\ud83c\udf28\ufe0f" },
    86: { desc: "Heavy snow showers",  emoji: "\ud83c\udf28\ufe0f" },
    95: { desc: "Thunderstorm",        emoji: "\u26a1" },
    96: { desc: "Thunderstorm + hail", emoji: "\u26a1" },
    99: { desc: "Thunderstorm + heavy hail", emoji: "\u26a1" }
  };
})();
