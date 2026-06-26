// Check-in orchestrator: composes the form's sub-components (emotion wheel, body
// signals; more added incrementally), loads today's entry on init, applies
// component-visibility settings, and owns save/new. Components never talk to each
// other — only this orchestrator reads/writes them.

import { timestampKey, todayKey } from '../../core/datetime';
import { normalize } from '../../core/entry';
import { computeMoodScore } from '../../core/scoring';
import type { Entry } from '../../core/types';
import { t } from '../../i18n';
import type { WeatherService } from '../../infra/weather';
import type { Store } from '../../state/store';
import { showToast } from '../toast';
import { BodyComponent } from './body';
import { ChipsComponent } from './chips';
import { EnergyComponent } from './energy';
import { HistoryComponent } from './history';
import { MetaComponent } from './meta';
import { MoodComponent } from './mood';
import { SummaryComponent } from './summary';
import { WeatherComponent } from './weather';
import { WheelComponent } from './wheel';

export class CheckinController {
  readonly #store: Store;
  readonly #wheel: WheelComponent;
  readonly #body: BodyComponent;
  readonly #energy: EnergyComponent;
  readonly #mood: MoodComponent;
  readonly #chips: ChipsComponent;
  readonly #weather: WeatherComponent;
  readonly #meta: MetaComponent;
  #currentKey: string | null = null;

  constructor(store: Store, weatherService: WeatherService) {
    this.#store = store;
    // The picked emotion is read back from the wheel at save time.
    this.#wheel = new WheelComponent(store, () => {});
    this.#body = new BodyComponent();
    this.#energy = new EnergyComponent(store);
    this.#mood = new MoodComponent();
    this.#chips = new ChipsComponent(store);
    this.#weather = new WeatherComponent(store, weatherService);
    this.#meta = new MetaComponent();
    new SummaryComponent(store);
    new HistoryComponent(store);

    document.getElementById('ci-btn-save')?.addEventListener('click', () => this.#save());
    document.getElementById('ci-btn-new')?.addEventListener('click', () => this.#clear());

    this.#applyVisibility();
    this.#store.settings.subscribe(() => this.#applyVisibility());
    this.#loadToday();
  }

  #loadToday(): void {
    const entries = this.#store.entries.get();
    const prefix = todayKey();
    const key = Object.keys(entries)
      .sort()
      .reverse()
      .find((k) => k.startsWith(prefix));
    if (!key) return;
    const entry = entries[key];
    if (!entry) return;
    this.#currentKey = key;
    this.#meta.setKey(key);
    this.#wheel.setVariant(entry.wheelType || 'act');
    this.#wheel.setPicked(entry.coreFeeling || '');
    this.#body.setZones(entry.bodySignals || []);
    this.#energy.setValues(entry.energy || null);
    this.#mood.setSelection(entry.moodRow, entry.moodCol);
    this.#setField('fld-thoughts', entry.thoughts);
    this.#setField('fld-custom', entry.customFeelings);
    this.#setField('fld-body-note', entry.bodyNote);
    this.#setField('fld-energy-note', entry.energyNote);
    this.#setField('fld-action', entry.actions);
    this.#setField('fld-note', entry.note);
    this.#chips.refresh();
  }

  #collect(): Entry {
    const partial: Partial<Entry> = {
      thoughts: this.#fieldValue('fld-thoughts'),
      coreFeeling: this.#wheel.picked,
      wheelType: this.#wheel.variant,
      customFeelings: this.#fieldValue('fld-custom'),
      bodySignals: this.#body.getZones(),
      bodyNote: this.#fieldValue('fld-body-note'),
      energy: this.#energy.getValues(),
      energyNote: this.#fieldValue('fld-energy-note'),
      actions: this.#fieldValue('fld-action'),
      note: this.#fieldValue('fld-note'),
    };
    const w = this.#weather.getCurrent();
    if (w) {
      partial.weather = {
        temperature: w.temperature,
        weathercode: w.weathercode,
        windspeed: w.windspeed,
        description: '',
        location: '',
      };
    }
    const mood = this.#mood.getSelection();
    partial.moodRow = mood ? mood.row : -1;
    partial.moodCol = mood ? mood.col : -1;
    partial.moodLabel = mood ? mood.label : '';
    partial.moodColor = mood ? mood.color : '';
    partial.moodScore = computeMoodScore(partial);
    return normalize(partial);
  }

  #save(): void {
    const entry = this.#collect();
    // Validation — at least a core feeling OR some thoughts.
    if (!entry.coreFeeling && !entry.thoughts) {
      showToast(t('saveWarnEmpty'), 'warning');
      return;
    }
    const key = this.#currentKey || this.#meta.getOverrideKey() || timestampKey();
    this.#store.saveEntry(key, entry);
    this.#currentKey = key;
    this.#meta.setKey(key);
    showToast(t('saveDone'), 'success');
  }

  #clear(): void {
    this.#currentKey = null;
    this.#meta.setKey(null);
    this.#wheel.setVariant(this.#store.settings.get().defaultWheelType || 'act');
    this.#wheel.setPicked('');
    this.#body.setZones([]);
    this.#energy.setValues(null);
    this.#mood.setSelection(-1, -1);
    for (const id of [
      'fld-thoughts',
      'fld-custom',
      'fld-body-note',
      'fld-energy-note',
      'fld-action',
      'fld-note',
    ])
      this.#setField(id, '');
    this.#chips.refresh();
  }

  #fieldValue(id: string): string {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    return el ? el.value.trim() : '';
  }

  #setField(id: string, value: string | undefined): void {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el) el.value = value || '';
  }

  #applyVisibility(): void {
    const c = this.#store.settings.get().components;
    const visible: Record<string, boolean> = {
      weather: c.weather,
      thoughts: c.thoughts,
      coreFeeling: c.coreFeeling,
      bodySignals: c.bodySignals,
      energyPanel: c.energyPhysical || c.energyMental || c.energyEmotional,
      moodMatrix: c.moodMatrix,
      actions: c.actions,
      note: c.note,
    };
    for (const [name, show] of Object.entries(visible)) {
      const el = document.querySelector(`#view-checkin [data-component="${name}"]`);
      el?.classList.toggle('is-hidden', !show);
    }
  }
}
