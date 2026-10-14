import { Icon } from '../Icon.jsx';
import { Link } from '../Link.jsx';

export function LowStockNote({ items, threshold }) {
  if (items.length === 0) {
    return null;
  }
  const names = items.map((item) => `${item.name} (${item.stock})`).join(', ');
  return (
    <p className="inline-note low-stock-note">
      <Icon name="box" size={18} />
      <span>
        Stok perlu diperiksa (≤ {threshold} unit): {names}.{' '}
        <Link to="/produk">
          <strong>Kelola produk</strong>
        </Link>
      </span>
    </p>
  );
}
