import { ConfirmDialog } from '../ConfirmDialog.jsx';
import { ErrorNotice } from '../ErrorNotice.jsx';

function ResetDialog({ reset }) {
  return (
    <ConfirmDialog
      open={reset.confirming}
      title="Reset data contoh?"
      confirmLabel={reset.error ? 'Coba reset lagi' : 'Reset demo'}
      busy={reset.pending}
      onConfirm={reset.confirm}
      onCancel={reset.cancel}
    >
      <p>
        Produk, transaksi percobaan, dan pengaturan di ruang demo ini diganti dengan data
        contoh awal. Pesanan yang sedang dibuat di Kasir ikut dibatalkan. Ruang demo lain
        tidak berubah.
      </p>
      {reset.error ? (
        <ErrorNotice title="Reset belum berhasil" error={reset.error} />
      ) : null}
    </ConfirmDialog>
  );
}

export function ResetPanel({ reset, disabled }) {
  return (
    <section className="panel danger-zone" aria-labelledby="reset-title">
      <h2 id="reset-title">Mulai ulang demo</h2>
      <p className="panel-subtitle">
        Kembalikan menu, transaksi, dan pengaturan ke contoh awal dengan tanggal terbaru.
      </p>
      <button
        type="button"
        className="danger-button"
        onClick={reset.open}
        disabled={disabled}
      >
        Reset data contoh
      </button>
      <ResetDialog reset={reset} />
    </section>
  );
}
