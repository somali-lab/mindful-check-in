// Info/About view controller: vertical sub-tabs (about / guide / privacy /
// heatmap / data) and the "Data" tab tools — export/import of entries +
// quadrant (with an overwrite/skip dialog for entries), demo-data generation,
// and clear-all.
import { generateDemoEntries } from '../../core/demo';
import { normalize } from '../../core/entry';
import { isQuadrantEmpty, mergeQuadrant, type Quadrant } from '../../core/quadrant';
import type { Entry, EntryMap } from '../../core/types';
import { lang, t } from '../../i18n';
import { quadrantSeeds } from '../../i18n/translations';
import type { Store } from '../../state/store';
import { confirmDialog } from '../common/confirm';
import { downloadJson, readJsonFile, wireSubTabs } from '../common/dom';
import { showToast } from '../common/toast';

export class InfoController {
  readonly #store: Store;
  #pendingImport: { entries: EntryMap; quadrant: Quadrant | null } | null = null;

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
    downloadJson('mindful-checkin-export.json', {
      entries: this.#store.entries.get(),
      quadrant: this.#store.quadrant.get(),
    });
  }

  #startImport(file: File): void {
    readJsonFile(file)
      .then((parsed) => {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('shape');
        }
        const r = parsed as Record<string, unknown>;
        // Current export format is { entries, quadrant }; older backups are a
        // flat entry map (its keys are dates, so the shapes can't collide).
        const wrapped = r.entries && typeof r.entries === 'object' && !Array.isArray(r.entries);
        this.#pendingImport = wrapped
          ? {
              entries: r.entries as EntryMap,
              quadrant: 'quadrant' in r ? mergeQuadrant(r.quadrant) : null,
            }
          : { entries: parsed as EntryMap, quadrant: null };
        const dlg = document.getElementById('dlg-import') as HTMLDialogElement | null;
        dlg?.showModal?.();
      })
      .catch(() => showToast(t('importError') || 'Invalid JSON file.', 'warning'));
  }

  #applyImport(mode: 'overwrite' | 'skip'): void {
    if (!this.#pendingImport) return;
    const merged: EntryMap = { ...this.#store.entries.get() };
    let added = 0;
    for (const [key, raw] of Object.entries(this.#pendingImport.entries)) {
      if (mode === 'skip' && merged[key]) continue;
      merged[key] = normalize(raw as Partial<Entry>);
      added++;
    }
    this.#store.replaceAllEntries(merged);
    // A quadrant in the file replaces the board wholesale (it is one document,
    // not keyed records — the overwrite/skip choice only applies to entries).
    if (this.#pendingImport.quadrant) this.#store.saveQuadrant(this.#pendingImport.quadrant);
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
    // Demo also fills the quadrant with the example board (active language),
    // but never overwrites a board the user has put content on.
    if (isQuadrantEmpty(this.#store.quadrant.get())) {
      this.#store.saveQuadrant(mergeQuadrant(quadrantSeeds[lang.get()]));
    }
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
