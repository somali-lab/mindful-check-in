/* Mindful Check-in v4 – Check-in meta: date control, time-of-day greeting, save-state pill.
   Reacts to the entry lifecycle on the bus; Checkin queries getOverrideKey() in save(). */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _key = null;     /* current entry key (null = new, unsaved) */
  var _dirty = false;  /* true once the user edits the date-override field */

  /* date override → minute-precision entry key, only when the user edited it */
  function getOverrideKey() {
    if (!_dirty) return null;
    var input = document.getElementById("ci-date-override");
    if (!input || !input.value) return null;
    var d = new Date(input.value);
    if (isNaN(d.getTime())) return null;
    return MCI.formatDate(d) + "_" + MCI.pad2(d.getHours()) + MCI.pad2(d.getMinutes()) + MCI.pad2(d.getSeconds()) + "000";
  }

  function syncDateInput() {
    var input = document.getElementById("ci-date-override");
    /* c8 ignore next -- date input always present */
    if (!input) return;
    /* existing entry: its datetime; new: now (the subline always shows a date) */
    var d = _key ? MCI.dateFromKey(_key) : new Date();
    /* c8 ignore next -- dateFromKey valid for valid keys */
    if (!d) d = new Date();
    input.value = d.getFullYear() + "-" + MCI.pad2(d.getMonth() + 1) + "-" + MCI.pad2(d.getDate())
      + "T" + MCI.pad2(d.getHours()) + ":" + MCI.pad2(d.getMinutes());
    updateDateDisplay();
  }

  /* nicely formatted subline date, e.g. "Mon 22 Jun · 08:30" */
  function fmtNiceDate(value) {
    if (!value) return "";
    var d = new Date(value);
    /* c8 ignore next -- guard invalid */
    if (isNaN(d.getTime())) return "";
    var nl = (MCI.get(MCI.KEYS.language, "en") || "en") === "nl";
    var dn = nl ? ["zo", "ma", "di", "wo", "do", "vr", "za"]
                : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var mn = nl ? ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
                : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return dn[d.getDay()] + " " + d.getDate() + " " + mn[d.getMonth()] + " · " + MCI.pad2(d.getHours()) + ":" + MCI.pad2(d.getMinutes());
  }
  function updateDateDisplay() {
    var disp = document.getElementById("ci-date-display");
    var inp = document.getElementById("ci-date-override");
    /* c8 ignore next -- elements present in check-in */
    if (!disp || !inp) return;
    disp.textContent = fmtNiceDate(inp.value);
  }

  function updateGreeting() {
    var el = document.getElementById("ci-greeting");
    /* c8 ignore next -- greeting element always present */
    if (!el) return;
    var h = new Date().getHours();
    var key = h < 12 ? "ciGreetMorning" : (h < 18 ? "ciGreetAfternoon" : "ciGreetEvening");
    el.textContent = MCI.t(key);
  }

  function updatePill() {
    var pill = document.getElementById("ci-pill");
    /* c8 ignore next -- pill element always present */
    if (!pill) return;
    if (_key) {
      /* c8 ignore start -- dateFromKey always returns a valid Date for valid keys */
      var d = MCI.dateFromKey(_key);
      pill.textContent = d ? (MCI.formatDate(d) + " · " + MCI.formatTime(d)) : _key;
      /* c8 ignore stop */
      pill.classList.remove("is-new");
      pill.classList.add("is-saved");
    } else {
      pill.textContent = MCI.t("pillNew") || /* c8 ignore next */ "New · not saved yet";
      pill.classList.add("is-new");
      pill.classList.remove("is-saved");
    }
  }

  function render() { updatePill(); syncDateInput(); }

  MCI.CheckinMeta = {
    init: function () {
      var dateInp = document.getElementById("ci-date-override");
      var dateCtrl = document.getElementById("ci-date-control");
      /* c8 ignore next -- date input always present */
      if (dateInp) dateInp.addEventListener("change", function () { _dirty = true; updateDateDisplay(); });
      /* c8 ignore start -- showPicker is a user-gesture browser API */
      if (dateCtrl && dateInp) {
        dateCtrl.addEventListener("click", function (e) {
          if (e.target === dateInp) return;
          if (dateInp.showPicker) { try { dateInp.showPicker(); } catch (_) { dateInp.focus(); } }
          else dateInp.focus();
        });
      }
      /* c8 ignore stop */

      MCI.on("entry:load", function (d) { _key = (d && d.key) || null; _dirty = false; render(); });
      MCI.on("entry:saved", function (d) { _key = (d && d.key) || _key; _dirty = false; render(); });
      MCI.on("entry:new", function () { _key = null; _dirty = false; render(); });
      MCI.on("language:changed", function () { updatePill(); updateGreeting(); updateDateDisplay(); });

      updateGreeting();
      render();
    },

    /* queried by Checkin.save() — one of its orchestrated sub-modules */
    getOverrideKey: getOverrideKey
  };
})();
