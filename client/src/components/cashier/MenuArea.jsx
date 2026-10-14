import { ProductToolbar } from '../products/ProductToolbar.jsx';
import { MenuGrid } from './MenuGrid.jsx';

function MenuBanner() {
  return (
    <div className="menu-banner">
      <span className="banner-tag">Menu andalan kedai</span>
      <h2>Secangkir kopi, sepenuh hati.</h2>
      <p>Kopi Susu Seduh. Teman baik untuk setiap hari.</p>
    </div>
  );
}

export function MenuArea({ page }) {
  const { filters, setFilters } = page;
  const toolbarFilters = {
    ...filters,
    setCategory: (category) => setFilters((previous) => ({ ...previous, category })),
    setSearch: (search) => setFilters((previous) => ({ ...previous, search })),
  };
  return (
    <section className="menu-area" aria-labelledby="menu-title">
      <MenuBanner />
      <div className="menu-heading">
        <h2 id="menu-title">Menu</h2>
        <span className="muted">{page.menu.length} menu tersedia</span>
      </div>
      <ProductToolbar filters={toolbarFilters} />
      <MenuGrid page={page} />
    </section>
  );
}
