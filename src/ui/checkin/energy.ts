// Energy meters — three horizontal 20-segment bars (physical / mental /
// emotional). Clicking segment N snaps the value to round(N/20 * 100)%. The
// emotional channel's label honours the configured third-label setting, and
// each meter respects its component-visibility flag. Self-contained: the
// orchestrator reads values via getValues() and restores them via setValues().
import type { ComponentVisibility, Settings } from '../../core/settings';
import { lang, type StringKey, t } from '../../i18n';
import type { Store } from '../../state/store';
import { Component } from '../common/component';

type EnergyKey = 'physical' | 'mental' | 'emotional';
type EnergyValues = Record<EnergyKey, number | null>;

const SEGMENTS = 20;
const METERS: { key: EnergyKey; flag: keyof ComponentVisibility; labelKey: StringKey }[] = [
  { key: 'physical', flag: 'energyPhysical', labelKey: 'energyPhysical' },
  { key: 'mental', flag: 'energyMental', labelKey: 'energyMental' },
  { key: 'emotional', flag: 'energyEmotional', labelKey: 'energyEmotional' },
];

function emotionalLabelKey(settings: Settings): StringKey {
  const map: Record<string, StringKey> = {
    emotionalSocial: 'energyEmotionalSocial',
    emotional: 'energyEmotional',
    social: 'energySocial',
  };
  return map[settings.energyEmotionalLabel] || 'energyEmotional';
}

export class EnergyComponent extends Component {
  readonly #store: Store;
  readonly #slot: HTMLElement | null;
  readonly #display: HTMLElement | null;
  #values: EnergyValues = { physical: null, mental: null, emotional: null };

  constructor(store: Store) {
    super();
    this.#store = store;
    this.#slot = document.getElementById('energy-slot');
    this.#display = document.getElementById('energy-display');
    if (!this.#slot) return;

    this.#slot.addEventListener('click', (e) => this.#onClick(e));

    document.getElementById('nrg-btn-reset')?.addEventListener('click', () => {
      this.#values = { physical: null, mental: null, emotional: null };
      this.render();
      const note = document.getElementById('fld-energy-note') as HTMLTextAreaElement | null;
      if (note) note.value = '';
    });

    this.listen(lang, () => this.render());
    this.listen(store.settings, () => this.render());
    this.render();
  }

  getValues(): EnergyValues {
    return { ...this.#values };
  }

  setValues(obj: Partial<EnergyValues> | null): void {
    this.#values = obj
      ? {
          physical: typeof obj.physical === 'number' ? obj.physical : null,
          mental: typeof obj.mental === 'number' ? obj.mental : null,
          emotional: typeof obj.emotional === 'number' ? obj.emotional : null,
        }
      : { physical: null, mental: null, emotional: null };
    this.render();
  }

  protected render(): void {
    if (!this.#slot) return;
    const settings = this.#store.settings.get();
    const comps = settings.components;
    this.#slot.innerHTML = '';
    const frag = document.createDocumentFragment();

    for (const meter of METERS) {
      if (comps[meter.flag] === false) continue;
      const labelKey = meter.key === 'emotional' ? emotionalLabelKey(settings) : meter.labelKey;
      const val = this.#values[meter.key];
      const hasVal = typeof val === 'number';
      const filled = hasVal ? Math.round((val * SEGMENTS) / 100) : 0;

      const row = document.createElement('div');
      row.className = 'nrg-row';
      row.setAttribute('data-meter', meter.key);
      row.setAttribute('data-energy-type', meter.key);

      const label = document.createElement('div');
      label.className = 'nrg-label';
      label.textContent = t(labelKey) || meter.key;
      row.appendChild(label);

      const track = document.createElement('div');
      track.className = 'nrg-track';
      track.setAttribute('data-meter', meter.key);
      track.setAttribute('data-energy-type', meter.key);
      for (let s = 1; s <= SEGMENTS; s++) {
        const seg = document.createElement('span');
        seg.className = `nrg-seg${s <= filled ? ' is-on' : ''}`;
        seg.setAttribute('data-meter', meter.key);
        seg.setAttribute('data-seg', String(s));
        track.appendChild(seg);
      }
      row.appendChild(track);

      const value = document.createElement('div');
      value.className = `nrg-val${hasVal ? '' : ' is-empty'}`;
      value.setAttribute('data-meter', meter.key);
      value.textContent = hasVal ? `${val}%` : '–';
      row.appendChild(value);

      frag.appendChild(row);
    }

    this.#slot.appendChild(frag);
    this.#updateDisplay();
  }

  #onClick(e: MouseEvent): void {
    const seg = (e.target as Element).closest('.nrg-seg');
    if (seg) {
      const key = seg.getAttribute('data-meter');
      const idx = Number.parseInt(seg.getAttribute('data-seg') ?? '', 10);
      if (key && !Number.isNaN(idx))
        this.#set(key as EnergyKey, Math.round((idx * 100) / SEGMENTS));
      return;
    }
    const track = (e.target as Element).closest('.nrg-track');
    if (!track) return;
    const key = track.getAttribute('data-meter');
    if (!key) return;
    const rect = track.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    this.#set(key as EnergyKey, Math.max(0, Math.min(100, Math.round(pct * 100))));
  }

  #set(key: EnergyKey, val: number): void {
    this.#values[key] = val;
    if (!this.#slot) return;
    const row = this.#slot.querySelector(`.nrg-row[data-energy-type="${key}"]`);
    if (row) {
      const filled = Math.round((val * SEGMENTS) / 100);
      const segs = row.querySelectorAll('.nrg-seg');
      segs.forEach((seg, i) => {
        seg.classList.toggle('is-on', i < filled);
      });
      const valEl = row.querySelector('.nrg-val');
      if (valEl) {
        valEl.textContent = `${val}%`;
        valEl.classList.remove('is-empty');
      }
    }
    this.#updateDisplay();
  }

  #updateDisplay(): void {
    if (!this.#display) return;
    const settings = this.#store.settings.get();
    const comps = settings.components;
    const parts: string[] = [];
    if (comps.energyPhysical !== false && typeof this.#values.physical === 'number') {
      parts.push(`${t('energyPhysical')}: ${this.#values.physical}%`);
    }
    if (comps.energyMental !== false && typeof this.#values.mental === 'number') {
      parts.push(`${t('energyMental')}: ${this.#values.mental}%`);
    }
    if (comps.energyEmotional !== false && typeof this.#values.emotional === 'number') {
      parts.push(`${t(emotionalLabelKey(settings))}: ${this.#values.emotional}%`);
    }
    if (parts.length === 0) {
      this.#display.textContent = t('energyNone');
      this.#display.classList.add('is-empty');
    } else {
      this.#display.textContent = parts.join(' · ');
      this.#display.classList.remove('is-empty');
    }
  }
}
