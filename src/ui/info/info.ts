// Info/About view controller: vertical sub-tabs (about / guide / privacy /
// heatmap / data) and the "Data" tab tools — export/import entries (with an
// overwrite/skip dialog), demo-data generation, and clear-all.
import { generateDemoEntries } from '../../core/demo';
import { normalize } from '../../core/entry';
import type { Entry, EntryMap } from '../../core/types';
import { lang, t } from '../../i18n';
import type { Store } from '../../state/store';
import { confirmDialog } from '../common/confirm';
import { downloadJson, readJsonFile, wireSubTabs } from '../common/dom';
import { showToast } from '../common/toast';

export class InfoController {
  readonly #store: Store;
  #pendingImport: EntryMap | null = null;

  constructor(store: Store) {
    this.#store = store;
    wireSubTabs('#view-info');
    this.#wireData();
  }

  #wireData(): void {
    document.getElementById('ov-export')?.addEventListener('click', () => this.#export());

    const imp = document.getElementById('ov-import') as HTMLInputElement | null;
    imp?.addEventListener('change', () => {
      const file = imp.files?.[0];
      if (file) this.#startImport(file);
      imp.value = '';
    });
    document
      .getElementById('dlg-overwrite')
      ?.addEventListener('click', () => this.#applyImport('overwrite'));
    document.getElementById('dlg-skip')?.addEventListener('click', () => this.#applyImport('skip'));

    document
      .getElementById('demo-btn-generate')
      ?.addEventListener('click', () => this.#generateDemo());
    document.getElementById('demo-btn-clear')?.addEventListener('click', () => this.#clearAll());
  }

  #export(): void {
    downloadJson('mindful-checkin-export.json', this.#store.entries.get());
  }

  #startImport(file: File): void {
    readJsonFile(file)
      .then((parsed) => {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('shape');
        }
        this.#pendingImport = parsed as EntryMap;
        const dlg = document.getElementById('dlg-import') as HTMLDialogElement | null;
        dlg?.showModal?.();
      })
      .catch(() => showToast(t('importError') || 'Invalid JSON file.', 'warning'));
  }

  #applyImport(mode: 'overwrite' | 'skip'): void {
    if (!this.#pendingImport) return;
    const merged: EntryMap = { ...this.#store.entries.get() };
    let added = 0;
    for (const [key, raw] of Object.entries(this.#pendingImport)) {
      if (mode === 'skip' && merged[key]) continue;
      merged[key] = normalize(raw as Partial<Entry>);
      added++;
    }
    this.#store.replaceAllEntries(merged);
    this.#pendingImport = null;
    (document.getElementById('dlg-import') as HTMLDialogElement | null)?.close();
    showToast(
      (t('importDone') || 'Imported {count} entries.').replace('{count}', String(added)),
      'success',
    );
  }

  async #generateDemo(): Promise<void> {
    const ok = await confirmDialog({
      title: t('btnDemo'),
      body: t('demoConfirm') || 'Generate 30 days of demo data?',
    });
    if (!ok) return;
    const demo = generateDemoEntries(lang.get());
    const merged = { ...this.#store.entries.get(), ...demo };
    this.#store.replaceAllEntries(merged);
    showToast(
      (t('demoGenerated') || 'Generated {count} demo entries.').replace(
        '{count}',
        String(Object.keys(demo).length),
      ),
      'success',
    );
  }

  async #clearAll(): Promise<void> {
    const first = await confirmDialog({
      title: t('btnClearAll'),
      body: t('clearConfirm') || 'Clear ALL data? This cannot be undone.',
      danger: true,
    });
    if (!first) return;
    const second = await confirmDialog({
      title: t('btnClearAll'),
      body: t('clearConfirmDouble') || 'Are you really sure?',
      danger: true,
    });
    if (!second) return;
    this.#store.clearAllData();
    showToast(t('clearDone') || 'All data cleared. Reloading…', 'success');
    setTimeout(() => location.reload(), 1500);
  }
}
