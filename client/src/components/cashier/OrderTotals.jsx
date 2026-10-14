import { formatRupiah } from '../../lib/format.js';

function DiscountLine({ page }) {
  const { cart, preview } = page;
  const invalid = preview.discountPercent === null;
  return (
    <div className="total-line">
      <label htmlFor="discount-percent">
        Diskon
        <input
          id="discount-percent"
          className="discount-input"
          inputMode="numeric"
          value={cart.order.discountText}
          onChange={(event) => cart.setDiscountText(event.target.value)}
          disabled={cart.locked}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={invalid ? 'discount-error' : undefined}
        />
        %
      </label>
      <strong>− {formatRupiah(preview.discountAmount)}</strong>
    </div>
  );
}

// Total di sini pratinjau; server menghitung ulang dari harga database saat bayar.
export function OrderTotals({ page }) {
  const { preview } = page;
  return (
    <div className="order-totals">
      <div className="total-line">
        <span>Subtotal</span>
        <strong>{formatRupiah(preview.subtotal)}</strong>
      </div>
      <DiscountLine page={page} />
      {preview.discountPercent === null ? (
        <p id="discount-error" className="field-error">
          Diskon harus bilangan bulat 0 sampai 100.
        </p>
      ) : null}
      <div className="total-line grand-total">
        <span>Total pembayaran</span>
        <strong>{formatRupiah(preview.total)}</strong>
      </div>
    </div>
  );
}
