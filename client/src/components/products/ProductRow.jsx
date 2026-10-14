import { formatRupiah } from '../../lib/format.js';
import { menuImage } from '../../lib/menu-images.js';
import { Icon } from '../Icon.jsx';
import { StockPill } from './StockPill.jsx';

// Nama/deskripsi dirender sebagai teks React (di-escape), tidak pernah sebagai HTML.
function ProductCell({ product }) {
  return (
    <div className="table-product">
      <img
        src={menuImage(product.imageKey)}
        alt=""
        width="44"
        height="44"
        loading="lazy"
      />
      <div>
        <strong>{product.name}</strong>
        {product.tag ? <span className="product-tag">{product.tag}</span> : null}
        <small>{product.description || 'Tanpa deskripsi'}</small>
      </div>
    </div>
  );
}

function RowActions({ product, onEdit, onDelete }) {
  return (
    <div className="table-actions">
      <button
        type="button"
        className="secondary-button compact-button"
        onClick={() => onEdit(product)}
        aria-label={`Edit ${product.name}`}
      >
        <Icon name="edit" size={16} />
        <span className="edit-label">Edit</span>
      </button>
      <button
        type="button"
        className="icon-button"
        onClick={() => onDelete(product)}
        aria-label={`Hapus ${product.name}`}
        title="Hapus produk"
      >
        <Icon name="trash" size={18} />
      </button>
    </div>
  );
}

export function ProductRow({ product, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <ProductCell product={product} />
      </td>
      <td data-label="Kategori">{product.category}</td>
      <td className="numeric" data-label="Harga">
        {formatRupiah(product.price)}
      </td>
      <td data-label="Stok">
        <StockPill stock={product.stock} />
      </td>
      <td className="actions-cell">
        <RowActions product={product} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}
