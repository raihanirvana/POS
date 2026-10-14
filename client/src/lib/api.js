// Klien API satu origin. Cookie sesi HttpOnly dikirim browser; JavaScript tidak
// pernah membaca atau menyimpan token (tidak ada localStorage).
export class ApiError extends Error {
  constructor({ status, code, message, fields, requestId }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.requestId = requestId;
  }
}

const unauthorizedListeners = new Set();

// Dipanggil setiap respons 401 agar sesi di UI langsung dikosongkan.
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function networkError() {
  return new ApiError({
    status: 0,
    code: 'NETWORK_ERROR',
    message: 'Server belum bisa dihubungi. Periksa koneksi, lalu coba lagi.',
  });
}

function invalidResponse(status = 200) {
  return new ApiError({
    status,
    code: 'INVALID_RESPONSE',
    message: 'Respons server tidak valid. Coba lagi sebentar.',
  });
}

async function readPayload(response) {
  if (response.status === 204) {
    return null;
  }
  try {
    const type = response.headers.get('content-type') ?? '';
    if (!type.includes('application/json')) {
      throw invalidResponse(response.status);
    }
    const payload = await response.json();
    if (payload === null) {
      throw invalidResponse(response.status);
    }
    return payload;
  } catch (error) {
    if (error.name === 'AbortError' || response.ok) {
      throw error.name === 'AbortError' ? error : invalidResponse(response.status);
    }
    return null;
  }
}

function toApiError(response, payload) {
  const error = payload?.error ?? {};
  return new ApiError({
    status: response.status,
    code: typeof error.code === 'string' ? error.code : 'SERVER_ERROR',
    message:
      typeof error.message === 'string'
        ? error.message
        : 'Server sedang bermasalah. Coba lagi sebentar.',
    fields: error.fields,
    requestId: typeof error.requestId === 'string' ? error.requestId : undefined,
  });
}

function sendRequest(path, { method = 'GET', body, signal }) {
  return fetch(`/api${path}`, {
    method,
    signal,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await sendRequest(path, options);
  } catch (error) {
    throw error.name === 'AbortError' ? error : networkError();
  }
  const payload = await readPayload(response);
  if (response.ok) {
    return payload;
  }
  const apiError = toApiError(response, payload);
  if (response.status === 401) {
    unauthorizedListeners.forEach((listener) => listener(apiError));
  }
  throw apiError;
}

function sessionResponse(payload) {
  const session = payload?.session;
  const dates = [session?.startedAt, session?.expiresAt];
  const valid =
    ['owner', 'cashier'].includes(session?.role) &&
    typeof session?.roleLabel === 'string' &&
    session.roleLabel.trim().length > 0 &&
    dates.every(
      (value) => typeof value === 'string' && Number.isFinite(Date.parse(value)),
    );
  if (!valid) {
    throw invalidResponse();
  }
  return payload;
}

export async function getSession(signal) {
  return sessionResponse(await apiRequest('/session', { signal }));
}

export async function startDemoSession(role) {
  const payload = await apiRequest('/demo/sessions', { method: 'POST', body: { role } });
  return sessionResponse(payload);
}

export function endSession() {
  return apiRequest('/session', { method: 'DELETE' });
}
