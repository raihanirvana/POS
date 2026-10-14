import { menuImage } from '../../lib/menu-images.js';

// Unit terjual dari snapshot item transaksi (bukan laba).
export function TopProducts({ products, emptyText }) {
  if (products.length === 0) {
    return <p className="empty-state">{emptyText}</p>;
  }
  return (
    <ol className="top-products">
      {products.map((product) => (
        <li key={product.id}>
          <img src={menuImage(product.imageKey)} alt="" width="44" height="44" />
          <span>
            <strong>{product.name}</strong>
            <small>{product.category}</small>
          </span>
          <span className="top-quantity">{product.quantity} terjual</span>
        </li>
      ))}
    </ol>
  );
}
