// Summary panel (#summary-slot in the check-in view): today's check-in state, a
// 7-day mood heat strip, and headline stats (total / streak / avg / top feeling).
// Reads entries from the store and re-renders on entries / language change.
import { scoreTier } from '../../core/scoring';
import { computeStats, weekStripDays } from '../../core/stats';
import { lang, t } from '../../i18n';
import type { Store } from '../../state/store';

const emotionLabel = (id: string): string =>
  (id ? t(`em${id.charAt(0).toUpperCase()}${id.slice(1)}`) : '') || id;

export class SummaryComponent {
  readonly #store: Store;
  readonly #slot: HTMLElement | null;

  constructor(store: Store) {
    this.#store = store;
    this.#slot = document.getElementById('summary-slot');
    if (!this.#slot) return;
    store.entries.subscribe(() => this.#render());
    lang.subscribe(() => this.#render());
    this.#render();
  }

  #render(): void {
    if (!this.#slot) return;
    const entries = this.#store.entries.get();
    this.#slot.innerHTML = '';
    if (Object.keys(entries).length === 0) {
      const p = document.createElement('p');
      p.className = 'empty-state';
      p.textContent = t('summaryEmpty') || 'No entries yet.';
      this.#slot.appendChild(p);
      return;
    }

    const stats = computeStats(entries);

    const today = document.createElement('div');
    today.className = `summary-today${stats.hasTodayEntry ? ' is-done' : ''}`;
    const icon = document.createElement('span');
    icon.className = 'summary-today-icon';
    icon.textContent = stats.hasTodayEntry ? '✅' : '⭕';
    const label = document.createElement('span');
    label.textContent = stats.hasTodayEntry
      ? t('summaryDone') || 'Today’s check-in done'
      : t('summaryPending') || 'No check-in yet today';
    today.append(icon, label);
    this.#slot.appendChild(today);

    this.#slot.appendChild(this.#weekStrip());

    const statsRow = document.createElement('div');
    statsRow.className = 'summary-stats';
    statsRow.appendChild(this.#stat(String(stats.total), t('statTotal') || 'Total'));
    statsRow.appendChild(this.#stat(String(stats.streak), t('statStreak') || 'Streak'));
    statsRow.appendChild(this.#stat(stats.avgScore, t('statAvgMood') || 'Avg Mood'));
    statsRow.appendChild(
      this.#stat(
        stats.topEmotionId ? emotionLabel(stats.topEmotionId) : '—',
        t('statTopFeeling') || 'Top Feeling',
      ),
    );
    this.#slot.appendChild(statsRow);
  }

  #weekStrip(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'summary-week';
    const locale = lang.get() === 'nl' ? 'nl-NL' : 'en-US';
    for (const day of weekStripDays(this.#store.entries.get())) {
      const cell = document.createElement('div');
      cell.className = `heat-day${day.isToday ? ' heat-today' : ''}`;
      const dot = document.createElement('div');
      dot.className = `heat-dot ${day.score === 0 ? 'heat-empty' : `heat-${scoreTier(day.score)}`}`;
      const lbl = document.createElement('span');
      lbl.className = 'heat-label';
      lbl.textContent = day.date.toLocaleDateString(locale, { weekday: 'short' });
      cell.append(dot, lbl);
      wrap.appendChild(cell);
    }
    return wrap;
  }

  #stat(value: string, labelText: string): HTMLElement {
    const stat = document.createElement('div');
    stat.className = 'summary-stat';
    const v = document.createElement('span');
    v.className = 'summary-stat-value';
    v.textContent = value;
    const l = document.createElement('span');
    l.className = 'summary-stat-label';
    l.textContent = labelText;
    stat.append(v, l);
    return stat;
  }
}
