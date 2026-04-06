document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  App.dom = {
    themeButtons: Array.from(document.querySelectorAll(".theme-button[data-theme-value]")),
    languageButtons: Array.from(document.querySelectorAll(".language-button")),
    emotionWheel: document.querySelector("#emotion-wheel"),
    bodyPartButtons: Array.from(document.querySelectorAll(".body-part")),
    moodGrid: document.querySelector("#mood-grid"),
    energyMeters: Array.from(document.querySelectorAll(".energy-meter[data-energy-type]")),
    energyFills: {
      physical: document.querySelector("#energy-fill-physical"),
      mental: document.querySelector("#energy-fill-mental"),
      emotional: document.querySelector("#energy-fill-emotional"),
    },
    thoughtsField: document.querySelector("#thoughts"),
    customEmotionsField: document.querySelector("#custom-emotions"),
    bodyField: document.querySelector("#body"),
    energyNoteField: document.querySelector("#energy-note"),
    actionField: document.querySelector("#action"),
    noteField: document.querySelector("#note"),
    saveButton: document.querySelector("#save-checkin"),
    saveAsNewEntryCheckbox: document.querySelector("#save-as-new-entry"),
    saveOptionWrap: document.querySelector("#save-option-wrap"),
    wheelTypeSelect: document.querySelector("#wheel-type"),
    resetFeelingButton: document.querySelector("#reset-feeling"),
    resetBodySignalsButton: document.querySelector("#reset-body-signals"),
    resetEnergyButton: document.querySelector("#reset-energy"),
    resetMoodButton: document.querySelector("#reset-mood"),
    statusMessage: document.querySelector("#status-message"),
    summaryContent: document.querySelector("#summary-content"),
    historyContent: document.querySelector("#history-content"),
    selectedEmotionDisplay: document.querySelector("#selected-emotion-display"),
    bodySignalsDisplay: document.querySelector("#body-signals-display"),
    energyDisplay: document.querySelector("#energy-display"),
    selectedMoodDisplay: document.querySelector("#selected-mood-display"),
    appVersionDisplay: document.querySelector("#app-version"),
    clearLocalStorageButton: document.querySelector("#clear-local-storage"),
    generateDemoButton: document.querySelector("#generate-demo-data"),
    infoStatus: document.querySelector("#info-status"),
    overviewHead: document.querySelector("#overview-head"),
    overviewBody: document.querySelector("#overview-body"),
    overviewEmpty: document.querySelector("#overview-empty"),
    overviewPrevButton: document.querySelector("#overview-prev"),
    overviewNextButton: document.querySelector("#overview-next"),
    overviewPageInfo: document.querySelector("#overview-page-info"),
    overviewSearchInput: document.querySelector("#overview-search"),
    overviewFilterSelect: document.querySelector("#overview-filter"),
    overviewWithNotesOnlyCheckbox: document.querySelector("#overview-with-notes-only"),
    overviewExportButton: document.querySelector("#overview-export"),
    overviewImportButton: document.querySelector("#overview-import"),
    overviewImportFile: document.querySelector("#overview-import-file"),
    overviewStatus: document.querySelector("#overview-status"),
    tabButtons: Array.from(document.querySelectorAll(".tab-button[data-tab-target]")),
    tabPanels: Array.from(document.querySelectorAll(".tab-panel[data-tab-panel]")),
    settingsDefaultLanguage: document.querySelector("#settings-default-language"),
    settingsTheme: document.querySelector("#settings-theme"),
    settingsRowsPerPage: document.querySelector("#settings-rows-per-page"),
    settingsOverviewMaxChars: document.querySelector("#settings-overview-max-chars"),
    settingsDefaultWheel: document.querySelector("#settings-default-wheel"),
    settingsWeatherLocation: document.querySelector("#settings-weather-location"),
    weatherLastFetched: document.querySelector("#weather-last-fetched"),
    settingsEnergyEmotionalLabel: document.querySelector("#settings-energy-emotional-label"),
    energyEmotionalTypeLabel: document.querySelector("#energy-emotional-label"),
    weatherWidget: document.querySelector("#weather-widget"),
    weatherIcon: document.querySelector("#weather-icon"),
    weatherTemp: document.querySelector("#weather-temp"),
    weatherDesc: document.querySelector("#weather-desc"),
    weatherLocationEl: document.querySelector("#weather-location"),
    settingsSaveButton: document.querySelector("#settings-save"),
    settingsResetButton: document.querySelector("#settings-reset"),
    settingsExportButton: document.querySelector("#settings-export"),
    settingsImportButton: document.querySelector("#settings-import"),
    settingsImportFile: document.querySelector("#settings-import-file"),
    settingsStatus: document.querySelector("#settings-status"),
    settingsCheckboxes: {
      weather: document.querySelector("#setting-weather"),
      thoughts: document.querySelector("#setting-thoughts"),
      coreFeeling: document.querySelector("#setting-core-feeling"),
      bodySignals: document.querySelector("#setting-body-signals"),
      energyPhysical: document.querySelector("#setting-energy-physical"),
      energyMental: document.querySelector("#setting-energy-mental"),
      energyEmotional: document.querySelector("#setting-energy-emotional"),
      moodMatrix: document.querySelector("#setting-mood-matrix"),
      actions: document.querySelector("#setting-actions"),
      note: document.querySelector("#setting-note"),
    },
    componentElements: {
      weather: document.querySelector('[data-component="weather"]'),
      thoughts: document.querySelector('[data-component="thoughts"]'),
      coreFeeling: document.querySelector('[data-component="coreFeeling"]'),
      bodySignals: document.querySelector('[data-component="bodySignals"]'),
      moodMatrix: document.querySelector('[data-component="moodMatrix"]'),
      actions: document.querySelector('[data-component="actions"]'),
      note: document.querySelector('[data-component="note"]'),
      energyPanel: document.querySelector('[data-component="energyPanel"]'),
      energyColumns: (function () {
        function findColumn(type) {
          var el = document.querySelector('.energy-meter[data-energy-type="' + type + '"]');
          return el ? el.closest(".energy-column") : null;
        }
        return { physical: findColumn("physical"), mental: findColumn("mental"), emotional: findColumn("emotional") };
      })(),
    },
  };

  var initialOverviewUi = App.loadOverviewUiState();
  App.overviewSortKey = initialOverviewUi.sortKey;
  App.overviewSortDir = initialOverviewUi.sortDir;
  App.currentOverviewPage = 1;

  var initialSettings = App.loadSettings();
  App.state = {
    settings: initialSettings,
    language: App.loadLanguage(initialSettings.defaultLanguage),
    entries: App.loadEntries(),
    selectedEmotion: null,
    bodySignals: new Set(),
    energy: { physical: null, mental: null, emotional: null },
    selectedMoodGrid: null,
    activeEntryKey: null,
    currentWeather: null,
  };

  App.activeWheelType = App.state.settings.defaultWheelType || "act";
  var savedWheelType = localStorage.getItem("moodTrackerWheelType");
  if (savedWheelType && App.emotionWheelVariants[savedWheelType]) {
    App.activeWheelType = savedWheelType;
  }
  App.dom.wheelTypeSelect.value = App.activeWheelType;

  if (App.dom.overviewSearchInput) App.dom.overviewSearchInput.value = initialOverviewUi.search;
  if (App.dom.overviewFilterSelect) App.dom.overviewFilterSelect.value = initialOverviewUi.filter;
  if (App.dom.overviewWithNotesOnlyCheckbox) App.dom.overviewWithNotesOnlyCheckbox.checked = Boolean(initialOverviewUi.withNotesOnly);

  App.activateTab = function (tabName, pushHistory) {
    var dom = App.dom;
    var hasMatchingTab = dom.tabButtons.some(function (b) { return b.dataset.tabTarget === tabName; });
    var safeTab = hasMatchingTab ? tabName : "checkin";
    dom.tabButtons.forEach(function (button) {
      var isActive = button.dataset.tabTarget === safeTab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
    dom.tabPanels.forEach(function (panel) {
      panel.classList.toggle("is-active", panel.dataset.tabPanel === safeTab);
    });
    if (dom.saveButton) dom.saveButton.classList.toggle("is-hidden", safeTab !== "checkin");
    if (dom.saveOptionWrap) dom.saveOptionWrap.classList.toggle("is-hidden", safeTab !== "checkin");
    App.saveActiveTab(safeTab);
    if (pushHistory && location.hash !== "#" + safeTab) {
      history.pushState({ tab: safeTab }, "", "#" + safeTab);
    }
  };

  var validTabs = new Set(App.dom.tabButtons.map(function (b) { return b.dataset.tabTarget; }));
  var initialTab = App.loadActiveTab(validTabs);

  App.applyTheme(App.state.settings.theme);
  App.applyLanguage();
  App.syncSettingsForm();
  App.applySettingsToUI();
  App.renderEmotionWheel();
  App.renderMoodGrid();
  App.hydrateTodayEntry();
  App.renderCoreSelections();
  App.renderSummary();
  App.renderHistory();
  App.renderOverview();
  App.renderQuickActionsChips();
  App.loadWeather();
  App.activateTab(initialTab, false);
  history.replaceState({ tab: initialTab }, "", "#" + initialTab);

  window.__moodOverviewApply = function () {
    App.currentOverviewPage = 1;
    App.saveOverviewUiState();
    App.renderOverview();
  };

  App.initCheckinEvents();
  App.initOverviewEvents();
  App.initSettingsEvents();

  App.dom.themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var nextTheme = button.dataset.themeValue;
      App.state.settings.theme = nextTheme;
      App.saveSettings(App.state.settings);
      if (App.dom.settingsTheme) App.dom.settingsTheme.value = nextTheme;
      App.applyTheme(nextTheme);
      App.syncThemeButtons();
    });
  });

  App.dom.languageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var nextLanguage = button.dataset.language;
      if (nextLanguage === App.state.language) return;
      App.state.language = nextLanguage;
      App.state.settings.defaultLanguage = nextLanguage;
      App.saveLanguage(App.state.language);
      App.saveSettings(App.state.settings);
      if (App.dom.settingsDefaultLanguage) App.dom.settingsDefaultLanguage.value = nextLanguage;
      App.applyLanguage();
      if (App.applyEnergyEmotionalLabel) App.applyEnergyEmotionalLabel();
      App.renderEmotionWheel();
      App.renderMoodGrid();
      App.renderCoreSelections();
      App.renderSummary();
      App.renderHistory();
      App.renderOverview();
      if (App.renderWeatherWidget) App.renderWeatherWidget();
      if (App.renderWeatherLastFetched) App.renderWeatherLastFetched();
      App.dom.statusMessage.textContent = "";
      if (App.dom.settingsStatus) App.dom.settingsStatus.textContent = "";
    });
  });

  App.dom.tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      App.activateTab(button.dataset.tabTarget, true);
    });
  });

  window.addEventListener("popstate", function () {
    var hash = location.hash.replace("#", "");
    App.activateTab(validTabs.has(hash) ? hash : "checkin", false);
  });

  if (App.dom.clearLocalStorageButton) {
    App.dom.clearLocalStorageButton.addEventListener("click", function () {
      if (!window.confirm(App.t("info.clearStorageConfirm"))) {
        if (App.dom.infoStatus) App.dom.infoStatus.textContent = App.t("info.clearStorageCancelled");
        return;
      }
      localStorage.clear();
      window.location.reload();
    });
  }

  if (App.dom.generateDemoButton) {
    App.dom.generateDemoButton.addEventListener("click", App.generateDemoData);
  }
});
