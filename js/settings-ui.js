(function () {
  "use strict";
  window.App = window.App || {};

  App.applyTheme = function (themeSetting) {
    var validThemes = new Set(["light", "dark", "system"]);
    var theme = validThemes.has(themeSetting) ? themeSetting : "system";
    if (theme === "system") {
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    App.syncThemeButtons();
  };

  App.syncThemeButtons = function () {
    var current = (App.state && App.state.settings && App.state.settings.theme) || "system";
    var buttons = document.querySelectorAll(".theme-button[data-theme-value]");
    buttons.forEach(function (btn) {
      var isSelected = btn.dataset.themeValue === current;
      btn.classList.toggle("is-selected", isSelected);
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  };

  App.toggleVisibility = function (element, isVisible) {
    if (!element) return;
    element.classList.toggle("is-hidden", !isVisible);
  };

  App.syncSettingsForm = function () {
    var dom = App.dom;
    var state = App.state;
    if (!dom.settingsDefaultLanguage) return;
    dom.settingsDefaultLanguage.value = state.settings.defaultLanguage;
    if (dom.settingsTheme) dom.settingsTheme.value = state.settings.theme || "system";
    if (dom.settingsDefaultWheel) dom.settingsDefaultWheel.value = state.settings.defaultWheelType || "act";
    if (dom.settingsRowsPerPage) dom.settingsRowsPerPage.value = String(state.settings.rowsPerPage || 20);
    if (dom.settingsOverviewMaxChars) dom.settingsOverviewMaxChars.value = String(state.settings.overviewMaxChars || 120);
    if (dom.settingsWeatherLocation) dom.settingsWeatherLocation.value = state.settings.weatherLocation || "";
    if (dom.settingsEnergyEmotionalLabel) dom.settingsEnergyEmotionalLabel.value = state.settings.energyEmotionalLabel || "emotionalSocial";
    Object.entries(dom.settingsCheckboxes).forEach(function (pair) {
      if (pair[1]) pair[1].checked = Boolean(state.settings.components[pair[0]]);
    });
    App.renderQuickActionsEditor();
    App.renderWeatherLastFetched();
  };

  App.collectSettingsFromForm = function () {
    var dom = App.dom;
    var settings = App.cloneSettings(App.getDefaultSettings());
    settings.defaultLanguage = dom.settingsDefaultLanguage && dom.settingsDefaultLanguage.value === "nl" ? "nl" : "en";
    var themeValue = dom.settingsTheme && dom.settingsTheme.value;
    settings.theme = (themeValue === "light" || themeValue === "dark") ? themeValue : "system";
    var wheelValue = dom.settingsDefaultWheel && dom.settingsDefaultWheel.value;
    if (wheelValue && App.emotionWheelVariants[wheelValue]) {
      settings.defaultWheelType = wheelValue;
    }
    if (dom.settingsRowsPerPage) {
      var parsedRows = Number.parseInt(dom.settingsRowsPerPage.value, 10);
      settings.rowsPerPage = Number.isFinite(parsedRows) ? Math.min(100, Math.max(5, parsedRows)) : 20;
    }
    if (dom.settingsOverviewMaxChars) {
      var parsedMaxChars = Number.parseInt(dom.settingsOverviewMaxChars.value, 10);
      settings.overviewMaxChars = Number.isFinite(parsedMaxChars) ? Math.min(500, Math.max(20, parsedMaxChars)) : 120;
    }
    settings.quickActions = (App.state.settings.quickActions || []).slice();
    settings.weatherLocation = dom.settingsWeatherLocation ? dom.settingsWeatherLocation.value.trim() : "";
    settings.weatherCoords = App.state.settings.weatherCoords || null;
    var emoLabelVal = dom.settingsEnergyEmotionalLabel && dom.settingsEnergyEmotionalLabel.value;
    settings.energyEmotionalLabel = (emoLabelVal === "emotional" || emoLabelVal === "social") ? emoLabelVal : "emotionalSocial";
    Object.entries(dom.settingsCheckboxes).forEach(function (pair) {
      if (pair[1]) settings.components[pair[0]] = pair[1].checked;
    });
    return settings;
  };

  App.applySettingsToUI = function () {
    var c = App.state.settings.components;
    var ce = App.dom.componentElements;
    App.toggleVisibility(ce.weather, c.weather);
    App.toggleVisibility(ce.thoughts, c.thoughts);
    App.toggleVisibility(ce.coreFeeling, c.coreFeeling);
    App.toggleVisibility(ce.bodySignals, c.bodySignals);
    App.toggleVisibility(ce.moodMatrix, c.moodMatrix);
    App.toggleVisibility(ce.actions, c.actions);
    App.toggleVisibility(ce.note, c.note);
    App.toggleVisibility(ce.energyColumns.physical, c.energyPhysical);
    App.toggleVisibility(ce.energyColumns.mental, c.energyMental);
    App.toggleVisibility(ce.energyColumns.emotional, c.energyEmotional);
    App.toggleVisibility(ce.energyPanel, c.energyPhysical || c.energyMental || c.energyEmotional);
    App.applyEnergyEmotionalLabel();
  };

  App.getEnergyEmotionalLabel = function () {
    var choice = App.state.settings.energyEmotionalLabel || "emotionalSocial";
    if (choice === "emotional") return App.t("energy.emotionalOnly");
    if (choice === "social") return App.t("energy.socialOnly");
    return App.t("energy.emotional");
  };

  App.applyEnergyEmotionalLabel = function () {
    var label = App.getEnergyEmotionalLabel();
    if (App.dom.energyEmotionalTypeLabel) {
      App.dom.energyEmotionalTypeLabel.textContent = label;
    }
    var settingsSpan = App.dom.settingsCheckboxes.energyEmotional
      ? App.dom.settingsCheckboxes.energyEmotional.parentElement.querySelector("span")
      : null;
    if (settingsSpan) {
      var choice = App.state.settings.energyEmotionalLabel || "emotionalSocial";
      settingsSpan.textContent = App.t("settings.energyEmotionalLabel." + choice);
    }
  };

  App.renderQuickActionsEditor = function () {
    var list = document.getElementById("quick-actions-list");
    if (!list) return;
    var actions = App.state.settings.quickActions || [];
    list.innerHTML = "";
    if (actions.length === 0) {
      var emptyMsg = document.createElement("span");
      emptyMsg.className = "form-help";
      emptyMsg.textContent = App.t("settings.quickActions.empty");
      list.appendChild(emptyMsg);
      return;
    }
    actions.forEach(function (text, index) {
      var tag = document.createElement("span");
      tag.className = "quick-action-tag";
      var label = document.createElement("span");
      label.textContent = text;
      var removeBtn = document.createElement("span");
      removeBtn.className = "qa-remove";
      removeBtn.textContent = "\u00d7";
      removeBtn.title = "Remove";
      removeBtn.addEventListener("click", function () {
        App.state.settings.quickActions.splice(index, 1);
        App.renderQuickActionsEditor();
      });
      tag.appendChild(label);
      tag.appendChild(removeBtn);
      list.appendChild(tag);
    });
  };

  App.renderQuickActionsChips = function () {
    var container = document.getElementById("quick-actions-chips");
    if (!container) return;
    var actions = App.state.settings.quickActions || [];
    container.innerHTML = "";
    actions.forEach(function (text) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "qa-chip";
      chip.textContent = text;
      chip.addEventListener("click", function () {
        var field = App.dom.actionField;
        if (!field) return;
        var current = field.value.trim();
        field.value = current ? current + "\n" + text : text;
        field.focus();
      });
      container.appendChild(chip);
    });
  };

  App.fullRefreshAfterSettings = function () {
    var state = App.state;
    App.applyTheme(state.settings.theme);
    state.language = state.settings.defaultLanguage;
    App.saveLanguage(state.language);
    App.activeWheelType = state.settings.defaultWheelType || "act";
    localStorage.setItem("moodTrackerWheelType", App.activeWheelType);
    if (App.dom.wheelTypeSelect) App.dom.wheelTypeSelect.value = App.activeWheelType;
    App.applyLanguage();
    App.applySettingsToUI();
    App.renderEmotionWheel();
    App.renderMoodGrid();
    App.renderCoreSelections();
    App.renderSummary();
    App.renderHistory();
    App.renderQuickActionsChips();
    if (App.renderWeatherWidget) App.renderWeatherWidget();
    App.currentOverviewPage = 1;
    App.renderOverview();
  };

  App.initSettingsEvents = function () {
    var dom = App.dom;
    var state = App.state;

    if (dom.settingsSaveButton) {
      dom.settingsSaveButton.addEventListener("click", function () {
        var newSettings = App.collectSettingsFromForm();
        var locationChanged = newSettings.weatherLocation !== state.settings.weatherLocation;
        var needsGeocode = newSettings.weatherLocation && locationChanged;

        function finishSave(settings) {
          state.settings = App.normalizeSettings(settings);
          App.saveSettings(state.settings);
          App.fullRefreshAfterSettings();
          App.loadWeather();
          App.renderWeatherLastFetched();
        }

        if (needsGeocode) {
          App.clearWeatherCache();
          if (App.dom.weatherLastFetched) App.dom.weatherLastFetched.textContent = "";
          dom.settingsStatus.textContent = App.t("weather.loading");
          App.geocodeCity(newSettings.weatherLocation)
            .then(function (coords) {
              newSettings.weatherCoords = coords;
              finishSave(newSettings);
              dom.settingsStatus.textContent = App.t("settings.status.saved");
            })
            .catch(function () {
              newSettings.weatherCoords = null;
              finishSave(newSettings);
              dom.settingsStatus.textContent = App.t("settings.status.saved") + " (" + App.t("weather.unavailable") + ")";
            });
        } else {
          if (!newSettings.weatherLocation) {
            newSettings.weatherCoords = null;
          }
          finishSave(newSettings);
          dom.settingsStatus.textContent = App.t("settings.status.saved");
        }
      });
    }

    if (dom.settingsResetButton) {
      dom.settingsResetButton.addEventListener("click", function () {
        state.settings = App.cloneSettings(App.getDefaultSettings());
        App.saveSettings(state.settings);
        App.syncSettingsForm();
        App.fullRefreshAfterSettings();
        dom.settingsStatus.textContent = App.t("settings.status.reset");
      });
    }

    if (dom.settingsExportButton) {
      dom.settingsExportButton.addEventListener("click", function () {
        var payload = JSON.stringify(state.settings, null, 2);
        var blob = new Blob([payload], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "mindful-checkin-settings.json";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        dom.settingsStatus.textContent = App.t("settings.status.exported");
      });
    }

    if (dom.settingsImportButton) {
      dom.settingsImportButton.addEventListener("click", function () {
        if (dom.settingsImportFile) dom.settingsImportFile.click();
      });
    }

    if (dom.settingsImportFile) {
      dom.settingsImportFile.addEventListener("change", function () {
        var file = dom.settingsImportFile.files && dom.settingsImportFile.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(String(reader.result));
            state.settings = App.normalizeSettings(parsed);
            App.saveSettings(state.settings);
            App.syncSettingsForm();
            App.fullRefreshAfterSettings();
            dom.settingsStatus.textContent = App.t("settings.status.imported");
          } catch (error) {
            console.warn("Could not import settings file.", error);
            dom.settingsStatus.textContent = App.t("settings.status.importError");
          }
          dom.settingsImportFile.value = "";
        };
        reader.readAsText(file);
      });
    }

    var qaInput = document.getElementById("quick-action-input");
    var qaAddBtn = document.getElementById("quick-action-add");
    function addQuickAction() {
      if (!qaInput) return;
      var text = qaInput.value.trim();
      if (!text) return;
      if (!App.state.settings.quickActions) App.state.settings.quickActions = [];
      App.state.settings.quickActions.push(text);
      qaInput.value = "";
      App.renderQuickActionsEditor();
    }
    if (qaAddBtn) {
      qaAddBtn.addEventListener("click", addQuickAction);
    }
    if (qaInput) {
      qaInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); addQuickAction(); }
      });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (state.settings.theme === "system") {
        App.applyTheme("system");
      }
    });
  };
})();
