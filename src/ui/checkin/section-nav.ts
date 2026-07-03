// Section navigator: the fixed rail on the check-in page (prev/next arrows + a
// dot per visible section). Scrolls the .app-scroll container to each section;
// hidden sections are skipped, and the rail hides itself with fewer than two
// stops. Rebuilds when the check-in view becomes active, on settings/language
// change, and tracks the active dot on scroll.
import { lang, type StringKey, t } from '../../i18n';
import type { Store } from '../../state/store';
import { Component } from '../common/component';

const SECTIONS: { sel: string; tKey: StringKey }[] = [
  { sel: '.ci-intro-row', tKey: 'labelThoughts' },
  { sel: '.ci-core-row', tKey: 'labelCoreFeeling' },
  { sel: '.ci-energy-section', tKey: 'labelEnergy' },
  { sel: "#view-checkin [data-component='moodMatrix']", tKey: 'labelMoodMatrix' },
  { sel: '.ci-card-actions', tKey: 'labelActions' },
  { sel: '#view-checkin .grid', tKey: 'summaryTitle' },
];

const isVisible = (el: Element | null): el is HTMLElement =>
  !!el && (el as HTMLElement).offsetParent !== null && (el as HTMLElement).offsetHeight > 6;

export class SectionNavComponent extends Component {
  readonly #rail: HTMLElement | null;
  readonly #dots: HTMLElement | null;
  readonly #prev: HTMLButtonElement | null;
  readonly #next: HTMLButtonElement | null;
  readonly #scroller: HTMLElement | null;
  #stops: HTMLElement[] = [];
  #active = 0;
  #ticking = false;

  constructor(store: Store) {
    super();
    this.#rail = document.getElementById('section-rail');
    this.#scroller = document.querySelector('.app-scroll');
    this.#dots = document.getElementById('section-rail-dots');
    this.#prev = this.#rail?.querySelector("[data-dir='prev']") ?? null;
    this.#next = this.#rail?.querySelector("[data-dir='next']") ?? null;
    if (!this.#rail || !this.#scroller) return;

    this.#rail.addEventListener('click', (e) => {
      const arrow = (e.target as Element).closest('.section-rail-arrow');
      if (arrow) {
        this.#scrollTo(this.#active + (arrow.getAttribute('data-dir') === 'next' ? 1 : -1));
        return;
      }
      const dot = (e.target as Element).closest('.section-rail-dot');
      if (dot) this.#scrollTo(Number.parseInt(dot.getAttribute('data-idx') ?? '', 10));
    });

    this.#scroller.addEventListener('scroll', () => this.#onScroll(), { passive: true });
    window.addEventListener('resize', () => this.#onScroll());
    window.addEventListener('hashchange', () => {
      if (this.#isCheckin()) requestAnimationFrame(() => this.render());
    });
    this.listen(store.settings, () => {
      if (this.#isCheckin()) requestAnimationFrame(() => this.render());
    });
    this.listen(lang, () => {
      if (this.#isCheckin()) this.render();
    });

    if (this.#isCheckin()) requestAnimationFrame(() => this.render());
  }

  #isCheckin(): boolean {
    return document.getElementById('view-checkin')?.classList.contains('is-active') ?? false;
  }

  #topIn(el: HTMLElement): number {
    if (!this.#scroller) return 0;
    return (
      el.getBoundingClientRect().top -
      this.#scroller.getBoundingClientRect().top +
      this.#scroller.scrollTop
    );
  }

  protected render(): void {
    if (!this.#rail || !this.#dots) return;
    this.#stops = [];
    this.#dots.innerHTML = '';
    for (const section of SECTIONS) {
      const el = document.querySelector(section.sel);
      if (!isVisible(el)) continue;
      this.#stops.push(el);
      const label = t(section.tKey) || '';
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'section-rail-dot';
      dot.setAttribute('data-idx', String(this.#stops.length - 1));
      dot.title = label;
      dot.setAttribute('aria-label', label);
      this.#dots.appendChild(dot);
    }
    if (this.#stops.length < 2) {
      this.#rail.classList.add('is-hidden');
      return;
    }
    this.#rail.classList.remove('is-hidden');
    this.#update();
  }

  #setActive(i: number): void {
    this.#active = Math.max(0, Math.min(i, this.#stops.length - 1));
    if (this.#dots) {
      Array.from(this.#dots.children).forEach((dot, k) => {
        dot.classList.toggle('is-active', k === this.#active);
      });
    }
    if (this.#prev) this.#prev.disabled = this.#active <= 0;
    if (this.#next) this.#next.disabled = this.#active >= this.#stops.length - 1;
  }

  #update(): void {
    if (!this.#scroller || this.#stops.length === 0) return;
    if (this.#scroller.scrollTop + this.#scroller.clientHeight >= this.#scroller.scrollHeight - 2) {
      this.#setActive(this.#stops.length - 1);
      return;
    }
    const ref = this.#scroller.scrollTop + 90;
    let idx = 0;
    for (let i = 0; i < this.#stops.length; i++) {
      const stop = this.#stops[i];
      if (stop && this.#topIn(stop) <= ref) idx = i;
      else break;
    }
    this.#setActive(idx);
  }

  #scrollTo(i: number): void {
    const stop = this.#stops[i];
    if (!stop || !this.#scroller) return;
    this.#scroller.scrollTo({ top: Math.max(0, this.#topIn(stop) - 14), behavior: 'smooth' });
    this.#setActive(i);
  }

  #onScroll(): void {
    if (this.#ticking) return;
    this.#ticking = true;
    requestAnimationFrame(() => {
      this.#update();
      this.#ticking = false;
    });
  }
}
