import { PageHeader } from '../components/PageHeader.jsx';
import { Pagination } from '../components/transactions/Pagination.jsx';
import { TransactionFilters } from '../components/transactions/TransactionFilters.jsx';
import { TransactionReceiptDialog } from '../components/transactions/TransactionReceiptDialog.jsx';
import { TransactionTable } from '../components/transactions/TransactionTable.jsx';
import { historyPageSize, useTransactionsPage } from '../hooks/useTransactionsPage.js';

function HistoryHeading({ list, busy }) {
  return (
    <div className="panel-header">
      <h2 id="history-title">Riwayat transaksi</h2>
      <span className="muted">
        {busy ? 'Memuat…' : `${list.data?.total ?? 0} transaksi`}
      </span>
    </div>
  );
}

function HistoryPanel({ page }) {
  const { list, filters } = page;
  const busy =
    list.status === 'loading' || list.status === 'refreshing' || filters.pendingSearch;
  return (
    <section className="panel" aria-labelledby="history-title" aria-busy={busy}>
      <HistoryHeading list={list} busy={busy} />
      <TransactionFilters filters={filters} />
      <TransactionTable
        list={list}
        filtered={Boolean(filters.debouncedSearch || filters.date)}
        onOpen={page.setOpenId}
      />
      <Pagination
        data={list.data}
        pageSize={historyPageSize}
        onChange={page.setPage}
        busy={busy}
      />
    </section>
  );
}

export function TransactionsPage() {
  const page = useTransactionsPage();
  return (
    <>
      <PageHeader title="Transaksi" subtitle="Setiap pesanan, tercatat dengan rapi." />
      <HistoryPanel page={page} />
      {page.openId ? (
        <TransactionReceiptDialog id={page.openId} onClose={() => page.setOpenId(null)} />
      ) : null}
    </>
  );
}
