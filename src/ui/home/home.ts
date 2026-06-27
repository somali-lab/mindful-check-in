// Home dashboard: streak ring, totals, 28-day heatmap, this-week strip, and the
// "mood swings" spread cards (wheel / matrix-valence / matrix-arousal) over a
// selectable window. Read-only; re-renders on entries / settings / language.
import { todayKey, weekdayHeaders } from '../../core/datetime';
import { computeSwing, scoreTier, swingTier } from '../../core/scoring';
import { buildHeatmapData, computeStats, entrySpanDays, weekStripDays } from '../../core/stats';
import type { EntryMap, SwingSource } from '../../core/types';
import { lang, t } from '../../i18n';
import { requestEntryLoad } from '../../state/load-request';
import type { Store } from '../../state/store';
import { renderWeekStrip, setText } from '../common/dom';

const SWING_CARDS: {
  source: SwingSource;
  scoreId: string;
  sparkId: string;
  tierId: string;
  subId: string | null;
}[] = [
  {
    source: 'wheel',
    scoreId: 'home-swing-wheel-score',
    sparkId: 'home-swing-wheel-spark',
    tierId: 'home-swing-wheel-tier',
    subId: 'home-swing-wheel-sub',
  },
  {
    source: 'valence',
    scoreId: 'home-swing-valence-score',
    sparkId: 'home-swing-valence-spark',
    tierId: 'home-swing-valence-tier',
    subId: 'home-swing-matrix-sub',
  },
  {
    source: 'arousal',
    scoreId: 'home-swing-arousal-score',
    sparkId: 'home-swing-arousal-spark',
    tierId: 'home-swing-arousal-tier',
    subId: null,
  },
];

export class HomeController {
  readonly #store: Store;
  #swingDays = 28;

  constructor(store: Store) {
    this.#store = store;

    document.getElementById('home-btn-checkin')?.addEventListener('click', () => {
      location.hash = 'checkin';
    });

    document.getElementById('home-heatmap')?.addEventListener('click', (e) => {
      const cell = (e.target as Element).closest('[data-entry-key]');
      const key = cell?.getAttribute('data-entry-key');
      if (key) requestEntryLoad(key);
    });

    const info = document.getElementById('home-swing-info');
    const help = document.getElementById('home-swing-help');
    info?.addEventListener('click', () => {
      const hidden = help?.classList.toggle('is-hidden');
      info.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    });

    const period = document.getElementById('home-swing-period') as HTMLSelectElement | null;
    period?.addEventListener('change', () => {
      const v = Number.parseInt(period.value, 10);
      this.#swingDays = Number.isNaN(v) ? 28 : v;
      this.#renderSwings(this.#store.entries.get());
    });

    store.entries.subscribe(() => this.#render());
    store.settings.subscribe(() => this.#render());
    lang.subscribe(() => this.#render());
    this.#render();
  }

  #render(): void {
    const entries = this.#store.entries.get();
    const stats = computeStats(entries);
    setText('home-streak', String(stats.streak));
    setText('home-total', String(stats.total));
    setText('home-avg', stats.avgScore);
    setText('home-status', stats.hasTodayEntry ? t('summaryDone') : t('summaryPending'));

    const span = entrySpanDays(entries);
    setText(
      'home-span',
      span == null
        ? ''
        : (t('homeSpanDays') || 'across {days} days').replace('{days}', String(span)),
    );
    setText('home-energy', this.#todayEnergy(entries));

    this.#renderHeatmap(entries);
    this.#renderRing(stats.streak);
    this.#renderWeek(entries);
    this.#renderSwings(entries);
  }

  #todayEnergy(entries: EntryMap): string {
    for (const [key, e] of Object.entries(entries)) {
      if (!key.startsWith(todayKey())) continue;
      const vals = [e.energy.physical, e.energy.mental, e.energy.emotional].filter(
        (v): v is number => typeof v === 'number',
      );
      if (vals.length === 0) return '—';
      return `${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)}%`;
    }
    return '—';
  }

  #renderHeatmap(entries: EntryMap): void {
    const el = document.getElementById('home-heatmap');
    if (!el) return;
    const heat = buildHeatmapData(entries);
    el.innerHTML = '';
    for (const name of weekdayHeaders(lang.get())) {
      const h = document.createElement('div');
      h.className = 'home-heat-header';
      h.textContent = name;
      el.appendChild(h);
    }
    for (let p = 0; p < heat.leadingSpacers; p++) {
      const pad = document.createElement('div');
      pad.className = 'home-heat-cell home-heat-spacer';
      el.appendChild(pad);
    }
    for (const day of heat.days) {
      const cell = document.createElement('div');
      let cls = 'home-heat-cell ';
      cls += day.entry
        ? `has-entry home-heat-${scoreTier(day.entry.moodScore || 2)}`
        : 'home-heat-empty';
      if (day.isToday) cls += ' home-heat-today';
      cell.className = cls;
      if (day.entryKey) cell.setAttribute('data-entry-key', day.entryKey);
      cell.title = day.dayKey;
      cell.textContent = day.label;
      el.appendChild(cell);
    }
  }

  #renderRing(streak: number): void {
    const el = document.getElementById('home-streak-ring');
    if (!el) return;
    const R = 30;
    const C = 2 * Math.PI * R;
    const ratio = Math.max(0, Math.min(1, streak / 7));
    const off = C * (1 - ratio);
    const label = (t('homeDays') || 'days').toUpperCase();
    el.innerHTML =
      `<svg viewBox="0 0 80 80" width="78" height="78" aria-hidden="true">` +
      `<circle class="home-ring-track" cx="40" cy="40" r="30" fill="none" stroke-width="7"/>` +
      `<circle class="home-ring-arc" cx="40" cy="40" r="30" fill="none" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 40 40)"/>` +
      `<text class="home-ring-num" x="40" y="46" text-anchor="middle" font-size="22">${streak}</text>` +
      `<text class="home-ring-label" x="40" y="58" text-anchor="middle" font-size="8.5" letter-spacing="1">${label}</text>` +
      `</svg>`;
  }

