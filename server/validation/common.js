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
