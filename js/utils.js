(function () {
  "use strict";
  window.App = window.App || {};

  App.FALLBACK_LANGUAGE = "en";
  App.APP_VERSION = "1.0.0";
  App.translations = window.MINDFUL_CHECKIN_TRANSLATIONS || {};

  App.t = function (key) {
    var chunks = key.split(".");
    var result = App.translations;
    for (var i = 0; i < chunks.length; i++) {
      result = result && result[chunks[i]];
      if (result === undefined) {
        return key;
      }
    }
    if (result && typeof result === "object") {
      var lang = App.state ? App.state.language : App.FALLBACK_LANGUAGE;
      return result[lang] != null ? result[lang] : (result[App.FALLBACK_LANGUAGE] != null ? result[App.FALLBACK_LANGUAGE] : key);
    }
    return result != null ? result : key;
  };

  App.escapeHtml = function (value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  App.hasLightBackground = function (hexColor) {
    var hex = String(hexColor).replace("#", "");
    if (hex.length !== 6) {
      return false;
    }
    var red = parseInt(hex.slice(0, 2), 16);
    var green = parseInt(hex.slice(2, 4), 16);
    var blue = parseInt(hex.slice(4, 6), 16);
    var luminance = (0.299 * red) + (0.587 * green) + (0.114 * blue);
    return luminance > 170;
  };

  App.toBodyPartKey = function (part) {
    var map = {
      "upper-back": "upperBack", "lower-back": "lowerBack",
      "left-shoulder": "leftShoulder", "right-shoulder": "rightShoulder",
      "left-upper-arm": "leftUpperArm", "right-upper-arm": "rightUpperArm",
      "left-elbow": "leftElbow", "right-elbow": "rightElbow",
      "left-forearm": "leftForearm", "right-forearm": "rightForearm",
      "left-hand": "leftHand", "right-hand": "rightHand",
      "left-hip": "leftHip", "right-hip": "rightHip",
      "left-leg": "leftLeg", "right-leg": "rightLeg",
      "left-knee": "leftKnee", "right-knee": "rightKnee",
      "left-lower-leg": "leftLowerLeg", "right-lower-leg": "rightLowerLeg",
      "left-foot": "leftFoot", "right-foot": "rightFoot",
    };
    return map[part] || part;
  };

  App.generateId = function () {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  App.downloadJsonFile = function (data, filename) {
    var payload = JSON.stringify(data, null, 2);
    var blob = new Blob([payload], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  App.readJsonFile = function (fileInput, callback) {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        callback(parsed, null);
      } catch (error) {
        callback(null, error);
      }
      fileInput.value = "";
    };
    reader.readAsText(file);
  };

  App.refreshViews = function () {
    App.renderSummary();
    App.renderHistory();
    App.renderOverview();
  };

  App.getTodayKey = function () {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  };

  App.extractDateKey = function (entryKey) {
    return String(entryKey).slice(0, 10);
  };

  App.createTimestampedEntryKey = function (baseDateKey) {
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, "0");
    var minutes = String(now.getMinutes()).padStart(2, "0");
    var seconds = String(now.getSeconds()).padStart(2, "0");
    var milliseconds = String(now.getMilliseconds()).padStart(3, "0");
    return baseDateKey + "_" + hours + minutes + seconds + milliseconds;
  };

  App.formatDate = function (dateKey, entry) {
    var dateText = App.formatDateOnly(dateKey);
    var timeText = App.formatEntryTime(dateKey, entry);
    return timeText ? dateText + " " + timeText : dateText;
  };

  App.formatDateOnly = function (dateKey) {
    var safeDateKey = App.extractDateKey(dateKey);
    var date = new Date(safeDateKey + "T00:00:00");
    var locale = App.state && App.state.language === "nl" ? "nl-NL" : undefined;
    return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  };

  App.formatEntryTime = function (entryKey, entry) {
    var keyText = String(entryKey);
    var separatorIndex = keyText.indexOf("_");
    if (separatorIndex >= 0) {
      var timePart = keyText.slice(separatorIndex + 1);
      if (timePart.length >= 6) {
        return timePart.slice(0, 2) + ":" + timePart.slice(2, 4) + ":" + timePart.slice(4, 6);
      }
      if (timePart.length >= 4) {
        return timePart.slice(0, 2) + ":" + timePart.slice(2, 4) + ":00";
      }
    }
    var isoSource = (entry && (entry.updatedAt || entry.timestamp)) || null;
    if (!isoSource) {
      return "";
    }
    var isoDate = new Date(isoSource);
    if (Number.isNaN(isoDate.getTime())) {
      return "";
    }
    return String(isoDate.getHours()).padStart(2, "0") + ":" +
      String(isoDate.getMinutes()).padStart(2, "0") + ":" +
      String(isoDate.getSeconds()).padStart(2, "0");
  };

  App.findLatestEntryKeyForDate = function (baseDateKey) {
    var matchingKeys = Object.keys(App.state.entries).filter(function (key) {
      return key.startsWith(baseDateKey);
    });
    if (matchingKeys.length === 0) {
      return null;
    }
    return matchingKeys.sort(function (a, b) { return b.localeCompare(a); })[0];
  };

  App.getMoodGridLabel = function (moodGrid) {
    if (!moodGrid || typeof moodGrid !== "object") {
      return "-";
    }
    var energy = Number(moodGrid.energy);
    var valence = Number(moodGrid.valence);
    if (Number.isFinite(energy) && Number.isFinite(valence)) {
      var rowIndex = 10 - energy;
      var colIndex = valence - 1;
      var lang = App.state ? App.state.language : App.FALLBACK_LANGUAGE;
      var byLanguage = App.moodGridData[lang] && App.moodGridData[lang][rowIndex] && App.moodGridData[lang][rowIndex][colIndex];
      var byFallback = App.moodGridData.en && App.moodGridData.en[rowIndex] && App.moodGridData.en[rowIndex][colIndex];
      if (byLanguage || byFallback) {
        return byLanguage || byFallback;
      }
    }
    return moodGrid.text || "-";
  };

  App.formatBodySignals = function (signals) {
    if (!Array.isArray(signals) || signals.length === 0) {
      return "-";
    }
    return signals
      .map(function (part) { return App.t("bodyParts." + App.toBodyPartKey(part)) || part; })
      .join(", ");
  };

  App.applyLanguage = function () {
    var dom = App.dom;
    var state = App.state;
    document.documentElement.lang = state.language;
    document.title = App.t("pageTitle");

    dom.languageButtons.forEach(function (button) {
      var isSelected = button.dataset.language === state.language;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.getAttribute("data-i18n");
      var value = App.t(key);
      if (value) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-placeholder");
      var value = App.t(key);
      if (value) {
        element.setAttribute("placeholder", value);
      }
    });

    dom.bodyPartButtons.forEach(function (el) {
      var part = el.dataset.part;
      if (!part) return;
      var label = App.t("bodyParts." + App.toBodyPartKey(part)) || part;
      var title = el.querySelector("title");
      if (!title) {
        title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        el.appendChild(title);
      }
      title.textContent = label;
    });

    if (dom.appVersionDisplay) {
      dom.appVersionDisplay.textContent = App.APP_VERSION;
    }
  };
})();
