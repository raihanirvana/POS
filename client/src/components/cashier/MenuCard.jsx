import { formatRupiah } from '../../lib/format.js';
import { menuImage } from '../../lib/menu-images.js';
import { Icon } from '../Icon.jsx';

function stockText(product, inCart) {
  if (product.stock === 0) {
    return 'Stok habis';
  }
  return inCart > 0
    ? `Stok ${product.stock} · ${inCart} di pesanan`
    : `Stok ${product.stock}`;
}

function AddButton({ product, inCart, locked, onAdd }) {
  const atLimit = inCart >= product.stock;
  return (
    <button
      type="button"
      className="add-button"
      onClick={() => onAdd(product)}
      disabled={atLimit || locked}
      aria-label={`Tambah ${product.name}`}
      title={atLimit && product.stock > 0 ? 'Jumlah sudah sama dengan stok' : undefined}
    >
      <Icon name="plus" size={18} />
    </button>
  );
}

// Teks menu dirender React (di-escape); stok nol menonaktifkan tombol tambah.
export function MenuCard({ product, inCart, locked, onAdd }) {
  return (
    <article className={product.stock === 0 ? 'menu-card sold-out' : 'menu-card'}>
      <div className="menu-photo">
        <img src={menuImage(product.imageKey)} alt="" loading="lazy" />
        {product.tag ? <span className="menu-tag">{product.tag}</span> : null}
      </div>
      <div className="menu-info">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="menu-bottom">
          <div>
            <div className="menu-price">{formatRupiah(product.price)}</div>
            <div className="menu-stock">{stockText(product, inCart)}</div>
          </div>
          <AddButton product={product} inCart={inCart} locked={locked} onAdd={onAdd} />
        </div>
      </div>
    </article>
  );
}
