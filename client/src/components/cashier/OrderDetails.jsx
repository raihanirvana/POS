import { Icon } from '../Icon.jsx';
import { OrderLine } from './OrderLine.jsx';

const orderTypes = [
  { value: 'dine_in', label: 'Makan di tempat' },
  { value: 'takeaway', label: 'Bawa pulang' },
];

export function CustomerField({ cart }) {
  return (
    <div className="field">
      <label htmlFor="customer-name">
        Nama pelanggan <span className="optional">(opsional)</span>
      </label>
      <input
        id="customer-name"
        className="input"
        value={cart.order.customerName}
        onChange={(event) => cart.setCustomerName(event.target.value)}
        placeholder="Contoh: Raka"
        maxLength={60}
        disabled={cart.locked}
        autoComplete="off"
      />
    </div>
  );
}

export function OrderTypeToggle({ cart }) {
  return (
    <div className="segmented" role="group" aria-label="Jenis pesanan">
      {orderTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          className={cart.order.orderType === type.value ? 'active' : undefined}
          aria-pressed={cart.order.orderType === type.value}
          onClick={() => cart.setOrderType(type.value)}
          disabled={cart.locked}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

export function OrderItems({ page }) {
  const { cart, preview } = page;
  if (preview.lines.length === 0) {
    return (
      <div className="cart-empty">
        <Icon name="receipt" size={26} />
        <h3>Belum ada pesanan</h3>
        <p>Pilih menu untuk mulai meracik pesanan.</p>
      </div>
    );
  }
  return (
    <ul className="cart-lines" aria-label="Item pesanan">
      {preview.lines.map((line) => (
        <OrderLine
          key={line.productId}
          line={line}
          locked={cart.locked}
          onChange={cart.setQuantity}
        />
      ))}
    </ul>
  );
}
