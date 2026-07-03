// Small shared UI helpers, extracted to remove the duplication that had spread
// across the view components.
import { scoreTier } from '../../core/scoring';
import type { WeekDay } from '../../core/stats';

/** Set an element's text content by id (no-op if absent). */
export function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Read a form field's value by id ('' if absent). */
export function fieldValue(id: string): string {
  const el = document.getElementById(id) as FormField | null;
  return el ? el.value : '';
}

/** Set a form field's value by id (no-op if absent). */
export function setFieldValue(id: string, value: string | number | undefined): void {
  const el = document.getElementById(id) as FormField | null;
  if (el) el.value = value === undefined ? '' : String(value);
}

/** Read a form field as a base-10 integer, falling back when absent or non-numeric. */
export function intFieldValue(id: string, fallback: number): number {
  const n = Number.parseInt(fieldValue(id), 10);
  return Number.isNaN(n) ? fallback : n;
}

/** Read a checkbox's checked state by id (false if absent). */
export function fieldChecked(id: string): boolean {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? el.checked : false;
}

/** Set a checkbox's checked state by id (no-op if absent). */
export function setFieldChecked(id: string, value: boolean): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.checked = value;
}

/** Trigger a client-side JSON file download. */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Read + parse a JSON file; rejects on read error or invalid JSON. */
export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsText(file);
  });
}

/**
 * Wire a settings/info card's vertical sub-tabs: clicking a `[data-settings-tab]`
 * toggles `.is-active` on the matching `.settings-tab` and `.settings-panel`
 * within the same `.settings-card`. Used by both the settings and info views.
 */
export function wireSubTabs(rootSelector: string): void {
  const nav = document.querySelector(`${rootSelector} .settings-nav`);
  nav?.addEventListener('click', (e) => {
    const tab = (e.target as Element).closest('[data-settings-tab]');
    const card = tab?.closest('.settings-card');
    if (!tab || !card) return;
    const key = tab.getAttribute('data-settings-tab');
    for (const el of card.querySelectorAll('.settings-tab')) {
      el.classList.toggle('is-active', el.getAttribute('data-settings-tab') === key);
    }
    for (const el of card.querySelectorAll('.settings-panel')) {
      el.classList.toggle('is-active', el.getAttribute('data-settings-panel') === key);
    }
  });
}

export interface RemovableTagOpts {
  tagClass: string;
  delClass: string;
  removeAttr: string;
  removeLabel: string;
}

/** Render a list of removable tags (label + ✕ button) into a slot (clears it first). */
export function renderRemovableTags(
  slot: HTMLElement,
  items: string[],
  opts: RemovableTagOpts,
): void {
  slot.innerHTML = '';
  items.forEach((item, i) => {
    const tag = document.createElement('span');
    tag.className = opts.tagClass;
    tag.appendChild(document.createTextNode(item));
    const del = document.createElement('button');
    del.type = 'button';
    del.className = opts.delClass;
    del.setAttribute(opts.removeAttr, String(i));
    del.setAttribute('aria-label', opts.removeLabel);
    del.textContent = '✕';
    tag.appendChild(del);
    slot.appendChild(tag);
  });
}

/** Render the 7-day mood heat strip (shared by the home view and the summary panel). */
export function renderWeekStrip(el: HTMLElement, days: WeekDay[], lang: 'en' | 'nl'): void {
  const locale = lang === 'nl' ? 'nl-NL' : 'en-US';
  el.innerHTML = '';
  for (const day of days) {
    const cell = document.createElement('div');
    cell.className = `heat-day${day.isToday ? ' heat-today' : ''}`;
    const dot = document.createElement('div');
    dot.className = `heat-dot ${day.score === 0 ? 'heat-empty' : `heat-${scoreTier(day.score)}`}`;
    const label = document.createElement('span');
    label.className = 'heat-label';
    label.textContent = day.date.toLocaleDateString(locale, { weekday: 'short' });
    cell.append(dot, label);
    el.appendChild(cell);
  }
}
