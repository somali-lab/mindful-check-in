// In-app confirm modal backed by the shell's <dialog id="dlg-confirm">. Resolves
// true on confirm, false on cancel / Esc / backdrop. Falls back to window.confirm
// when <dialog> is unsupported.
export interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  const dlg = document.getElementById('dlg-confirm') as HTMLDialogElement | null;
  if (!dlg || typeof dlg.showModal !== 'function') {
    return Promise.resolve(window.confirm(opts.body || opts.title || ''));
  }

  const titleEl = document.getElementById('dlg-confirm-title');
  const bodyEl = document.getElementById('dlg-confirm-body');
  const okBtn = document.getElementById('dlg-confirm-ok') as HTMLButtonElement | null;
  const cancelBtn = document.getElementById('dlg-confirm-cancel') as HTMLButtonElement | null;
  if (titleEl) titleEl.textContent = opts.title;
  if (bodyEl) bodyEl.textContent = opts.body;
  if (okBtn) {
    if (opts.confirmLabel) okBtn.textContent = opts.confirmLabel;
    okBtn.classList.toggle('btn--danger', Boolean(opts.danger));
  }
  if (cancelBtn && opts.cancelLabel) cancelBtn.textContent = opts.cancelLabel;

  return new Promise((resolve) => {
    let result = false;
    const onOk = (): void => {
      result = true;
      dlg.close();
    };
    const onCancel = (): void => dlg.close();
    const onClose = (): void => {
      okBtn?.removeEventListener('click', onOk);
      cancelBtn?.removeEventListener('click', onCancel);
      dlg.removeEventListener('close', onClose);
      resolve(result);
    };
    okBtn?.addEventListener('click', onOk);
    cancelBtn?.addEventListener('click', onCancel);
    dlg.addEventListener('close', onClose);
    dlg.showModal();
  });
}
