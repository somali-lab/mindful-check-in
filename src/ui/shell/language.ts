import { lang, setLang } from '../../i18n';
import type { Store } from '../../state/store';
import { applyTranslations } from '../common/dom-i18n';

function syncButtons(): void {
  const current = lang.get();
  for (const btn of document.querySelectorAll<HTMLElement>('[data-lang-pick]')) {
    const on = btn.getAttribute('data-lang-pick') === current;
    btn.classList.toggle('is-selected', on);
    btn.setAttribute('aria-pressed', String(on));
  }
}

/** Load the persisted language, apply it to the DOM, and wire the EN/NL buttons. */
export function initLanguage(store: Store): void {
  setLang(store.loadLanguage());

  applyTranslations();
  syncButtons();

  lang.subscribe(() => {
    applyTranslations();
    syncButtons();
  });

  for (const btn of document.querySelectorAll<HTMLElement>('[data-lang-pick]')) {
    btn.addEventListener('click', () => {
      const pick = btn.getAttribute('data-lang-pick') === 'nl' ? 'nl' : 'en';
      store.saveLanguage(pick);
      setLang(pick);
    });
  }
}
