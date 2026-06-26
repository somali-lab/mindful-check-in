// Pure scheduling logic for break reminders (the Notification side-effects live
// in infra/notifications.ts). Days: 0=Sun … 6=Sat. Active hours are [start, end).

export interface ReminderWindow {
  days: number[];
  startHour: number;
  endHour: number;
}

export function isWithinReminderWindow(now: Date, window: ReminderWindow): boolean {
  const day = now.getDay();
  const hour = now.getHours();
  return window.days.includes(day) && hour >= window.startHour && hour < window.endHour;
}
