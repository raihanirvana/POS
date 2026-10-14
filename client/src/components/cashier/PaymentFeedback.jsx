import { ErrorNotice } from '../ErrorNotice.jsx';
import { amountFieldError } from '../../lib/checkout.js';

const stockCodes = ['INSUFFICIENT_STOCK', 'PRODUCT_UNAVAILABLE'];

function UncertainNotice({ checkout }) {
  return (
    <div className="payment-uncertain" role="alert">
      <strong>Pembayaran belum pasti tersimpan</strong>
      <p>{checkout.error.message}</p>
      <p>
        Kirim ulang memakai kunci transaksi yang sama, jadi pesanan tidak akan tercatat
        dua kali. Pesanan dikunci sampai pembayaran ini selesai.
      </p>
      <button type="button" className="text-button" onClick={checkout.abandon}>
        Batalkan percobaan (cek halaman Transaksi sebelum membuat pesanan ulang)
      </button>
    </div>
  );
}

// Ditolak server (400/409): tidak ada transaksi; pesanan tetap bisa diperbaiki.
function feedbackError(checkout, empty) {
  if (!stockCodes.includes(checkout.error.code)) {
    const fields = Object.values(checkout.error.fields ?? {}).filter(
      (message) => typeof message === 'string' && message.trim(),
    );
    return {
      ...checkout.error,
      message: fields.length > 0 ? fields.join(' ') : checkout.error.message,
    };
  }
  const next = empty
    ? 'Pesanan sudah kosong. Tutup pembayaran lalu pilih menu lagi.'
    : 'Pesanan disesuaikan; periksa lalu bayar lagi.';
  return { message: `${checkout.error.message} ${next}` };
}

export function PaymentFeedback({ checkout, method, empty }) {
  if (checkout.status === 'uncertain') {
    return <UncertainNotice checkout={checkout} />;
  }
  if (
    checkout.status !== 'failed' ||
    (method === 'cash' && amountFieldError(checkout.error))
  ) {
    return null;
  }
  const stockChanged = stockCodes.includes(checkout.error.code);
  return (
    <ErrorNotice
      title={stockChanged ? 'Stok berubah' : 'Pembayaran ditolak'}
      error={feedbackError(checkout, empty)}
    />
  );
}
