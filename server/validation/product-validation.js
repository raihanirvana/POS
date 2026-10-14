import { HttpError } from '../lib/http-error.js';
import { imagePresets, productCategories } from '../lib/product-catalog.js';
import { isPlainObject, readInteger, readText } from './common.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const requiredOnCreate = ['name', 'category', 'price', 'stock'];

function readOneOf(value, allowed) {
  return allowed.includes(value) ? { value } : null;
}

function readTag(value) {
  if (value === null) {
    return { value: null };
  }
  const result = readText(value, 0, 30);
  return result && { value: result.value || null };
}

const fieldRules = {
  name: [(value) => readText(value, 1, 60), 'Nama wajib diisi, maksimal 60 karakter.'],
  category: [
    (value) => readOneOf(value, productCategories),
    'Kategori harus Kopi, Non-kopi, atau Pastry.',
  ],
  price: [
    (value) => readInteger(value, 1000, 10000000),
    'Harga harus bilangan bulat Rp1.000 sampai Rp10.000.000.',
  ],
  stock: [
    (value) => readInteger(value, 0, 100000),
    'Stok harus bilangan bulat 0 sampai 100.000.',
  ],
  description: [(value) => readText(value, 0, 100), 'Deskripsi maksimal 100 karakter.'],
  tag: [readTag, 'Label maksimal 30 karakter atau null.'],
  imageKey: [
    (value) =>
      readOneOf(
        value,
        imagePresets.map((preset) => preset.key),
      ),
    'Foto harus salah satu preset.',
  ],
};

export function invalidProduct(fields) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Periksa kembali data produk.', fields);
}

// Field di luar daftar (id, workspaceId, seedKey, ...) ditolak, bukan diabaikan.
function assertProductBody(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Kirim data produk dalam JSON.');
  }
  const unknown = Object.keys(body).filter((key) => !Object.hasOwn(fieldRules, key));
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

function readFields(body, missingFields) {
  const values = {};
  const errors = {};
  for (const key of Object.keys(body)) {
    const [read, message] = fieldRules[key];
    const result = read(body[key]);
    if (result) {
      values[key] = result.value;
    } else {
      errors[key] = message;
    }
  }
  for (const key of missingFields) {
    errors[key] = fieldRules[key][1];
  }
  if (Object.keys(errors).length > 0) {
    throw invalidProduct(errors);
  }
  return values;
}

export function parseProductCreate(body) {
  assertProductBody(body);
  const missing = requiredOnCreate.filter((key) => !Object.hasOwn(body, key));
  const values = readFields(body, missing);
  return { description: '', tag: null, ...values };
}

export function parseProductPatch(body) {
  assertProductBody(body);
  if (Object.keys(body).length === 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Tidak ada perubahan produk.');
  }
  return readFields(body, []);
}

function readSearch(value) {
  if (value === undefined) {
    return { value: undefined };
  }
  const result = readText(value, 0, 60);
  return result && { value: result.value || undefined };
}

function readCategoryFilter(value) {
  return value === undefined ? { value: undefined } : readOneOf(value, productCategories);
}

// Parameter query lain (termasuk workspaceId) diabaikan; workspace selalu dari sesi.
export function parseProductQuery(query) {
  const categoryResult = readCategoryFilter(query.category);
  const searchResult = readSearch(query.search);
  const errors = {};
  if (!categoryResult) {
    errors.category = fieldRules.category[1];
  }
  if (!searchResult) {
    errors.search = 'Kata kunci maksimal 60 karakter.';
  }
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Filter produk tidak valid.', errors);
  }
  return { category: categoryResult.value, search: searchResult.value };
}

// ID asing atau salah format diperlakukan sama: produk tidak ditemukan.
export function parseProductId(value) {
  if (typeof value !== 'string' || !uuidPattern.test(value)) {
    throw productNotFound();
  }
  return value;
}

export function productNotFound() {
  return new HttpError(404, 'NOT_FOUND', 'Produk tidak ditemukan.');
}
