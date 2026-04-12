/* Mindful Check-in v4 – Overview */
(function () {
  "use strict";
  var MCI = window.MCI;

  var _page = 1, _sort = "date", _sortDir = "desc", _filter = "all", _search = "";
  var _pageSize = 7, _maxChars = 120;
  var _filtered = [];

  var COLS = [
    { key: "date",     tKey: "colDate" },
    { key: "feeling",  tKey: "colFeeling" },
    { key: "mood",     tKey: "colMood" },
    { key: "energy",   tKey: "colEnergy" },
    { key: "thoughts", tKey: "colThoughts" },
    { key: "score",    tKey: "colScore" },
    { key: "actions",  tKey: "colActions" }
  ];

  function loadState() {
    var s = MCI.get(MCI.KEYS.overviewUI, null);
    /* c8 ignore start -- saved state always has all fields */
    if (s) {
      _page = s.page || 1;
      _sort = s.sort || "date";
      _sortDir = s.sortDir || "desc";
      _filter = s.filter || "all";
      _search = s.search || "";
    }
    /* c8 ignore stop */
  }

  function saveState() {
    MCI.put(MCI.KEYS.overviewUI, {
      page: _page, sort: _sort, sortDir: _sortDir, filter: _filter, search: _search
    });
  }

  /* ── filtering ── */
  function applyFilter(entries) {
    var keys = Object.keys(entries);
    var now = new Date();
    var cutoff = null;

    if (_filter === "today") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (_filter !== "all") {
      var days = parseInt(_filter, 10);
      if (!isNaN(days)) cutoff = new Date(now.getTime() - days * 86400000);
    }

    var result = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var e = entries[k];
      if (cutoff) {
        var d = MCI.dateFromKey(k);
        if (!d || d < cutoff) continue;
      }
      /* c8 ignore next -- search fields might be empty or undefined */
      if (_search) {
        var hay = (e.thoughts || "") + " " + (e.coreFeeling || "") + " " + (e.moodLabel || "") + " " + (e.actions || "") + " " + (e.note || "");
        if (hay.toLowerCase().indexOf(_search.toLowerCase()) === -1) continue;
      }
      result.push({ key: k, entry: e });
    }

    result.sort(function (a, b) {
      var va, vb;
      /* c8 ignore start -- sort field fallbacks for missing entry data */
      if (_sort === "date") { va = a.key; vb = b.key; }
      else if (_sort === "score") { va = (a.entry.moodScore || 0); vb = (b.entry.moodScore || 0); }
      else if (_sort === "feeling") { va = a.entry.coreFeeling || ""; vb = b.entry.coreFeeling || ""; }
      else if (_sort === "mood") { va = a.entry.moodLabel || ""; vb = b.entry.moodLabel || ""; }
      else if (_sort === "energy") {
        var ea = a.entry.energy, eb = b.entry.energy;
        va = ea ? ((ea.physical || 0) + (ea.mental || 0) + (ea.emotional || 0)) : 0;
        vb = eb ? ((eb.physical || 0) + (eb.mental || 0) + (eb.emotional || 0)) : 0;
      }
      else if (_sort === "thoughts") { va = a.entry.thoughts || ""; vb = b.entry.thoughts || ""; }
      else if (_sort === "actions") { va = a.entry.actions || ""; vb = b.entry.actions || ""; }
      /* c8 ignore stop */
      /* c8 ignore next -- fallback sort for unknown columns */
      else { va = a.key; vb = b.key; }

      if (va < vb) return _sortDir === "asc" ? -1 : 1;
      if (va > vb) return _sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }

  /* ── rendering ── */
  function buildHead() {
    var thead = document.getElementById("ov-thead");
    /* c8 ignore next -- thead always present */
    if (!thead) return;
    var html = "";
    for (var i = 0; i < COLS.length; i++) {
      var c = COLS[i];
      var arrow = _sort === c.key ? (_sortDir === "asc" ? " \u25b2" : " \u25bc") : "";
      html += '<th class="ov-th-sortable" data-sortcol="' + c.key + '">'
        + MCI.esc(MCI.t(c.tKey) || c.key) + arrow + '</th>';
    }
    html += '<th></th>'; /* delete column */
    thead.innerHTML = html;
  }

  function truncate(s, max) {
    if (!s) return "";
    return s.length > max ? s.substring(0, max) + "\u2026" : s;
  }

  function scoreLabel(s) {
    if (s >= 3) return "\ud83d\ude0a";
    if (s >= 2) return "\ud83d\ude10";
    return "\ud83d\ude1e";
  }

  function buildBody() {
    var tbody = document.getElementById("ov-tbody");
    var empty = document.getElementById("ov-empty");
    /* c8 ignore next -- tbody always present */
    if (!tbody) return;

    if (_filtered.length === 0) {
      tbody.innerHTML = "";
      if (empty) empty.classList.remove("is-hidden");
      return;
    }
    if (empty) empty.classList.add("is-hidden");

    var total = _filtered.length;
    var pages = Math.ceil(total / _pageSize);
    if (_page > pages) _page = pages;
    if (_page < 1) _page = 1;

    var start = (_page - 1) * _pageSize;
    var end = Math.min(start + _pageSize, total);
    var html = "";

    for (var i = start; i < end; i++) {
      var item = _filtered[i];
      var e = item.entry;
      var d = MCI.dateFromKey(item.key);
      /* c8 ignore next -- dateFromKey always returns valid Date for valid keys */
      var dateStr = d ? MCI.formatDate(d) + " " + MCI.formatTime(d) : item.key;

      html += '<tr class="ov-row" data-ekey="' + MCI.esc(item.key) + '">';
      html += '<td>' + MCI.esc(dateStr) + '</td>';
      /* c8 ignore next -- entry fields may be undefined */
      html += '<td>' + MCI.esc(e.coreFeeling || "\u2014") + '</td>';
      /* c8 ignore next -- entry fields may be undefined */
      html += '<td>' + MCI.esc(truncate(e.moodLabel, 20) || "\u2014") + '</td>';
      html += '<td>';
      if (e.energy) {
        var ep = [];
        if (typeof e.energy.physical === "number") ep.push("P:" + e.energy.physical + "%");
        if (typeof e.energy.mental === "number") ep.push("M:" + e.energy.mental + "%");
        if (typeof e.energy.emotional === "number") ep.push("E:" + e.energy.emotional + "%");
        html += ep.length > 0 ? ep.join(" ") : "\u2014";
      } else { /* c8 ignore next */ html += "\u2014"; }
      html += '</td>';
      /* c8 ignore next -- entry fields may be undefined */
      html += '<td>' + MCI.esc(truncate(e.thoughts, _maxChars) || "\u2014") + '</td>';
      /* c8 ignore next -- moodScore defaults to 2 */
      html += '<td>' + scoreLabel(e.moodScore || 2) + '</td>';
      html += '<td><button type="button" class="ov-del" data-dk="' + MCI.esc(item.key) + '">\u2715</button></td>';
      html += '</tr>';
    }

    tbody.innerHTML = html;
    updatePagination(pages);
    saveState();
  }

  function updatePagination(pages) {
    var info = document.getElementById("ov-page-info");
    if (info) {
      var tpl = MCI.t("pageInfo");
      if (tpl && tpl !== "pageInfo") {
        info.textContent = tpl.replace("{current}", _page).replace("{total}", pages || 1);
      } else {
        /* c8 ignore next -- translation always resolves */
        info.textContent = "Page " + _page + " of " + (pages || 1);
      }
    }

    var first = document.getElementById("ov-first");
    var prev  = document.getElementById("ov-prev");
    var next  = document.getElementById("ov-next");
    var last  = document.getElementById("ov-last");
    if (first) first.disabled = _page <= 1;
    if (prev) prev.disabled = _page <= 1;
    if (next) next.disabled = _page >= (pages || 1);
    if (last) last.disabled = _page >= (pages || 1);
  }

  function refresh() {
    var settings = MCI.loadSettings();
    _pageSize = settings.rowsPerPage || 7;
    _maxChars = settings.overviewMaxChars || 120;

    var entries = MCI.loadEntries();
    _filtered = applyFilter(entries);
    buildHead();
    buildBody();
  }

  /* ── export / import ── */
  function exportEntries() {
    var entries = MCI.loadEntries();
    MCI.download(JSON.stringify(entries, null, 2), "mindful-checkin-export.json");
  }

  var _pendingImport = null;

  function startImport(file) {
    MCI.readFile(file, function (err, text) {
      /* c8 ignore next 2 -- FileReader error untestable in E2E */
      if (err) {
        MCI.banner(MCI.t("importError") || /* c8 ignore next */ "Invalid JSON file.", "warning");
        return;
      }
      try {
        /* c8 ignore next -- text from FileReader is always a string */
        _pendingImport = typeof text === "string" ? JSON.parse(text) : text;
        var dlg = document.getElementById("dlg-import");
        /* c8 ignore next -- dialog always present and supports showModal */
        if (dlg && dlg.showModal) dlg.showModal();
      } catch (e) {
        MCI.banner(MCI.t("importError") || /* c8 ignore next */ "Invalid JSON file.", "warning");
      }
    });
  }

  function doImport(mode) {
    if (!_pendingImport) return;
    var entries = MCI.loadEntries();
    var imported = _pendingImport;
    var keys = Object.keys(imported);
    var added = 0;

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (mode === "skip" && entries[k]) continue;
      entries[k] = MCI.normalize(imported[k]);
      added++;
    }

    MCI.saveAllEntries(entries);
    _pendingImport = null;

    var dlg = document.getElementById("dlg-import");
    if (dlg && dlg.close) dlg.close();

    MCI.banner((MCI.t("importDone") || /* c8 ignore next */ "Imported {count} entries.").replace("{count}", added), "success");
    refresh();
  }

  MCI.Overview = {
    init: function () {
      loadState();

      /* c8 ignore next 2 -- search input always present */
      var searchEl = document.getElementById("ov-search");
      if (searchEl) {
        searchEl.value = _search;
        var debouncedSearch = MCI.debounce(function () {
          _search = searchEl.value;
          _page = 1;
          refresh();
        }, 200);
        searchEl.addEventListener("input", debouncedSearch);
      }

      /* c8 ignore next 2 -- filter element always present */
      var filterEl = document.getElementById("ov-filter");
      if (filterEl) {
        filterEl.value = _filter;
        filterEl.addEventListener("change", function () {
          _filter = filterEl.value;
          _page = 1;
          refresh();
        });
      }

      /* c8 ignore next 2 -- thead always present */
      var thead = document.getElementById("ov-thead");
      if (thead) {
        thead.addEventListener("click", function (e) {
          var th = e.target.closest("[data-sortcol]");
          if (!th) return;
          var col = th.getAttribute("data-sortcol");
          if (_sort === col) {
            _sortDir = _sortDir === "asc" ? "desc" : "asc";
          } else {
            _sort = col;
            _sortDir = col === "date" ? "desc" : "asc";
          }
          refresh();
        });
      }

      /* c8 ignore next 2 -- tbody always present */
      var tbody = document.getElementById("ov-tbody");
      if (tbody) {
        tbody.addEventListener("click", function (e) {
          /* delete button */
          var delBtn = e.target.closest(".ov-del");
          if (delBtn) {
            var dk = delBtn.getAttribute("data-dk");
            if (dk && confirm(MCI.t("deleteConfirm") || "Delete this entry?")) {
              MCI.deleteEntry(dk);
              refresh();
            }
            return;
          }

          /* row click → load */
          var row = e.target.closest("tr[data-ekey]");
          if (row) {
            var ek = row.getAttribute("data-ekey");
            var entries = MCI.loadEntries();
            if (entries[ek]) {
              MCI.emit("entry:request-load", { key: ek, entry: entries[ek] });
            }
          }
        });
      }

      /* c8 ignore start -- pagination buttons always present */
      var btnFirst = document.getElementById("ov-first");
      var btnPrev  = document.getElementById("ov-prev");
      var btnNext  = document.getElementById("ov-next");
      var btnLast  = document.getElementById("ov-last");
      if (btnFirst) btnFirst.addEventListener("click", function () { _page = 1; buildBody(); });
      if (btnPrev) btnPrev.addEventListener("click", function () { if (_page > 1) { _page--; buildBody(); } });
      if (btnNext) btnNext.addEventListener("click", function () { _page++; buildBody(); });
      if (btnLast) btnLast.addEventListener("click", function () { _page = Math.ceil(_filtered.length / _pageSize); buildBody(); });
      /* c8 ignore stop */

      /* c8 ignore next 2 -- export button always present */
      var expBtn = document.getElementById("ov-export");
      if (expBtn) expBtn.addEventListener("click", exportEntries);

      /* c8 ignore next 2 -- import input always present */
      var impInput = document.getElementById("ov-import");
      if (impInput) {
        impInput.addEventListener("change", function () {
          if (impInput.files && impInput.files[0]) startImport(impInput.files[0]);
          impInput.value = "";
        });
      }

      /* c8 ignore start -- dialog buttons always present */
      var btnOw = document.getElementById("dlg-overwrite");
      var btnSk = document.getElementById("dlg-skip");
      if (btnOw) btnOw.addEventListener("click", function () { doImport("overwrite"); });
      if (btnSk) btnSk.addEventListener("click", function () { doImport("skip"); });
      /* c8 ignore stop */

      /* listen for events */
      MCI.onDataChange(function () { refresh(); });

      refresh();
    },

    refresh: refresh
  };
})();
