import './styles.css';
import { LocalStorageRepository } from './infra/storage';
import { WeatherService } from './infra/weather';
import { Store } from './state/store';
import { exposeBridge } from './ui/bridge';
import { CheckinController } from './ui/checkin/checkin';
import { initLanguage } from './ui/language';
import { OverviewController } from './ui/overview/overview';
import { initRouter } from './ui/router';
import { SettingsController } from './ui/settings/settings';
import { initTheme } from './ui/theme';

// Composition root: build the repository + store, then wire the shell.
const repo = new LocalStorageRepository();
const store = new Store(repo);

initLanguage(repo);
initTheme(store);
initRouter(repo);

if (document.getElementById('view-checkin')) {
  new CheckinController(store, new WeatherService(repo));
}

if (document.getElementById('view-overview')) {
  new OverviewController(store, repo);
}

if (document.getElementById('view-settings')) {
  new SettingsController(store);
}

exposeBridge(store);
