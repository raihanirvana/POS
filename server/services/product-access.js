import { withTransaction } from '../database/transaction.js';
import { HttpError } from '../lib/http-error.js';
import { resolveDemoSessionById } from './demo-session-service.js';

function activeOwnerWorkspace(database, auth) {
  const current = resolveDemoSessionById(database, auth.sessionId, new Date());
  if (!current.auth || current.auth.workspaceId !== auth.workspaceId) {
    const expired = current.problem === 'expired';
    const code = expired ? 'SESSION_EXPIRED' : 'UNAUTHENTICATED';
    throw new HttpError(401, code, 'Sesi berubah atau berakhir. Masuk demo lagi.');
  }
  if (current.auth.role !== 'owner') {
    throw new HttpError(403, 'FORBIDDEN', 'Hanya pemilik dapat mengelola produk.');
  }
  return current.auth.workspaceId;
}

// Periksa sesi setelah kunci tulis didapat, sebelum perubahan produk apa pun.
export function withOwnerWorkspace(database, auth, work) {
  return withTransaction(database, () => {
    const workspaceId = activeOwnerWorkspace(database, auth);
    return work(workspaceId);
  });
}
