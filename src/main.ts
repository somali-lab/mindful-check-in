import './styles.css';
import { t } from './i18n';
import { LocalStorageRepository } from './infra/storage';
import { WeatherService } from './infra/weather';
import { Store } from './state/store';
import { CheckinController } from './ui/checkin/checkin';
import { setToastDuration, showToast } from './ui/common/toast';
import { HomeController } from './ui/home/home';
import { WeatherComponent } from './ui/home/weather';
import { InfoController } from './ui/info/info';
import { OverviewController } from './ui/overview/overview';
import { SettingsController } from './ui/settings/settings';
import { initLanguage } from './ui/shell/language';
import { ReminderController } from './ui/shell/reminders';
import { initRouter } from './ui/shell/router';
import { initTheme } from './ui/shell/theme';

// Composition root: build the repository + store, then wire the shell.
const repo = new LocalStorageRepository();
const store = new Store(repo);
const weatherService = new WeatherService(repo);

// Toast lifetime follows the user's setting; a failed persist surfaces a warning.
setToastDuration(store.settings.get().toastDuration);
store.settings.subscribe((s) => setToastDuration(s.toastDuration));
store.persistError.subscribe((failed) => {
  if (failed) showToast(t('storageWriteError'), 'warning');
});

initLanguage(repo);
initTheme(store);
initRouter(repo);

// Weather widget lives on the home view; its reading feeds the check-in save.
if (document.getElementById('weather-slot')) {
  new WeatherComponent(store, weatherService);
}

if (document.getElementById('view-checkin')) {
  new CheckinController(store, weatherService);
}

if (document.getElementById('view-home')) {
  new HomeController(store);
}

if (document.getElementById('view-overview')) {
  new OverviewController(store, repo);
}

if (document.getElementById('view-settings')) {
  new SettingsController(store);
  new ReminderController(store);
}

if (document.getElementById('view-info')) {
  new InfoController(store, repo);
}
