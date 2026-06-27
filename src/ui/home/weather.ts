// Weather widget (lives on the home view). Renders the current reading from the
// WeatherService into #weather-slot: fresh cache first, else geocode the
// configured location and fetch. Degrades gracefully (error / location hint) and
// never throws. The check-in save reads the reading via WeatherService.getCached().
import { weatherCodes } from '../../data/static';
import { lang, t } from '../../i18n';
import type { CurrentWeather, WeatherService } from '../../infra/weather';
import type { Store } from '../../state/store';

export class WeatherComponent {
  readonly #store: Store;
  readonly #service: WeatherService;
  readonly #slot: HTMLElement | null;
  #current: CurrentWeather | null = null;

  constructor(store: Store, service: WeatherService) {
    this.#store = store;
    this.#service = service;
    this.#slot = document.getElementById('weather-slot');
    if (!this.#slot) return;

    const card = this.#slot.closest('[data-component="weather"]');
    let lastLocation = store.settings.get().weatherLocation;
    const applyVisibility = (visible: boolean): void => {
      card?.classList.toggle('is-hidden', !visible);
    };
    applyVisibility(store.settings.get().components.weather);
    store.settings.subscribe((s) => {
      applyVisibility(s.components.weather);
      if (s.weatherLocation !== lastLocation) {
        lastLocation = s.weatherLocation;
        void this.#refresh();
      }
    });
    lang.subscribe(() => {
      if (this.#current) this.#render(this.#current);
    });

    void this.#refresh();
  }

  async #refresh(): Promise<void> {
    const cached = this.#service.getCached();
    if (cached) {
      this.#current = cached;
      this.#render(cached);
      return;
    }
    const location = this.#store.settings.get().weatherLocation;
    if (!location) {
      this.#renderHint();
      return;
    }
    const geo = await this.#service.geocode(location);
    if (!geo) {
      this.#renderHint();
      return;
    }
    const cw = await this.#service.fetchCurrent(geo.lat, geo.lon);
    if (cw) {
      this.#current = cw;
      this.#render(cw);
    } else {
      this.#renderError();
    }
  }

  #render(cw: CurrentWeather): void {
    if (!this.#slot) return;
    const code = cw.weathercode ?? 0;
    const info = weatherCodes[code] || { emoji: '❓', desc: { en: 'Unknown', nl: 'Unknown' } };
    const desc = info.desc[lang.get()] || info.desc.en;
    const temp = cw.temperature != null ? cw.temperature : '?';
    this.#slot.innerHTML = '';
    this.#span('weather-icon', info.emoji);
    this.#span('weather-temp', `${temp}°`);
    const sep = this.#span('weather-sep', '·');
    sep.setAttribute('aria-hidden', 'true');
    this.#span('weather-desc', desc);
  }

  #renderError(): void {
    if (!this.#slot) return;
    this.#slot.innerHTML = '';
    this.#span('weather-unavailable', t('weatherUnavailable') || 'Weather unavailable');
  }

  #renderHint(): void {
    if (!this.#slot) return;
    this.#slot.innerHTML = '';
    this.#span('weather-unavailable', t('weatherSetLocation') || 'Set a weather location');
  }

  #span(cls: string, text: string): HTMLSpanElement {
    const el = document.createElement('span');
    el.className = cls;
    el.textContent = text;
    this.#slot?.appendChild(el);
    return el;
  }
}
