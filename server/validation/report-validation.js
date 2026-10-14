import { HttpError } from '../lib/http-error.js';
import { isDateKey } from './common.js';

export const maxReportDays = 366;
const dayInMs = 86400000;

function dayCount(from, to) {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / dayInMs + 1;
}

function periodErrors(from, to) {
  const errors = {};
  if (!isDateKey(from)) {
    errors.from = 'Tanggal awal wajib, format YYYY-MM-DD.';
  }
  if (!isDateKey(to)) {
    errors.to = 'Tanggal akhir wajib, format YYYY-MM-DD.';
  }
  if (Object.keys(errors).length === 0 && from > to) {
    errors.to = 'Tanggal akhir tidak boleh sebelum tanggal awal.';
  } else if (Object.keys(errors).length === 0 && dayCount(from, to) > maxReportDays) {
    errors.to = `Rentang laporan maksimal ${maxReportDays} hari.`;
  }
  return errors;
}

// Periode inklusif menurut kalender Asia/Jakarta; parameter lain diabaikan.
export function parseReportPeriod(query) {
  const errors = periodErrors(query.from, query.to);
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Periode laporan tidak valid.', errors);
  }
  return { from: query.from, to: query.to };
}
