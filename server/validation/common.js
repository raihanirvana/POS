import { HttpError } from '../lib/http-error.js';

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Panjang dihitung per karakter Unicode, sama dengan length() SQLite untuk TEXT.
export function characterCount(text) {
  return [...text].length;
}

function hasControlCharacter(text) {
  return [...text].some((character) => {
    const code = character.codePointAt(0);
    return code < 32 || (code >= 127 && code <= 159);
  });
}

// Hasil { value } jika valid; null jika bukan teks yang diizinkan.
export function readText(value, minLength, maxLength) {
  if (typeof value !== 'string' || !value.isWellFormed() || hasControlCharacter(value)) {
    return null;
  }
  const text = value.trim();
  const length = characterCount(text);
  return length >= minLength && length <= maxLength ? { value: text } : null;
}

export function readInteger(value, min, max) {
  const valid = Number.isSafeInteger(value) && value >= min && value <= max;
  return valid ? { value } : null;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isUuid(value) {
  return typeof value === 'string' && uuidPattern.test(value);
}

// Body harus objek JSON; field di luar `allowed` ditolak, bukan diabaikan.
export function assertJsonObject(body, allowed, emptyMessage) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', emptyMessage);
  }
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    const entries = unknown
      .slice(0, 10)
      .map((key) => [key.slice(0, 40), 'Tidak diterima.']);
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Ada field yang tidak diterima.',
      Object.fromEntries(entries),
    );
  }
}

// Tanggal kalender YYYY-MM-DD yang benar-benar ada (menolak 2026-02-30).
export function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
