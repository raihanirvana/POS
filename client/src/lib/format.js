const timeZone = 'Asia/Jakarta';

const longDateFormat = new Intl.DateTimeFormat('id-ID', {
  timeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat('id-ID', {
  timeZone,
  hour: '2-digit',
  minute: '2-digit',
});

export function formatToday(date = new Date()) {
  return longDateFormat.format(date);
}

export function formatTime(value) {
  return `${timeFormat.format(new Date(value))} WIB`;
}

export const roleLabels = { owner: 'Pemilik', cashier: 'Kasir' };

const rupiahFormat = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatRupiah(value) {
  return rupiahFormat.format(value);
}

const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  timeZone,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(value) {
  return `${dateTimeFormat.format(new Date(value))} WIB`;
}

export const orderTypeLabels = { dine_in: 'Makan di tempat', takeaway: 'Bawa pulang' };
export const paymentMethodLabels = { cash: 'Tunai', qris: 'QRIS (simulasi)' };
