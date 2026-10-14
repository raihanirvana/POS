import { ErrorNotice } from '../ErrorNotice.jsx';
import { TransactionRow } from './TransactionRow.jsx';

export function TransactionTableHead() {
  return (
    <thead>
      <tr>
        <th scope="col">Nomor &amp; waktu</th>
        <th scope="col">Pelanggan</th>
        <th scope="col">Pesanan</th>
        <th scope="col">Item</th>
        <th scope="col">Metode</th>
        <th scope="col" className="numeric">
          Total
        </th>
        <th scope="col">Struk</th>
      </tr>
    </thead>
  );
}

function TransactionRows({ transactions, onOpen }) {
  return (
    <div className="table-wrap">
      <table className="card-table transaction-table">
        <TransactionTableHead />
        <tbody>
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onOpen={onOpen}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadedTransactions({ list, filtered, onOpen }) {
  const { transactions } = list.data;
  return (
    <>
      {list.error ? (
        <ErrorNotice
          title="Riwayat belum diperbarui"
          error={list.error}
          onRetry={list.reload}
        />
      ) : null}
      {transactions.length === 0 ? (
        <p className="empty-state">
          {filtered
            ? 'Tidak ada transaksi yang cocok dengan filter.'
            : 'Belum ada transaksi.'}
        </p>
      ) : (
        <TransactionRows transactions={transactions} onOpen={onOpen} />
      )}
    </>
  );
}

export function TransactionTable({ list, ...props }) {
  if (list.data) {
    return <LoadedTransactions list={list} {...props} />;
  }
  if (list.status === 'error') {
    return (
      <ErrorNotice
        title="Riwayat belum bisa dimuat"
        error={list.error}
        onRetry={list.reload}
      />
    );
  }
  return (
    <p className="empty-state" role="status">
      Memuat riwayat…
    </p>
  );
}
