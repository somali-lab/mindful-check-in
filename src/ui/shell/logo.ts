import type { Store } from '../../state/store';

/** Reflect the chosen brand logo on <body data-logo>; CSS swaps the header mark. */
export function initLogo(store: Store): void {
  const apply = (logo: string): void => {
    document.body.setAttribute('data-logo', logo);
  };

  apply(store.settings.get().logo);
  store.settings.subscribe((s) => apply(s.logo));
}
