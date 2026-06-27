// Overview view: a read-only, sortable, paginated, searchable/filterable table of
// all entries. Reads entries + settings from the store and re-renders on either
// change; UI state (page / sort / filter / search) persists to the repository so
// it survives reloads. Delete is wired (confirm → store.deleteEntry); row-click
// loading into the form lands with the entry-loading step.
import { dateFromKey, formatDate, formatTime } from '../../core/datetime';
import type { Entry } from '../../core/types';
import { moodLabels } from '../../data/static';
import { emotionLabel, lang, t } from '../../i18n';
import type { Repository } from '../../infra/storage';
import { STORAGE_KEYS } from '../../infra/storage';
import { requestEntryLoad } from '../../state/load-request';
import type { Store } from '../../state/store';
import { confirmDialog } from '../common/confirm';

type SortKey = 'date' | 'feeling' | 'mood' | 'energy' | 'thoughts' | 'score' | 'actions';
type SortDir = 'asc' | 'desc';
type Item = { key: string; entry: Entry };

interface OverviewUI {
  page: number;
  sort: SortKey;
  sortDir: SortDir;
  filter: string;
  search: string;
}

const COLS: { key: SortKey; tKey: string }[] = [
  { key: 'date', tKey: 'colDate' },
  { key: 'feeling', tKey: 'colFeeling' },
  { key: 'mood', tKey: 'colMood' },
  { key: 'energy', tKey: 'colEnergy' },
  { key: 'thoughts', tKey: 'colThoughts' },
  { key: 'score', tKey: 'colScore' },
  { key: 'actions', tKey: 'colActions' },
];

function moodLabelOf(e: Entry): string {
  if (e.moodRow >= 0 && e.moodCol >= 0) {
    const grid = moodLabels[lang.get()] || moodLabels.en;
    return grid[e.moodRow]?.[e.moodCol] || e.moodLabel || '';
  }
  return e.moodLabel || '';
}

const MOOD_LABEL_MAX = 20; // mood column is fixed-width; thoughts use the configurable maxChars

function truncate(s: string, max: number): string {
  if (!s) return '';
  return s.length > max ? `${s.substring(0, max)}…` : s;
}

export class OverviewController {
  readonly #store: Store;
  readonly #repo: Repository;
  #ui: OverviewUI = { page: 1, sort: 'date', sortDir: 'desc', filter: 'all', search: '' };
  #filtered: Item[] = [];
  #searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(store: Store, repo: Repository) {
    this.#store = store;
    this.#repo = repo;
    const saved = repo.read<Partial<OverviewUI> | null>(STORAGE_KEYS.overviewUI, null);
    if (saved) this.#ui = { ...this.#ui, ...saved };

    this.#wireControls();
    this.#store.entries.subscribe(() => this.#refresh());
    this.#store.settings.subscribe(() => this.#refresh());
    lang.subscribe(() => this.#refresh());
    this.#refresh();
  }

