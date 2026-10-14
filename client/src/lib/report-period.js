// Sama dengan validasi server (server/validation/report-validation.js); server tetap
// menolak periode tidak valid walau pemeriksaan ini dilewati.
export const maxReportDays = 366;

export function shiftDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dayCount(from, to) {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000 + 1;
}

export function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function periodError({ from, to }) {
  if (!from || !to) {
    return 'Pilih tanggal awal dan akhir.';
  }
  if (!isDateKey(from) || !isDateKey(to)) {
    return 'Pilih tanggal kalender yang valid, format YYYY-MM-DD.';
  }
  if (from > to) {
    return 'Tanggal akhir tidak boleh sebelum tanggal awal.';
  }
  return dayCount(from, to) > maxReportDays
    ? `Rentang laporan maksimal ${maxReportDays} hari.`
    : null;
}

export function presetPeriod(today, days) {
  return { from: shiftDateKey(today, -(days - 1)), to: today };
}
