/* Mindful Check-in v4 – Pauze-herinnering via Web Notifications API */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _timer       = null;
  var _enabled     = false;
  var _intervalMs  = 120 * 60 * 1000;
  var _days        = [1, 2, 3, 4, 5]; /* 0=zo 1=ma … 6=za */
  var _startHour   = 8;
  var _endHour     = 18;
  var _customTitle = "";
  var _customBody  = "";

  function _isSupported() {
    return typeof window !== "undefined" && "Notification" in window;
  }

  function _withinWindow() {
    var now = new Date();
    var day = now.getDay();   /* 0=zo … 6=za */
    var h   = now.getHours();
    var dayOk = false;
    for (var i = 0; i < _days.length; i++) {
      if (_days[i] === day) { dayOk = true; break; }
    }
    return dayOk && h >= _startHour && h < _endHour;
  }

  function _doNotify(isTest) {
    if (!_isSupported()) return;
    if (Notification.permission !== "granted") return;
    var title = (_customTitle && _customTitle.trim())
      ? _customTitle
      : (MCI.t("reminderNotifTitle") || "Tijd voor een pauze");
    var body  = (_customBody && _customBody.trim())
      ? _customBody
      : (MCI.t("reminderNotifBody") || "Je hebt al een tijdje gewerkt. Neem even een moment voor jezelf.");
    try {
      /* Unique tag for tests so Windows never silently suppresses it as a duplicate */
      var tag = isTest ? ("mci-reminder-test-" + Date.now()) : "mci-reminder";
      var n = new Notification(title, {
        body: body,
        icon: "favicon.ico",
        tag: tag
      });
      setTimeout(function () { try { n.close(); } catch (e) { /* ignore */ } }, 10000);
    } catch (e) {
      /* silently ignore NotAllowedError etc. */
    }
  }

  function _notify() {
    if (!_withinWindow()) return;
    _doNotify(false);
  }

  function _stop() {
    if (_timer !== null) {
      clearInterval(_timer);
      _timer = null;
    }
  }

  function _requestAndStart() {
    if (Notification.permission === "denied") {
      MCI.banner(MCI.t("reminderNotifDenied") || "Notificaties zijn geblokkeerd in de browser.", "warning");
      return;
    }
    if (Notification.permission === "default") {
      Notification.requestPermission(function (perm) {
        if (perm === "granted") {
          _timer = setInterval(_notify, _intervalMs);
        } else {
          MCI.banner(MCI.t("reminderNotifDenied") || "Notificaties zijn geblokkeerd in de browser.", "warning");
        }
      });
      return;
    }
    /* already "granted" */
    _timer = setInterval(_notify, _intervalMs);
  }

  function _start() {
    _stop();
    if (!_enabled) return;
    if (!_isSupported()) return;
    _requestAndStart();
  }

  function _applySettings(s) {
    _enabled     = s.reminderEnabled === true;
    var mins     = parseInt(s.reminderInterval, 10);
    _intervalMs  = (mins > 0 ? mins : 120) * 60 * 1000;
    _days        = Array.isArray(s.reminderDays) ? s.reminderDays : [1, 2, 3, 4, 5];
    var sh       = parseInt(s.reminderStartHour, 10);
    var eh       = parseInt(s.reminderEndHour, 10);
    _startHour   = isNaN(sh) ? 8  : sh;
    _endHour     = isNaN(eh) ? 18 : eh;
    _customTitle = s.reminderCustomTitle || "";
    _customBody  = s.reminderCustomBody  || "";
    if (_enabled) {
      _start();
    } else {
      _stop();
    }
  }

  MCI.Reminder = {
    init: function () {
      if (!_isSupported()) {
        var sec = document.getElementById("reminder-section");
        if (sec) sec.style.display = "none";
        return;
      }

      var s = MCI.loadSettings();
      _applySettings(s);

      MCI.on("settings:changed", function (s2) {
        _applySettings(s2);
      });

      /* test-knop */
      var testBtn = document.getElementById("cfg-reminder-test");
      if (testBtn) {
        testBtn.addEventListener("click", function () {
          if (!_isSupported()) return;
          if (Notification.permission === "granted") {
            _doNotify(true);
          } else {
            Notification.requestPermission(function (perm) {
              if (perm === "granted") {
                _doNotify(true);
              } else {
                MCI.banner(MCI.t("reminderNotifDenied") || "Notificaties geblokkeerd.", "warning");
              }
            });
          }
        });
      }
    }
  };
})();
