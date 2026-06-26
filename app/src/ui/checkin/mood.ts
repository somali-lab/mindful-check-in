// Mood matrix — a 10×10 grid spanning energy (top = high) × valence (right =
// positive). Each cell carries a localized label and a fixed colour; selecting
// one is single-choice (clicking the active cell clears it). Self-contained:
// the orchestrator reads the pick via getSelection() and restores it via
// setSelection().
import { hasLightBackground } from '../../core/color';
import { moodColors, moodLabels } from '../../data/static';
import { lang, t } from '../../i18n';

export interface MoodSelection {
  row: number;
  col: number;
  label: string;
  color: string;
}

export class MoodComponent {
  readonly #slot: HTMLElement | null;
  readonly #display: HTMLElement | null;
  #row = -1;
  #col = -1;

  constructor() {
    this.#slot = document.getElementById('mood-slot');
    this.#display = document.getElementById('mood-display');
    if (!this.#slot) return;

    this.#slot.addEventListener('click', (e) => {
      const cell = (e.target as Element).closest('.mood-cell');
      if (cell) this.#pick(this.#attr(cell, 'data-mr'), this.#attr(cell, 'data-mc'));
    });

    document.getElementById('mood-btn-reset')?.addEventListener('click', () => {
      this.#row = -1;
      this.#col = -1;
      this.#build();
    });

    lang.subscribe(() => this.#build());
    this.#build();
  }

  getSelection(): MoodSelection | null {
    if (this.#row < 0 || this.#col < 0) return null;
    return {
      row: this.#row,
      col: this.#col,
      label: this.#labels()[this.#row]?.[this.#col] ?? '',
      color: moodColors[this.#row]?.[this.#col] ?? '',
    };
  }

  setSelection(row: number, col: number): void {
    this.#row = row != null && row >= 0 ? row : -1;
    this.#col = col != null && col >= 0 ? col : -1;
    this.#build();
  }

  #labels(): string[][] {
    return moodLabels[lang.get()] || moodLabels.en;
  }

  #attr(el: Element, name: string): number {
    return Number.parseInt(el.getAttribute(name) ?? '', 10);
  }

  #pick(row: number, col: number): void {
    if (Number.isNaN(row) || Number.isNaN(col)) return;
    if (this.#row === row && this.#col === col) {
      this.#row = -1;
      this.#col = -1;
    } else {
      this.#row = row;
      this.#col = col;
    }
    this.#build();
  }

  #build(): void {
    if (!this.#slot) return;
    const labels = this.#labels();
    const frag = document.createDocumentFragment();

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const color = moodColors[r]?.[c] ?? '#cccccc';
        const selected = this.#row === r && this.#col === c;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `mood-cell${selected ? ' is-selected' : ''}${
          hasLightBackground(color) ? ' mood-cell--light' : ''
        }`;
        cell.textContent = labels[r]?.[c] ?? '';
        cell.setAttribute('data-mr', String(r));
        cell.setAttribute('data-mc', String(c));
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.style.backgroundColor = color;
        frag.appendChild(cell);
      }
    }

    this.#slot.innerHTML = '';
    this.#slot.appendChild(frag);
    this.#updateDisplay();
  }

  #updateDisplay(): void {
    if (!this.#display) return;
    if (this.#row < 0 || this.#col < 0) {
      this.#display.textContent = t('moodNone');
      this.#display.classList.add('is-empty');
      return;
    }
    this.#display.classList.remove('is-empty');
    this.#display.textContent = t('moodReadout', {
      label: this.#labels()[this.#row]?.[this.#col] ?? '',
      energy: 10 - this.#row,
      valence: this.#col + 1,
    });
  }
}
