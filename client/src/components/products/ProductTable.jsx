import { ErrorNotice } from '../ErrorNotice.jsx';
import { ProductRow } from './ProductRow.jsx';

function EmptyProducts({ filtered }) {
  return (
    <p className="empty-state">
      {filtered
        ? 'Tidak ada menu yang cocok. Coba kata kunci atau kategori lain.'
        : 'Belum ada menu. Tambahkan produk pertama untuk mulai berjualan.'}
    </p>
  );
}

function TableHead() {
  return (
    <thead>
      <tr>
        <th scope="col">Produk</th>
        <th scope="col">Kategori</th>
        <th scope="col" className="numeric">
          Harga
        </th>
        <th scope="col">Stok</th>
        <th scope="col">Tindakan</th>
      </tr>
    </thead>
  );
}

function ProductRows({ products, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="product-table">
        <TableHead />
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadedProducts({ state, filtered, onEdit, onDelete }) {
  return (
    <>
      {state.error ? (
        <ErrorNotice
          title="Daftar belum diperbarui"
          error={state.error}
          onRetry={state.reload}
        />
      ) : null}
      {state.products.length === 0 ? (
        <EmptyProducts filtered={filtered} />
      ) : (
        <ProductRows products={state.products} onEdit={onEdit} onDelete={onDelete} />
      )}
    </>
  );
}

export function ProductTable({ state, ...props }) {
  if (state.status === 'loading') {
    return (
      <p className="empty-state" role="status">
        Memuat menu…
      </p>
    );
  }
  if (!state.catalog) {
    return (
      <ErrorNotice
        title="Menu belum bisa dimuat"
        error={state.error}
        onRetry={state.reload}
      />
    );
  }
  return <LoadedProducts state={state} {...props} />;
}
