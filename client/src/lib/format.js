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

const jakartaDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Tanggal YYYY-MM-DD menurut Asia/Jakarta, sama dengan filter tanggal API.
export function jakartaDateKey(date = new Date()) {
  return jakartaDateFormat.format(date);
}

const compactFormat = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// Contoh: 400000 → "Rp 400 rb" untuk label sumbu yang ringkas.
export function formatCompactRupiah(value) {
  return `Rp ${compactFormat.format(value)}`;
}

const weekdayFormat = new Intl.DateTimeFormat('id-ID', { timeZone, weekday: 'short' });
const shortDateFormat = new Intl.DateTimeFormat('id-ID', {
  timeZone,
  day: 'numeric',
  month: 'short',
});

// Kunci tanggal YYYY-MM-DD (kalender Jakarta) ke label; siang WIB agar tidak bergeser hari.
export function formatDayLabel(dateKey) {
  const date = new Date(`${dateKey}T12:00:00+07:00`);
  return { weekday: weekdayFormat.format(date), date: shortDateFormat.format(date) };
}
