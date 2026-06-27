// Break-reminders controller: applies the reminder settings, runs the interval
// scheduler (fires a Web Notification when inside the active window), and wires
// the "send test notification" button. Notifications need a secure context, so
// the whole panel hides when the API is unavailable (e.g. file://).
import { isWithinReminderWindow, type ReminderWindow } from '../../core/reminders';
import type { Settings } from '../../core/settings';
import { t } from '../../i18n';
import {
  notificationsSupported,
  requestNotificationPermission,
  showNotification,
} from '../../infra/notifications';
import type { Store } from '../../state/store';
import { showToast } from '../common/toast';

export class ReminderController {
  #timer: ReturnType<typeof setInterval> | null = null;
  #enabled = false;
  #intervalMs = 120 * 60 * 1000;
  #window: ReminderWindow = { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 18 };
  #customTitle = '';
  #customBody = '';

  constructor(store: Store) {
    if (!notificationsSupported()) {
      const section = document.getElementById('reminder-section');
      if (section) section.style.display = 'none';
      return;
    }

    document.getElementById('cfg-reminder-test')?.addEventListener('click', () => this.#test());

    this.#apply(store.settings.get());
    store.settings.subscribe((s) => this.#apply(s));
  }

  #apply(s: Settings): void {
    this.#enabled = s.reminderEnabled === true;
    this.#intervalMs = (s.reminderInterval > 0 ? s.reminderInterval : 120) * 60 * 1000;
    this.#window = {
      days: Array.isArray(s.reminderDays) ? s.reminderDays : [1, 2, 3, 4, 5],
      startHour: Number.isNaN(s.reminderStartHour) ? 8 : s.reminderStartHour,
      endHour: Number.isNaN(s.reminderEndHour) ? 18 : s.reminderEndHour,
    };
    this.#customTitle = s.reminderCustomTitle || '';
    this.#customBody = s.reminderCustomBody || '';
    if (this.#enabled) this.#start();
    else this.#stop();
  }

  #stop(): void {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  #start(): void {
    this.#stop();
    if (!this.#enabled || !notificationsSupported()) return;
    this.#withPermission(() => {
      this.#timer = setInterval(() => this.#tick(), this.#intervalMs);
    });
  }

  #tick(): void {
    if (!isWithinReminderWindow(new Date(), this.#window)) return;
    showNotification(this.#title(), this.#body(), 'mci-reminder');
  }

  #test(): void {
    if (!notificationsSupported()) return;
    this.#withPermission(() => {
      // Unique tag so the OS never suppresses the test as a duplicate.
      showNotification(this.#title(), this.#body(), `mci-reminder-test-${Date.now()}`);
    });
  }

  /** Run `onGranted` if notifications are permitted, requesting permission first; else warn. */
  #withPermission(onGranted: () => void): void {
    if (Notification.permission === 'granted') {
      onGranted();
      return;
    }
    if (Notification.permission === 'denied') {
      showToast(t('reminderNotifDenied') || 'Notifications are blocked.', 'warning');
      return;
    }
    void requestNotificationPermission().then((perm) => {
      if (perm === 'granted') onGranted();
      else showToast(t('reminderNotifDenied') || 'Notifications are blocked.', 'warning');
    });
  }

  #title(): string {
    return this.#customTitle.trim() || t('reminderNotifTitle') || 'Time for a break';
  }

  #body(): string {
    return this.#customBody.trim() || t('reminderNotifBody') || 'Take a moment for yourself.';
  }
}
