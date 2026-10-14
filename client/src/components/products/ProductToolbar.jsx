import { Icon } from '../Icon.jsx';

const categoryFilters = [
  { value: '', label: 'Semua menu' },
  { value: 'Kopi', label: 'Kopi' },
  { value: 'Non-kopi', label: 'Non-kopi' },
  { value: 'Pastry', label: 'Pastry' },
];

function CategoryFilter({ filters }) {
  return (
    <div className="category-tabs" role="group" aria-label="Filter kategori">
      {categoryFilters.map((option) => (
        <button
          key={option.label}
          type="button"
          className={
            option.value === filters.category ? 'category-tab active' : 'category-tab'
          }
          aria-pressed={option.value === filters.category}
          onClick={() => filters.setCategory(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ProductToolbar({ filters }) {
  return (
    <div className="product-toolbar">
      <label className="search-box">
        <Icon name="search" size={18} />
        <span className="visually-hidden">Cari menu</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => filters.setSearch(event.target.value)}
          placeholder="Cari nama atau deskripsi menu…"
          maxLength={60}
        />
      </label>
      <CategoryFilter filters={filters} />
    </div>
  );
}
