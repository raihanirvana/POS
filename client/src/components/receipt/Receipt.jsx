import {
  formatDateTime,
  formatRupiah,
  orderTypeLabels,
  paymentMethodLabels,
} from '../../lib/format.js';

function ReceiptHeader({ transaction }) {
  return (
    <header className="receipt-top">
      <span className="brand-mark" aria-hidden="true">
        s<span>•</span>
      </span>
      <h3>{transaction.store.name}</h3>
      <p>{transaction.store.address}</p>
      <p>{formatDateTime(transaction.createdAt)}</p>
      <p>{transaction.number}</p>
    </header>
  );
}

function ReceiptItems({ items }) {
  return (
    <ul className="receipt-items">
      {items.map((item, index) => (
        <li key={`${item.lineNumber ?? index}-${item.name}`}>
          <div>
            {item.name}
            <small>
              {item.quantity} × {formatRupiah(item.unitPrice)}
            </small>
          </div>
          <strong>{formatRupiah(item.lineTotal)}</strong>
        </li>
      ))}
    </ul>
  );
}

function Line({ label, value, strong }) {
  return (
    <div className={strong ? 'total-line grand-total' : 'total-line'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReceiptTotals({ transaction }) {
  const cash = transaction.paymentMethod === 'cash';
  return (
    <div className="order-totals">
      <Line label="Subtotal" value={formatRupiah(transaction.subtotal)} />
      <Line
        label={`Diskon (${transaction.discountPercent}%)`}
        value={`− ${formatRupiah(transaction.discountAmount)}`}
      />
      <Line label="Total" value={formatRupiah(transaction.total)} strong />
      <Line label="Metode" value={paymentMethodLabels[transaction.paymentMethod]} />
      {cash ? (
        <Line label="Uang diterima" value={formatRupiah(transaction.amountReceived)} />
      ) : null}
      {cash ? (
        <Line label="Kembalian" value={formatRupiah(transaction.changeAmount)} />
      ) : null}
    </div>
  );
}

// Semua isi struk berasal dari snapshot transaksi server, bukan data produk terkini.
export function Receipt({ transaction }) {
  return (
    <article className="receipt" aria-label={`Struk ${transaction.number}`}>
      <ReceiptHeader transaction={transaction} />
      <Line label="Pelanggan" value={transaction.customerName} />
      <Line label="Pesanan" value={orderTypeLabels[transaction.orderType]} />
      <ReceiptItems items={transaction.items} />
      <ReceiptTotals transaction={transaction} />
      <p className="receipt-footer">{transaction.store.receiptMessage}</p>
      <p className="receipt-demo">Struk demo · bukan bukti pembayaran asli</p>
    </article>
  );
}
