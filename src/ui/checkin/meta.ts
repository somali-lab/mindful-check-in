// Check-in meta: time-of-day greeting, save-state pill, and the date-override
// control. The orchestrator drives the entry key (setKey) on load/save/clear and
// reads getOverrideKey() at save time; everything else is self-contained.
import { dateFromKey, formatDate, formatTime, pad2 } from '../../core/datetime';
import { lang, t } from '../../i18n';
import { Component } from '../common/component';

export class MetaComponent extends Component {
  #key: string | null = null;
  #dirty = false;

  constructor() {
    super();
    const input = document.getElementById('ci-date-override') as HTMLInputElement | null;
    const control = document.getElementById('ci-date-control');
    input?.addEventListener('change', () => {
      this.#dirty = true;
      this.#updateDateDisplay();
    });
    if (control && input) {
      control.addEventListener('click', (e) => {
        if (e.target === input) return;
        if (typeof input.showPicker === 'function') {
          try {
            input.showPicker();
          } catch {
            input.focus();
          }
        } else {
          input.focus();
        }
      });
    }

    this.listen(lang, () => {
      this.#updateGreeting();
      this.#updatePill();
      this.#updateDateDisplay();
    });

    this.#updateGreeting();
    this.render();
  }

  setKey(key: string | null): void {
    this.#key = key;
    this.#dirty = false;
    this.render();
  }

  /** Minute-precision key from the date field, only once the user edits it. */
  getOverrideKey(): string | null {
    if (!this.#dirty) return null;
    const input = document.getElementById('ci-date-override') as HTMLInputElement | null;
    if (!input?.value) return null;
    const d = new Date(input.value);
    if (Number.isNaN(d.getTime())) return null;
    return `${formatDate(d)}_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}000`;
  }

  protected render(): void {
    this.#updatePill();
    this.#syncDateInput();
  }

  #updateGreeting(): void {
    const el = document.getElementById('ci-greeting');
    if (!el) return;
    const h = new Date().getHours();
    el.textContent = t(h < 12 ? 'ciGreetMorning' : h < 18 ? 'ciGreetAfternoon' : 'ciGreetEvening');
  }

  #updatePill(): void {
    const pill = document.getElementById('ci-pill');
    if (!pill) return;
    if (this.#key) {
      const d = dateFromKey(this.#key);
      pill.textContent = d ? `${formatDate(d)} · ${formatTime(d)}` : this.#key;
      pill.classList.remove('is-new', 'checkin-context-pill--new');
      pill.classList.add('is-saved', 'checkin-context-pill--saved');
    } else {
      pill.textContent = t('pillNew') || 'New · not saved yet';
      pill.classList.add('is-new', 'checkin-context-pill--new');
      pill.classList.remove('is-saved', 'checkin-context-pill--saved');
    }
  }

  #syncDateInput(): void {
    const input = document.getElementById('ci-date-override') as HTMLInputElement | null;
    if (!input) return;
    const d = (this.#key ? dateFromKey(this.#key) : new Date()) || new Date();
    input.value = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    this.#updateDateDisplay();
  }

  #updateDateDisplay(): void {
    const disp = document.getElementById('ci-date-display');
    const input = document.getElementById('ci-date-override') as HTMLInputElement | null;
    if (!disp || !input) return;
    disp.textContent = this.#fmtNice(input.value);
  }

  #fmtNice(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const locale = lang.get() === 'nl' ? 'nl' : 'en-GB';
    const date = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d);
    return `${date} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
}
