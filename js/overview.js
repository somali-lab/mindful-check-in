(function () {
  "use strict";
  window.App = window.App || {};

  App.getRowsPerPage = function () {
    var value = Number(App.state.settings.rowsPerPage);
    if (!Number.isFinite(value)) return 20;
    return Math.min(100, Math.max(5, Math.round(value)));
  };

  App.getOverviewMaxChars = function () {
    var value = Number(App.state.settings.overviewMaxChars);
    if (!Number.isFinite(value)) return 120;
    return Math.min(500, Math.max(20, Math.round(value)));
  };

  App.truncateOverviewText = function (value) {
    var text = String(value == null ? "" : value).trim();
    if (!text) return "";
    var maxChars = App.getOverviewMaxChars();
    if (text.length <= maxChars) return text;
    return text.slice(0, Math.max(1, maxChars - 1)).trimEnd() + "...";
  };

  App.getOverviewColumns = function () {
    var c = App.state.settings.components;
    var columns = [{ key: "date", label: App.t("overview.columns.date") }];
    if (c.weather) columns.push({ key: "weather", label: App.t("overview.columns.weather") });
    if (c.coreFeeling) columns.push({ key: "coreFeeling", label: App.t("fields.feelings.label") });
    if (c.thoughts) columns.push({ key: "thoughts", label: App.t("overview.columns.thoughts") });
    if (c.bodySignals) columns.push({ key: "bodySignals", label: App.t("overview.columns.bodySignals") });
    if (c.energyPhysical) columns.push({ key: "energyPhysical", label: App.t("overview.columns.energyPhysical") });
    if (c.energyMental) columns.push({ key: "energyMental", label: App.t("overview.columns.energyMental") });
    if (c.energyEmotional) columns.push({ key: "energyEmotional", label: App.getEnergyEmotionalLabel ? App.getEnergyEmotionalLabel() : App.t("overview.columns.energyEmotional") });
    if (c.moodMatrix) columns.push({ key: "moodMatrix", label: App.t("overview.columns.moodMatrix") });
    if (c.actions) columns.push({ key: "actions", label: App.t("overview.columns.actions") });
    columns.push({ key: "delete", label: "" });
    columns.push({ key: "exportEntry", label: "" });
    return columns;
  };

  App.getOverviewHeaderCell = function (column) {
    var isSortable = column.key !== "delete" && column.key !== "exportEntry";
    if (!isSortable) {
      return '<th class="overview-col overview-col-' + column.key + '">' + App.escapeHtml(column.label) + "</th>";
    }
    var isActive = App.overviewSortKey === column.key;
    var directionMark = isActive ? (App.overviewSortDir === "asc" ? " \u25b2" : " \u25bc") : "";
    return '<th class="overview-col overview-col-' + column.key + ' overview-sortable' + (isActive ? " is-active" : "") + '" data-sort-key="' + App.escapeHtml(column.key) + '">' + App.escapeHtml(column.label) + directionMark + "</th>";
  };

  App.getOverviewCellValue = function (columnKey, entry) {
    var noteSubValue = App.state.settings.components.note ? (entry.note || "") : "";
    switch (columnKey) {
      case "delete":
        return { main: "", sub: "" };
      case "exportEntry":
        return { main: "", sub: "" };
      case "date":
        return { main: App.formatDateOnly(entry.entryKey), sub: App.formatEntryTime(entry.entryKey, entry) };
      case "weather":
        var w = entry.weather;
        if (w && (w.icon || w.code !== undefined || w.temperature !== null)) {
          var icon = w.icon || (w.code !== undefined && App.getWeatherIcon ? App.getWeatherIcon(w.code) : "");
          var temp = (w.temperature !== null && w.temperature !== undefined) ? Math.round(w.temperature) + "°" : "";
          return { main: (icon + " " + temp).trim(), sub: "" };
        }
        return { main: "-", sub: "" };
      case "thoughts":
        return { main: entry.thoughts || "-", sub: "" };
      case "coreFeeling":
        return {
          main: entry.selectedEmotion ? (App.t("feelings." + entry.selectedEmotion) || entry.selectedEmotion) : "-",
          sub: entry.customFeelings || "",
        };
      case "bodySignals":
        return { main: App.formatBodySignals(entry.bodySignals), sub: entry.bodyNote || "" };
      case "energyPhysical":
        return { main: (entry.energy && typeof entry.energy.physical === "number") ? entry.energy.physical + "%" : "-", sub: "" };
      case "energyMental":
        return { main: (entry.energy && typeof entry.energy.mental === "number") ? entry.energy.mental + "%" : "-", sub: "" };
      case "energyEmotional":
        return { main: (entry.energy && typeof entry.energy.emotional === "number") ? entry.energy.emotional + "%" : "-", sub: "" };
      case "moodMatrix":
        if (entry.moodGrid) {
          var normalizedMoodGrid = App.normalizeMoodGrid(entry.moodGrid);
          if (normalizedMoodGrid) {
            return { main: App.getMoodGridLabel(normalizedMoodGrid), sub: "Energie: " + normalizedMoodGrid.energy + ", Mood: " + normalizedMoodGrid.valence };
          }
          return { main: App.getMoodGridLabel(entry.moodGrid), sub: "" };
        }
        return { main: "-", sub: "" };
      case "actions":
        return { main: entry.action || "-", sub: noteSubValue };
      default:
        return { main: "-", sub: "" };
    }
  };

  App.getFilteredOverviewEntries = function (entries) {
    var dom = App.dom;
    var query = String((dom.overviewSearchInput && dom.overviewSearchInput.value) || "").trim().toLowerCase();
    var filterMode = (dom.overviewFilterSelect && dom.overviewFilterSelect.value) || "all";
    var todayKey = App.getTodayKey();
    var now = new Date();
    var minDate7 = new Date(now); minDate7.setHours(0, 0, 0, 0); minDate7.setDate(minDate7.getDate() - 6);
    var minDate14 = new Date(now); minDate14.setHours(0, 0, 0, 0); minDate14.setDate(minDate14.getDate() - 13);
    var minDateMonth = new Date(now); minDateMonth.setHours(0, 0, 0, 0); minDateMonth.setMonth(minDateMonth.getMonth() - 1);
    var minDate3Months = new Date(now); minDate3Months.setHours(0, 0, 0, 0); minDate3Months.setMonth(minDate3Months.getMonth() - 3);

    return entries.filter(function (entry) {
      if (filterMode === "today") {
        if (entry.dateKey !== todayKey) return false;
      } else if (filterMode === "last7") {
        var d7 = new Date(entry.dateKey + "T00:00:00");
        if (Number.isNaN(d7.getTime()) || d7 < minDate7) return false;
      } else if (filterMode === "last14") {
        var d14 = new Date(entry.dateKey + "T00:00:00");
        if (Number.isNaN(d14.getTime()) || d14 < minDate14) return false;
      } else if (filterMode === "lastMonth") {
        var dM = new Date(entry.dateKey + "T00:00:00");
        if (Number.isNaN(dM.getTime()) || dM < minDateMonth) return false;
      } else if (filterMode === "last3Months") {
        var d3M = new Date(entry.dateKey + "T00:00:00");
        if (Number.isNaN(d3M.getTime()) || d3M < minDate3Months) return false;
      }
      if (!query) return true;
      return App.getOverviewSearchText(entry).includes(query);
    });
  };

  App.getOverviewSearchText = function (entry) {
    var parts = [
      App.formatDate(entry.entryKey, entry),
      App.getDisplayMood(entry),
      entry.thoughts,
      entry.selectedEmotion ? (App.t("feelings." + entry.selectedEmotion) || entry.selectedEmotion) : "",
      entry.customFeelings,
      App.formatBodySignals(entry.bodySignals),
      entry.bodyNote, entry.energyNote, entry.action, entry.note,
      entry.moodGrid ? App.getMoodGridLabel(entry.moodGrid) : "",
    ];
    return parts.map(function (p) { return String(p || "").toLowerCase(); }).join(" ");
  };

  App.sortOverviewEntries = function (entries) {
    var sorted = entries.slice();
    sorted.sort(function (a, b) {
      var left = App.getOverviewSortValue(App.overviewSortKey, a);
      var right = App.getOverviewSortValue(App.overviewSortKey, b);
      var result = 0;
      if (typeof left === "number" && typeof right === "number") {
        result = left - right;
      } else {
        result = String(left).localeCompare(String(right), undefined, { sensitivity: "base" });
      }
      if (result === 0) {
        result = b.entryKey.localeCompare(a.entryKey);
      }
      return App.overviewSortDir === "asc" ? result : -result;
    });
    return sorted;
  };

  App.getOverviewSortValue = function (sortKey, entry) {
    switch (sortKey) {
      case "date":
        if (entry.entryKey.length > 10) return entry.entryKey;
        if (entry.updatedAt) {
          var d = new Date(entry.updatedAt);
          if (!Number.isNaN(d.getTime())) {
            return entry.dateKey + "_" + String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0") + String(d.getSeconds()).padStart(2, "0") + String(d.getMilliseconds()).padStart(3, "0");
          }
        }
        return entry.dateKey + "_235959999";
      case "coreFeeling":
        return entry.selectedEmotion ? (App.t("feelings." + entry.selectedEmotion) || entry.selectedEmotion) : "";
      case "thoughts":
        return entry.thoughts || "";
      case "bodySignals":
        return App.formatBodySignals(entry.bodySignals);
      case "energyPhysical":
        return (entry.energy && typeof entry.energy.physical === "number") ? entry.energy.physical : -1;
      case "energyMental":
        return (entry.energy && typeof entry.energy.mental === "number") ? entry.energy.mental : -1;
      case "energyEmotional":
        return (entry.energy && typeof entry.energy.emotional === "number") ? entry.energy.emotional : -1;
      case "moodMatrix":
        return entry.moodGrid ? (entry.moodGrid.energy || 0) + "-" + (entry.moodGrid.valence || 0) : "";
      case "actions":
        return entry.action || "";
      default:
        return App.getDisplayMood(entry);
    }
  };

  App.setOverviewEntryHighlight = function (entryKey, isActive) {
    var dom = App.dom;
    if (!dom.overviewBody || !entryKey) return;
    dom.overviewBody.querySelectorAll('.overview-row[data-entry-key="' + entryKey + '"]').forEach(function (row) {
      row.classList.toggle("is-entry-hover", isActive);
    });
  };

  App.openEntryInCheckin = function (entryKey) {
    var dom = App.dom;
    var state = App.state;
    var rawEntry = state.entries[entryKey];
    if (!rawEntry || typeof rawEntry !== "object") return;
    var entry = App.normalizeEntry(rawEntry);
    state.activeEntryKey = entryKey;
    App.populateFormFromEntry(entry);
    if (App.showEntryWeather) App.showEntryWeather(entry);

    var savedWheel = rawEntry.wheelType || entry.wheelType || null;
    if (savedWheel && App.emotionWheelVariants[savedWheel] && savedWheel !== App.activeWheelType) {
      App.activeWheelType = savedWheel;
      localStorage.setItem("moodTrackerWheelType", App.activeWheelType);
      if (dom.wheelTypeSelect) dom.wheelTypeSelect.value = App.activeWheelType;
      App.renderEmotionWheel();
    }

    App.renderCheckinContext();
    App.renderCheckinMessage("");
    App.renderCoreSelections();
    App.activateTab("checkin", true);
  };

  App.renderOverview = function () {
    var dom = App.dom;
    if (!dom.overviewHead || !dom.overviewBody || !dom.overviewPageInfo) return;

    var allEntries = App.getSortedEntries();
    var filteredEntries = App.getFilteredOverviewEntries(allEntries);
    var sortedEntries = App.sortOverviewEntries(filteredEntries);
    var rowsPerPage = App.getRowsPerPage();
    var totalPages = Math.max(1, Math.ceil(sortedEntries.length / rowsPerPage));
    App.currentOverviewPage = Math.min(App.currentOverviewPage, totalPages);
    App.currentOverviewPage = Math.max(1, App.currentOverviewPage);

    var columns = App.getOverviewColumns();
    if (!columns.some(function (c) { return c.key === App.overviewSortKey; })) {
      App.overviewSortKey = "date";
      App.overviewSortDir = "desc";
      App.saveOverviewUiState();
    }
    var firstEnergyIndex = columns.findIndex(function (c) { return c.key.startsWith("energy"); });
    var energyColumns = columns.filter(function (c) { return c.key.startsWith("energy"); });
    var prefixColumnCount = firstEnergyIndex < 0 ? columns.length : firstEnergyIndex;

    dom.overviewHead.innerHTML = "<tr>" + columns.map(function (c) { return App.getOverviewHeaderCell(c); }).join("") + "</tr>";

    if (sortedEntries.length === 0) {
      dom.overviewBody.innerHTML = "";
      if (dom.overviewEmpty) dom.overviewEmpty.textContent = App.t("overview.empty");
      dom.overviewPageInfo.textContent = App.t("overview.page") + " 1 " + App.t("overview.of") + " 1";
      if (dom.overviewPrevButton) dom.overviewPrevButton.disabled = true;
      if (dom.overviewNextButton) dom.overviewNextButton.disabled = true;
      return;
    }

    if (dom.overviewEmpty) dom.overviewEmpty.textContent = "";

    var startIndex = (App.currentOverviewPage - 1) * rowsPerPage;
    var pageEntries = sortedEntries.slice(startIndex, startIndex + rowsPerPage);

    dom.overviewBody.innerHTML = pageEntries.map(function (entry, entryIndex) {
      var stripeClass = entryIndex % 2 === 1 ? " overview-entry-alt" : "";
      var cells = columns.map(function (column) {
        return Object.assign({ key: column.key }, App.getOverviewCellValue(column.key, entry));
      });
      var hasAnySub = cells.some(function (cell) { return String(cell.sub || "").trim().length > 0; })
        || String(entry.energyNote || "").trim().length > 0;

      var mainRow = '<tr class="overview-row' + stripeClass + '" data-entry-key="' + App.escapeHtml(entry.entryKey) + '" tabindex="0">' +
        cells.map(function (cell) {
          if (cell.key === "delete") {
            return '<td class="overview-col overview-col-delete"' + (hasAnySub ? ' rowspan="2"' : '') + '>' +
              '<button type="button" class="overview-delete-button" data-entry-key="' + App.escapeHtml(entry.entryKey) + '" aria-label="' + App.escapeHtml(App.t("overview.deleteAria")) + '" title="' + App.escapeHtml(App.t("overview.deleteAria")) + '">\u2716</button></td>';
          }
          if (cell.key === "exportEntry") {
            return '<td class="overview-col overview-col-exportEntry"' + (hasAnySub ? ' rowspan="2"' : '') + '>' +
              '<button type="button" class="overview-export-entry-button" data-entry-key="' + App.escapeHtml(entry.entryKey) + '" aria-label="' + App.escapeHtml(App.t("overview.exportEntryAria")) + '" title="' + App.escapeHtml(App.t("overview.exportEntryAria")) + '">' +
              '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v8M4 7l4 4 4-4M3 13h10"/></svg>' +
              '</button></td>';
          }
          return '<td class="overview-col overview-col-' + cell.key + '"><div class="overview-cell-main">' + App.escapeHtml(App.truncateOverviewText(cell.main)) + "</div></td>";
        }).join("") + "</tr>";

      if (!hasAnySub) return mainRow;

      var noteCells = "";
      var index = 0;
      while (index < columns.length) {
        var column = columns[index];
        if (column.key.startsWith("energy") && energyColumns.length > 0 && index === prefixColumnCount) {
          noteCells += '<td class="overview-energy-note-cell" colspan="' + energyColumns.length + '"><div class="overview-cell-sub">' + App.escapeHtml(App.truncateOverviewText(entry.energyNote || "")) + "</div></td>";
          index += energyColumns.length;
          continue;
        }
        if (column.key === "delete" || column.key === "exportEntry") { index += 1; continue; }
        var subValue = App.truncateOverviewText(cells[index].sub || "");
        noteCells += '<td class="overview-note-cell"><div class="overview-cell-sub">' + App.escapeHtml(subValue) + "</div></td>";
        index += 1;
      }

      return mainRow + '<tr class="overview-row overview-row-note' + stripeClass + '" data-entry-key="' + App.escapeHtml(entry.entryKey) + '">' + noteCells + "</tr>";
    }).join("");

    dom.overviewBody.querySelectorAll(".overview-row").forEach(function (row) {
      var entryKey = row.getAttribute("data-entry-key");
      row.addEventListener("click", function (event) {
        if (event.target instanceof Element && (event.target.closest(".overview-delete-button") || event.target.closest(".overview-export-entry-button"))) return;
        if (!entryKey) return;
        App.openEntryInCheckin(entryKey);
      });
      row.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (entryKey) App.openEntryInCheckin(entryKey);
      });
      row.addEventListener("mouseenter", function () { if (entryKey) App.setOverviewEntryHighlight(entryKey, true); });
      row.addEventListener("mouseleave", function () { if (entryKey) App.setOverviewEntryHighlight(entryKey, false); });
      row.addEventListener("focusin", function () { if (entryKey) App.setOverviewEntryHighlight(entryKey, true); });
      row.addEventListener("focusout", function () { if (entryKey) App.setOverviewEntryHighlight(entryKey, false); });
    });

    dom.overviewBody.querySelectorAll(".overview-delete-button").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var entryKey = button.getAttribute("data-entry-key");
        if (!entryKey) return;
        if (!window.confirm(App.t("overview.deleteConfirm"))) return;
        delete App.state.entries[entryKey];
        if (App.state.activeEntryKey === entryKey) {
          App.clearCheckinForm();
        }
        App.saveEntries(App.state.entries);
        App.hydrateTodayEntry();
        App.renderCoreSelections();
        App.refreshViews();
      });
    });

    dom.overviewBody.querySelectorAll(".overview-export-entry-button").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var entryKey = button.getAttribute("data-entry-key");
        if (!entryKey) return;
        var raw = App.state.entries[entryKey];
        if (!raw || typeof raw !== "object") return;
        var exportData = Object.assign({}, raw);
        delete exportData.language;
        var dateTimeStr = entryKey.replace(/[^0-9T\-]/g, "").replace(/T/, "-");
        if (!dateTimeStr) dateTimeStr = App.getTodayKey();
        App.downloadJsonFile(exportData, "mindful-checkin-" + dateTimeStr + ".json");
      });
    });

    dom.overviewHead.querySelectorAll("[data-sort-key]").forEach(function (headerCell) {
      headerCell.addEventListener("click", function () {
        var sortKey = headerCell.getAttribute("data-sort-key");
        if (!sortKey) return;
        if (App.overviewSortKey === sortKey) {
          App.overviewSortDir = App.overviewSortDir === "asc" ? "desc" : "asc";
        } else {
          App.overviewSortKey = sortKey;
          App.overviewSortDir = sortKey === "date" ? "desc" : "asc";
        }
        App.currentOverviewPage = 1;
        App.saveOverviewUiState();
        App.renderOverview();
      });
    });

    dom.overviewPageInfo.textContent = App.t("overview.page") + " " + App.currentOverviewPage + " " + App.t("overview.of") + " " + totalPages;
    if (dom.overviewFirstButton) dom.overviewFirstButton.disabled = App.currentOverviewPage <= 1;
    if (dom.overviewPrevButton) dom.overviewPrevButton.disabled = App.currentOverviewPage <= 1;
    if (dom.overviewNextButton) dom.overviewNextButton.disabled = App.currentOverviewPage >= totalPages;
    if (dom.overviewLastButton) dom.overviewLastButton.disabled = App.currentOverviewPage >= totalPages;
  };

  App.initOverviewEvents = function () {
    var dom = App.dom;

    if (dom.overviewFirstButton) {
      dom.overviewFirstButton.addEventListener("click", function () {
        App.currentOverviewPage = 1;
        App.renderOverview();
      });
    }
    if (dom.overviewPrevButton) {
      dom.overviewPrevButton.addEventListener("click", function () {
        App.currentOverviewPage = Math.max(1, App.currentOverviewPage - 1);
        App.renderOverview();
      });
    }
    if (dom.overviewNextButton) {
      dom.overviewNextButton.addEventListener("click", function () {
        App.currentOverviewPage += 1;
        App.renderOverview();
      });
    }
    if (dom.overviewLastButton) {
      dom.overviewLastButton.addEventListener("click", function () {
        App.currentOverviewPage = 999999;
        App.renderOverview();
      });
    }
    if (dom.overviewSearchInput) {
      dom.overviewSearchInput.addEventListener("input", function () {
        App.currentOverviewPage = 1;
        App.saveOverviewUiState();
        App.renderOverview();
      });
    }
    if (dom.overviewFilterSelect) {
      dom.overviewFilterSelect.addEventListener("change", function () {
        App.currentOverviewPage = 1;
        App.saveOverviewUiState();
        App.renderOverview();
      });
    }
    if (dom.overviewExportButton) {
      dom.overviewExportButton.addEventListener("click", function () {
        var allEntries = App.getSortedEntries();
        var filteredEntries = App.getFilteredOverviewEntries(allEntries);
        var sortedEntries = App.sortOverviewEntries(filteredEntries);
        var exportData = sortedEntries.map(function (entry) {
          var raw = Object.assign({}, App.state.entries[entry.entryKey]);
          delete raw.language;
          return Object.assign({ entryKey: entry.entryKey }, raw);
        });
        App.downloadJsonFile(exportData, "mindful-checkin-export-" + App.getTodayKey() + ".json");
        if (dom.overviewStatus) {
          dom.overviewStatus.textContent = App.t("overview.exportDone").replace("{count}", String(exportData.length));
        }
      });
    }

    if (dom.overviewImportButton) {
      dom.overviewImportButton.addEventListener("click", function () {
        if (dom.overviewImportFile) dom.overviewImportFile.click();
      });
    }

    if (dom.overviewImportFile) {
      dom.overviewImportFile.addEventListener("change", function () {
        App.readJsonFile(dom.overviewImportFile, function (parsed, error) {
          if (error || !Array.isArray(parsed)) {
            if (dom.overviewStatus) dom.overviewStatus.textContent = App.t("overview.importError");
            return;
          }
          var overwrite = window.confirm(App.t("overview.importConfirmOverwrite"));
          var existingById = {};
          Object.entries(App.state.entries).forEach(function (pair) {
            if (pair[1] && pair[1].id) existingById[pair[1].id] = pair[0];
          });
          var added = 0, updated = 0, skipped = 0;
          parsed.forEach(function (imported) {
            if (!imported || typeof imported !== "object") return;
            var importId = imported.id || null;
            var importKey = imported.entryKey || App.createTimestampedEntryKey(App.getTodayKey());
            var entryData = Object.assign({}, imported);
            delete entryData.entryKey;
            if (importId && existingById[importId]) {
              if (overwrite) {
                var existingKey = existingById[importId];
                App.state.entries[existingKey] = Object.assign({}, App.state.entries[existingKey], entryData);
                updated += 1;
              } else {
                skipped += 1;
              }
            } else {
              if (!entryData.id) entryData.id = App.generateId();
              App.state.entries[importKey] = entryData;
              if (entryData.id) existingById[entryData.id] = importKey;
              added += 1;
            }
          });
          App.saveEntries(App.state.entries);
          App.refreshViews();
          if (dom.overviewStatus) {
            dom.overviewStatus.textContent = App.t("overview.importDone")
              .replace("{added}", String(added))
              .replace("{updated}", String(updated))
              .replace("{skipped}", String(skipped));
          }
        });
      });
    }
  };
})();
