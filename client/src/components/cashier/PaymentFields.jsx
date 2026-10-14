import { quickCashOptions } from '../../lib/checkout.js';
import { formatRupiah } from '../../lib/format.js';

const methods = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS simulasi' },
];

export function MethodToggle({ form }) {
  return (
    <div
      className="segmented payment-methods"
      role="group"
      aria-label="Metode pembayaran"
    >
      {methods.map((method) => (
        <button
          key={method.value}
          type="button"
          className={form.method === method.value ? 'active' : undefined}
          aria-pressed={form.method === method.value}
          onClick={() => form.setMethod(method.value)}
        >
          {method.label}
        </button>
      ))}
    </div>
  );
}

function AmountHint({ form }) {
  return (
    <p id="payment-amount-message" className="field-hint">
      {form.amountText.trim()
        ? 'Nominal harus bulat Rp0 sampai Rp1.000.000.000.000.'
        : 'Masukkan nominal tanpa titik.'}
    </p>
  );
}

function ChangeLine({ form, total, serverError }) {
  if (serverError) {
    return (
      <p id="payment-amount-message" className="field-error">
        {serverError}
      </p>
    );
  }
  if (form.amount === null) {
    return <AmountHint form={form} />;
  }
  const short = form.amount < total;
  return (
    <p id="payment-amount-message" className={short ? 'field-error' : 'change-line'}>
      {short
        ? `Uang kurang ${formatRupiah(total - form.amount)}.`
        : `Kembalian ${formatRupiah(form.amount - total)}`}
    </p>
  );
}

function QuickCash({ form, total }) {
  return (
    <div className="quick-cash" role="group" aria-label="Nominal cepat">
      {quickCashOptions(total).map((value, index) => (
        <button
          key={value}
          type="button"
          className="secondary-button compact-button"
          onClick={() => form.setAmountText(String(value))}
        >
          {index === 0 ? 'Uang pas' : formatRupiah(value)}
        </button>
      ))}
    </div>
  );
}

export function CashFields({ form, total, serverError }) {
  const invalid =
    Boolean(serverError) ||
    Boolean(form.amountText.trim() && (form.amount === null || form.amount < total));
  return (
    <div className="field">
      <label htmlFor="payment-amount">Uang diterima (Rp)</label>
      <input
        id="payment-amount"
        className="input"
        inputMode="numeric"
        value={form.amountText}
        onChange={(event) => form.setAmountText(event.target.value)}
        aria-describedby="payment-amount-message"
        aria-invalid={invalid ? 'true' : undefined}
        autoComplete="off"
        autoFocus
      />
      <QuickCash form={form} total={total} />
      <ChangeLine form={form} total={total} serverError={serverError} />
    </div>
  );
}

// QRIS di demo hanya konfirmasi manual: tidak ada kode QR maupun payment gateway.
export function QrisNote({ total }) {
  return (
    <div className="qris-note">
      <strong>QRIS simulasi</strong>
      <p>
        Tidak ada kode QR atau payment gateway di demo ini. Konfirmasi setelah pelanggan
        dianggap membayar {formatRupiah(total)}.
      </p>
    </div>
  );
}
