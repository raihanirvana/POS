import { config } from '../config.js';
import { normalizeOrigin } from '../lib/origin.js';
import { HttpError } from '../lib/http-error.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const crossSiteFetch = new Set(['cross-site', 'same-site']);

function ownOrigin(request) {
  return normalizeOrigin(`${request.protocol}://${request.get('host')}`);
}

function originAllowed(request, origin) {
  const normalized = normalizeOrigin(origin);
  return (
    normalized !== null &&
    (normalized === ownOrigin(request) || config.allowedOrigins.includes(normalized))
  );
}

// Perlindungan CSRF lapis kedua (cookie sudah SameSite=Strict dan body wajib JSON):
// mutasi dari browser harus berasal dari origin aplikasi ini. Klien non-browser tanpa
// Origin/Sec-Fetch-Site (curl) tidak membawa cookie korban sehingga tetap diizinkan.
export function requireSameOrigin(request, _response, next) {
  if (safeMethods.has(request.method)) {
    next();
    return;
  }
  const origin = request.get('origin');
  const fetchSite = request.get('sec-fetch-site');
  const rejected = origin
    ? !originAllowed(request, origin)
    : crossSiteFetch.has(fetchSite);
  if (rejected) {
    next(new HttpError(403, 'ORIGIN_REJECTED', 'Permintaan dari situs lain ditolak.'));
    return;
  }
  next();
}
