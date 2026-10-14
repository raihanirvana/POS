import { withTransaction } from '../database/transaction.js';
import { HttpError } from '../lib/http-error.js';
import { resolveDemoSessionById } from './demo-session-service.js';

function activeWorkspaceAuth(database, auth, access) {
  const current = resolveDemoSessionById(database, auth.sessionId, new Date());
  if (!current.auth || current.auth.workspaceId !== auth.workspaceId) {
    const expired = current.problem === 'expired';
    const code = expired ? 'SESSION_EXPIRED' : 'UNAUTHENTICATED';
    throw new HttpError(401, code, 'Sesi berubah atau berakhir. Masuk demo lagi.');
  }
  if (!access.roles.includes(current.auth.role)) {
    throw new HttpError(403, 'FORBIDDEN', access.forbiddenMessage);
  }
  return current.auth;
}

// Periksa sesi setelah kunci tulis didapat, sebelum perubahan data apa pun.
// `work` menerima auth terkini (workspaceId, role) dari tabel sessions.
export function withWorkspaceAccess(database, auth, access, work) {
  return withTransaction(database, () =>
    work(activeWorkspaceAuth(database, auth, access)),
  );
}

const ownerAccess = {
  roles: ['owner'],
  forbiddenMessage: 'Hanya pemilik dapat mengelola produk.',
};

export function withOwnerWorkspace(database, auth, work) {
  return withWorkspaceAccess(database, auth, ownerAccess, (current) =>
    work(current.workspaceId),
  );
}
