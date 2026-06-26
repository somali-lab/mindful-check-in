// Emotion wheel — muted SVG donut with external labels and pill tabs.
// Self-contained component; the orchestrator reads the picked emotion via the `picked` getter.
import type { WheelType } from '../../core/types';
import { type Wheel, wheels } from '../../data/static';
import { emotionLabel, lang, t } from '../../i18n';
import type { Store } from '../../state/store';

const SVGNS = 'http://www.w3.org/2000/svg';
const CENTER = 180;
const RO = 116;
const RI = 58;
const LABEL_R = 130;
const VARIANTS: WheelType[] = ['act', 'plutchik', 'ekman', 'junto', 'extended'];

function polar(r: number, a: number): { x: number; y: number } {
  return { x: CENTER + r * Math.cos(a), y: CENTER + r * Math.sin(a) };
}

function ringPath(a0: number, a1: number, ri: number, ro: number): string {
  const oS = polar(ro, a0);
  const oE = polar(ro, a1);
  const iE = polar(ri, a1);
  const iS = polar(ri, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${oS.x.toFixed(2)} ${oS.y.toFixed(2)} A ${ro} ${ro} 0 ${large} 1 ${oE.x.toFixed(2)} ${oE.y.toFixed(2)} L ${iE.x.toFixed(2)} ${iE.y.toFixed(2)} A ${ri} ${ri} 0 ${large} 0 ${iS.x.toFixed(2)} ${iS.y.toFixed(2)} Z`;
}

function svgEl(name: string, attrs: Record<string, string | number>): SVGElement {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

const isWheelType = (v: string): v is WheelType => (VARIANTS as string[]).includes(v);

export class WheelComponent {
  readonly #svg: SVGElement | null;
  readonly #display: HTMLElement | null;
  readonly #select: HTMLSelectElement | null;
  readonly #tabs: HTMLElement | null;
  #picked = '';

  constructor(store: Store) {
    this.#svg = document.getElementById('wheel-svg') as SVGElement | null;
    this.#display = document.getElementById('wheel-display');
    this.#select = document.getElementById('sel-wheel') as HTMLSelectElement | null;
    this.#tabs = document.getElementById('wheel-tabs');
    if (!this.#svg) return;

    this.#svg.addEventListener('click', (e) => {
      const seg = (e.target as Element).closest('[data-em]');
      if (seg) this.#select_(seg.getAttribute('data-em') ?? '');
    });

    this.#tabs?.addEventListener('click', (e) => {
      const pill = (e.target as Element).closest('[data-wheel]');
      if (!pill) return;
      this.#setVariantValue(pill.getAttribute('data-wheel') ?? 'act');
      this.#picked = '';
      this.#buildTabs();
      this.#draw();
    });

    document.getElementById('whl-btn-reset')?.addEventListener('click', () => {
      this.#picked = '';
      this.#draw();
      const custom = document.getElementById('fld-custom') as HTMLTextAreaElement | null;
      if (custom) custom.value = '';
    });

    lang.subscribe(() => {
      this.#buildTabs();
      this.#draw();
    });
    store.settings.subscribe((s) => {
      if (this.#select && s.defaultWheelType && this.#select.value !== s.defaultWheelType) {
        this.setVariant(s.defaultWheelType);
      }
    });

    const initial = store.settings.get().defaultWheelType;
    if (this.#select && initial) this.#select.value = initial;
    this.#buildTabs();
    this.#draw();
  }

  get picked(): string {
    return this.#picked;
  }

  get variant(): WheelType {
    const v = this.#select?.value ?? 'act';
    return isWheelType(v) ? v : 'act';
  }

  setPicked(id: string): void {
    this.#picked = id || '';
    this.#draw();
  }

  setVariant(variant: string): void {
    this.#setVariantValue(variant);
    this.#buildTabs();
    this.#draw();
  }

  #setVariantValue(variant: string): void {
    if (this.#select) this.#select.value = isWheelType(variant) ? variant : 'act';
  }

  #select_(emId: string): void {
    this.#picked = this.#picked === emId ? '' : emId;
    this.#draw();
  }

  #buildTabs(): void {
    if (!this.#tabs) return;
    const cur = this.variant;
    this.#tabs.innerHTML = '';
    for (const key of VARIANTS) {
      const config = wheels[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pill pill--sm wheel-pill${key === cur ? ' is-active' : ''}`;
      btn.setAttribute('data-wheel', key);
      btn.textContent = t(config.labelKey) || key;
      this.#tabs.appendChild(btn);
    }
  }

  #draw(): void {
    if (!this.#svg) return;
    const config: Wheel = wheels[this.variant];
    const { emotions, colors } = config;
    const n = emotions.length;
    const frag = document.createDocumentFragment();
    this.#svg.innerHTML = '';
    const offset = -Math.PI / 2;

    for (let i = 0; i < n; i++) {
      const emInfo = emotions[i];
      if (!emInfo) continue;
      const a0 = offset + (i * 2 * Math.PI) / n;
      const a1 = offset + ((i + 1) * 2 * Math.PI) / n;
      const mid = (a0 + a1) / 2;
      const emId = emInfo.id;
      const label = t(emInfo.tKey) || emId;
      const selected = this.#picked === emId;

      frag.appendChild(
        svgEl('path', {
          d: ringPath(a0, a1, RI, RO),
          fill: colors[i % colors.length] ?? '#cccccc',
          class: `emotion-segment${selected ? ' is-selected' : ''}`,
          'data-em': emId,
          'data-index': i,
          'data-total': n,
          role: 'button',
          tabindex: '0',
          'aria-label': label,
        }),
      );

      const lp = polar(LABEL_R, mid);
      const cos = Math.cos(mid);
      const anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
      const text = svgEl('text', {
        x: lp.x.toFixed(1),
        y: lp.y.toFixed(1),
        class: `wheel-ext-label${selected ? ' is-selected' : ''}`,
        'text-anchor': anchor,
        'dominant-baseline': 'middle',
      });
      text.textContent = label;
      frag.appendChild(text);
    }

    frag.appendChild(
      svgEl('circle', { cx: CENTER, cy: CENTER, r: RI - 4, class: 'wheel-center-disc' }),
    );

    if (this.#picked) {
      const sub = svgEl('text', {
        x: CENTER,
        y: CENTER - 11,
        class: 'wheel-center-sub',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      });
      sub.textContent = (t(config.labelKey) || '').toUpperCase();
      frag.appendChild(sub);
      const main = svgEl('text', {
        x: CENTER,
        y: CENTER + 9,
        class: 'wheel-center-main',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      });
      main.textContent = emotionLabel(this.#picked);
      frag.appendChild(main);
    } else {
      const hint = svgEl('text', {
        x: CENTER,
        y: CENTER,
        class: 'wheel-center-empty',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      });
      hint.textContent = t('pickWheel') || '';
      frag.appendChild(hint);
    }

    this.#svg.classList.toggle('has-selection', Boolean(this.#picked));
    this.#svg.appendChild(frag);
    this.#updateDisplay();
  }

  #updateDisplay(): void {
    if (!this.#display) return;
    if (!this.#picked) {
      this.#display.textContent = t('emotionNone');
      this.#display.classList.add('is-empty');
      return;
    }
    this.#display.classList.remove('is-empty');
    this.#display.textContent = emotionLabel(this.#picked);
  }
}
