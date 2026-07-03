// Summary panel (#summary-slot in the check-in view): today's check-in state, a
// 7-day mood heat strip, and headline stats (total / streak / avg / top feeling).
// Reads entries from the store and re-renders on entries / language change.
import { computeStats, weekStripDays } from '../../core/stats';
import { emotionLabel, lang, t } from '../../i18n';
import type { Store } from '../../state/store';
import { Component } from '../common/component';
import { renderWeekStrip } from '../common/dom';

export class SummaryComponent extends Component {
  readonly #store: Store;
  readonly #slot: HTMLElement | null;

  constructor(store: Store) {
    super();
    this.#store = store;
    this.#slot = document.getElementById('summary-slot');
    if (!this.#slot) return;
    this.listen(store.entries, () => this.render());
    this.listen(lang, () => this.render());
    this.render();
  }

  protected render(): void {
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

    const week = document.createElement('div');
    week.className = 'summary-week';
    renderWeekStrip(week, weekStripDays(entries), lang.get());
    this.#slot.appendChild(week);

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
