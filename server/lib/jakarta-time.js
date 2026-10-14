// Asia/Jakarta tidak memakai daylight saving, sehingga offset selalu +07:00.
const jakartaDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function jakartaDateKey(date) {
  return jakartaDateFormat.format(date);
}

export function shiftDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function jakartaTime(dateKey, time) {
  return new Date(`${dateKey}T${time}+07:00`);
}
