import { useEffect, useRef } from 'react';

function useModal(open) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);
  return dialogRef;
}

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
  const dialogRef = useModal(open);
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
      aria-labelledby="confirm-title"
    >
      <h2 id="confirm-title">{title}</h2>
      <div className="confirm-body">{children}</div>
      <DialogActions busy={busy} onCancel={onCancel} {...actions} />
    </dialog>
  );
}
