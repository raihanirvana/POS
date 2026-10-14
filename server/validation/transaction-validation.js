import { HttpError } from '../lib/http-error.js';
import {
  assertJsonObject,
  isPlainObject,
  isUuid,
  readInteger,
  readText,
} from './common.js';

export const maxCheckoutLines = 50;
export const maxRupiah = 1000000000000;
const idempotencyKeyPattern = /^[A-Za-z0-9_-]{8,100}$/;
const checkoutFields = [
  'idempotencyKey',
  'items',
  'discountPercent',
  'customerName',
  'orderType',
  'paymentMethod',
  'amountReceived',
];

export function invalidCheckout(fields) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Periksa kembali pesanan.', fields);
}

function readOneOf(value, allowed, error) {
  return allowed.includes(value) ? { value } : { error };
}

function readItem(item) {
  const keys = isPlainObject(item) ? Object.keys(item) : [];
  const shapeValid =
    isPlainObject(item) && keys.every((key) => key === 'productId' || key === 'quantity');
  const quantity = shapeValid && readInteger(item.quantity, 1, 100000);
  if (!quantity || !isUuid(item.productId)) {
    return null;
  }
  return { productId: item.productId, quantity: quantity.value };
}

function readItems(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxCheckoutLines) {
    return { error: `Pesanan berisi 1 sampai ${maxCheckoutLines} produk.` };
  }
  const items = value.map(readItem);
  if (items.includes(null)) {
    return { error: 'Setiap item butuh productId dan jumlah bulat 1 sampai 100.000.' };
  }
  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    return { error: 'Produk yang sama hanya boleh muncul sekali.' };
  }
  return { value: items };
}

function readIdempotencyKey(value) {
  const valid = typeof value === 'string' && idempotencyKeyPattern.test(value);
  return valid
    ? { value }
    : { error: 'idempotencyKey wajib: 8–100 karakter huruf, angka, - atau _.' };
}

function readDiscountPercent(value = 0) {
  return readInteger(value, 0, 100) ?? { error: 'Diskon harus bilangan bulat 0–100.' };
}

// Nama pelanggan opsional; kosong menjadi "Pelanggan" seperti prototype.
function readCustomerName(value) {
  if (value === undefined || value === null) {
    return { value: 'Pelanggan' };
  }
  const result = readText(value, 0, 60);
  return result
    ? { value: result.value || 'Pelanggan' }
    : { error: 'Nama pelanggan maksimal 60 karakter.' };
}

const checkoutRules = {
  idempotencyKey: readIdempotencyKey,
  items: readItems,
  discountPercent: readDiscountPercent,
  customerName: readCustomerName,
  orderType: (value) =>
    readOneOf(
      value,
      ['dine_in', 'takeaway'],
      'Jenis pesanan harus dine_in atau takeaway.',
    ),
  paymentMethod: (value) =>
    readOneOf(value, ['cash', 'qris'], 'Metode pembayaran harus cash atau qris.'),
};

// Tunai wajib menyebut uang diterima; QRIS selalu sebesar total sehingga tidak dikirim.
function readAmountReceived(value, paymentMethod) {
  if (paymentMethod === 'qris') {
    const absent = value === undefined;
    return absent ? { value: null } : { error: 'QRIS tidak memakai uang diterima.' };
  }
  if (paymentMethod !== 'cash') {
    return { value: null };
  }
  return (
    readInteger(value, 0, maxRupiah) ?? {
      error: 'Uang diterima wajib berupa bilangan bulat rupiah.',
    }
  );
}

function collectCheckout(body) {
  const values = {};
  const errors = {};
  for (const [key, read] of Object.entries(checkoutRules)) {
    const result = read(body[key]);
    if (result.error) {
      errors[key] = result.error;
    } else {
      values[key] = result.value;
    }
  }
  const amount = readAmountReceived(body.amountReceived, values.paymentMethod);
  if (amount.error) {
    errors.amountReceived = amount.error;
  }
  values.amountReceived = amount.value;
  return { values, errors };
}

export function parseCheckoutBody(body) {
  assertJsonObject(body, checkoutFields, 'Kirim pesanan dalam JSON.');
  const { values, errors } = collectCheckout(body);
  if (Object.keys(errors).length > 0) {
    throw invalidCheckout(errors);
  }
  return values;
}

function readDateFilter(value) {
  if (value === undefined) {
    return { value: undefined };
  }
  const date =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00.000Z`)
      : new Date(NaN);
  const valid =
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  return valid ? { value } : { error: 'Tanggal harus berformat YYYY-MM-DD.' };
}

function readQueryInteger(value, fallback, max, error) {
  if (value === undefined) {
    return { value: fallback };
  }
  const number =
    typeof value === 'string' && /^\d{1,6}$/.test(value) ? Number(value) : -1;
  return number >= 0 && number <= max ? { value: number } : { error };
}

function readSearch(value) {
  if (value === undefined) {
    return { value: undefined };
  }
  const result = readText(value, 0, 60);
  return result
    ? { value: result.value || undefined }
    : { error: 'Maksimal 60 karakter.' };
}

// Parameter lain (termasuk workspaceId) diabaikan; workspace selalu dari sesi.
export function parseTransactionQuery(query) {
  const results = {
    search: readSearch(query.search),
    date: readDateFilter(query.date),
    limit: readQueryInteger(query.limit, 50, 100, 'Limit harus 1 sampai 100.'),
    offset: readQueryInteger(query.offset, 0, 100000, 'Offset harus 0 sampai 100.000.'),
  };
  if (results.limit.value === 0) {
    results.limit = { error: 'Limit harus 1 sampai 100.' };
  }
  const errors = Object.entries(results).filter(([, result]) => result.error);
  if (errors.length > 0) {
    const fields = Object.fromEntries(errors.map(([key, result]) => [key, result.error]));
    throw new HttpError(400, 'VALIDATION_ERROR', 'Filter transaksi tidak valid.', fields);
  }
  return Object.fromEntries(Object.entries(results).map(([key, r]) => [key, r.value]));
}

export function transactionNotFound() {
  return new HttpError(404, 'NOT_FOUND', 'Transaksi tidak ditemukan.');
}

// ID asing atau salah format diperlakukan sama: transaksi tidak ditemukan.
export function parseTransactionId(value) {
  if (!isUuid(value)) {
    throw transactionNotFound();
  }
  return value;
}
