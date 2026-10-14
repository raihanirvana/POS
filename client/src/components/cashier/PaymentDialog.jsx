import { useModalDialog } from '../../hooks/useModalDialog.js';
import { usePaymentForm } from '../../hooks/usePaymentForm.js';
import { formatRupiah } from '../../lib/format.js';
import { amountFieldError } from '../../lib/checkout.js';
import { DialogHeader } from '../DialogHeader.jsx';
import { CashFields, MethodToggle, QrisNote } from './PaymentFields.jsx';
import { PaymentFeedback } from './PaymentFeedback.jsx';

function submitLabel(status) {
  if (status === 'submitting') {
    return 'Memproses…';
  }
  return status === 'uncertain' ? 'Kirim ulang pembayaran' : 'Konfirmasi pembayaran';
}

function PaymentActions({ form, onClose }) {
  const busy = form.status === 'submitting';
  return (
    <div className="dialog-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={onClose}
        disabled={busy}
      >
        Tutup
      </button>
      <button
        type="submit"
        className="primary-button"
        disabled={busy || (form.status !== 'uncertain' && !form.enough)}
      >
        {submitLabel(form.status)}
      </button>
    </div>
  );
}

function PaymentInputs({ form, total, checkout }) {
  return (
    <fieldset className="payment-inputs" disabled={form.locked}>
      <legend className="visually-hidden">Metode dan nominal</legend>
      <MethodToggle form={form} />
      {form.method === 'cash' ? (
        <CashFields
          form={form}
          total={total}
          serverError={amountFieldError(checkout.error)}
        />
      ) : (
        <QrisNote total={total} />
      )}
    </fieldset>
  );
}

function PaymentSummary({ page, form }) {
  const { checkout } = page.cart;
  const total = checkout.attempt?.previewTotal ?? page.preview.total;
  return (
    <>
      <div className="payment-total">
        <small>Total pembayaran</small>
        <strong>{formatRupiah(total)}</strong>
      </div>
      <PaymentInputs form={form} total={total} checkout={checkout} />
      <PaymentFeedback
        checkout={checkout}
        method={form.method}
        empty={!page.preview.lines.length}
      />
    </>
  );
}

function PaymentForm({ page, form, onClose }) {
  return (
    <form onSubmit={form.submit} noValidate>
      <DialogHeader
        titleId="payment-title"
        title="Pembayaran"
        subtitle="Simulasi: tidak ada uang atau saldo yang berpindah."
        onClose={onClose}
        disabled={form.status === 'submitting'}
        closeLabel="Tutup pembayaran"
      />
      <PaymentSummary page={page} form={form} />
      <PaymentActions form={form} onClose={onClose} />
    </form>
  );
}

// Escape/Tutup tidak berlaku saat request masih berjalan agar hasilnya tidak hilang.
export function PaymentDialog({ page }) {
  const form = usePaymentForm(page);
  const dialogRef = useModalDialog(true);
  function close() {
    if (form.status !== 'submitting') {
      page.payment.close();
    }
  }
  function handleCancel(event) {
    event.preventDefault();
    close();
  }
  return (
    <dialog
      ref={dialogRef}
      className="form-dialog"
      onCancel={handleCancel}
      aria-labelledby="payment-title"
    >
      <PaymentForm page={page} form={form} onClose={close} />
    </dialog>
  );
}
