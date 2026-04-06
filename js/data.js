(function () {
  "use strict";
  window.App = window.App || {};

  App.moodGridData = {
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
      ["Desperate", "Hopeless", "Desolate", "Burned out", "Drained", "Sleepy", "Content", "Serene", "Cozy", "Serene"],
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
      ["Wanhopig", "Hopeloos", "Troosteloos", "Opgebrand", "Leeggezogen", "Slaperig", "Voldaan", "Serene", "Knus", "Serene"],
    ],
  };

  App.moodGridClasses = [
    ["#8b0000", "#8b0000", "#a52a2a", "#dc143c", "#ffb3ba", "#fff8dc", "#ffff99", "#ffd700", "#ff8c00", "#ff8c00"],
    ["#8b0000", "#8b0000", "#a52a2a", "#dc143c", "#ffb3ba", "#fff8dc", "#ffff99", "#ffd700", "#ff8c00", "#ff8c00"],
    ["#a52a2a", "#a52a2a", "#a52a2a", "#dc143c", "#ffb3ba", "#fff8dc", "#ffff99", "#ffd700", "#ffd700", "#ffd700"],
    ["#dc143c", "#dc143c", "#dc143c", "#dc143c", "#ffb3ba", "#fff8dc", "#ffff99", "#ffff99", "#ffff99", "#ffff99"],
    ["#ffb3ba", "#ffb3ba", "#ffb3ba", "#ffb3ba", "#ffb3ba", "#fff8dc", "#fff8dc", "#fff8dc", "#fff8dc", "#fff8dc"],
    ["#e0f6ff", "#e0f6ff", "#e0f6ff", "#e0f6ff", "#e0f6ff", "#f0fff0", "#f0fff0", "#f0fff0", "#f0fff0", "#f0fff0"],
    ["#87ceeb", "#87ceeb", "#87ceeb", "#87ceeb", "#e0f6ff", "#f0fff0", "#98fb98", "#98fb98", "#98fb98", "#98fb98"],
    ["#6495ed", "#6495ed", "#6495ed", "#87ceeb", "#e0f6ff", "#f0fff0", "#98fb98", "#228b22", "#228b22", "#228b22"],
    ["#4169e1", "#4169e1", "#6495ed", "#87ceeb", "#e0f6ff", "#f0fff0", "#98fb98", "#228b22", "#006400", "#006400"],
    ["#4169e1", "#4169e1", "#6495ed", "#87ceeb", "#e0f6ff", "#f0fff0", "#98fb98", "#228b22", "#006400", "#006400"],
  ];

  App.moodScoreMap = {
    joy: 3, serenity: 3, love: 3, acceptance: 2,
    sadness: 1, melancholy: 1, anger: 1, aggression: 1,
    trust: 3, fear: 1, surprise: 2, disgust: 1,
    anticipation: 2, shame: 1, great: 3, okay: 2, low: 1,
  };

  App.emotionWheelVariants = {
    act: {
      emotions: ["joy", "serenity", "love", "acceptance", "sadness", "melancholy", "anger", "aggression"],
      colors: ["#f6c453", "#9fd46f", "#f08ac0", "#8ec5e8", "#80a7ee", "#9a8fe0", "#ef6a6a", "#f28b4f"],
    },
    plutchik: {
      emotions: ["joy", "trust", "fear", "surprise", "sadness", "disgust", "anger", "anticipation"],
      colors: ["#f9e547", "#8ed16e", "#4aac6e", "#2da8c2", "#4168b0", "#ab4fa0", "#ef3f36", "#f28b2c"],
    },
    ekman: {
      emotions: ["joy", "sadness", "anger", "fear", "surprise", "disgust"],
      colors: ["#f6c453", "#80a7ee", "#ef6a6a", "#4aac6e", "#2da8c2", "#ab4fa0"],
    },
    junto: {
      emotions: ["love", "joy", "surprise", "anger", "sadness", "fear"],
      colors: ["#f08ac0", "#f6c453", "#2da8c2", "#ef6a6a", "#80a7ee", "#4aac6e"],
    },
    extended: {
      emotions: ["joy", "trust", "love", "serenity", "surprise", "anticipation", "sadness", "melancholy", "anger", "disgust", "fear", "shame"],
      colors: ["#f9e547", "#8ed16e", "#f08ac0", "#9fd46f", "#2da8c2", "#f28b2c", "#80a7ee", "#9a8fe0", "#ef6a6a", "#ab4fa0", "#4aac6e", "#c19a6b"],
    },
  };
})();
