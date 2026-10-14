import { HttpError } from '../lib/http-error.js';
import { clearSessionCookie, readSessionToken } from '../lib/session-cookie.js';
import { demoRoles, resolveDemoSession } from '../services/demo-session-service.js';

const sessionProblems = {
  missing: { code: 'UNAUTHENTICATED', message: 'Masuk demo terlebih dahulu.' },
  invalid: { code: 'UNAUTHENTICATED', message: 'Sesi tidak dikenali. Masuk demo lagi.' },
  expired: { code: 'SESSION_EXPIRED', message: 'Sesi demo berakhir. Masuk demo lagi.' },
};

// Mengisi request.auth dari cookie; workspace dan peran hanya berasal dari tabel sessions.
export function loadSession(database) {
  return (request, _response, next) => {
    const token = readSessionToken(request);
    request.auth = null;
    request.authProblem = 'missing';
    if (token !== undefined) {
      const result = resolveDemoSession(database, token, new Date());
      request.auth = result.auth ?? null;
      request.authProblem = result.problem ?? null;
    }
    next();
  };
}

export function requireSession(request, response, next) {
  if (request.auth) {
    next();
    return;
  }
  if (request.authProblem !== 'missing') {
    clearSessionCookie(request, response);
  }
  const { code, message } = sessionProblems[request.authProblem];
  next(new HttpError(401, code, message));
}

export function requireRole(...roles) {
  return (request, _response, next) => {
    if (roles.includes(request.auth?.role)) {
      next();
      return;
    }
    const label = demoRoles[request.auth?.role] ?? 'Pengunjung';
    next(new HttpError(403, 'FORBIDDEN', `${label} tidak memiliki akses ke fitur ini.`));
  };
}
