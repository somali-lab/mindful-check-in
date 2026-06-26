// Check-in chip editors: quick-action pills (#ci-chips) and custom-feeling tags
// (#ci-feel-chips). Both back onto comma-separated textarea fields (#fld-action /
// #fld-custom) which the orchestrator collects. The action pills start from the
// configured quick actions plus anything already selected; tapping toggles it.
// Custom-feeling tags mirror the field, each removable. Both rows offer an inline
// "+ add" input (Enter/blur commits, Escape cancels).
import { lang, t } from '../../i18n';
import type { Store } from '../../state/store';

function fieldList(id: string): string[] {
  const f = document.getElementById(id) as HTMLTextAreaElement | null;
  if (!f?.value.trim()) return [];
  return f.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function setFieldList(id: string, arr: string[]): void {
  const f = document.getElementById(id) as HTMLTextAreaElement | null;
  if (f) f.value = arr.join(', ');
}

function startInlineAdd(
  addBtn: Element,
  placeholder: string,
  onCommit: (value: string) => void,
  rebuild: () => void,
): void {
  const wrap = document.createElement('span');
  wrap.className = 'ci-act-add ci-act-add--editing';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'ci-act-input';
  input.placeholder = placeholder;
  wrap.appendChild(input);
  addBtn.replaceWith(wrap);
  input.focus();
  let done = false;
  const commit = (keep: boolean): void => {
    if (done) return;
    done = true;
    if (keep) {
      const v = input.value.trim();
      if (v) onCommit(v);
    }
    rebuild();
  };
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      commit(true);
    } else if (ev.key === 'Escape') {
      commit(false);
    }
  });
  input.addEventListener('blur', () => commit(true));
}

export class ChipsComponent {
  readonly #store: Store;

  constructor(store: Store) {
    this.#store = store;
    document.getElementById('ci-chips')?.addEventListener('click', (e) => this.#onActionClick(e));
    document
      .getElementById('ci-feel-chips')
      ?.addEventListener('click', (e) => this.#onFeelClick(e));

    store.settings.subscribe(() => this.#buildActions());
    lang.subscribe(() => this.refresh());
    this.refresh();
  }

  /** Rebuild both rows from the backing fields — called after load/clear. */
  refresh(): void {
    this.#buildActions();
    this.#buildFeel();
  }

  #buildActions(): void {
    const slot = document.getElementById('ci-chips');
    if (!slot) return;
    const base = this.#store.settings.get().quickActions || [];
    const sel = fieldList('fld-action');
    const all = [...base];
    for (const s of sel) if (!all.includes(s)) all.push(s);

    slot.innerHTML = '';
    for (const act of all) {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `pill ci-act-pill${sel.includes(act) ? ' is-on' : ''}`;
      pill.setAttribute('data-act', act);
      pill.textContent = act;
      slot.appendChild(pill);
    }
    slot.appendChild(this.#addButton('data-add', t('ciAddAction') || 'Add your own'));
  }

  #onActionClick(e: MouseEvent): void {
    const add = (e.target as Element).closest('[data-add]');
    if (add) {
      startInlineAdd(
        add,
        t('ciAddAction') || 'Add your own',
        (v) => {
          const sel = fieldList('fld-action');
          if (!sel.includes(v)) sel.push(v);
          setFieldList('fld-action', sel);
        },
        () => this.#buildActions(),
      );
      return;
    }
    const chip = (e.target as Element).closest('[data-act]');
    if (!chip) return;
    const act = chip.getAttribute('data-act') ?? '';
    const sel = fieldList('fld-action');
    const idx = sel.indexOf(act);
    if (idx === -1) sel.push(act);
    else sel.splice(idx, 1);
    setFieldList('fld-action', sel);
    this.#buildActions();
  }

  #buildFeel(): void {
    const slot = document.getElementById('ci-feel-chips');
    if (!slot) return;
    const list = fieldList('fld-custom');
    slot.innerHTML = '';
    list.forEach((feel, i) => {
      const tag = document.createElement('span');
      tag.className = 'tag ci-chip';
      tag.setAttribute('data-feel', String(i));
      tag.appendChild(document.createTextNode(feel));
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'tag-x';
      x.setAttribute('data-felrm', String(i));
      x.setAttribute('aria-label', t('ariaRemove') || 'Remove');
      x.textContent = '×';
      tag.appendChild(x);
      slot.appendChild(tag);
    });
    slot.appendChild(this.#addButton('data-feladd', t('ciAddFeeling') || 'Own feeling'));
  }

  #onFeelClick(e: MouseEvent): void {
    const add = (e.target as Element).closest('[data-feladd]');
    if (add) {
      startInlineAdd(
        add,
        t('ciAddFeeling') || 'Own feeling',
        (v) => {
          const l = fieldList('fld-custom');
          l.push(v);
          setFieldList('fld-custom', l);
        },
        () => this.#buildFeel(),
      );
      return;
    }
    const rm = (e.target as Element).closest('[data-felrm]');
    if (rm) {
      const idx = Number.parseInt(rm.getAttribute('data-felrm') ?? '', 10);
      const l = fieldList('fld-custom');
      l.splice(idx, 1);
      setFieldList('fld-custom', l);
      this.#buildFeel();
    }
  }

  #addButton(attr: string, label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ci-act-add';
    btn.setAttribute(attr, '1');
    btn.textContent = `+ ${label}`;
    return btn;
  }
}
