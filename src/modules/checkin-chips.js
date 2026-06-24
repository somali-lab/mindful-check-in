/* Mindful Check-in v4 – Check-in chip editors (quick-action pills + custom-feeling tags) */
(function () {
  "use strict";
  var MCI = window.MCI;

  /* ── shared comma-list field helpers ── */
  function fieldList(id) {
    var f = document.getElementById(id);
    /* c8 ignore next -- field always present */
    if (!f || !f.value.trim()) return [];
    return f.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function setFieldList(id, arr) {
    var f = document.getElementById(id);
    /* c8 ignore next -- field always present */
    if (f) f.value = arr.join(", ");
  }

  /* ── shared inline "+ add" input (Enter/blur commit, Escape cancels) ── */
  function startInlineAdd(addBtn, placeholder, onCommit, rebuild) {
    var wrap = document.createElement("span");
    wrap.className = "ci-act-add ci-act-add--editing";
    var input = document.createElement("input");
    input.type = "text";
    input.className = "ci-act-input";
    input.placeholder = placeholder;
    wrap.appendChild(input);
    addBtn.replaceWith(wrap);
    input.focus();
    var done = false;
    function commit(keep) {
      if (done) return; done = true;
      if (keep) {
        var v = input.value.trim();
        if (v) onCommit(v);
      }
      rebuild();
    }
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); commit(true); }
      else if (ev.key === "Escape") { commit(false); }
    });
    input.addEventListener("blur", function () { commit(true); });
  }

  /* ── action pills: base = quick actions + selected; toggle on/off ── */
  function buildActionChips() {
    var slot = document.getElementById("ci-chips");
    /* c8 ignore next -- chips slot always present */
    if (!slot) return;
    var settings = MCI.loadSettings();
    /* c8 ignore next -- quickActions always initialized */
    var base = settings.quickActions || [];
    var sel = fieldList("fld-action");
    var all = base.slice();
    for (var s = 0; s < sel.length; s++) {
      if (all.indexOf(sel[s]) === -1) all.push(sel[s]);
    }
    var html = "";
    for (var i = 0; i < all.length; i++) {
      var on = sel.indexOf(all[i]) !== -1;
      html += '<button type="button" class="ci-act-pill' + (on ? " is-on" : "")
        + '" data-act="' + MCI.esc(all[i]) + '">' + MCI.esc(all[i]) + '</button>';
    }
    html += '<button type="button" class="ci-act-add" data-add="1">+ '
      + MCI.esc(MCI.t("ciAddAction") || /* c8 ignore next */ "Add your own") + '</button>';
    slot.innerHTML = html;
  }

  function handleActionClick(e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      startInlineAdd(add, MCI.t("ciAddAction") || /* c8 ignore next */ "Add your own", function (v) {
        var sel = fieldList("fld-action");
        if (sel.indexOf(v) === -1) sel.push(v);
        setFieldList("fld-action", sel);
      }, buildActionChips);
      return;
    }
    var chip = e.target.closest("[data-act]");
    /* c8 ignore next -- clicks always target chip buttons in tests */
    if (!chip) return;
    var act = chip.getAttribute("data-act");
    var sel = fieldList("fld-action");
    var idx = sel.indexOf(act);
    if (idx === -1) sel.push(act); else sel.splice(idx, 1);
    setFieldList("fld-action", sel);
    buildActionChips();
  }

  /* ── custom-feeling tags: list = the field; each tag removable ── */
  function buildFeelChips() {
    var slot = document.getElementById("ci-feel-chips");
    /* c8 ignore next -- slot present in check-in */
    if (!slot) return;
    var list = fieldList("fld-custom");
    var html = "";
    for (var i = 0; i < list.length; i++) {
      html += '<span class="ci-chip" data-feel="' + i + '">' + MCI.esc(list[i])
        + '<button type="button" class="ci-chip-x" data-felrm="' + i + '" aria-label="remove">×</button></span>';
    }
    html += '<button type="button" class="ci-act-add" data-feladd="1">+ '
      + MCI.esc(MCI.t("ciAddFeeling") || /* c8 ignore next */ "Own feeling") + '</button>';
    slot.innerHTML = html;
  }

  function handleFeelClick(e) {
    var add = e.target.closest("[data-feladd]");
    if (add) {
      startInlineAdd(add, MCI.t("ciAddFeeling") || /* c8 ignore next */ "Own feeling", function (v) {
        var l = fieldList("fld-custom"); l.push(v); setFieldList("fld-custom", l);
      }, buildFeelChips);
      return;
    }
    var rm = e.target.closest("[data-felrm]");
    if (rm) {
      var idx = parseInt(rm.getAttribute("data-felrm"), 10);
      var l = fieldList("fld-custom"); l.splice(idx, 1); setFieldList("fld-custom", l); buildFeelChips();
    }
  }

  function rebuildAll() {
    buildActionChips();
    buildFeelChips();
  }

  MCI.CheckinChips = {
    init: function () {
      var actionSlot = document.getElementById("ci-chips");
      /* c8 ignore next -- slot always present */
      if (actionSlot) actionSlot.addEventListener("click", handleActionClick);
      var feelSlot = document.getElementById("ci-feel-chips");
      /* c8 ignore next -- slot always present */
      if (feelSlot) feelSlot.addEventListener("click", handleFeelClick);

      /* Checkin fills the backing fields then emits load/new; rebuild on those.
         settings:changed swaps quick actions; language:changed re-labels. */
      MCI.on("settings:changed", buildActionChips);
      MCI.on("language:changed", rebuildAll);
      MCI.on("entry:load", rebuildAll);
      MCI.on("entry:new", rebuildAll);

      rebuildAll();
    }
  };
})();
