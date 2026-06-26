import './styles.css';
import { LocalStorageRepository } from './infra/storage';
import { WeatherService } from './infra/weather';
import { Store } from './state/store';
import { exposeBridge } from './ui/bridge';
import { CheckinController } from './ui/checkin/checkin';
import { HomeController } from './ui/home/home';
import { InfoController } from './ui/info/info';
import { initLanguage } from './ui/language';
import { OverviewController } from './ui/overview/overview';
import { ReminderController } from './ui/reminders';
import { initRouter } from './ui/router';
import { SettingsController } from './ui/settings/settings';
import { initTheme } from './ui/theme';
import { WeatherComponent } from './ui/weather';

// Composition root: build the repository + store, then wire the shell.
const repo = new LocalStorageRepository();
const store = new Store(repo);
const weatherService = new WeatherService(repo);

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

exposeBridge(store);
