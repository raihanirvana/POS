import { useEffect, useRef } from 'react';

// Membuka <dialog> sebagai modal dan mengembalikan fokus ke pemicu saat ditutup.
export function useModalDialog(open) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) {
      return undefined;
    }
    const opener = document.activeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog.open) {
        dialog.close();
      }
      if (opener?.isConnected) {
        opener.focus();
      }
    };
  }, [open]);
  return dialogRef;
}
