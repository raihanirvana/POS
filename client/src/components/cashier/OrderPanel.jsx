import { Icon } from '../Icon.jsx';
import { CustomerField, OrderItems, OrderTypeToggle } from './OrderDetails.jsx';
import { OrderNotices } from './OrderNotices.jsx';
import { OrderTotals } from './OrderTotals.jsx';

function itemCountText(items) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return count > 0 ? `${count} item dalam pesanan` : 'Mulai dengan memilih menu';
}

function ClearCartButton({ cart }) {
  return (
    <button
      type="button"
      className="icon-button"
      onClick={cart.clear}
      disabled={cart.locked || cart.order.items.length === 0}
      aria-label="Kosongkan pesanan"
      title="Kosongkan pesanan"
    >
      <Icon name="trash" size={18} />
    </button>
  );
}

function HeadingActions({ cart, onClose }) {
  return (
    <div className="order-heading-actions">
      <ClearCartButton cart={cart} />
      {onClose ? (
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Tutup pesanan"
        >
          <Icon name="close" size={18} />
        </button>
      ) : null}
    </div>
  );
}

function OrderHeading({ page, onClose }) {
  return (
    <div className="order-heading">
      <div>
        <h2 id="order-title">Pesanan baru</h2>
        <small>{itemCountText(page.cart.order.items)}</small>
      </div>
      <HeadingActions cart={page.cart} onClose={onClose} />
    </div>
  );
}

function CheckoutButton({ page }) {
  const { cart, preview, products, payment } = page;
  const pending = cart.checkout.status === 'uncertain';
  const disabled =
    !pending &&
    (preview.lines.length === 0 ||
      preview.discountPercent === null ||
      products.status !== 'ready');
  return (
    <button
      type="button"
      className="primary-button checkout-button"
      onClick={payment.openPayment}
      disabled={disabled}
    >
      <span>{pending ? 'Lanjutkan pembayaran tertunda' : 'Lanjut pembayaran'}</span>
      <Icon name="arrow" size={18} />
    </button>
  );
}

export function OrderPanel({ page, onClose }) {
  return (
    <div className="order-panel-body">
      <OrderHeading page={page} onClose={onClose} />
      <CustomerField cart={page.cart} />
      <OrderTypeToggle cart={page.cart} />
      <OrderItems page={page} />
      <OrderNotices page={page} />
      <OrderTotals page={page} />
      <CheckoutButton page={page} />
      <p className="payment-hint">Tunai atau QRIS · pembayaran simulasi</p>
    </div>
  );
}
