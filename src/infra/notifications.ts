// Thin wrapper around the Web Notifications API. Notifications require a secure
// context, so they are unavailable on file:// — callers must degrade gracefully.

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  return Notification.requestPermission();
}

/** Show a notification if permission is granted; auto-closes after 10s. No-op otherwise. */
export function showNotification(title: string, body: string, tag = 'mci-reminder'): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  try {
    const notification = new Notification(title, { body, icon: 'favicon.svg', tag });
    setTimeout(() => {
      try {
        notification.close();
      } catch {
        /* ignore */
      }
    }, 10_000);
  } catch {
    /* ignore NotAllowedError etc. */
  }
}
