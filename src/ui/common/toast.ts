// Transient toast notifications, rendered into the shell's #toast-container.
// Mirrors the original MCI.banner DOM (.toast--success / .toast--warning) so the
// existing Playwright selectors keep working.
const ENTER_DELAY_MS = 10; // let the element paint before the enter transition
const EXIT_TRANSITION_MS = 300; // must match the CSS toast--exit transition
const DEFAULT_DURATION_MS = 2600;

let durationMs = DEFAULT_DURATION_MS;

/** Set the on-screen lifetime from the user's `toastDuration` setting (seconds). */
export function setToastDuration(seconds: number): void {
  durationMs = seconds > 0 ? seconds * 1000 : DEFAULT_DURATION_MS;
}

export function showToast(message: string, type: 'success' | 'warning' = 'success'): void {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('toast--visible'), ENTER_DELAY_MS);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), EXIT_TRANSITION_MS);
  }, durationMs);
}
