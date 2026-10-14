import { Icon } from '../Icon.jsx';

function DateShortcuts({ filters }) {
  return (
    <>
      <button
        type="button"
        className="secondary-button compact-button"
        onClick={() => filters.setDate(filters.today)}
      >
        Hari ini
      </button>
      <button
        type="button"
        className="text-button"
        onClick={() => filters.setDate('')}
        disabled={!filters.date}
      >
        Semua tanggal
      </button>
    </>
  );
}

function DateFilter({ filters }) {
  return (
    <div className="date-filter">
      <label htmlFor="history-date">Tanggal (WIB)</label>
      <input
        id="history-date"
        type="date"
        className="input"
        value={filters.date}
        max={filters.today}
        onChange={(event) => filters.setDate(event.target.value)}
      />
      <DateShortcuts filters={filters} />
    </div>
  );
}

export function TransactionFilters({ filters }) {
  return (
    <div className="history-filters">
      <label className="search-box">
        <Icon name="search" size={18} />
        <span className="visually-hidden">Cari nomor transaksi atau pelanggan</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => filters.setSearch(event.target.value)}
          placeholder="Cari nomor transaksi atau pelanggan…"
          maxLength={60}
        />
      </label>
      <DateFilter filters={filters} />
    </div>
  );
}
