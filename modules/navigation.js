/* Mindful Check-in v4 – Navigation: rail routing, theme, language */
(function () {
  "use strict";
  var MCI = window.MCI;

  /* ── private state ── */
  var _activeRoute = "checkin";
  var _theme = "system";
  var _mql = window.matchMedia("(prefers-color-scheme: dark)");

  /* ════════════════════════════════════════════
     TAB / ROUTE SWITCHING
     ════════════════════════════════════════════ */

  function switchTo(route) {
    var views = document.querySelectorAll(".view");
    var btns  = document.querySelectorAll("[data-route]");
    var i;

    for (i = 0; i < views.length; i++) {
      views[i].classList.remove("is-active");
    }
    for (i = 0; i < btns.length; i++) {
      btns[i].classList.remove("is-active");
    }

    var panel = document.getElementById("view-" + route);
    if (panel) {
      panel.classList.add("is-active");
    } else {
      route = "home";
      var fallback = document.getElementById("view-home");
      if (fallback) fallback.classList.add("is-active");
    }

    var activeBtn = document.querySelector('[data-route="' + route + '"]');
    if (activeBtn) activeBtn.classList.add("is-active");

    _activeRoute = route;
    MCI.put(MCI.KEYS.activeTab, route);
    MCI.emit("tab:changed", route);
    history.replaceState(null, "", "#" + route);
  }

  function initTabs() {
    var rail = document.querySelector(".nav-rail");
    if (rail) {
      rail.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-route]");
        if (!btn) return;
        switchTo(btn.getAttribute("data-route"));
      });
    }

    var hash = location.hash.replace("#", "");
    var saved = MCI.get(MCI.KEYS.activeTab, null);
    switchTo(hash || saved || "home");
  }

  /* ════════════════════════════════════════════
     THEME
     ════════════════════════════════════════════ */

  /* Visual-only theme application — no save, no side effects */
  function applyThemeVisual(choice) {
    _theme = choice;
    var root = document.documentElement;
    var btns = document.querySelectorAll("[data-theme-pick]");
    var i;

    for (i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("is-selected", btns[i].getAttribute("data-theme-pick") === choice);
    }

    if (choice === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (choice === "system") {
      if (_mql.matches) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
    } else {
      root.removeAttribute("data-theme");
    }

    MCI.emit("theme:changed", choice);
  }

  /* User-initiated theme change — applies + saves */
  function applyTheme(choice) {
    applyThemeVisual(choice);
    var settings = MCI.loadSettings();
    settings.theme = choice;
    MCI.saveSettings(settings, "navigation");
  }

  function onSystemThemeChange() {
    if (_theme === "system") applyThemeVisual("system");
  }

  function initTheme() {
    var ct = document.getElementById("theme-btns");
    if (ct) {
      ct.addEventListener("click", function (e) {
        var pick = e.target.closest("[data-theme-pick]");
        if (!pick) return;
        applyTheme(pick.getAttribute("data-theme-pick"));
      });
    }

    if (_mql.addEventListener) {
      _mql.addEventListener("change", onSystemThemeChange);
    } else if (_mql.addListener) {
      _mql.addListener(onSystemThemeChange);
    }

    var settings = MCI.loadSettings();
    applyThemeVisual(settings.theme || "system");
  }

  /* ════════════════════════════════════════════
     LANGUAGE
     ════════════════════════════════════════════ */

  function updateLangButtons(lang) {
    var btns = document.querySelectorAll("[data-lang-pick]");
    for (var i = 0; i < btns.length; i++) {
      var isActive = btns[i].getAttribute("data-lang-pick") === lang;
      btns[i].classList.toggle("is-selected", isActive);
      btns[i].setAttribute("aria-pressed", String(isActive));
    }
  }

  function initLang() {
    var ct = document.getElementById("lang-btns");
    if (ct) {
      ct.addEventListener("click", function (e) {
        var pick = e.target.closest("[data-lang-pick]");
        if (!pick) return;
        var lang = pick.getAttribute("data-lang-pick");
        var s = MCI.loadSettings();
        s.defaultLanguage = lang;
        MCI.saveSettings(s, "navigation");
        MCI.setLang(lang);
        updateLangButtons(lang);
      });
    }

    var saved = MCI.get(MCI.KEYS.language, null);
    var lang = saved || "en";
    MCI.setLang(lang);
    updateLangButtons(lang);
  }

  /* ════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════ */

  MCI.Nav = {
    init: function () {
      initTabs();
      initTheme();
      initLang();

      /* sync header buttons when settings change from settings page */
      MCI.on("settings:changed", function (s) {
        if (s && s.theme && s.theme !== _theme) {
          applyThemeVisual(s.theme);
        }
      });
      MCI.on("language:changed", function (lang) {
        updateLangButtons(lang);
      });
      MCI.on("entry:request-load", function () {
        switchTo("checkin");
      });
      MCI.on("navigate:route", function (route) {
        switchTo(route);
      });
    },
    switchTo: switchTo,
    activeRoute: function () { return _activeRoute; }
  };
})();
