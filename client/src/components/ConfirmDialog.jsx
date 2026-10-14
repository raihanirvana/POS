import { useId } from 'react';
import { useModalDialog } from '../hooks/useModalDialog.js';

function DialogActions({ confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <div className="dialog-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={onCancel}
        disabled={busy}
      >
        Batal
      </button>
      <button type="button" className="danger-button" onClick={onConfirm} disabled={busy}>
        {busy ? 'Memproses…' : confirmLabel}
      </button>
    </div>
  );
}

// <dialog> modal: fokus terkunci di dalam dialog; Escape menutup kecuali saat memproses.
export function ConfirmDialog({ open, title, children, busy, onCancel, ...actions }) {
  const dialogRef = useModalDialog(open);
  const titleId = useId();
  function handleCancel(event) {
    event.preventDefault();
    if (!busy) {
      onCancel();
    }
  }
  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      onCancel={handleCancel}
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>{title}</h2>
      <div className="confirm-body">{children}</div>
      <DialogActions busy={busy} onCancel={onCancel} {...actions} />
    </dialog>
  );
}
