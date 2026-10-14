import {
  formatDateTime,
  formatRupiah,
  orderTypeLabels,
  paymentMethodLabels,
} from '../../lib/format.js';

function OpenReceiptButton({ transaction, onOpen }) {
  return (
    <button
      type="button"
      className="secondary-button compact-button"
      onClick={() => onOpen(transaction.id)}
      aria-label={`Lihat struk ${transaction.number}`}
    >
      Lihat struk
    </button>
  );
}

export function TransactionRow({ transaction, onOpen }) {
  return (
    <tr>
      <td>
        <strong className="tx-number">{transaction.number}</strong>
        <small className="tx-time">{formatDateTime(transaction.createdAt)}</small>
      </td>
      <td data-label="Pelanggan">{transaction.customerName}</td>
      <td data-label="Pesanan">{orderTypeLabels[transaction.orderType]}</td>
      <td data-label="Item">{transaction.itemCount}</td>
      <td data-label="Metode">{paymentMethodLabels[transaction.paymentMethod]}</td>
      <td className="numeric" data-label="Total">
        {formatRupiah(transaction.total)}
      </td>
      <td className="actions-cell">
        <OpenReceiptButton transaction={transaction} onOpen={onOpen} />
      </td>
    </tr>
  );
}
