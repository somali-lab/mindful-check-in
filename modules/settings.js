/* Mindful Check-in v4 – Settings */
(function () {
  "use strict";
  var MCI = window.MCI;

  function loadForm() {
    var s = MCI.loadSettings();
    setVal("cfg-wheel", s.defaultWheelType || "act");
    setVal("cfg-energy-label", s.energyEmotionalLabel || "emotionalSocial");
    setVal("cfg-rows", s.rowsPerPage || 7);
    setVal("cfg-maxchars", s.overviewMaxChars || 120);
    setVal("cfg-toast", s.toastDuration || 4);
    setVal("cfg-location", s.weatherLocation || "");
    setVal("cfg-lang", s.defaultLanguage || "en");
    setVal("cfg-theme", s.theme || "system");

    /* component toggles */
    var checks = document.querySelectorAll("[data-comp]");
    for (var i = 0; i < checks.length; i++) {
      var key = checks[i].getAttribute("data-comp");
      checks[i].checked = s.components ? s.components[key] !== false : true;
    }

    /* quick action list */
    buildQAList(s.quickActions || []);
  }

  function gather() {
    var s = MCI.loadSettings();
    s.defaultWheelType = getVal("cfg-wheel") || "act";
    s.energyEmotionalLabel = getVal("cfg-energy-label") || "emotionalSocial";
    s.rowsPerPage = parseInt(getVal("cfg-rows"), 10) || 7;
    s.overviewMaxChars = parseInt(getVal("cfg-maxchars"), 10) || 120;
    s.toastDuration = parseInt(getVal("cfg-toast"), 10) || 4;
    s.weatherLocation = getVal("cfg-location") || "";
    s.defaultLanguage = getVal("cfg-lang") || "en";
    s.theme = getVal("cfg-theme") || "system";

    /* component toggles */
    var checks = document.querySelectorAll("[data-comp]");
    if (!s.components) s.components = {};
    for (var i = 0; i < checks.length; i++) {
      var key = checks[i].getAttribute("data-comp");
      s.components[key] = checks[i].checked;
    }

    return s;
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  /* ── quick actions list ── */
  function buildQAList(actions) {
    var ct = document.getElementById("qa-list");
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
    return s.quickActions || [];
  }

  /* ── export / import settings ── */
  function exportSettings() {
    var s = MCI.loadSettings();
    MCI.download(JSON.stringify(s, null, 2), "mindful-checkin-settings.json");
  }

  function importSettings(file) {
    MCI.readFile(file, function (err, text) {
      if (err) {
        MCI.banner(MCI.t("importError") || "Invalid JSON file.", "warning");
        return;
      }
      try {
        var imported = typeof text === "string" ? JSON.parse(text) : text;
        MCI.saveSettings(imported, "settings");
        loadForm();
        MCI.banner(MCI.t("settingsImported") || "Settings imported.", "success");
      } catch (e) {
        MCI.banner(MCI.t("importError") || "Invalid JSON file.", "warning");
      }
    });
  }

  MCI.Settings = {
    init: function () {
      loadForm();

      /* save */
      var saveBtn = document.getElementById("cfg-btn-save");
      if (saveBtn) {
        saveBtn.addEventListener("click", function () {
          var s = gather();
          MCI.saveSettings(s, "settings");

          /* apply language if changed */
          if (s.defaultLanguage && s.defaultLanguage !== MCI.lang) {
            MCI.setLang(s.defaultLanguage);
          }

          MCI.banner(MCI.t("settingsSaved") || "Settings saved.", "success");
        });
      }

      /* reset */
      var resetBtn = document.getElementById("cfg-btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          if (!confirm(MCI.t("settingsResetConfirm") || "Reset all settings to defaults?")) return;
          var def = MCI.defaultSettings();
          MCI.saveSettings(def, "settings");
          loadForm();
          MCI.banner(MCI.t("settingsReset") || "Settings reset to defaults.", "success");
        });
      }

      /* export */
      var expBtn = document.getElementById("cfg-btn-export");
      if (expBtn) expBtn.addEventListener("click", exportSettings);

      /* import */
      var impInput = document.getElementById("cfg-inp-import");
      if (impInput) {
        impInput.addEventListener("change", function () {
          if (impInput.files && impInput.files[0]) importSettings(impInput.files[0]);
          impInput.value = "";
        });
      }

      /* add quick action */
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

      /* delete quick action */
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
