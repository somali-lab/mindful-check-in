/* Mindful Check-in – Section navigator
   A fixed left-hand rail on the check-in page: prev/next arrows plus a dot
   per visible section. Scrolls the .app-scroll container to each section;
   the page order itself is untouched. */
(function () {
  "use strict";
  var MCI = window.MCI;

  /* Ordered scroll stops on the check-in page. Each reuses an existing
     label key for its tooltip/aria text. Hidden sections are skipped. */
  var SECTIONS = [
    { sel: ".ci-intro-row",                                tKey: "labelThoughts" },
    { sel: ".ci-core-row",                                 tKey: "labelCoreFeeling" },
    { sel: ".ci-energy-section",                           tKey: "labelEnergy" },
    { sel: "#view-checkin [data-component='moodMatrix']",  tKey: "labelMoodMatrix" },
    { sel: ".ci-card-actions",                             tKey: "labelActions" },
    { sel: "#view-checkin .grid",                          tKey: "summaryTitle" }
  ];

  var rail, dotsWrap, prevBtn, nextBtn, scroller;
  var stops = [], activeIdx = 0, ticking = false, isCheckin = false;

  function isVisible(el) {
    return !!(el && el.offsetParent !== null && el.offsetHeight > 6);
  }

  /* top of el relative to the scroll container's content */
  function topIn(el) {
    return el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  }

  function build() {
    if (!rail || !scroller) return;
    stops = [];
    var dots = "";
    for (var i = 0; i < SECTIONS.length; i++) {
      var el = document.querySelector(SECTIONS[i].sel);
      if (!isVisible(el)) continue;
      var label = MCI.t(SECTIONS[i].tKey) || "";
      stops.push(el);
      dots += '<button type="button" class="section-rail-dot" data-idx="' + (stops.length - 1) +
              '" title="' + MCI.esc(label) + '" aria-label="' + MCI.esc(label) + '"></button>';
    }
    dotsWrap.innerHTML = dots;
    if (stops.length < 2) { rail.classList.add("is-hidden"); return; }
    rail.classList.remove("is-hidden");
    update();
  }

  function setActive(i) {
    if (i < 0) i = 0;
    if (i > stops.length - 1) i = stops.length - 1;
    activeIdx = i;
    var ds = dotsWrap.children;
    for (var k = 0; k < ds.length; k++) {
      if (k === i) ds[k].classList.add("is-active");
      else ds[k].classList.remove("is-active");
    }
    prevBtn.disabled = (i <= 0);
    nextBtn.disabled = (i >= stops.length - 1);
  }

  /* Highlight the last section whose top has scrolled past the reference line. */
  function update() {
    if (!stops.length) return;
    /* at the very bottom the last section is in view even if its top
       never scrolls past the reference line — mark it active */
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) {
      setActive(stops.length - 1);
      return;
    }
    var ref = scroller.scrollTop + 90;
    var idx = 0;
    for (var i = 0; i < stops.length; i++) {
      if (topIn(stops[i]) <= ref) idx = i; else break;
    }
    setActive(idx);
  }

  function scrollToStop(i) {
    if (i < 0 || i >= stops.length) return;
    var top = topIn(stops[i]) - 14;
    if (top < 0) top = 0;
    scroller.scrollTo({ top: top, behavior: "smooth" });
    setActive(i);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { update(); ticking = false; });
  }

  MCI.SectionNav = {
    init: function () {
      rail = document.getElementById("section-rail");
      scroller = document.querySelector(".app-scroll");
      if (!rail || !scroller) return;
      dotsWrap = document.getElementById("section-rail-dots");
      prevBtn = rail.querySelector("[data-dir='prev']");
      nextBtn = rail.querySelector("[data-dir='next']");

      rail.addEventListener("click", function (e) {
        var arrow = e.target.closest(".section-rail-arrow");
        if (arrow) {
          scrollToStop(activeIdx + (arrow.getAttribute("data-dir") === "next" ? 1 : -1));
          return;
        }
        var dot = e.target.closest(".section-rail-dot");
        if (dot) scrollToStop(parseInt(dot.getAttribute("data-idx"), 10));
      });

      scroller.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);

      MCI.on("tab:changed", function (route) {
        isCheckin = (route === "checkin");
        if (isCheckin) window.requestAnimationFrame(build);
      });
      MCI.on("settings:changed", function () { if (isCheckin) window.requestAnimationFrame(build); });
      MCI.on("language:changed", function () { if (isCheckin) build(); });

      /* build immediately if the check-in view is the initial active view */
      var view = document.getElementById("view-checkin");
      if (view && view.classList.contains("is-active")) {
        isCheckin = true;
        window.requestAnimationFrame(build);
      }
    }
  };
})();
