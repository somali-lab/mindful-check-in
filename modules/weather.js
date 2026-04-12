/* Mindful Check-in v4 – Weather */
(function () {
  "use strict";
  var MCI = window.MCI;

  var CACHE_TTL = 30 * 60 * 1000; /* 30 min */
  var RETRY_DELAY = 60 * 1000; /* 60 sec */
  var _slot;
  var _locationName = null;
  var _retryTimer = null;

  function loadCache() {
    var c = MCI.get(MCI.KEYS.weatherCache, null);
    if (!c || Date.now() - c.ts > CACHE_TTL) return null;
    return c;
  }

  function saveCache(data) {
    MCI.put(MCI.KEYS.weatherCache, { ts: Date.now(), data: data });
  }

  function fetchWeather(lat, lon) {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat
      + "&longitude=" + lon
      + "&current_weather=true&timezone=auto";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
        try {
          var resp = JSON.parse(xhr.responseText);
          var cw = resp.current_weather;
          saveCache(cw);
          renderWeather(cw, _locationName);
          MCI.emit("weather:fetched", cw);
        } catch (e) { renderError(); }
      } else {
        renderError();
      }
    };
    xhr.onerror = function () { renderError(); };
    xhr.send();
  }

  function geocode(location, cb) {
    var url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(location) + "&count=1";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data.results && data.results.length > 0) {
            cb(data.results[0].latitude, data.results[0].longitude);
            return;
          }
        } catch (e) { /* fall through */ }
      }
      cb(null, null);
    };
    xhr.onerror = function () { cb(null, null); };
    xhr.send();
  }

  function renderWeather(cw, locationName) {
    if (!_slot || !cw) return;
    var code = cw.weathercode != null ? cw.weathercode : cw.weather_code;
    var wInfo = MCI.Data.weatherCodes[code] || { emoji: "\u2753", desc: "Unknown" };
    var temp = cw.temperature != null ? cw.temperature : "?";
    var wind = cw.windspeed != null ? cw.windspeed : "?";
    var locHtml = locationName ? '<span class="weather-location">' + MCI.esc(locationName) + '</span>' : '';

    _slot.innerHTML = '<div class="weather-display">'
      + '<span class="weather-icon">' + wInfo.emoji + '</span>'
      + '<div class="weather-details">'
      + '<span class="weather-temp">' + MCI.esc(temp + "\u00b0C") + '</span>'
      + '<span class="weather-desc">' + MCI.esc(wInfo.desc) + ' \u00b7 ' + MCI.esc(wind + " km/h") + '</span>'
      + locHtml
      + '</div></div>';
  }

  function renderError() {
    if (!_slot) return;
    _slot.innerHTML = '<span class="weather-unavailable">' + MCI.esc(MCI.t("weatherUnavailable") || "Weather unavailable") + '</span>';
    scheduleRetry();
  }

  function scheduleRetry() {
    if (_retryTimer) return; /* already scheduled */
    _retryTimer = setTimeout(function () {
      _retryTimer = null;
      startFetch();
    }, RETRY_DELAY);
  }

  function startFetch() {
    /* cancel any pending retry */
    if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null; }

    var settings = MCI.loadSettings();
    _locationName = settings.weatherLocation || null;

    /* check cache first */
    var cached = loadCache();
    if (cached) { renderWeather(cached.data, _locationName); return; }

    /* try named location first */
    if (settings.weatherLocation) {
      geocode(settings.weatherLocation, function (lat, lon) {
        if (lat != null) fetchWeather(lat, lon);
        else tryGeolocation();
      });
      return;
    }

    tryGeolocation();
  }

  function tryGeolocation() {
    /* Geolocation requires a secure context (HTTPS or localhost).
       On file:// it is either missing or always denied. */
    if (!navigator.geolocation || window.location.protocol === "file:") {
      renderLocationHint();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) { fetchWeather(pos.coords.latitude, pos.coords.longitude); },
      function ()    { renderLocationHint(); },
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  function renderLocationHint() {
    if (!_slot) return;
    _slot.innerHTML = '<span class="weather-unavailable">'
      + MCI.esc(MCI.t("weatherSetLocation") || "Set a weather location in Settings")
      + '</span>';
  }

  MCI.Weather = {
    init: function () {
      _slot = document.getElementById("weather-slot");
      if (!_slot) return;
      startFetch();
      MCI.on("settings:changed", function () { startFetch(); });
      MCI.on("language:changed", function () {
        /* re-render with cached data or hint in new language */
        var cached = loadCache();
        if (cached) { renderWeather(cached.data, _locationName); }
        else { renderLocationHint(); }
      });
    },

    getCurrent: function () {
      var c = loadCache();
      return c ? c.data : null;
    },

    refresh: startFetch
  };
})();
