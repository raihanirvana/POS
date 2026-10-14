import { useState } from 'react';
import { SalesColumnChart } from '../components/charts/SalesColumnChart.jsx';
import { Icon } from '../components/Icon.jsx';
import { Link } from '../components/Link.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { RemoteContent } from '../components/RemoteContent.jsx';
import { LowStockNote } from '../components/reports/LowStockNote.jsx';
import { RecentTransactions } from '../components/reports/RecentTransactions.jsx';
import { StatTile } from '../components/reports/StatTile.jsx';
import { TopProducts } from '../components/reports/TopProducts.jsx';
import { TransactionReceiptDialog } from '../components/transactions/TransactionReceiptDialog.jsx';
import { useRemoteData } from '../hooks/useRemoteData.js';
import { formatRupiah } from '../lib/format.js';
import { getDashboard } from '../lib/reports-api.js';

function todayTiles(data) {
  const { summary } = data;
  const average = formatRupiah(summary.averageTransaction);
  const lowStockNote = `Produk dengan stok ≤ ${data.lowStockThreshold}`;
  return [
    [
      'register',
      'Penjualan hari ini',
      formatRupiah(summary.revenue),
      'Pendapatan setelah diskon',
    ],
    [
      'receipt',
      'Transaksi hari ini',
      summary.transactionCount,
      'Pesanan berhasil dibayar',
    ],
    ['chart', 'Rata-rata transaksi', average, 'Nilai per pesanan hari ini'],
    ['box', 'Stok menipis', data.lowStock.length, lowStockNote],
  ];
}

function TodayStats({ data }) {
  return (
    <div className="stats-grid">
      {todayTiles(data).map(([icon, label, value, note]) => (
        <StatTile key={label} icon={icon} label={label} value={value} note={note} />
      ))}
    </div>
  );
}

function DashboardPanels({ data }) {
  return (
    <div className="dashboard-grid">
      <section className="panel" aria-labelledby="week-title">
        <h2 id="week-title">Penjualan 7 hari</h2>
        <p className="panel-subtitle">
          Pendapatan setelah diskon per hari (WIB), hari ini disorot.
        </p>
        <SalesColumnChart
          days={data.salesByDay}
          highlightDate={data.today}
          label="Pendapatan 7 hari terakhir"
        />
      </section>
      <section className="panel" aria-labelledby="favorite-title">
        <h2 id="favorite-title">Favorit pelanggan</h2>
        <p className="panel-subtitle">Produk paling banyak terjual, semua waktu.</p>
        <TopProducts
          products={data.topProducts}
          emptyText="Buat transaksi untuk melihat produk terlaris."
        />
      </section>
    </div>
  );
}

function DashboardContent({ data, onOpen }) {
  return (
    <>
      <TodayStats data={data} />
      <DashboardPanels data={data} />
      <RecentTransactions transactions={data.recentTransactions} onOpen={onOpen} />
      <LowStockNote items={data.lowStock} threshold={data.lowStockThreshold} />
    </>
  );
}

const dashboardLabels = {
  loading: 'Memuat dashboard…',
  error: 'Dashboard belum bisa dimuat',
  stale: 'Dashboard belum diperbarui',
};

export function DashboardPage() {
  const state = useRemoteData(getDashboard);
  const [openId, setOpenId] = useState(null);
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Lihat cerita kedaimu hari ini.">
        <Link className="primary-button" to="/kasir">
          <Icon name="plus" size={18} />
          Buat pesanan
        </Link>
      </PageHeader>
      <RemoteContent state={state} labels={dashboardLabels}>
        {(data) => <DashboardContent data={data} onOpen={setOpenId} />}
      </RemoteContent>
      {openId ? (
        <TransactionReceiptDialog id={openId} onClose={() => setOpenId(null)} />
      ) : null}
    </>
  );
}
