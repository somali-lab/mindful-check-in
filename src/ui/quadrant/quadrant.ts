// Change-quadrant view: four editable free-text lists on the internal/external
// × away-from/towards axes. Items are added via the per-panel input, edited
// inline (click the text), and removed with the ✕ button. All mutations go
// through store.saveQuadrant.
import { QUADRANT_KEYS, type Quadrant, type QuadrantKey } from '../../core/quadrant';
import { lang, t } from '../../i18n';
import type { Store } from '../../state/store';
import { Component } from '../common/component';

export class QuadrantController extends Component {
  readonly #store: Store;

  constructor(store: Store) {
    super();
    this.#store = store;
    this.#wire();
    this.listen(this.#store.quadrant, () => this.render());
    this.listen(lang, () => this.render());
    this.render();
  }

  #wire(): void {
    const grid = document.getElementById('quadrant-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const target = e.target as Element;
      const add = target.closest('[data-qadd]');
      if (add) {
        this.#addFromInput(add.getAttribute('data-qadd') as QuadrantKey);
        return;
      }
      const del = target.closest('.quadrant-item-del');
      if (del) {
        const item = del.closest('[data-qi]');
        const list = del.closest('[data-qlist]');
        if (item && list) {
          this.#removeItem(
            list.getAttribute('data-qlist') as QuadrantKey,
            Number.parseInt(item.getAttribute('data-qi') ?? '', 10),
          );
        }
        return;
      }
      const text = target.closest('.quadrant-item-text');
      if (text) this.#startEdit(text as HTMLElement);
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const input = (e.target as Element).closest('[data-qinput]');
      if (input) {
        e.preventDefault();
        this.#addFromInput(input.getAttribute('data-qinput') as QuadrantKey);
      }
    });
  }

  #addFromInput(key: QuadrantKey): void {
    const input = document.querySelector<HTMLInputElement>(`[data-qinput="${key}"]`);
    const value = input?.value.trim();
    if (!input || !value) return;
    const cur = this.#store.quadrant.get();
    this.#store.saveQuadrant({ ...cur, [key]: [...cur[key], value] });
    input.value = '';
    input.focus();
  }

  #removeItem(key: QuadrantKey, index: number): void {
    const cur = this.#store.quadrant.get();
    if (Number.isNaN(index) || !cur[key][index]) return;
    const next = cur[key].filter((_, i) => i !== index);
    this.#store.saveQuadrant({ ...cur, [key]: next });
  }

  #updateItem(key: QuadrantKey, index: number, value: string): void {
    const cur = this.#store.quadrant.get();
    if (cur[key][index] === undefined) return;
    const trimmed = value.trim();
    const next = trimmed
      ? cur[key].map((item, i) => (i === index ? trimmed : item))
      : cur[key].filter((_, i) => i !== index); // emptied → remove
    this.#store.saveQuadrant({ ...cur, [key]: next });
  }

  /** Swap the item's text for an input; Enter/blur commits, Escape cancels. */
  #startEdit(textEl: HTMLElement): void {
    const item = textEl.closest('[data-qi]');
    const list = textEl.closest('[data-qlist]');
    if (!item || !list || item.querySelector('input')) return;
    const key = list.getAttribute('data-qlist') as QuadrantKey;
    const index = Number.parseInt(item.getAttribute('data-qi') ?? '', 10);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'quadrant-item-edit';
    input.value = textEl.textContent ?? '';
    let done = false;
    const commit = (): void => {
      if (done) return;
      done = true;
      this.#updateItem(key, index, input.value);
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') {
        done = true;
        this.render();
      }
    });
    input.addEventListener('blur', commit);
    textEl.replaceWith(input);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  protected render(): void {
    const data: Quadrant = this.#store.quadrant.get();
    for (const key of QUADRANT_KEYS) {
      const list = document.querySelector<HTMLElement>(`[data-qlist="${key}"]`);
      if (!list) continue;
      list.innerHTML = '';
      if (data[key].length === 0) {
        const empty = document.createElement('li');
        empty.className = 'quadrant-empty';
        empty.textContent = t('quadrantEmpty');
        list.appendChild(empty);
        continue;
      }
      data[key].forEach((text, i) => {
        const li = document.createElement('li');
        li.className = 'quadrant-item';
        li.setAttribute('data-qi', String(i));
        const span = document.createElement('span');
        span.className = 'quadrant-item-text';
        span.setAttribute('title', t('ariaQuadrantEdit'));
        span.textContent = text;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'quadrant-item-del';
        del.setAttribute('aria-label', t('ariaRemove'));
        del.textContent = '✕';
        li.append(span, del);
        list.appendChild(li);
      });
    }
  }
}
