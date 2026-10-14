import { toCsv } from '../lib/csv.js';
import { exportTransactions } from '../repositories/report-repository.js';
import { periodRange } from './report-service.js';

const orderTypes = { dine_in: 'Makan di tempat', takeaway: 'Bawa pulang' };
const methods = { cash: 'Tunai', qris: 'QRIS (simulasi)' };

// WIB selalu UTC+7; ISO mempertahankan empat digit, termasuk tahun 0000.
function formatCsvTime(value) {
  const date = new Date(Date.parse(value) + 7 * 3600000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

const header = [
  'Nomor transaksi',
  'Waktu (WIB)',
  'Pelanggan',
  'Jenis pesanan',
  'Metode pembayaran',
  'Jumlah item',
  'Subtotal (Rp)',
  'Diskon (%)',
  'Diskon (Rp)',
  'Total setelah diskon (Rp)',
  'Uang diterima (Rp)',
  'Kembalian (Rp)',
];

function toCsvRow(row) {
  return [
    row.number,
    formatCsvTime(row.created_at),
    row.customer_name,
    orderTypes[row.order_type],
    methods[row.payment_method],
    row.item_count,
    row.subtotal,
    row.discount_percent,
    row.discount_amount,
    row.total,
    row.amount_received,
    row.change_amount,
  ];
}

export function buildReportCsv(database, workspaceId, period) {
  const rows = exportTransactions(database, workspaceId, periodRange(period));
  return {
    filename: `seduh-laporan-${period.from}-sampai-${period.to}.csv`,
    content: toCsv([header, ...rows.map(toCsvRow)]),
    rowCount: rows.length,
  };
}
