(function () {
  "use strict";
  window.App = window.App || {};

  var WEATHER_CACHE_KEY = "local-mood-tracker-weather-cache";
  var WEATHER_CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

  function getCacheKey(lat, lon) {
    return Math.round(lat * 100) / 100 + "," + Math.round(lon * 100) / 100;
  }

  function readWeatherCache() {
    try {
      var raw = localStorage.getItem(WEATHER_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeWeatherCache(cache) {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
    } catch (e) { /* storage full — ignore */ }
  }

  function getCachedWeather(lat, lon) {
    var cache = readWeatherCache();
    var entry = cache[getCacheKey(lat, lon)];
    if (!entry) return null;
    if (Date.now() - entry.ts > WEATHER_CACHE_TTL) return null;
    return entry.data;
  }

  function setCachedWeather(lat, lon, data) {
    var cache = readWeatherCache();
    cache[getCacheKey(lat, lon)] = { ts: Date.now(), data: data };
    writeWeatherCache(cache);
  }

  function getLastFetchedTs(lat, lon) {
    var cache = readWeatherCache();
    var entry = cache[getCacheKey(lat, lon)];
    return (entry && entry.ts) ? entry.ts : null;
  }

  App.clearWeatherCache = function () {
    try { localStorage.removeItem(WEATHER_CACHE_KEY); } catch (e) { /* ignore */ }
  };

  App.renderWeatherLastFetched = function () {
    var el = App.dom && App.dom.weatherLastFetched;
    if (!el) return;
    var coords = App.state && App.state.settings && App.state.settings.weatherCoords;
    if (!coords) { el.textContent = ""; return; }
    var ts = getLastFetchedTs(coords.lat, coords.lon);
    if (!ts) { el.textContent = ""; return; }
    var d = new Date(ts);
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var formatted = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
      + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
    el.textContent = App.t("settings.weatherLocation.lastFetched") + " " + formatted;
  };

  var WEATHER_ICONS = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌧️", 55: "🌧️",
    56: "🌧️", 57: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "🌧️",
    66: "🧊", 67: "🧊",
    71: "🌨️", 73: "❄️", 75: "❄️", 77: "❄️",
    80: "🌦️", 81: "🌧️", 82: "⛈️",
    85: "🌨️", 86: "🌨️",
    95: "⛈️", 96: "⛈️", 99: "⛈️",
  };

  function getWeatherIcon(code, isDay) {
    if (code === 0 && !isDay) return "🌙";
    if ((code === 1 || code === 2) && !isDay) return "🌙";
    return WEATHER_ICONS[code] || "❓";
  }

  function getWeatherDescription(code) {
    var key = "weather.codes." + code;
    var desc = App.t(key);
    if (desc === key) return "";
    return desc;
  }

  App.fetchWeather = function (lat, lon) {
    var cached = getCachedWeather(lat, lon);
    if (cached) {
      return Promise.resolve(cached);
    }
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat
      + "&longitude=" + lon
      + "&current=temperature_2m,weather_code,is_day"
      + "&timezone=auto&temperature_unit=celsius";
    return fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error("Weather API error " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data.current) throw new Error("No current weather data");
        var current = data.current;
        var result = {
          temperature: current.temperature_2m,
          code: current.weather_code,
          description: getWeatherDescription(current.weather_code),
          icon: getWeatherIcon(current.weather_code, current.is_day),
          isDay: current.is_day,
        };
        setCachedWeather(lat, lon, result);
        return result;
      });
  };

  App.geocodeCity = function (cityName) {
    var lang = (App.state && App.state.language) || "en";
    var url = "https://geocoding-api.open-meteo.com/v1/search?name="
      + encodeURIComponent(cityName)
      + "&count=1&language=" + lang;
    return fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error("Geocoding API error " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data.results || data.results.length === 0) {
          throw new Error("City not found: " + cityName);
        }
        var r = data.results[0];
        return {
          lat: r.latitude,
          lon: r.longitude,
          name: r.name,
        };
      });
  };

  App.renderWeatherWidget = function () {
    var dom = App.dom;
    if (!dom.weatherWidget) return;

    var weather = App.state.currentWeather;
    var settings = App.state.settings;
    var locationName = (settings.weatherCoords && settings.weatherCoords.name) || settings.weatherLocation || "";

    if (!settings.weatherLocation && !settings.weatherCoords) {
      dom.weatherWidget.classList.add("is-empty");
      dom.weatherIcon.textContent = "🌤️";
      dom.weatherTemp.textContent = "";
      dom.weatherDesc.textContent = App.t("weather.unavailable");
      dom.weatherLocationEl.textContent = "";
      return;
    }

    if (!weather) {
      dom.weatherWidget.classList.remove("is-empty");
      dom.weatherIcon.textContent = "⏳";
      dom.weatherTemp.textContent = "";
      dom.weatherDesc.textContent = App.t("weather.loading");
      dom.weatherLocationEl.textContent = locationName;
      return;
    }

    dom.weatherWidget.classList.remove("is-empty");
    dom.weatherIcon.textContent = weather.icon;
    dom.weatherTemp.textContent = Math.round(weather.temperature) + "°C";
    dom.weatherDesc.textContent = getWeatherDescription(weather.code) || weather.description;
    dom.weatherLocationEl.textContent = locationName;
  };

  App.loadWeather = function () {
    var coords = App.state.settings.weatherCoords;
    if (!coords) {
      App.state.currentWeather = null;
      App.renderWeatherWidget();
      return;
    }
    App.state.currentWeather = null;
    App.renderWeatherWidget();
    App.fetchWeather(coords.lat, coords.lon)
      .then(function (weatherData) {
        App.state.currentWeather = weatherData;
        App.renderWeatherWidget();
        App.renderWeatherLastFetched();
      })
      .catch(function (err) {
        console.warn("Could not fetch weather:", err);
        App.state.currentWeather = null;
        App.renderWeatherWidget();
      });
  };

  App.getWeatherForEntry = function () {
    var weather = App.state.currentWeather;
    var settings = App.state.settings;
    if (!weather || weather.temperature === null || weather.temperature === undefined) return null;
    return {
      temperature: weather.temperature,
      code: weather.code,
      description: weather.description,
      location: (settings.weatherCoords && settings.weatherCoords.name) || settings.weatherLocation || "",
    };
  };
})();
