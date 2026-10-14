import { createPortal } from 'react-dom';
import { useModalDialog } from '../../hooks/useModalDialog.js';
import { DialogHeader } from '../DialogHeader.jsx';
import { Icon } from '../Icon.jsx';

export function PrintReceiptButton({ disabled }) {
  return (
    <button
      type="button"
      className="secondary-button"
      onClick={() => window.print()}
      disabled={disabled}
    >
      <Icon name="print" size={18} />
      Cetak struk
    </button>
  );
}

function ReceiptDialogBody({ titleId, title, subtitle, onClose, actions, children }) {
  return (
    <>
      <div className="no-print">
        <DialogHeader
          titleId={titleId}
          title={title}
          subtitle={subtitle}
          onClose={onClose}
          closeLabel="Tutup struk"
        />
      </div>
      {children}
      <div className="dialog-actions no-print">{actions}</div>
    </>
  );
}

// Dirender ke <body> lewat portal: CSS print menyembunyikan semua anak body lain
// sehingga yang tercetak hanya area struk (elemen .no-print ikut disembunyikan).
export function ReceiptModal(props) {
  const dialogRef = useModalDialog(true);
  function handleCancel(event) {
    event.preventDefault();
    props.onClose();
  }
  return createPortal(
    <div className="receipt-portal">
      <dialog
        ref={dialogRef}
        className="form-dialog receipt-dialog"
        onCancel={handleCancel}
        aria-labelledby={props.titleId}
      >
        <ReceiptDialogBody {...props} />
      </dialog>
    </div>,
    document.body,
  );
}
