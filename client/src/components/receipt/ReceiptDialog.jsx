import { formatRupiah } from '../../lib/format.js';
import { Receipt } from './Receipt.jsx';
import { PrintReceiptButton, ReceiptModal } from './ReceiptModal.jsx';

// Total final selalu dari server; jika harga berubah sejak menu dimuat, kasir diberi tahu.
function ReceiptNotes({ receipt }) {
  const { transaction, previewTotal, replayed } = receipt;
  return (
    <div className="no-print">
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
    </div>
  );
}

function SaleActions({ onClose }) {
  return (
    <>
      <PrintReceiptButton />
      <button type="button" className="primary-button" onClick={onClose} autoFocus>
        Pesanan baru
      </button>
    </>
  );
}

// Struk setelah pembayaran berhasil di halaman Kasir.
export function ReceiptDialog({ receipt, onClose }) {
  return (
    <ReceiptModal
      titleId="receipt-title"
      title="Pembayaran berhasil"
      subtitle="Transaksi tersimpan dan stok sudah diperbarui."
      onClose={onClose}
      actions={<SaleActions onClose={onClose} />}
    >
      <ReceiptNotes receipt={receipt} />
      <Receipt transaction={receipt.transaction} />
    </ReceiptModal>
  );
}
