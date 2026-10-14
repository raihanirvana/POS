// Aturan sama dengan validasi server (server/validation/product-validation.js).
// Validasi di sini hanya mempercepat umpan balik; server tetap sumber kebenaran.
export const defaultImageByCategory = {
  Kopi: 'latte',
  'Non-kopi': 'matcha',
  Pastry: 'croissant',
};

const messages = {
  name: 'Nama wajib diisi, maksimal 60 karakter.',
  category: 'Pilih kategori.',
  price: 'Harga harus bilangan bulat Rp1.000 sampai Rp10.000.000.',
  stock: 'Stok harus bilangan bulat 0 sampai 100.000.',
  description: 'Deskripsi maksimal 100 karakter.',
  tag: 'Label maksimal 30 karakter.',
  imageKey: 'Pilih foto yang sesuai kategori.',
};

export const productFields = Object.keys(messages);

export function emptyProductValues() {
  return {
    name: '',
    category: 'Kopi',
    price: '',
    stock: '0',
    description: '',
    tag: '',
    imageKey: defaultImageByCategory.Kopi,
  };
}

export function productToValues(product) {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    description: product.description,
    tag: product.tag ?? '',
    imageKey: product.imageKey,
  };
}

function characterCount(text) {
  return [...text.trim()].length;
}

function hasControlCharacter(text) {
  return [...text].some((character) => {
    const code = character.codePointAt(0);
    return code < 32 || (code >= 127 && code <= 159);
  });
}

function validText(text, min, max) {
  const length = characterCount(text);
  return (
    text.isWellFormed() && !hasControlCharacter(text) && length >= min && length <= max
  );
}

function readWholeNumber(text, min, max) {
  const trimmed = text.trim();
  const number = /^\d{1,9}$/.test(trimmed) ? Number(trimmed) : Number.NaN;
  return number >= min && number <= max ? number : null;
}

function presetFits(presets, imageKey, category) {
  return presets.some(
    (preset) => preset.key === imageKey && preset.category === category,
  );
}

function fieldValid(key, values, presets) {
  const checks = {
    name: () => validText(values.name, 1, 60),
    category: () => Object.hasOwn(defaultImageByCategory, values.category),
    price: () => readWholeNumber(values.price, 1000, 10000000) !== null,
    stock: () => readWholeNumber(values.stock, 0, 100000) !== null,
    description: () => validText(values.description, 0, 100),
    tag: () => validText(values.tag, 0, 30),
    imageKey: () => presetFits(presets, values.imageKey, values.category),
  };
  return checks[key]();
}

export function validateProduct(values, presets) {
  const invalid = productFields.filter((key) => !fieldValid(key, values, presets));
  return Object.fromEntries(invalid.map((key) => [key, messages[key]]));
}

export function toProductPayload(values) {
  return {
    name: values.name.trim(),
    category: values.category,
    price: Number(values.price.trim()),
    stock: Number(values.stock.trim()),
    description: values.description.trim(),
    tag: values.tag.trim() || null,
    imageKey: values.imageKey,
  };
}

// Edit hanya mengirim field yang berubah agar stok hasil checkout tidak tertimpa.
export function changedFields(payload, product) {
  const original = { ...product, tag: product.tag ?? null };
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => original[key] !== value),
  );
}

// Ganti kategori: foto dipertahankan bila cocok, selain itu kembali ke default kategori.
export function imageForCategory(category, imageKey, presets) {
  return presetFits(presets, imageKey, category)
    ? imageKey
    : defaultImageByCategory[category];
}

export function priceHint(price, formatRupiah) {
  const value = readWholeNumber(price, 1000, 10000000);
  return value !== null
    ? `Tampil sebagai ${formatRupiah(value)}`
    : 'Bilangan bulat rupiah, contoh 28000';
}
