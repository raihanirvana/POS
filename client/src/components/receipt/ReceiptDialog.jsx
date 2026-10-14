import { useModalDialog } from '../../hooks/useModalDialog.js';
import { formatRupiah } from '../../lib/format.js';
import { DialogHeader } from '../DialogHeader.jsx';
import { Receipt } from './Receipt.jsx';

// Total final selalu dari server; jika harga berubah sejak menu dimuat, kasir diberi tahu.
function ReceiptNotes({ receipt }) {
  const { transaction, previewTotal, replayed } = receipt;
  return (
    <>
      {replayed ? (
        <p className="order-notice">
          Transaksi ini sudah tercatat sebelumnya; struk yang sama ditampilkan.
        </p>
      ) : null}
      {previewTotal !== transaction.total ? (
        <p className="order-notice order-notice--warning">
          Total final {formatRupiah(transaction.total)} berbeda dari pratinjau{' '}
          {formatRupiah(previewTotal)} karena harga menu berubah di server.
        </p>
      ) : null}
    </>
  );
}

function ReceiptContent({ receipt, onClose }) {
  return (
    <>
      <DialogHeader
        titleId="receipt-title"
        title="Pembayaran berhasil"
        subtitle="Transaksi tersimpan dan stok sudah diperbarui."
        onClose={onClose}
        closeLabel="Tutup struk"
      />
      <ReceiptNotes receipt={receipt} />
      <Receipt transaction={receipt.transaction} />
      <div className="dialog-actions">
        <button type="button" className="primary-button" onClick={onClose} autoFocus>
          Pesanan baru
        </button>
      </div>
    </>
  );
}

export function ReceiptDialog({ receipt, onClose }) {
  const dialogRef = useModalDialog(true);
  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }
  return (
    <dialog
      ref={dialogRef}
      className="form-dialog receipt-dialog"
      onCancel={handleCancel}
      aria-labelledby="receipt-title"
    >
      <ReceiptContent receipt={receipt} onClose={onClose} />
    </dialog>
  );
}