  #wireControls(): void {
    const search = document.getElementById('ov-search') as HTMLInputElement | null;
    if (search) {
      search.value = this.#ui.search;
      search.addEventListener('input', () => {
        if (this.#searchTimer) clearTimeout(this.#searchTimer);
        this.#searchTimer = setTimeout(() => {
          this.#ui.search = search.value;
          this.#ui.page = 1;
          this.#refresh();
        }, 200);
      });
    }

    const filter = document.getElementById('ov-filter') as HTMLSelectElement | null;
    if (filter) {
      filter.value = this.#ui.filter;
      filter.addEventListener('change', () => {
        this.#ui.filter = filter.value;
        this.#ui.page = 1;
        this.#refresh();
      });
    }

    document.getElementById('ov-thead')?.addEventListener('click', (e) => {
      const th = (e.target as Element).closest('[data-sortcol]');
      if (!th) return;
      const col = th.getAttribute('data-sortcol') as SortKey;
      if (this.#ui.sort === col) {
        this.#ui.sortDir = this.#ui.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.#ui.sort = col;
        this.#ui.sortDir = col === 'date' ? 'desc' : 'asc';
      }
      this.#refresh();
    });

    document.getElementById('ov-tbody')?.addEventListener('click', (e) => {
      const target = e.target as Element;
      const del = target.closest('.ov-del');
      if (del) {
        const key = del.getAttribute('data-dk');
        if (key) this.#confirmDelete(key);
        return;
      }
      const row = target.closest('tr[data-ekey]');
      const ekey = row?.getAttribute('data-ekey');
      if (ekey) requestEntryLoad(ekey);
    });

    const nav: [string, () => void][] = [
      ['ov-first', () => (this.#ui.page = 1)],
      ['ov-prev', () => (this.#ui.page = Math.max(1, this.#ui.page - 1))],
      ['ov-next', () => (this.#ui.page += 1)],
      ['ov-last', () => (this.#ui.page = this.#pageCount())],
    ];
    for (const [id, fn] of nav) {
      document.getElementById(id)?.addEventListener('click', () => {
        fn();
        this.#buildBody();
      });
    }
  }

  async #confirmDelete(key: string): Promise<void> {
    const ok = await confirmDialog({
      title: t('deleteConfirmTitle') || 'Delete check-in',
      body: t('deleteConfirm') || 'Delete this entry?',
      danger: true,
    });
    if (ok) this.#store.deleteEntry(key);
  }

  #pageSize(): number {
    return this.#store.settings.get().rowsPerPage || 7;
  }

  #pageCount(): number {
    return Math.max(1, Math.ceil(this.#filtered.length / this.#pageSize()));
  }

  #refresh(): void {
    this.#filtered = this.#applyFilter();
    this.#buildHead();
    this.#buildBody();
  }

  #applyFilter(): Item[] {
    const entries = this.#store.entries.get();
    const now = new Date();
    let cutoff: Date | null = null;
    if (this.#ui.filter === 'today') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (this.#ui.filter !== 'all') {
      const days = Number.parseInt(this.#ui.filter, 10);
      if (!Number.isNaN(days)) cutoff = new Date(now.getTime() - days * 86_400_000);
    }
    const needle = this.#ui.search.toLowerCase();

    const result: Item[] = [];
    for (const key of Object.keys(entries)) {
      const entry = entries[key];
      if (!entry) continue;
      if (cutoff) {
        const d = dateFromKey(key);
        if (!d || d < cutoff) continue;
      }
      if (needle) {
        const hay = `${entry.thoughts} ${entry.coreFeeling} ${moodLabelOf(entry)} ${entry.actions} ${entry.note}`;
        if (!hay.toLowerCase().includes(needle)) continue;
      }
      result.push({ key, entry });
    }

    const dir = this.#ui.sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const [va, vb] = this.#sortValues(a, b);
      if (va < vb) return -dir;
      if (va > vb) return dir;
      return 0;
    });
    return result;
  }

  #sortValues(a: Item, b: Item): [number | string, number | string] {
    const sumEnergy = (e: Entry): number =>
      (e.energy.physical || 0) + (e.energy.mental || 0) + (e.energy.emotional || 0);
    switch (this.#ui.sort) {
      case 'score':
        return [a.entry.moodScore || 0, b.entry.moodScore || 0];
      case 'feeling':
        return [a.entry.coreFeeling, b.entry.coreFeeling];
      case 'mood':
        return [moodLabelOf(a.entry), moodLabelOf(b.entry)];
      case 'energy':
        return [sumEnergy(a.entry), sumEnergy(b.entry)];
      case 'thoughts':
        return [a.entry.thoughts, b.entry.thoughts];
      case 'actions':
        return [a.entry.actions, b.entry.actions];
      default:
        return [a.key, b.key];
    }
  }

  #buildHead(): void {
    const thead = document.getElementById('ov-thead');
    if (!thead) return;
    thead.innerHTML = '';
    for (const c of COLS) {
      const th = document.createElement('th');
      th.className = 'ov-th-sortable';
      th.setAttribute('data-sortcol', c.key);
      const arrow = this.#ui.sort === c.key ? (this.#ui.sortDir === 'asc' ? ' ▲' : ' ▼') : '';
      th.textContent = (t(c.tKey) || c.key) + arrow;
      thead.appendChild(th);
    }
    thead.appendChild(document.createElement('th'));
  }

  #buildBody(): void {
    const tbody = document.getElementById('ov-tbody');
    const empty = document.getElementById('ov-empty');
    if (!tbody) return;

    if (this.#filtered.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('is-hidden');
      this.#updatePagination();
      this.#saveState();
      return;
    }
    empty?.classList.add('is-hidden');

    const pages = this.#pageCount();
    if (this.#ui.page > pages) this.#ui.page = pages;
    if (this.#ui.page < 1) this.#ui.page = 1;
    const size = this.#pageSize();
    const start = (this.#ui.page - 1) * size;
    const slice = this.#filtered.slice(start, start + size);
    const maxChars = this.#store.settings.get().overviewMaxChars || 120;

    tbody.innerHTML = '';
    for (const item of slice) {
      tbody.appendChild(this.#buildRow(item, maxChars));
    }
    this.#updatePagination();
    this.#saveState();
  }

  #buildRow(item: Item, maxChars: number): HTMLTableRowElement {
    const e = item.entry;
    const d = dateFromKey(item.key);
    const row = document.createElement('tr');
    row.className = 'ov-row';
    row.setAttribute('data-ekey', item.key);

    const energyParts: string[] = [];
    if (typeof e.energy.physical === 'number') energyParts.push(`P:${e.energy.physical}%`);
    if (typeof e.energy.mental === 'number') energyParts.push(`M:${e.energy.mental}%`);
    if (typeof e.energy.emotional === 'number') energyParts.push(`E:${e.energy.emotional}%`);

    this.#td(row, d ? `${formatDate(d)} ${formatTime(d)}` : item.key);
    this.#td(row, e.coreFeeling ? emotionLabel(e.coreFeeling) : '—');
    this.#td(row, truncate(moodLabelOf(e), MOOD_LABEL_MAX) || '—');
    this.#td(row, energyParts.length ? energyParts.join(' ') : '—');
    this.#td(row, truncate(e.thoughts, maxChars) || '—');

    const score = document.createElement('td');
    score.className = 'ov-center';
    const dot = document.createElement('span');
    const s = e.moodScore || 2;
    dot.className = `ov-score-dot ${s >= 3 ? 'score-high' : s >= 2 ? 'score-mid' : 'score-low'}`;
    dot.setAttribute('aria-hidden', 'true');
    score.appendChild(dot);
    row.appendChild(score);

    this.#td(row, e.actions || '—');

    const delCell = document.createElement('td');
    delCell.className = 'ov-center';
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'ov-del';
    del.setAttribute('data-dk', item.key);
    del.textContent = '✕';
    delCell.appendChild(del);
    row.appendChild(delCell);

    return row;
  }

  #td(row: HTMLTableRowElement, text: string): void {
    const td = document.createElement('td');
    td.textContent = text;
    row.appendChild(td);
  }

  #updatePagination(): void {
    const pages = this.#pageCount();
    const info = document.getElementById('ov-page-info');
    if (info) {
      info.textContent = t('pageInfo', { current: this.#ui.page, total: pages });
    }
    const setDisabled = (id: string, disabled: boolean): void => {
      const btn = document.getElementById(id) as HTMLButtonElement | null;
      if (btn) btn.disabled = disabled;
    };
    const atStart = this.#ui.page <= 1;
    const atEnd = this.#ui.page >= pages;
    setDisabled('ov-first', atStart);
    setDisabled('ov-prev', atStart);
    setDisabled('ov-next', atEnd);
    setDisabled('ov-last', atEnd);
  }

  #saveState(): void {
    this.#repo.write(STORAGE_KEYS.overviewUI, this.#ui);
  }
}
