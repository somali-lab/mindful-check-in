import { type Repository, STORAGE_KEYS } from '../../infra/storage';

const ROUTES = ['home', 'checkin', 'overview', 'settings', 'info'] as const;
type Route = (typeof ROUTES)[number];
const DEFAULT_ROUTE: Route = 'home';

function parseRoute(hash: string): Route {
  const name = hash.replace(/^#/, '');
  return (ROUTES as readonly string[]).includes(name) ? (name as Route) : DEFAULT_ROUTE;
}

/** Hash-based router: toggles `.is-active` on `[data-route]` buttons and `.view` panels. */
export function initRouter(repo: Repository): void {
  const apply = (route: Route): void => {
    for (const btn of document.querySelectorAll<HTMLElement>('[data-route]')) {
      btn.classList.toggle('is-active', btn.getAttribute('data-route') === route);
    }
    for (const view of document.querySelectorAll<HTMLElement>('.view')) {
      view.classList.toggle('is-active', view.id === `view-${route}`);
    }
    // The footer-bar visibility is driven by CSS keyed on this attribute.
    document.body.setAttribute('data-active-route', route);
    repo.write(STORAGE_KEYS.activeTab, route);
  };

  apply(parseRoute(location.hash));
  window.addEventListener('hashchange', () => apply(parseRoute(location.hash)));

  for (const btn of document.querySelectorAll<HTMLElement>('[data-route]')) {
    btn.addEventListener('click', () => {
      const route = btn.getAttribute('data-route');
      if (route) location.hash = route;
    });
  }
}
