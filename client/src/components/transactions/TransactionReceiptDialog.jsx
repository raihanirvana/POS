import { useTransactionDetail } from '../../hooks/useTransactionDetail.js';
import { ErrorNotice } from '../ErrorNotice.jsx';
import { Receipt } from '../receipt/Receipt.jsx';
import { PrintReceiptButton, ReceiptModal } from '../receipt/ReceiptModal.jsx';

function DetailContent({ detail }) {
  if (detail.transaction) {
    return <Receipt transaction={detail.transaction} />;
  }
  if (detail.status === 'error') {
    return (
      <div className="no-print">
        <ErrorNotice
          title="Struk belum bisa dimuat"
          error={detail.error}
          onRetry={detail.reload}
        />
      </div>
    );
  }
  return (
    <p className="empty-state no-print" role="status">
      Memuat struk…
    </p>
  );
}

// Struk lama dari snapshot transaksi: tidak ikut berubah saat menu/toko diubah.
export function TransactionReceiptDialog({ id, onClose }) {
  const detail = useTransactionDetail(id);
  const actions = (
    <>
      <PrintReceiptButton disabled={!detail.transaction} />
      <button type="button" className="primary-button" onClick={onClose} autoFocus>
        Tutup
      </button>
    </>
  );
  return (
    <ReceiptModal
      titleId="history-receipt-title"
      title="Struk transaksi"
      subtitle={detail.transaction?.number ?? 'Snapshot saat transaksi dibuat.'}
      onClose={onClose}
      actions={actions}
    >
      <DetailContent detail={detail} />
    </ReceiptModal>
  );
}
