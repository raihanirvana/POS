import { ErrorNotice } from '../components/ErrorNotice.jsx';
import { Icon } from '../components/Icon.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { RemoteContent } from '../components/RemoteContent.jsx';
import { DailySales } from '../components/reports/DailySales.jsx';
import { PaymentSplit } from '../components/reports/PaymentSplit.jsx';
import { ReportFilters } from '../components/reports/ReportFilters.jsx';
import { ReportSummary } from '../components/reports/ReportSummary.jsx';
import { TopProducts } from '../components/reports/TopProducts.jsx';
import { useReportsPage } from '../hooks/useReportsPage.js';

function ExportButton({ page }) {
  return (
    <button
      type="button"
      className="secondary-button"
      onClick={page.exporter.run}
      disabled={page.exporter.pending || !page.exporter.enabled}
    >
      <Icon name="download" size={18} />
      {page.exporter.pending ? 'Menyiapkan CSV…' : 'Ekspor CSV'}
    </button>
  );
}

function ReportContent({ report }) {
  const empty = report.summary.transactionCount === 0;
  return (
    <>
      <ReportSummary report={report} />
      {empty ? (
        <p className="empty-state">Belum ada transaksi pada periode ini.</p>
      ) : null}
      <div className="dashboard-grid">
        <DailySales days={report.byDay} />
        <div>
          <PaymentSplit byPaymentMethod={report.byPaymentMethod} />
          <section className="panel" aria-labelledby="report-top-title">
            <h2 id="report-top-title">Produk terlaris</h2>
            <TopProducts
              products={report.topProducts}
              emptyText="Belum ada produk terjual."
            />
          </section>
        </div>
      </div>
    </>
  );
}

const reportLabels = {
  loading: 'Memuat laporan…',
  error: 'Laporan belum bisa dimuat',
  stale: 'Laporan belum diperbarui',
};

function ExportStatus({ exporter }) {
  if (exporter.error) {
    return (
      <ErrorNotice
        title="CSV belum bisa diunduh"
        error={exporter.error}
        onRetry={exporter.enabled && !exporter.pending ? exporter.run : undefined}
      />
    );
  }
  return (
    <p className="save-notice" role="status">
      {exporter.message}
    </p>
  );
}

export function ReportsPage() {
  const page = useReportsPage();
  return (
    <>
      <PageHeader
        title="Laporan penjualan"
        subtitle="Kenali angka di balik setiap seduhan."
      >
        <ExportButton page={page} />
      </PageHeader>
      <section className="panel" aria-label="Periode laporan">
        <ReportFilters page={page} />
      </section>
      <ExportStatus exporter={page.exporter} />
      <RemoteContent state={page.report} labels={reportLabels}>
        {(report) => <ReportContent report={report} />}
      </RemoteContent>
    </>
  );
}
