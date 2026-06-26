// Transient toast notifications, rendered into the shell's #toast-container.
// Mirrors the original MCI.banner DOM (.toast--success / .toast--warning) so the
// existing Playwright selectors keep working.
const DURATION = 2600;

export function showToast(message: string, type: 'success' | 'warning' = 'success'): void {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('toast--visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), 300);
  }, DURATION);
}
