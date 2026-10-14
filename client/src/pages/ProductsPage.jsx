import { Icon } from '../components/Icon.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { DeleteProductDialog } from '../components/products/DeleteProductDialog.jsx';
import { ProductFormDialog } from '../components/products/ProductFormDialog.jsx';
import { ProductTable } from '../components/products/ProductTable.jsx';
import { ProductToolbar } from '../components/products/ProductToolbar.jsx';
import { useProductsPage } from '../hooks/useProductsPage.js';

function PanelHeading({ products }) {
  return (
    <div className="panel-header">
      <h2 id="product-list-title">Daftar menu</h2>
      <span className="muted">
        {products.status === 'refreshing'
          ? 'Memperbarui…'
          : `${products.products.length} produk`}
      </span>
    </div>
  );
}

function ProductListPanel({ page }) {
  const { products, filters } = page;
  return (
    <section
      className="panel"
      aria-labelledby="product-list-title"
      aria-busy={['loading', 'refreshing'].includes(products.status)}
    >
      <PanelHeading products={products} />
      <ProductToolbar filters={filters} />
      <ProductTable
        state={products}
        filtered={Boolean(filters.category || filters.debouncedSearch)}
        onEdit={page.openEdit}
        onDelete={page.remover.open}
      />
    </section>
  );
}

function ProductDialogs({ page }) {
  return (
    <>
      {page.editor ? (
        <ProductFormDialog
          key={page.editor.key}
          product={page.editor.product}
          catalog={page.products.catalog}
          onSaved={page.handleSaved}
          onClose={page.closeEditor}
        />
      ) : null}
      <DeleteProductDialog remover={page.remover} />
    </>
  );
}

function AddProductButton({ page }) {
  return (
    <button
      type="button"
      className="primary-button"
      onClick={page.openCreate}
      disabled={!page.products.catalog}
    >
      <Icon name="plus" size={18} />
      Tambah produk
    </button>
  );
}

export function ProductsPage() {
  const page = useProductsPage();
  return (
    <>
      <PageHeader title="Produk" subtitle="Menu yang diracik, stok yang terjaga.">
        <AddProductButton page={page} />
      </PageHeader>
      <p className="save-notice" role="status">
        {page.notice}
      </p>
      <ProductListPanel page={page} />
      <p className="inline-note">
        Stok otomatis berkurang setelah pembayaran. Foto produk memakai preset sesuai
        kategori.
      </p>
      <ProductDialogs page={page} />
    </>
  );
}
