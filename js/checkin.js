(function () {
  "use strict";
  window.App = window.App || {};

  App.getActiveWheelConfig = function () {
    return App.emotionWheelVariants[App.activeWheelType] || App.emotionWheelVariants.act;
  };

  App.renderEmotionWheel = function () {
    var svg = App.dom.emotionWheel;
    svg.innerHTML = "";
    var config = App.getActiveWheelConfig();
    var centerX = 180, centerY = 180, radius = 145;
    var total = config.emotions.length;
    var fragment = document.createDocumentFragment();

    config.emotions.forEach(function (emotionKey, index) {
      var startAngle = (index * 2 * Math.PI) / total;
      var endAngle = ((index + 1) * 2 * Math.PI) / total;
      var x1 = centerX + radius * Math.cos(startAngle);
      var y1 = centerY + radius * Math.sin(startAngle);
      var x2 = centerX + radius * Math.cos(endAngle);
      var y2 = centerY + radius * Math.sin(endAngle);

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M " + centerX + " " + centerY + " L " + x1 + " " + y1 + " A " + radius + " " + radius + " 0 0 1 " + x2 + " " + y2 + " Z");
      path.setAttribute("fill", config.colors[index]);
      path.setAttribute("class", "emotion-segment");
      path.setAttribute("data-emotion", emotionKey);
      path.setAttribute("data-index", String(index));
      path.setAttribute("data-total", String(total));
      fragment.appendChild(path);

      var labelAngle = (startAngle + endAngle) / 2;
      var labelRadius = radius * 0.6;
      var labelX = centerX + labelRadius * Math.cos(labelAngle);
      var labelY = centerY + labelRadius * Math.sin(labelAngle);
      var rotationDeg = labelAngle * 180 / Math.PI;
      var adjustedRotation = (rotationDeg > 90 && rotationDeg < 270) ? rotationDeg + 180 : rotationDeg;
      var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      var isLightSegment = App.hasLightBackground(config.colors[index]);
      label.setAttribute("x", String(labelX));
      label.setAttribute("y", String(labelY));
      label.setAttribute("class", "emotion-segment-label");
      label.setAttribute("fill", isLightSegment ? "#0f172a" : "#f8fafc");
      label.setAttribute("transform", "rotate(" + adjustedRotation + " " + labelX + " " + labelY + ")");
      label.textContent = App.t("feelings." + emotionKey);
      fragment.appendChild(label);
    });

    svg.appendChild(fragment);
  };

  App.renderMoodGrid = function () {
    var dom = App.dom;
    var state = App.state;
    dom.moodGrid.innerHTML = "";
    var labels = App.moodGridData[state.language] || App.moodGridData.en;
    var fragment = document.createDocumentFragment();

    labels.forEach(function (row, rowIndex) {
      row.forEach(function (text, colIndex) {
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "mood-cell";
        cell.textContent = text;
        var cellBgColor = App.moodGridClasses[rowIndex][colIndex];
        var useDarkText = App.hasLightBackground(cellBgColor);
        cell.style.backgroundColor = cellBgColor;
        cell.style.color = useDarkText ? "#0f172a" : "#f8fafc";
        cell.style.textShadow = useDarkText ? "none" : "0 1px 2px rgba(15, 23, 42, 0.45)";
        cell.dataset.row = String(rowIndex);
        cell.dataset.col = String(colIndex);
        cell.dataset.label = text;
        cell.addEventListener("click", function () {
          state.selectedMoodGrid = { energy: 10 - rowIndex, valence: colIndex + 1 };
          dom.statusMessage.textContent = "";
          App.renderCoreSelections();
        });
        fragment.appendChild(cell);
      });
    });

    dom.moodGrid.appendChild(fragment);
  };

  App.renderCoreSelections = function () {
    var dom = App.dom;
    var state = App.state;

    dom.emotionWheel.classList.toggle("has-selection", Boolean(state.selectedEmotion));
    dom.emotionWheel.querySelectorAll(".emotion-segment").forEach(function (segment) {
      var isSelected = segment.dataset.emotion === state.selectedEmotion;
      segment.classList.toggle("is-selected", isSelected);
      if (isSelected) {
        var index = Number(segment.dataset.index);
        var total = Number(segment.dataset.total);
        var midAngle = ((index + 0.5) * 2 * Math.PI) / total;
        var dx = Math.cos(midAngle) * 8;
        var dy = Math.sin(midAngle) * 8;
        segment.style.transform = "translate(" + dx.toFixed(2) + "px, " + dy.toFixed(2) + "px)";
      } else {
        segment.style.transform = "";
      }
    });

    dom.bodyPartButtons.forEach(function (button) {
      var isSelected = state.bodySignals.has(button.dataset.part);
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".mood-cell").forEach(function (cell) {
      var isSelected = state.selectedMoodGrid
        && Number(cell.dataset.row) === 10 - state.selectedMoodGrid.energy
        && Number(cell.dataset.col) === state.selectedMoodGrid.valence - 1;
      cell.classList.toggle("is-selected", Boolean(isSelected));
      if (isSelected) {
        cell.style.outline = isDark ? "3px solid #facc15" : "3px solid #1e293b";
        cell.style.outlineOffset = "2px";
        cell.style.transform = "scale(1.12)";
        cell.style.zIndex = "2";
        cell.style.boxShadow = isDark
          ? "inset 0 0 0 3px #0f172a, 0 0 0 4px #facc15, 0 0 18px 4px rgba(250,204,21,0.55)"
          : "inset 0 0 0 3px currentColor, 0 4px 10px rgba(15,23,42,0.25)";
      } else {
        cell.style.outline = "";
        cell.style.outlineOffset = "";
        cell.style.transform = "";
        cell.style.zIndex = "";
        cell.style.boxShadow = "";
      }
    });

    if (state.selectedEmotion) {
      dom.selectedEmotionDisplay.classList.remove("is-empty");
      dom.selectedEmotionDisplay.textContent = App.t("labels.selectedFeeling") + ": " + App.t("feelings." + state.selectedEmotion);
    } else {
      dom.selectedEmotionDisplay.classList.add("is-empty");
      dom.selectedEmotionDisplay.textContent = App.t("fields.feelings.empty");
    }

    if (state.bodySignals.size > 0) {
      var textList = Array.from(state.bodySignals).map(function (part) {
        return App.t("bodyParts." + App.toBodyPartKey(part)) || part;
      });
      dom.bodySignalsDisplay.classList.remove("is-empty");
      dom.bodySignalsDisplay.textContent = App.t("labels.selectedSignals") + ": " + textList.join(", ");
    } else {
      dom.bodySignalsDisplay.classList.add("is-empty");
      dom.bodySignalsDisplay.textContent = App.t("fields.bodySignals.empty");
    }

    var energyTypes = [];
    if (state.settings.components.energyPhysical) energyTypes.push("physical");
    if (state.settings.components.energyMental) energyTypes.push("mental");
    if (state.settings.components.energyEmotional) energyTypes.push("emotional");
    var energyParts = [];
    energyTypes.forEach(function (type) {
      var val = state.energy[type];
      var fill = dom.energyFills[type];
      if (fill) {
        fill.style.height = typeof val === "number" ? val + "%" : "0%";
      }
      if (typeof val === "number") {
        var label = type === "emotional" ? App.getEnergyEmotionalLabel() : App.t("energy." + type);
        energyParts.push(label + ": " + val + "%");
      }
    });
    if (energyParts.length > 0) {
      dom.energyDisplay.classList.remove("is-empty");
      dom.energyDisplay.textContent = energyParts.join(" \u00b7 ");
    } else {
      dom.energyDisplay.classList.add("is-empty");
      dom.energyDisplay.textContent = App.t("fields.energy.empty");
    }

    if (state.selectedMoodGrid) {
      var translatedMoodLabel = App.getMoodGridLabel(state.selectedMoodGrid);
      dom.selectedMoodDisplay.classList.remove("is-empty");
      dom.selectedMoodDisplay.textContent = App.t("labels.selectedMood") + ": " + translatedMoodLabel + " (E " + state.selectedMoodGrid.energy + "/10, V " + state.selectedMoodGrid.valence + "/10)";
    } else {
      dom.selectedMoodDisplay.classList.add("is-empty");
      dom.selectedMoodDisplay.textContent = App.t("fields.moodGrid.empty");
    }
  };

  App.hydrateTodayEntry = function () {
    var dom = App.dom;
    var state = App.state;
    var todayKey = App.getTodayKey();
    var latestTodayEntryKey = App.findLatestEntryKeyForDate(todayKey);
    if (!latestTodayEntryKey) return;

    var rawTodayEntry = state.entries[latestTodayEntryKey];
    if (!rawTodayEntry || typeof rawTodayEntry !== "object") return;
    var todayEntry = App.normalizeEntry(rawTodayEntry);
    state.activeEntryKey = latestTodayEntryKey;

    dom.thoughtsField.value = todayEntry.thoughts || "";
    dom.customEmotionsField.value = todayEntry.customFeelings || "";
    dom.bodyField.value = todayEntry.bodyNote || todayEntry.body || "";
    dom.energyNoteField.value = todayEntry.energyNote || "";
    dom.actionField.value = todayEntry.action || "";
    dom.noteField.value = todayEntry.note || "";
    state.selectedEmotion = todayEntry.selectedEmotion || todayEntry.feelings || null;
    if (todayEntry.energy && typeof todayEntry.energy === "object") {
      state.energy = {
        physical: typeof todayEntry.energy.physical === "number" ? todayEntry.energy.physical : null,
        mental: typeof todayEntry.energy.mental === "number" ? todayEntry.energy.mental : null,
        emotional: typeof todayEntry.energy.emotional === "number" ? todayEntry.energy.emotional : null,
      };
    } else if (typeof todayEntry.energy === "number") {
      state.energy = { physical: todayEntry.energy, mental: null, emotional: null };
    } else {
      state.energy = { physical: null, mental: null, emotional: null };
    }
    state.selectedMoodGrid = App.normalizeMoodGrid(todayEntry.moodGrid);
    state.bodySignals = new Set(todayEntry.bodySignals || todayEntry.body_signals || []);
    dom.statusMessage.textContent = App.t("status.loaded");
  };

  App.getSortedEntries = function () {
    return Object.entries(App.state.entries)
      .map(function (pair) {
        return Object.assign({ entryKey: pair[0], dateKey: App.extractDateKey(pair[0]) }, App.normalizeEntry(pair[1] || {}));
      })
      .filter(function (entry) { return entry.mood || entry.selectedEmotion || entry.moodGrid; })
      .sort(function (a, b) { return b.entryKey.localeCompare(a.entryKey); });
  };

  App.getDisplayMood = function (entry) {
    if (entry.selectedEmotion) {
      return App.t("feelings." + entry.selectedEmotion) || entry.selectedEmotion;
    }
    if (entry.moodGrid) {
      return App.getMoodGridLabel(entry.moodGrid);
    }
    if (entry.mood) {
      return entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1);
    }
    return "-";
  };

  App.scoreEntry = function (entry) {
    if (entry.selectedEmotion && App.moodScoreMap[entry.selectedEmotion]) {
      return App.moodScoreMap[entry.selectedEmotion];
    }
    if (entry.mood && App.moodScoreMap[entry.mood]) {
      return App.moodScoreMap[entry.mood];
    }
    if (entry.moodGrid) {
      return entry.moodGrid.valence >= 7 ? 3 : entry.moodGrid.valence >= 4 ? 2 : 1;
    }
    return 2;
  };

  // Score an entry based on a specific history view mode
  App.scoreEntryByMode = function (entry, mode) {
    if (!entry) return null;
    if (mode === "feeling") return App.scoreEntry(entry);
    if (mode === "moodMatrix") {
      var mg = entry.moodGrid;
      if (!mg || typeof mg.valence !== "number") return null;
      return mg.valence >= 7 ? 3 : mg.valence >= 4 ? 2 : 1;
    }
    var energyKey = mode === "energyPhysical" ? "physical" : mode === "energyMental" ? "mental" : "emotional";
    var val = entry.energy && typeof entry.energy[energyKey] === "number" ? entry.energy[energyKey] : null;
    if (val === null) return null;
    return val >= 67 ? 3 : val >= 34 ? 2 : 1;
  };

  // Tooltip text for a calendar cell based on the active mode
  App.tooltipByMode = function (entry, mode) {
    if (!entry) return App.t("history.noEntry");
    if (mode === "feeling") return App.getDisplayMood(entry);
    if (mode === "moodMatrix") {
      var mg = entry.moodGrid;
      if (!mg || typeof mg.valence !== "number") return App.t("history.noEntry");
      return typeof App.getMoodGridLabel === "function" ? App.getMoodGridLabel(mg) : App.t("history.noEntry");
    }
    var energyKey = mode === "energyPhysical" ? "physical" : mode === "energyMental" ? "mental" : "emotional";
    var val = entry.energy && typeof entry.energy[energyKey] === "number" ? entry.energy[energyKey] : null;
    if (val === null) return App.t("history.noEntry");
    return val + "%";
  };

  App.deriveMoodBucket = function (selectedEmotion, moodGrid, existingEntry) {
    if (selectedEmotion && App.moodScoreMap[selectedEmotion]) {
      var score = App.moodScoreMap[selectedEmotion];
      return score >= 3 ? "great" : score >= 2 ? "okay" : "low";
    }
    if (moodGrid) {
      return moodGrid.valence >= 7 ? "great" : moodGrid.valence >= 4 ? "okay" : "low";
    }
    return App.normalizeEntry(existingEntry || {}).mood || "okay";
  };

  App.getCurrentStreak = function (sortedEntries) {
    if (sortedEntries.length === 0) return 0;
    var uniqueDates = Array.from(new Set(sortedEntries.map(function (e) { return e.dateKey; })));
    if (uniqueDates.length === 0) return 0;
    var streak = 1;
    for (var i = 1; i < uniqueDates.length; i++) {
      var prevDate = new Date(uniqueDates[i - 1] + "T00:00:00");
      var currentDate = new Date(uniqueDates[i] + "T00:00:00");
      if (Math.round((prevDate - currentDate) / 86400000) !== 1) break;
      streak += 1;
    }
    return streak;
  };

  App.getRecentAverageLabel = function (sortedEntries) {
    var recent = sortedEntries.slice(0, 5);
    var scores = recent.map(function (e) { return App.scoreEntry(e); }).filter(function (s) { return typeof s === "number"; });
    if (scores.length === 0) return App.t("summary.averageMid");
    var average = scores.reduce(function (sum, v) { return sum + v; }, 0) / scores.length;
    if (average >= 2.5) return App.t("summary.averageHigh");
    if (average >= 1.75) return App.t("summary.averageMid");
    return App.t("summary.averageLow");
  };

  App.renderSummary = function () {
    var dom = App.dom;
    var sortedEntries = App.getSortedEntries();
    if (sortedEntries.length === 0) {
      dom.summaryContent.innerHTML = '<p class="empty-state">' + App.escapeHtml(App.t("summary.empty")) + "</p>";
      return;
    }

    var todayKey = App.getTodayKey();
    var todayEntries = sortedEntries.filter(function (e) { return e.dateKey === todayKey; });
    var checkedInToday = todayEntries.length > 0;
    var latestTodayTime = checkedInToday
      ? App.formatEntryTime(todayEntries[0].entryKey, todayEntries[0])
      : "";

    var streak = App.getCurrentStreak(sortedEntries);

    // Build a date→entry map for the last 7 days
    var entryByDate = {};
    sortedEntries.forEach(function (e) {
      if (!entryByDate[e.dateKey]) entryByDate[e.dateKey] = e;
    });

    // Week heatmap: today and 6 days back
    var weekDays = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      var dk = y + "-" + m + "-" + day;
      weekDays.push({ dateKey: dk, entry: entryByDate[dk] || null });
    }

    var locale = App.state.language === "nl" ? "nl-NL" : "en-US";
    var weekHtml = weekDays.map(function (item) {
      var d = new Date(item.dateKey + "T00:00:00");
      var dayLabel = d.toLocaleDateString(locale, { weekday: "short" });
      var isToday = item.dateKey === todayKey;
      var score = item.entry ? App.scoreEntry(item.entry) : null;
      var colorClass = score === null ? "heat-empty" : score >= 3 ? "heat-high" : score >= 2 ? "heat-mid" : "heat-low";
      var moodLabel = item.entry ? App.getDisplayMood(item.entry) : App.t("summary.noEntry");
      return '<div class="heat-day' + (isToday ? " heat-today" : "") + '" title="' + App.escapeHtml(item.dateKey + ": " + moodLabel) + '">' +
        '<div class="heat-dot ' + colorClass + '"></div>' +
        '<span class="heat-label">' + App.escapeHtml(dayLabel) + '</span>' +
        '</div>';
    }).join("");

    var todayHtml = '<div class="summary-today' + (checkedInToday ? " is-done" : "") + '">' +
      '<span class="summary-today-icon">' + (checkedInToday ? "✓" : "○") + '</span>' +
      '<span class="summary-today-text">' +
        (checkedInToday
          ? App.escapeHtml(App.t("summary.checkedInAt").replace("{time}", latestTodayTime))
          : App.escapeHtml(App.t("summary.notYet"))) +
      '</span>' +
    '</div>';

    var statsHtml = '<div class="summary-stats">' +
      '<div class="summary-stat"><span class="summary-stat-value">' + streak + '</span><span class="summary-stat-label">' + App.escapeHtml(streak === 1 ? App.t("summary.day") : App.t("summary.days")) + '</span></div>' +
      '<div class="summary-stat"><span class="summary-stat-value">' + sortedEntries.length + '</span><span class="summary-stat-label">' + App.escapeHtml(App.t("summary.totalCheckins")) + '</span></div>' +
    '</div>';

    dom.summaryContent.innerHTML =
      todayHtml +
      '<div class="summary-week">' + weekHtml + '</div>' +
      statsHtml;
  };

  App.renderHistory = function () {
    var dom = App.dom;
    var allEntries = App.getSortedEntries();
    if (allEntries.length === 0) {
      dom.historyContent.innerHTML = '<p class="empty-state">' + App.escapeHtml(App.t("history.empty")) + "</p>";
      return;
    }

    App.historyMode = App.historyMode || "feeling";
    var mode = App.historyMode;

    // Build date→best-entry map
    var entryByDate = {};
    allEntries.forEach(function (e) {
      if (!entryByDate[e.dateKey]) entryByDate[e.dateKey] = e;
    });

    // 28 days back (4 full weeks, 7 per row)
    var today = new Date();
    var days = [];
    for (var i = 27; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      var y = d.getFullYear();
      var mo = String(d.getMonth() + 1).padStart(2, "0");
      var dy = String(d.getDate()).padStart(2, "0");
      days.push(y + "-" + mo + "-" + dy);
    }

    var locale = App.state.language === "nl" ? "nl-NL" : "en-US";
    var todayKey = App.getTodayKey();
    var isEnergyMode = mode.indexOf("energy") === 0;

    // Mode selector
    var modes = [
      { key: "feeling",        label: App.t("history.modeFeeling") },
      { key: "moodMatrix",     label: App.t("history.modeMood") },
      { key: "energyPhysical", label: App.t("history.modeEnergyPhysical") },
      { key: "energyMental",   label: App.t("history.modeEnergyMental") },
      { key: "energyEmotional",label: App.getEnergyEmotionalLabel() },
    ];

    var modeSelectorHtml = '<div class="cal-mode-row">' +
      modes.map(function (m) {
        return '<button type="button" class="cal-mode-btn' + (m.key === mode ? " is-active" : "") +
          '" data-mode="' + m.key + '">' + App.escapeHtml(m.label) + '</button>';
      }).join("") +
      '</div>';

    var dayHeaders = App.t("history.dayHeaders").split(",");
    var headersHtml = dayHeaders.map(function (d) {
      return '<div class="cal-day-header">' + App.escapeHtml(d.trim()) + '</div>';
    }).join("");

    // Pad leading empty cells so first day lands on the correct column (Mon = col 0)
    var firstDate = new Date(days[0] + "T00:00:00");
    var firstDow = firstDate.getDay(); // 0=Sun
    var leadingCols = (firstDow + 6) % 7; // Mon-based: Mon=0 … Sun=6
    var paddingHtml = "";
    for (var p = 0; p < leadingCols; p++) {
      paddingHtml += '<div class="cal-cell-pad"></div>';
    }

    var cellsHtml = days.map(function (dateKey) {
      var entry = entryByDate[dateKey] || null;
      var d = new Date(dateKey + "T00:00:00");
      var dayNum = d.getDate();
      var isToday = dateKey === todayKey;
      var score = App.scoreEntryByMode(entry, mode);
      var colorClass = score === null ? "cal-empty" : score >= 3 ? "cal-high" : score >= 2 ? "cal-mid" : "cal-low";
      var tooltipLabel = App.tooltipByMode(entry, mode);
      var tooltip = d.toLocaleDateString(locale, { month: "short", day: "numeric" }) + ": " + tooltipLabel;

      return '<button type="button" class="cal-cell ' + colorClass + (isToday ? " cal-today" : "") + '" ' +
        'data-date="' + dateKey + '" title="' + App.escapeHtml(tooltip) + '" ' +
        'aria-label="' + App.escapeHtml(tooltip) + '">' +
        '<span class="cal-day-num">' + dayNum + '</span>' +
        '</button>';
    }).join("");

    dom.historyContent.innerHTML =
      modeSelectorHtml +
      '<div class="cal-legend">' +
        '<span class="cal-legend-dot cal-high"></span><span class="cal-legend-label">' + App.escapeHtml(App.t(isEnergyMode ? "history.legendEnergyHigh" : "history.legendHigh")) + '</span>' +
        '<span class="cal-legend-dot cal-mid"></span><span class="cal-legend-label">' + App.escapeHtml(App.t(isEnergyMode ? "history.legendEnergyMid" : "history.legendMid")) + '</span>' +
        '<span class="cal-legend-dot cal-low"></span><span class="cal-legend-label">' + App.escapeHtml(App.t(isEnergyMode ? "history.legendLowEnergy" : "history.legendLow")) + '</span>' +
        '<span class="cal-legend-dot cal-empty"></span><span class="cal-legend-label">' + App.escapeHtml(App.t("history.legendEmpty")) + '</span>' +
      '</div>' +
      '<div class="cal-headers">' + headersHtml + '</div>' +
      '<div class="cal-grid">' + paddingHtml + cellsHtml + '</div>';

    // Mode button events
    dom.historyContent.querySelectorAll(".cal-mode-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        App.historyMode = btn.dataset.mode;
        App.renderHistory();
      });
    });

    // Click a day → load that entry into check-in
    dom.historyContent.querySelectorAll(".cal-cell[data-date]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dateKey = btn.dataset.date;
        var entryKey = App.findLatestEntryKeyForDate(dateKey);
        if (!entryKey) return;
        App.loadEntryIntoForm(entryKey);
        App.activateTab("checkin", true);
      });
    });
  };

  App.initCheckinEvents = function () {
    var dom = App.dom;
    var state = App.state;

    dom.emotionWheel.addEventListener("click", function (event) {
      var segment = event.target.closest(".emotion-segment");
      if (!segment) return;
      state.selectedEmotion = segment.dataset.emotion;
      dom.statusMessage.textContent = "";
      App.renderCoreSelections();
    });

    dom.bodyPartButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.dataset.part;
        if (state.bodySignals.has(key)) { state.bodySignals.delete(key); }
        else { state.bodySignals.add(key); }
        dom.statusMessage.textContent = "";
        App.renderCoreSelections();
      });
    });

    dom.energyMeters.forEach(function (meter) {
      meter.addEventListener("click", function (event) {
        var type = meter.dataset.energyType;
        var rect = meter.getBoundingClientRect();
        var clickY = event.clientY - rect.top;
        var percentage = Math.max(0, Math.min(100, 100 - (clickY / rect.height) * 100));
        state.energy[type] = Math.round(percentage);
        dom.statusMessage.textContent = "";
        App.renderCoreSelections();
      });
    });

    document.querySelectorAll(".energy-scale span").forEach(function (label) {
      var value = parseInt(label.textContent, 10);
      if (Number.isNaN(value)) return;
      label.addEventListener("click", function () {
        var column = label.closest(".energy-column");
        if (!column) return;
        var meter = column.querySelector(".energy-meter[data-energy-type]");
        if (!meter) return;
        state.energy[meter.dataset.energyType] = value;
        dom.statusMessage.textContent = "";
        App.renderCoreSelections();
      });
    });

    dom.wheelTypeSelect.addEventListener("change", function (e) {
      App.activeWheelType = e.target.value;
      localStorage.setItem("moodTrackerWheelType", App.activeWheelType);
      state.selectedEmotion = null;
      App.renderEmotionWheel();
      App.renderCoreSelections();
    });

    dom.resetFeelingButton.addEventListener("click", function () {
      state.selectedEmotion = null;
      dom.statusMessage.textContent = "";
      App.renderCoreSelections();
    });

    dom.resetBodySignalsButton.addEventListener("click", function () {
      state.bodySignals.clear();
      dom.statusMessage.textContent = "";
      App.renderCoreSelections();
    });

    dom.resetEnergyButton.addEventListener("click", function () {
      state.energy = { physical: null, mental: null, emotional: null };
      dom.statusMessage.textContent = "";
      App.renderCoreSelections();
    });

    dom.resetMoodButton.addEventListener("click", function () {
      state.selectedMoodGrid = null;
      dom.statusMessage.textContent = "";
      App.renderCoreSelections();
    });

    dom.saveButton.addEventListener("click", function () {
      var needsMoodInput = state.settings.components.coreFeeling || state.settings.components.moodMatrix;
      if (needsMoodInput && !state.selectedEmotion && !App.normalizeMoodGrid(state.selectedMoodGrid)) {
        dom.statusMessage.textContent = App.t("status.chooseFeeling");
        return;
      }

      var todayKey = App.getTodayKey();
      var shouldCreateExtraEntry = Boolean(dom.saveAsNewEntryCheckbox && dom.saveAsNewEntryCheckbox.checked);
      var latestTodayEntryKey = App.findLatestEntryKeyForDate(todayKey);
      var shouldUpdateActiveEntry = Boolean(
        !shouldCreateExtraEntry && state.activeEntryKey
        && Object.prototype.hasOwnProperty.call(state.entries, state.activeEntryKey),
      );
      var targetEntryKey = shouldCreateExtraEntry
        ? App.createTimestampedEntryKey(todayKey)
        : (shouldUpdateActiveEntry ? state.activeEntryKey : (latestTodayEntryKey || todayKey));
      var existingEntry = state.entries[targetEntryKey];
      var wasUpdate = !shouldCreateExtraEntry && Boolean(existingEntry);

      state.entries[targetEntryKey] = {
        ...App.normalizeEntry(existingEntry || {}),
        id: (existingEntry && existingEntry.id) ? existingEntry.id : App.generateId(),
        thoughts: dom.thoughtsField.value.trim(),
        selectedEmotion: state.selectedEmotion,
        wheelType: App.activeWheelType,
        customFeelings: dom.customEmotionsField.value.trim(),
        energy: state.energy,
        bodySignals: Array.from(state.bodySignals),
        bodyNote: dom.bodyField.value.trim(),
        energyNote: dom.energyNoteField.value.trim(),
        action: dom.actionField.value.trim(),
        note: dom.noteField.value.trim(),
        moodGrid: App.sanitizeMoodGridForStorage(state.selectedMoodGrid),
        mood: App.deriveMoodBucket(state.selectedEmotion, state.selectedMoodGrid, existingEntry),
        weather: App.getWeatherForEntry ? App.getWeatherForEntry() : null,
        updatedAt: new Date().toISOString(),
      };

      App.saveEntries(state.entries);
      state.activeEntryKey = targetEntryKey;
      App.renderSummary();
      App.renderHistory();
      App.renderOverview();
      dom.statusMessage.textContent = wasUpdate ? App.t("status.updated") : App.t("status.saved");
      if (dom.saveAsNewEntryCheckbox) {
        dom.saveAsNewEntryCheckbox.checked = false;
      }
    });
  };
})();
