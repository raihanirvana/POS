// Batas sama dengan validasi server (server/validation/settings-validation.js).
export const settingsLimits = { storeName: 60, storeAddress: 150, receiptMessage: 200 };

const messages = {
  storeName: 'Nama toko wajib diisi, maksimal 60 karakter.',
  storeAddress: 'Alamat wajib diisi, maksimal 150 karakter.',
  receiptMessage: 'Pesan struk wajib diisi, maksimal 200 karakter.',
};

export function characterCount(text) {
  return [...text.trim()].length;
}

function hasControlCharacter(text) {
  return [...text].some((character) => {
    const code = character.codePointAt(0);
    return code < 32 || (code >= 127 && code <= 159);
  });
}

export function validateSettings(values) {
  const invalid = Object.keys(settingsLimits).filter((key) => {
    const value = values[key];
    if (typeof value !== 'string' || !value.isWellFormed()) {
      return true;
    }
    const count = characterCount(value);
    return count < 1 || count > settingsLimits[key] || hasControlCharacter(value);
  });
  return Object.fromEntries(invalid.map((key) => [key, messages[key]]));
}

// Hanya field yang berubah dikirim (PATCH).
export function changedSettings(values, saved) {
  const trimmed = Object.fromEntries(
    Object.keys(settingsLimits).map((key) => [key, values[key].trim()]),
  );
  return Object.fromEntries(
    Object.entries(trimmed).filter(([key, value]) => saved[key] !== value),
  );
}
