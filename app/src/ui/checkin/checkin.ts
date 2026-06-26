// Check-in orchestrator: composes the form's sub-components (currently the
// emotion wheel; more added incrementally), loads today's entry on init, and
// applies component-visibility settings. Components never talk to each other —
// only this orchestrator reads/writes them.
import { todayKey } from '../../core/datetime';
import type { Store } from '../../state/store';
import { WheelComponent } from './wheel';

export class CheckinController {
  readonly #store: Store;
  readonly #wheel: WheelComponent;

  constructor(store: Store) {
    this.#store = store;
    // The picked emotion is read back from the wheel at save time (Phase 5 save step).
    this.#wheel = new WheelComponent(store, () => {});

    this.#applyVisibility();
    this.#store.settings.subscribe(() => this.#applyVisibility());
    this.#loadToday();
  }

  #loadToday(): void {
    const entries = this.#store.entries.get();
    const prefix = todayKey();
    const key = Object.keys(entries).find((k) => k.startsWith(prefix));
    if (!key) return;
    const entry = entries[key];
    if (!entry) return;
    this.#wheel.setVariant(entry.wheelType || 'act');
    this.#wheel.setPicked(entry.coreFeeling || '');
  }

  #applyVisibility(): void {
    const c = this.#store.settings.get().components;
    const visible: Record<string, boolean> = {
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
