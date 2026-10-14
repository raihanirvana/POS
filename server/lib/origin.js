// Bentuk kanonis HTTP(S), tanpa kredensial, path, query, atau fragment.
export function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value || /\s/.test(value)) {
    return null;
  }
  try {
    const url = new URL(value);
    const valid =
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash;
    return valid ? url.origin : null;
  } catch {
    return null;
  }
}
