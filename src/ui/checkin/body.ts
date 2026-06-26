// Body signals — interactive body figure where each zone cycles through
// intensity levels (0 → 1 → 2 → 3 → 0) on tap. Self-contained: the orchestrator
// reads selected zones via getZones() and restores them via setZones().
import { bodyZones, zoneKeys } from '../../data/static';
import { lang, t } from '../../i18n';

export class BodyComponent {
  readonly #svg: HTMLElement | null;
  readonly #display: HTMLElement | null;
  #levels: Record<string, number> = {};

  constructor() {
    this.#svg = document.getElementById('body-svg');
    this.#display = document.getElementById('body-display');
    if (!this.#svg) return;

    this.#svg.addEventListener('click', (e) => {
      const part = (e.target as Element).closest('[data-zone]');
      if (part) this.#toggle(part.getAttribute('data-zone') ?? '');
    });

    document.getElementById('bdy-btn-reset')?.addEventListener('click', () => {
      this.#levels = {};
      this.#repaint();
      const note = document.getElementById('fld-body-note') as HTMLTextAreaElement | null;
      if (note) note.value = '';
    });

    lang.subscribe(() => this.#showDisplay());
    this.#repaint();
  }

  getZones(): string[] {
    return bodyZones.filter((z) => this.#levels[z]);
  }

  setZones(zones: string[]): void {
    this.#levels = {};
    // Persisted entries store zone ids only — restore at medium intensity.
    for (const z of zones) this.#levels[z] = 2;
    this.#repaint();
  }

  #toggle(zoneId: string): void {
    if (!zoneId) return;
    const next = ((this.#levels[zoneId] || 0) + 1) % 4;
    if (next === 0) delete this.#levels[zoneId];
    else this.#levels[zoneId] = next;
    this.#repaint();
  }

  #repaint(): void {
    if (!this.#svg) return;
    for (const part of this.#svg.querySelectorAll<SVGElement>('[data-zone]')) {
      const level = this.#levels[part.getAttribute('data-zone') ?? ''] || 0;
      part.classList.toggle('is-on', level > 0);
      part.classList.toggle('lvl-1', level === 1);
      part.classList.toggle('lvl-2', level === 2);
      part.classList.toggle('lvl-3', level === 3);
    }
    this.#showDisplay();
  }

  #showDisplay(): void {
    if (!this.#display) return;
    const list = this.getZones();
    this.#display.innerHTML = '';
    if (list.length === 0) {
      this.#display.textContent = t('bodyNone');
      this.#display.classList.add('is-empty');
      return;
    }
    this.#display.classList.remove('is-empty');
    for (const id of list) {
      const level = this.#levels[id] || 2;
      const key = zoneKeys[id];
      const sig = document.createElement('span');
      sig.className = 'body-sig';
      const dot = document.createElement('span');
      dot.className = `body-sig-dot lvl-${level}`;
      sig.appendChild(dot);
      sig.appendChild(document.createTextNode(key ? t(key) : id));
      this.#display.appendChild(sig);
    }
  }
}