  #renderWeek(entries: EntryMap): void {
    const el = document.getElementById('home-week');
    if (el) renderWeekStrip(el, weekStripDays(entries), lang.get());
  }

  #renderSwings(entries: EntryMap): void {
    for (const card of SWING_CARDS) {
      const data = computeSwing(entries, card.source, this.#swingDays);
      setText(card.scoreId, data.score == null ? '—' : String(data.score));
      const spark = document.getElementById(card.sparkId);
      if (spark) spark.innerHTML = sparkSvg(data.series, data.min, data.max);
      setText(card.tierId, data.score == null ? '' : t(`swingTier${swingTier(data.score)}`) || '');
      if (card.subId) {
        setText(
          card.subId,
          data.score == null
            ? t('swingNoData') || 'Not enough data yet'
            : (t('swingBasis') || '{count} check-ins').replace('{count}', String(data.count)),
        );
      }
    }
  }
}

/** Inline sparkline; empty string for < 2 points (so no <svg> is rendered). */
function sparkSvg(series: number[], min: number, max: number): string {
  if (!series || series.length < 2) return '';
  let pts = series;
  const MAX = 48;
  if (pts.length > MAX) {
    const bucketed: number[] = [];
    const size = pts.length / MAX;
    for (let b = 0; b < MAX; b++) {
      const s = Math.floor(b * size);
      const en = Math.floor((b + 1) * size);
      let sum = 0;
      let n = 0;
      for (let j = s; j < en; j++) {
        sum += pts[j] ?? 0;
        n++;
      }
      bucketed.push(n ? sum / n : (pts[s] ?? 0));
    }
    pts = bucketed;
  }
  const W = 100;
  const H = 32;
  const pad = 2;
  const range = max - min || 1;
  const step = pts.length > 1 ? (W - 2 * pad) / (pts.length - 1) : 0;
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const x = pad + i * step;
    const y = pad + (1 - ((pts[i] ?? 0) - min) / range) * (H - 2 * pad);
    d += `${i ? ' L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
