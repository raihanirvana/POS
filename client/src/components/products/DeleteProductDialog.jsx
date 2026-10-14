import { ConfirmDialog } from '../ConfirmDialog.jsx';
import { ErrorNotice } from '../ErrorNotice.jsx';

export function DeleteProductDialog({ remover }) {
  const product = remover.target;
  return (
    <ConfirmDialog
      open={Boolean(product)}
      title={product ? `Hapus ${product.name}?` : 'Hapus produk?'}
      confirmLabel={remover.error ? 'Coba hapus lagi' : 'Hapus produk'}
      busy={remover.pending}
      onConfirm={remover.confirm}
      onCancel={remover.cancel}
    >
      <p>
        Menu dihapus dari kasir. Struk transaksi lama tetap menyimpan nama dan harganya.
      </p>
      {remover.error ? (
        <ErrorNotice title="Produk belum terhapus" error={remover.error} />
      ) : null}
    </ConfirmDialog>
  );
}
