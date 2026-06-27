// Settings view controller: vertical sub-tabs (general / components / actions /
// reminders / portability), form load/save against the store, reset-to-defaults
// (confirm), the quick-action list editor, and settings import/export. Each form
// control maps to one Settings field; saving persists the whole object, and the
// store's subscribers (theme, wheel, energy, chips, check-in visibility) react.
import {
  type ComponentVisibility,
  defaultSettings,
  type LogoChoice,
  mergeSettings,
  type Settings,
  type ThemeChoice,
} from '../../core/settings';
import type { WheelType } from '../../core/types';
import { lang, setLang, t } from '../../i18n';
import type { Store } from '../../state/store';
import { confirmDialog } from '../common/confirm';
import { downloadJson, readJsonFile, renderRemovableTags, wireSubTabs } from '../common/dom';
import { showToast } from '../common/toast';

const REMINDER_DEFAULT_DAYS = [1, 2, 3, 4, 5];

function val(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  return el ? el.value : '';
}

function setVal(id: string, value: string | number): void {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  if (el) el.value = String(value);
}

function intVal(id: string, fallback: number): number {
  const n = Number.parseInt(val(id), 10);
  return Number.isNaN(n) ? fallback : n;
}

function checked(id: string): boolean {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? el.checked : false;
}

function setChecked(id: string, value: boolean): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.checked = value;
}

export class SettingsController {
  readonly #store: Store;

  constructor(store: Store) {
    this.#store = store;
    wireSubTabs('#view-settings');
    this.#wireButtons();
    this.#wireQuickActions();
    this.#loadForm();
    // Re-render quick actions / labels when the language switches.
    lang.subscribe(() => this.#buildQAList(this.#store.settings.get().quickActions));
  }

  #loadForm(): void {
    const s = this.#store.settings.get();
    setVal('cfg-lang', s.defaultLanguage);
    setVal('cfg-theme', s.theme);
    setVal('cfg-logo', s.logo);
    setVal('cfg-wheel', s.defaultWheelType);
    setVal('cfg-energy-label', s.energyEmotionalLabel);
    setVal('cfg-location', s.weatherLocation);
    setVal('cfg-rows', s.rowsPerPage);
    setVal('cfg-maxchars', s.overviewMaxChars);
    setVal('cfg-toast', s.toastDuration);
    setChecked('cfg-reminder-enabled', s.reminderEnabled);
    setVal('cfg-reminder-interval', s.reminderInterval);
    setVal('cfg-reminder-start', s.reminderStartHour);
    setVal('cfg-reminder-end', s.reminderEndHour);
    setVal('cfg-reminder-title', s.reminderCustomTitle);
    setVal('cfg-reminder-body', s.reminderCustomBody);

    const days = Array.isArray(s.reminderDays) ? s.reminderDays : REMINDER_DEFAULT_DAYS;
    for (const cb of document.querySelectorAll<HTMLInputElement>('[data-reminder-day]')) {
      cb.checked = days.includes(Number.parseInt(cb.getAttribute('data-reminder-day') ?? '', 10));
    }

    for (const cb of document.querySelectorAll<HTMLInputElement>('[data-comp]')) {
      const key = cb.getAttribute('data-comp') as keyof ComponentVisibility | null;
      cb.checked = key ? s.components[key] !== false : true;
    }

    this.#buildQAList(s.quickActions);
  }

