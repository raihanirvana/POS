import { Link } from '../Link.jsx';
import { TransactionRow } from '../transactions/TransactionRow.jsx';
import { TransactionTableHead } from '../transactions/TransactionTable.jsx';

function RecentTable({ transactions, onOpen }) {
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

export function RecentTransactions({ transactions, onOpen }) {
  return (
    <section className="panel" aria-labelledby="recent-title">
      <div className="panel-header">
        <h2 id="recent-title">Transaksi terbaru</h2>
        <Link to="/transaksi">Lihat semua transaksi</Link>
      </div>
      {transactions.length === 0 ? (
        <p className="empty-state">Belum ada transaksi.</p>
      ) : (
        <RecentTable transactions={transactions} onOpen={onOpen} />
      )}
    </section>
  );
}
