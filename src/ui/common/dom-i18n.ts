import { t } from '../../i18n';

/** Apply translations to all data-t* attributes within a root (default: document). */
export function applyTranslations(root: ParentNode = document): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-t]')) {
    const key = el.getAttribute('data-t');
    if (key) el.textContent = t(key);
  }
  for (const el of root.querySelectorAll<HTMLInputElement>('[data-t-placeholder]')) {
    const key = el.getAttribute('data-t-placeholder');
    if (key) el.placeholder = t(key);
  }
  for (const el of root.querySelectorAll<HTMLElement>('[data-t-aria]')) {
    const key = el.getAttribute('data-t-aria');
    if (key) el.setAttribute('aria-label', t(key));
  }
  for (const el of root.querySelectorAll<HTMLElement>('[data-t-title]')) {
    const key = el.getAttribute('data-t-title');
    if (key) el.setAttribute('title', t(key));
  }
}