  #gather(): Settings {
    const s = { ...this.#store.settings.get() };
    s.defaultLanguage = val('cfg-lang') === 'nl' ? 'nl' : 'en';
    s.theme = (val('cfg-theme') || 'system') as ThemeChoice;
    s.logo = (val('cfg-logo') || 'wolf') as LogoChoice;
    s.defaultWheelType = (val('cfg-wheel') || 'act') as WheelType;
    s.energyEmotionalLabel = val('cfg-energy-label') || 'social';
    s.weatherLocation = val('cfg-location');
    s.rowsPerPage = intVal('cfg-rows', 7);
    s.overviewMaxChars = intVal('cfg-maxchars', 120);
    s.toastDuration = intVal('cfg-toast', 4);
    s.reminderEnabled = checked('cfg-reminder-enabled');
    s.reminderInterval = intVal('cfg-reminder-interval', 120);
    s.reminderStartHour = intVal('cfg-reminder-start', 8);
    s.reminderEndHour = intVal('cfg-reminder-end', 18);
    s.reminderCustomTitle = val('cfg-reminder-title');
    s.reminderCustomBody = val('cfg-reminder-body');

    const days: number[] = [];
    for (const cb of document.querySelectorAll<HTMLInputElement>('[data-reminder-day]')) {
      if (cb.checked) days.push(Number.parseInt(cb.getAttribute('data-reminder-day') ?? '', 10));
    }
    s.reminderDays = days;

    const components = { ...s.components };
    for (const cb of document.querySelectorAll<HTMLInputElement>('[data-comp]')) {
      const key = cb.getAttribute('data-comp') as keyof ComponentVisibility | null;
      if (key) components[key] = cb.checked;
    }
    s.components = components;

    return s;
  }

  #wireButtons(): void {
    document.getElementById('cfg-btn-save')?.addEventListener('click', () => {
      const next = this.#gather();
      const langChanged = next.defaultLanguage !== this.#store.settings.get().defaultLanguage;
      this.#store.saveSettings(next);
      if (langChanged) setLang(next.defaultLanguage);
      showToast(t('settingsSaved') || 'Settings saved.', 'success');
    });

    document.getElementById('cfg-btn-reset')?.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: t('settingReset'),
        body: t('settingsResetConfirm') || 'Reset all settings to defaults?',
        danger: true,
      });
      if (!ok) return;
      this.#store.saveSettings(defaultSettings());
      this.#loadForm();
      showToast(t('settingsReset') || 'Settings reset to defaults.', 'success');
    });

    document.getElementById('cfg-btn-export')?.addEventListener('click', () => this.#export());
    const imp = document.getElementById('cfg-inp-import') as HTMLInputElement | null;
    imp?.addEventListener('change', () => {
      const file = imp.files?.[0];
      if (file) this.#import(file);
      imp.value = '';
    });
  }

  #wireQuickActions(): void {
    const input = document.getElementById('qa-input') as HTMLInputElement | null;
    const addBtn = document.getElementById('cfg-btn-add-qa');
    const add = (): void => {
      if (!input) return;
      const value = input.value.trim();
      if (value) {
        const list = [...this.#store.settings.get().quickActions];
        if (!list.includes(value)) {
          this.#saveQuickActions([...list, value]);
        }
      }
      input.value = '';
    };
    addBtn?.addEventListener('click', add);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        add();
      }
    });

    document.getElementById('qa-list')?.addEventListener('click', (e) => {
      const del = (e.target as Element).closest('.qa-del');
      if (!del) return;
      const idx = Number.parseInt(del.getAttribute('data-qi') ?? '', 10);
      const list = [...this.#store.settings.get().quickActions];
      list.splice(idx, 1);
      this.#saveQuickActions(list);
    });
  }

  #saveQuickActions(list: string[]): void {
    const next = {
      ...this.#store.settings.get(),
      quickActions: list,
      isDefaultQuickActions: false,
    };
    this.#store.saveSettings(next);
    this.#buildQAList(list);
  }

  #buildQAList(actions: string[]): void {
    const ct = document.getElementById('qa-list');
    if (!ct) return;
    renderRemovableTags(ct, actions, {
      tagClass: 'tag quick-action-tag',
      delClass: 'tag-x qa-del',
      removeAttr: 'data-qi',
      removeLabel: t('ariaRemove') || 'Remove',
    });
  }

  #export(): void {
    downloadJson('mindful-checkin-settings.json', this.#store.settings.get());
  }

  #import(file: File): void {
    readJsonFile(file)
      .then((raw) => {
        this.#store.saveSettings(mergeSettings(raw));
        this.#loadForm();
        showToast(t('settingsImported') || 'Settings imported.', 'success');
      })
      .catch(() => showToast(t('importError') || 'Invalid JSON file.', 'warning'));
  }
}
