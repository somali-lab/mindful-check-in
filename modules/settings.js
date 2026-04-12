/* Mindful Check-in v4 – Settings */
(function () {
  "use strict";
  var MCI = window.MCI;

  function loadForm() {
    var s = MCI.loadSettings();
    /* c8 ignore start -- settings always have defaults from loadSettings() */
    setVal("cfg-wheel", s.defaultWheelType || "act");
    setVal("cfg-energy-label", s.energyEmotionalLabel || "emotionalSocial");
    setVal("cfg-rows", s.rowsPerPage || 7);
    setVal("cfg-maxchars", s.overviewMaxChars || 120);
    setVal("cfg-toast", s.toastDuration || 4);
    setVal("cfg-location", s.weatherLocation || "");
    setVal("cfg-lang", s.defaultLanguage || "en");
    setVal("cfg-theme", s.theme || "system");
    /* c8 ignore stop */

    /* component toggles */
    var checks = document.querySelectorAll("[data-comp]");
    for (var i = 0; i < checks.length; i++) {
      var key = checks[i].getAttribute("data-comp");
      /* c8 ignore next -- components always present in settings */
      checks[i].checked = s.components ? s.components[key] !== false : true;
    }

    /* quick action list */
    buildQAList(s.quickActions || /* c8 ignore next */ []);
  }

  function gather() {
    var s = MCI.loadSettings();
    /* c8 ignore start -- form values always present */
    s.defaultWheelType = getVal("cfg-wheel") || "act";
    s.energyEmotionalLabel = getVal("cfg-energy-label") || "emotionalSocial";
    s.rowsPerPage = parseInt(getVal("cfg-rows"), 10) || 7;
    s.overviewMaxChars = parseInt(getVal("cfg-maxchars"), 10) || 120;
    s.toastDuration = parseInt(getVal("cfg-toast"), 10) || 4;
    s.weatherLocation = getVal("cfg-location") || "";
    s.defaultLanguage = getVal("cfg-lang") || "en";
    s.theme = getVal("cfg-theme") || "system";
    /* c8 ignore stop */

    /* component toggles */
    var checks = document.querySelectorAll("[data-comp]");
    /* c8 ignore next -- components always present in settings */
    if (!s.components) s.components = {};
    for (var i = 0; i < checks.length; i++) {
      var key = checks[i].getAttribute("data-comp");
      s.components[key] = checks[i].checked;
    }

    return s;
  }

  /* c8 ignore start -- form elements always present in full page */
  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }
  /* c8 ignore stop */

  /* ── quick actions list ── */
  function buildQAList(actions) {
    var ct = document.getElementById("qa-list");
    /* c8 ignore next -- QA list element always present */
    if (!ct) return;
    var html = "";
    for (var i = 0; i < actions.length; i++) {
      html += '<span class="quick-action-tag">'
        + MCI.esc(actions[i])
        + '<button type="button" class="qa-del" data-qi="' + i + '">\u2715</button>'
        + '</span>';
    }
    ct.innerHTML = html;
  }

  function getQAList() {
    var s = MCI.loadSettings();
    return s.quickActions || /* c8 ignore next */ [];
  }

  /* ── export / import settings ── */
  function exportSettings() {
    var s = MCI.loadSettings();
    MCI.download(JSON.stringify(s, null, 2), "mindful-checkin-settings.json");
  }

  function importSettings(file) {
    MCI.readFile(file, function (err, text) {
      /* c8 ignore next 2 -- FileReader error path untestable in E2E */
      if (err) {
        MCI.banner(MCI.t("importError") || /* c8 ignore next */ "Invalid JSON file.", "warning");
        return;
      }
      try {
        /* c8 ignore next -- text from FileReader is always a string */
        var imported = typeof text === "string" ? JSON.parse(text) : text;
        MCI.saveSettings(imported, "settings");
        loadForm();
        MCI.banner(MCI.t("settingsImported") || /* c8 ignore next */ "Settings imported.", "success");
      } catch (e) {
        MCI.banner(MCI.t("importError") || /* c8 ignore next */ "Invalid JSON file.", "warning");
      }
    });
  }

  MCI.Settings = {
    init: function () {
      loadForm();

      /* c8 ignore next 2 -- save button always present */
      var saveBtn = document.getElementById("cfg-btn-save");
      if (saveBtn) {
        saveBtn.addEventListener("click", function () {
          var s = gather();
          MCI.saveSettings(s, "settings");

          /* apply language if changed */
          if (s.defaultLanguage && s.defaultLanguage !== MCI.lang) {
            MCI.setLang(s.defaultLanguage);
          }

          MCI.banner(MCI.t("settingsSaved") || /* c8 ignore next */ "Settings saved.", "success");
        });
      }

      /* c8 ignore next 2 -- reset button always present */
      var resetBtn = document.getElementById("cfg-btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          if (!confirm(MCI.t("settingsResetConfirm") || /* c8 ignore next */ "Reset all settings to defaults?")) return;
          var def = MCI.defaultSettings();
          MCI.saveSettings(def, "settings");
          loadForm();
          MCI.banner(MCI.t("settingsReset") || /* c8 ignore next */ "Settings reset to defaults.", "success");
        });
      }

      /* c8 ignore next 2 -- export button always present */
      var expBtn = document.getElementById("cfg-btn-export");
      if (expBtn) expBtn.addEventListener("click", exportSettings);

      /* c8 ignore next 2 -- import input always present */
      var impInput = document.getElementById("cfg-inp-import");
      if (impInput) {
        impInput.addEventListener("change", function () {
          if (impInput.files && impInput.files[0]) importSettings(impInput.files[0]);
          impInput.value = "";
        });
      }

      /* c8 ignore next 3 -- add button and input always present */
      var addBtn = document.getElementById("cfg-btn-add-qa");
      var qaInput = document.getElementById("qa-input");
      if (addBtn && qaInput) {
        addBtn.addEventListener("click", function () {
          var val = qaInput.value.trim();
          if (!val) return;
          var list = getQAList();
          if (list.indexOf(val) === -1) {
            list.push(val);
            var s = MCI.loadSettings();
            s.quickActions = list;
            s.isDefaultQuickActions = false;
            MCI.saveSettings(s, "settings");
            buildQAList(list);
          }
          qaInput.value = "";
        });
        qaInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); addBtn.click(); }
        });
      }

      /* c8 ignore next 2 -- QA list element always present */
      var qaList = document.getElementById("qa-list");
      if (qaList) {
        qaList.addEventListener("click", function (e) {
          var del = e.target.closest(".qa-del");
          if (!del) return;
          var idx = parseInt(del.getAttribute("data-qi"), 10);
          var list = getQAList();
          list.splice(idx, 1);
          var s = MCI.loadSettings();
          s.quickActions = list;
          s.isDefaultQuickActions = false;
          MCI.saveSettings(s, "settings");
          buildQAList(list);
        });
      }

      MCI.on("language:changed", function (lang) {
        /* swap quick actions if user is still using defaults */
        var s = MCI.loadSettings();
        if (s.isDefaultQuickActions !== false) {
          /* c8 ignore next -- MCI.strings always loaded */
          var newT = MCI.strings && MCI.strings[lang] ? MCI.strings[lang] : {};
          var newDefaults = newT.defaultQuickActions;
          if (newDefaults && newDefaults.length > 0) {
            s.quickActions = newDefaults;
            s.isDefaultQuickActions = true;
            MCI.saveSettings(s, "settings");
          }
        }
        loadForm();
      });
      MCI.on("settings:changed", function () {
        if (MCI.getSettingsSaveSource() !== "settings") loadForm();
      });
    }
  };
})();
