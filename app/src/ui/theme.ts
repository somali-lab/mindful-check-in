import type { ThemeChoice } from '../core/settings';
import type { Store } from '../state/store';

/** Apply the theme to <html data-theme>, reflect the active button, and persist picks. */
export function initTheme(store: Store): void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const resolve = (choice: ThemeChoice): 'light' | 'dark' =>
    choice === 'system' ? (media.matches ? 'dark' : 'light') : choice;

  const apply = (choice: ThemeChoice): void => {
    document.documentElement.setAttribute('data-theme', resolve(choice));
    for (const btn of document.querySelectorAll<HTMLElement>('[data-theme-pick]')) {
      btn.classList.toggle('is-selected', btn.getAttribute('data-theme-pick') === choice);
    }
  };

  apply(store.settings.get().theme);
  store.settings.subscribe((s) => apply(s.theme));
  media.addEventListener('change', () => {
    if (store.settings.get().theme === 'system') apply('system');
  });

  for (const btn of document.querySelectorAll<HTMLElement>('[data-theme-pick]')) {
    btn.addEventListener('click', () => {
      const pick = btn.getAttribute('data-theme-pick') as ThemeChoice | null;
      if (pick) store.saveSettings({ ...store.settings.get(), theme: pick });
    });
  }
}
