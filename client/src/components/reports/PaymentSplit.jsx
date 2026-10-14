import { formatRupiah } from '../../lib/format.js';

const methods = [
  { key: 'cash', label: 'Tunai' },
  { key: 'qris', label: 'QRIS (simulasi)' },
];

export function PaymentSplit({ byPaymentMethod }) {
  return (
    <section className="panel" aria-labelledby="method-title">
      <h2 id="method-title">Metode pembayaran</h2>
      <dl className="method-split">
        {methods.map((method) => (
          <div key={method.key}>
            <dt>{method.label}</dt>
            <dd>
              <strong>{formatRupiah(byPaymentMethod[method.key].revenue)}</strong>
              <small>{byPaymentMethod[method.key].transactionCount} transaksi</small>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
