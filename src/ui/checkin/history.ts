// 28-day history calendar (in the check-in view): a colour grid driven by a
// selectable mode (core feeling / mood / energy axes). Each mode maps to a
// component-visibility flag, so hidden components drop their mode button.
import { energyTier, scoreTier, valenceTier } from '../../core/scoring';
import type { ComponentVisibility } from '../../core/settings';
import { buildHeatmapData } from '../../core/stats';
import type { Entry } from '../../core/types';
import { lang, t, weekdayHeaders } from '../../i18n';
import { requestEntryLoad } from '../../state/load-request';
import type { Store } from '../../state/store';

type Mode = 'core' | 'mood' | 'physical' | 'mental' | 'emotional';

const MODES: { key: Mode; tKey: string; comp: keyof ComponentVisibility }[] = [
  { key: 'core', tKey: 'histCore', comp: 'coreFeeling' },
  { key: 'mood', tKey: 'histMood', comp: 'moodMatrix' },
  { key: 'physical', tKey: 'modePhysical', comp: 'energyPhysical' },
  { key: 'mental', tKey: 'modeMental', comp: 'energyMental' },
  { key: 'emotional', tKey: 'modeEmotional', comp: 'energyEmotional' },
];

export class HistoryComponent {
  readonly #store: Store;
  #mode: Mode = 'core';

  constructor(store: Store) {
    this.#store = store;
    document.getElementById('history-modes')?.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest('[data-hmode]');
      if (!btn) return;
      this.#mode = (btn.getAttribute('data-hmode') as Mode) || 'core';
      this.#renderModes();
      this.#renderGrid();
    });

    document.getElementById('history-grid')?.addEventListener('click', (e) => {
      const cell = (e.target as Element).closest('.cal-cell[data-entry-key]');
      const key = cell?.getAttribute('data-entry-key');
      if (key) requestEntryLoad(key);
    });

    store.entries.subscribe(() => this.#renderGrid());
    store.settings.subscribe(() => this.#render());
    lang.subscribe(() => this.#render());
    this.#render();
  }

  #render(): void {
    this.#renderModes();
    this.#renderGrid();
  }

  #renderModes(): void {
    const el = document.getElementById('history-modes');
    if (!el) return;
    const comps = this.#store.settings.get().components;
    const available = MODES.filter((m) => comps[m.comp] !== false);
    if (!available.some((m) => m.key === this.#mode)) {
      this.#mode = available[0]?.key ?? 'core';
    }
    el.innerHTML = '';
    for (const m of available) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cal-mode-btn${m.key === this.#mode ? ' is-active' : ''}`;
      btn.setAttribute('data-hmode', m.key);
      btn.textContent = t(m.tKey) || m.key;
      el.appendChild(btn);
    }
  }

  #renderGrid(): void {
    const el = document.getElementById('history-grid');
    if (!el) return;
    const heat = buildHeatmapData(this.#store.entries.get());
    el.innerHTML = '';
    for (const name of weekdayHeaders()) {
      const h = document.createElement('div');
      h.className = 'cal-day-header';
      h.textContent = name;
      el.appendChild(h);
    }
    for (let p = 0; p < heat.leadingSpacers; p++) {
      const pad = document.createElement('div');
      pad.className = 'cal-cell-pad';
      el.appendChild(pad);
    }
    for (const day of heat.days) {
      const cell = document.createElement('div');
      cell.className = `cal-cell ${day.entry ? this.#cellClass(day.entry) : 'cal-empty'}${day.isToday ? ' cal-today' : ''}`;
      if (day.entryKey) cell.setAttribute('data-entry-key', day.entryKey);
      cell.title = day.dayKey;
      const num = document.createElement('span');
      num.className = 'cal-day-num';
      num.textContent = day.label;
      cell.appendChild(num);
      el.appendChild(cell);
    }
  }

  #cellClass(entry: Entry): string {
    switch (this.#mode) {
      case 'core':
        return `cal-${scoreTier(entry.moodScore || 2)}`;
      case 'mood':
        return entry.moodCol >= 0 ? `cal-${valenceTier(entry.moodCol)}` : 'cal-empty';
      default: {
        const v = entry.energy[this.#mode as 'physical' | 'mental' | 'emotional'];
        return typeof v === 'number' ? `cal-${energyTier(v)}` : 'cal-empty';
      }
    }
  }
}
