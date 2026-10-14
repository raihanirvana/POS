import { ErrorNotice } from '../ErrorNotice.jsx';
import { MenuCard } from './MenuCard.jsx';

function MenuCards({ page }) {
  const quantities = new Map(
    page.cart.order.items.map((item) => [item.productId, item.quantity]),
  );
  if (page.menu.length === 0) {
    return (
      <p className="empty-state">Menu tidak ditemukan. Coba nama lain atau Semua menu.</p>
    );
  }
  return (
    <div className="menu-grid">
      {page.menu.map((product) => (
        <MenuCard
          key={product.id}
          product={product}
          inCart={quantities.get(product.id) ?? 0}
          locked={page.cart.locked}
          onAdd={page.cart.add}
        />
      ))}
    </div>
  );
}

function MenuUnavailable({ products }) {
  if (products.status === 'loading') {
    return (
      <p className="empty-state" role="status">
        Memuat menu…
      </p>
    );
  }
  return (
    <ErrorNotice
      title="Menu belum bisa dimuat"
      error={products.error}
      onRetry={products.reload}
    />
  );
}

export function MenuGrid({ page }) {
  const { products } = page;
  if (products.status === 'loading' || !products.catalog) {
    return <MenuUnavailable products={products} />;
  }
  return (
    <>
      {products.error ? (
        <ErrorNotice
          title="Stok belum diperbarui"
          error={products.error}
          onRetry={products.reload}
        />
      ) : null}
      <MenuCards page={page} />
    </>
  );
}
