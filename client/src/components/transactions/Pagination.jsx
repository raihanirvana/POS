function PageButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      className="secondary-button compact-button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// Rentang dihitung dari offset respons server agar label selalu sesuai baris yang tampil.
export function Pagination({ data, pageSize, onChange, busy }) {
  if (!data || data.total <= pageSize || data.transactions.length === 0) {
    return null;
  }
  const page = Math.floor(data.offset / pageSize);
  const first = data.offset + 1;
  const last = Math.min(data.total, data.offset + data.transactions.length);
  return (
    <nav className="pagination" aria-label="Halaman riwayat">
      <PageButton
        label="Sebelumnya"
        onClick={() => onChange(page - 1)}
        disabled={busy || page === 0}
      />
      <span aria-live="polite">
        {first}–{last} dari {data.total}
      </span>
      <PageButton
        label="Berikutnya"
        onClick={() => onChange(page + 1)}
        disabled={busy || last >= data.total}
      />
    </nav>
  );
}
