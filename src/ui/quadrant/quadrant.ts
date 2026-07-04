// Change-quadrant view (ACT matrix): four editable free-text lists on the
// internal/external × away-from/towards axes around the compass hub, which
// holds the values everything is oriented on. Items are added via the
// per-panel input, edited inline (click the text), struck through as overcome
// (✓), dragged to another panel by their direction dot, and removed with ✕.
// All mutations go through store.saveQuadrant.
import { QUADRANT_KEYS, type Quadrant, type QuadrantKey } from '../../core/quadrant';
import { lang, t } from '../../i18n';
import type { Store } from '../../state/store';
import { Component } from '../common/component';

export class QuadrantController extends Component {
  readonly #store: Store;
  #drag: { key: QuadrantKey; index: number } | null = null;

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
      const valueAdd = target.closest('.quadrant-value-add-btn');
      if (valueAdd) {
        this.#addValue();
        return;
      }
      const valueDel = target.closest('.quadrant-value-del');
      if (valueDel) {
        this.#removeValue(Number.parseInt(valueDel.getAttribute('data-qvi') ?? '', 10));
        return;
      }
      const done = target.closest('.quadrant-item-done');
      if (done) {
        const pos = this.#itemPosition(done);
        if (pos) this.#toggleDone(pos.key, pos.index);
        return;
      }
      const del = target.closest('.quadrant-item-del');
      if (del) {
        const pos = this.#itemPosition(del);
        if (pos) this.#removeItem(pos.key, pos.index);
        return;
      }
      const text = target.closest('.quadrant-item-text');
      if (text) this.#startEdit(text as HTMLElement);
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const target = e.target as Element;
      const input = target.closest('[data-qinput]');
      if (input) {
        e.preventDefault();
        this.#addFromInput(input.getAttribute('data-qinput') as QuadrantKey);
        return;
      }
      if (target.closest('.quadrant-value-input')) {
        e.preventDefault();
        this.#addValue();
      }
    });

    // Drag an item (by its direction dot) onto another panel to move it there.
    // Pointer events instead of HTML5 drag & drop: they also work on touch
    // and are deterministic under test automation.
    grid.addEventListener('pointerdown', (e) => {
      const handle = (e.target as Element).closest('.quadrant-item-grab');
      const pos = handle && this.#itemPosition(handle);
      if (!handle || !pos) return;
      e.preventDefault(); // no text selection while dragging
      this.#drag = pos;
      (handle as HTMLElement).setPointerCapture(e.pointerId);
      handle.closest('[data-qi]')?.classList.add('is-dragging');
    });
    grid.addEventListener('pointermove', (e) => {
      if (!this.#drag) return;
      // Auto-scroll near the viewport edges so off-screen panels are reachable.
      const scroller = document.querySelector('.app-scroll');
      if (scroller) {
        if (e.clientY < 130) scroller.scrollBy(0, -14);
        else if (e.clientY > window.innerHeight - 130) scroller.scrollBy(0, 14);
      }
      const panel = this.#panelAt(e.clientX, e.clientY);
      for (const el of grid.querySelectorAll('.is-drop-target')) {
        if (el !== panel) el.classList.remove('is-drop-target');
      }
      if (panel && panel.getAttribute('data-qpanel') !== this.#drag.key) {
        panel.classList.add('is-drop-target');
      }
    });
    grid.addEventListener('pointerup', (e) => {
      if (!this.#drag) return;
      const panel = this.#panelAt(e.clientX, e.clientY);
      const to = panel?.getAttribute('data-qpanel') as QuadrantKey | null;
      const from = this.#drag;
      this.#drag = null;
      if (to && to !== from.key) {
        this.#moveItem(from, to); // saveQuadrant triggers a full re-render
      } else {
        this.render(); // clear drag styling
      }
    });
    grid.addEventListener('pointercancel', () => {
      if (!this.#drag) return;
      this.#drag = null;
      this.render();
    });
  }

  /** The quadrant panel under a viewport point (drag hit-testing). */
  #panelAt(x: number, y: number): Element | null {
    return document.elementFromPoint(x, y)?.closest('[data-qpanel]') ?? null;
  }

  /** Resolve which panel/index an element inside a rendered item belongs to. */
  #itemPosition(el: Element): { key: QuadrantKey; index: number } | null {
    const item = el.closest('[data-qi]');
    const list = el.closest('[data-qlist]');
    if (!item || !list) return null;
    const index = Number.parseInt(item.getAttribute('data-qi') ?? '', 10);
    if (Number.isNaN(index)) return null;
    return { key: list.getAttribute('data-qlist') as QuadrantKey, index };
  }

  #addFromInput(key: QuadrantKey): void {
    const input = document.querySelector<HTMLInputElement>(`[data-qinput="${key}"]`);
    const value = input?.value.trim();
    if (!input || !value) return;
    const cur = this.#store.quadrant.get();
    this.#store.saveQuadrant({ ...cur, [key]: [...cur[key], { text: value, done: false }] });
    input.value = '';
    input.focus();
  }

  #removeItem(key: QuadrantKey, index: number): void {
    const cur = this.#store.quadrant.get();
    if (!cur[key][index]) return;
    this.#store.saveQuadrant({ ...cur, [key]: cur[key].filter((_, i) => i !== index) });
  }

  #toggleDone(key: QuadrantKey, index: number): void {
    const cur = this.#store.quadrant.get();
    if (!cur[key][index]) return;
    const next = cur[key].map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    this.#store.saveQuadrant({ ...cur, [key]: next });
  }

  #moveItem(from: { key: QuadrantKey; index: number }, to: QuadrantKey): void {
    const cur = this.#store.quadrant.get();
    const item = cur[from.key][from.index];
    if (!item || from.key === to) return;
    this.#store.saveQuadrant({
      ...cur,
      [from.key]: cur[from.key].filter((_, i) => i !== from.index),
      [to]: [...cur[to], item],
    });
  }

  #updateItem(key: QuadrantKey, index: number, value: string): void {
    const cur = this.#store.quadrant.get();
    const item = cur[key][index];
    if (!item) return;
    const trimmed = value.trim();
    const next = trimmed
      ? cur[key].map((it, i) => (i === index ? { ...it, text: trimmed } : it))
      : cur[key].filter((_, i) => i !== index); // emptied → remove
    this.#store.saveQuadrant({ ...cur, [key]: next });
  }

  #addValue(): void {
    const input = document.querySelector<HTMLInputElement>('.quadrant-value-input');
    const value = input?.value.trim();
    if (!input || !value) return;
    const cur = this.#store.quadrant.get();
    this.#store.saveQuadrant({ ...cur, values: [...cur.values, value] });
    // render() rebuilt the chips; put focus back into the fresh input.
    document.querySelector<HTMLInputElement>('.quadrant-value-input')?.focus();
  }

  #removeValue(index: number): void {
    const cur = this.#store.quadrant.get();
    if (Number.isNaN(index) || cur.values[index] === undefined) return;
    this.#store.saveQuadrant({ ...cur, values: cur.values.filter((_, i) => i !== index) });
  }

  /** Swap the item's text for an input; Enter/blur commits, Escape cancels. */
  #startEdit(textEl: HTMLElement): void {
    const pos = this.#itemPosition(textEl);
    if (!pos || textEl.closest('[data-qi]')?.querySelector('input')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'quadrant-item-edit';
    input.value = textEl.textContent ?? '';
    let done = false;
    const commit = (): void => {
      if (done) return;
      done = true;
      this.#updateItem(pos.key, pos.index, input.value);
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
    this.#renderValues(data.values);
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
      data[key].forEach((item, i) => {
        const li = document.createElement('li');
        li.className = `quadrant-item${item.done ? ' is-done' : ''}`;
        li.setAttribute('data-qi', String(i));
        const grab = document.createElement('span');
        grab.className = 'quadrant-item-grab';
        grab.setAttribute('aria-hidden', 'true');
        const span = document.createElement('span');
        span.className = 'quadrant-item-text';
        span.setAttribute('title', t('ariaQuadrantEdit'));
        span.textContent = item.text;
        const done = document.createElement('button');
        done.type = 'button';
        done.className = 'quadrant-item-done';
        done.setAttribute('aria-label', t('ariaQuadrantDone'));
        done.setAttribute('aria-pressed', String(item.done));
        done.textContent = '✓';
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'quadrant-item-del';
        del.setAttribute('aria-label', t('ariaRemove'));
        del.textContent = '✕';
        li.append(grab, span, done, del);
        list.appendChild(li);
      });
    }
  }

  /** Compass hub: one removable chip per value + the add pill. */
  #renderValues(values: string[]): void {
    const slot = document.getElementById('quadrant-values');
    if (!slot) return;
    slot.innerHTML = '';
    values.forEach((value, i) => {
      const chip = document.createElement('span');
      chip.className = 'quadrant-value-chip';
      chip.appendChild(document.createTextNode(value));
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'quadrant-value-del';
      del.setAttribute('data-qvi', String(i));
      del.setAttribute('aria-label', t('ariaRemove'));
      del.textContent = '✕';
      chip.appendChild(del);
      slot.appendChild(chip);
    });
    const add = document.createElement('span');
    add.className = 'quadrant-value-add';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'quadrant-value-input';
    input.setAttribute('placeholder', t('quadrantValuePh'));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quadrant-value-add-btn';
    btn.setAttribute('aria-label', t('ariaQuadrantValueAdd'));
    btn.textContent = '+';
    add.append(input, btn);
    slot.appendChild(add);
  }
}
