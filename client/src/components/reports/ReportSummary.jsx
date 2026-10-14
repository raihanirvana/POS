import { formatRupiah } from '../../lib/format.js';
import { StatTile } from './StatTile.jsx';

function summaryTiles(summary) {
  return [
    ['register', 'Pendapatan', formatRupiah(summary.revenue), 'Total setelah diskon'],
    ['receipt', 'Jumlah transaksi', summary.transactionCount, 'Pesanan dalam periode'],
    [
      'chart',
      'Rata-rata transaksi',
      formatRupiah(summary.averageTransaction),
      'Pendapatan ÷ transaksi',
    ],
    ['box', 'Produk terjual', `${summary.unitsSold} unit`, 'Total unit dalam periode'],
  ];
}

// Pendapatan bukan laba: biaya bahan dan operasional tidak dicatat di demo ini.
export function ReportSummary({ report }) {
  const { summary } = report;
  return (
    <>
      <div className="stats-grid">
        {summaryTiles(summary).map(([icon, label, value, note]) => (
          <StatTile key={label} icon={icon} label={label} value={value} note={note} />
        ))}
      </div>
      <p className="inline-note">
        Subtotal sebelum diskon {formatRupiah(summary.subtotalBeforeDiscount)} − diskon{' '}
        {formatRupiah(summary.discountTotal)} = pendapatan {formatRupiah(summary.revenue)}
        . Angka ini <strong>bukan laba</strong>: belum dikurangi biaya bahan, gaji, dan
        operasional.
      </p>
    </>
  );
}
