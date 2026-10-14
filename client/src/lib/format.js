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
