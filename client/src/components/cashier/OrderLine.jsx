import { formatRupiah } from '../../lib/format.js';
import { menuImage } from '../../lib/menu-images.js';
import { Icon } from '../Icon.jsx';

function QuantityControl({ line, locked, onChange }) {
  const max = line.product?.stock ?? 0;
  return (
    <div className="quantity" role="group" aria-label={`Jumlah ${line.name}`}>
      <button
        type="button"
        onClick={() => onChange(line.productId, line.quantity - 1)}
        disabled={locked}
        aria-label={`Kurangi ${line.name}`}
      >
        −
      </button>
      <span aria-live="polite">{line.quantity}</span>
      <button
        type="button"
        onClick={() => onChange(line.productId, line.quantity + 1)}
        disabled={locked || line.quantity >= max}
        aria-label={`Tambah jumlah ${line.name}`}
      >
        +
      </button>
    </div>
  );
}

function LineTotal({ line, locked, onChange }) {
  return (
    <div className="cart-line-total">
      <span>{formatRupiah(line.lineTotal)}</span>
      <button
        type="button"
        className="icon-button"
        onClick={() => onChange(line.productId, 0)}
        disabled={locked}
        aria-label={`Hapus ${line.name} dari pesanan`}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export function OrderLine({ line, locked, onChange }) {
  return (
    <li className="cart-line">
      <img src={menuImage(line.product?.imageKey)} alt="" width="44" height="44" />
      <div>
        <h3>{line.name}</h3>
        <span className="muted">
          {line.product ? formatRupiah(line.unitPrice) : 'Tidak tersedia'}
        </span>
        <QuantityControl line={line} locked={locked} onChange={onChange} />
        {line.product && line.quantity >= line.product.stock ? (
          <small className="stock-limit">
            Sudah mencapai stok ({line.product.stock})
          </small>
        ) : null}
      </div>
      <LineTotal line={line} locked={locked} onChange={onChange} />
    </li>
  );
}
