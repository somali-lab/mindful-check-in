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
    setVal("cfg-logo", s.logo || "mindful");
    setChecked("cfg-reminder-enabled", s.reminderEnabled === true);
    setVal("cfg-reminder-interval", s.reminderInterval || 120);
    setVal("cfg-reminder-start", s.reminderStartHour !== undefined ? s.reminderStartHour : 8);
    setVal("cfg-reminder-end",   s.reminderEndHour   !== undefined ? s.reminderEndHour   : 18);
    setVal("cfg-reminder-title", s.reminderCustomTitle || "");
    setVal("cfg-reminder-body",  s.reminderCustomBody  || "");
    /* day checkboxes */
    var days = Array.isArray(s.reminderDays) ? s.reminderDays : [1, 2, 3, 4, 5];
    var dayCbs = document.querySelectorAll("[data-reminder-day]");
    for (var d = 0; d < dayCbs.length; d++) {
      var dayVal = parseInt(dayCbs[d].getAttribute("data-reminder-day"), 10);
      dayCbs[d].checked = days.indexOf(dayVal) !== -1;
    }

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
    s.logo = getVal("cfg-logo") || "mindful";
    s.reminderEnabled      = getChecked("cfg-reminder-enabled");
    s.reminderInterval     = parseInt(getVal("cfg-reminder-interval"), 10) || 120;
    s.reminderStartHour    = parseInt(getVal("cfg-reminder-start"), 10);
    s.reminderEndHour      = parseInt(getVal("cfg-reminder-end"), 10);
    s.reminderCustomTitle  = getVal("cfg-reminder-title");
    s.reminderCustomBody   = getVal("cfg-reminder-body");
    /* day checkboxes */
    var selDays = [];
    var dayCbs2 = document.querySelectorAll("[data-reminder-day]");
    for (var d2 = 0; d2 < dayCbs2.length; d2++) {
      if (dayCbs2[d2].checked) selDays.push(parseInt(dayCbs2[d2].getAttribute("data-reminder-day"), 10));
    }
    s.reminderDays = selDays;

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

  function setChecked(id, val) {
    var el = document.getElementById(id);
    if (el) el.checked = !!val;
  }

  function getChecked(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
  }

  /* ── quick actions list ── */
  function buildQAList(actions) {
    var ct = document.getElementById("qa-list");
    if (!ct) return;
    var html = "";
    for (var i = 0; i < actions.length; i++) {
      html += '<span class="tag quick-action-tag">'
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

      /* vertical section tabs — shared by Settings and About; each .settings-nav
         toggles only the tabs/panels within its own .settings-card */
      var navs = document.querySelectorAll(".settings-nav");
      for (var ni = 0; ni < navs.length; ni++) {
        navs[ni].addEventListener("click", function (e) {
          var tab = e.target.closest("[data-settings-tab]");
          if (!tab) return;
          var card = tab.closest(".settings-card");
          if (!card) return;
          var key = tab.getAttribute("data-settings-tab");
          var tabs = card.querySelectorAll(".settings-tab");
          for (var ti = 0; ti < tabs.length; ti++) {
            tabs[ti].classList.toggle("is-active", tabs[ti].getAttribute("data-settings-tab") === key);
          }
          var panels = card.querySelectorAll(".settings-panel");
          for (var pi = 0; pi < panels.length; pi++) {
            panels[pi].classList.toggle("is-active", panels[pi].getAttribute("data-settings-panel") === key);
          }
        });
      }

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

      var expBtn = document.getElementById("cfg-btn-export");
      if (expBtn) expBtn.addEventListener("click", exportSettings);

      var impInput = document.getElementById("cfg-inp-import");
      if (impInput) {
        impInput.addEventListener("change", function () {
          if (impInput.files && impInput.files[0]) importSettings(impInput.files[0]);
          impInput.value = "";
        });
      }

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
