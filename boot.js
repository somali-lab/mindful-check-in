(function () {
  "use strict";
  var MCI = window.MCI;

  document.addEventListener("DOMContentLoaded", function () {
    /* Initialize modules in dependency order */
    MCI.Nav.init();       /* nav rail, theme, language — must be first */
    MCI.Home.init();      /* home / bento dashboard */
    MCI.Wheel.init();     /* emotion wheel SVG */
    MCI.Body.init();      /* body signals SVG */
    MCI.Energy.init();    /* energy meters */
    MCI.Mood.init();      /* mood matrix grid */
    MCI.Weather.init();   /* weather widget */
    MCI.Checkin.init();   /* save/load/new orchestration */
    MCI.Overview.init();  /* overview table */
    MCI.Settings.init();  /* settings form */
    MCI.Reminder.init();  /* pauze-herinneringen via Web Notifications */
    MCI.Dashboard.init(); /* summary + 28-day history */
    MCI.Demo.init();      /* demo data + clear all */
  });
})();
