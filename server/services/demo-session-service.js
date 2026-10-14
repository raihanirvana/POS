import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { seedWorkspaceData } from '../database/seed/index.js';
import { withTransaction } from '../database/transaction.js';
import {
  findSessionByTokenHash,
  insertSession,
  revokeSession,
} from '../repositories/session-repository.js';
import {
  deleteExpiredWorkspaces,
  deleteWorkspace,
  insertWorkspace,
  touchWorkspace,
} from '../repositories/workspace-repository.js';

export const demoRoles = { owner: 'Pemilik', cashier: 'Kasir' };

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function openWorkspace(database, now, ttlMinutes) {
  const createdAt = now.toISOString();
  deleteExpiredWorkspaces(database, createdAt);
  const workspace = {
    id: randomUUID(),
    createdAt,
    expiresAt: new Date(now.getTime() + ttlMinutes * 60000).toISOString(),
  };
  insertWorkspace(database, workspace);
  seedWorkspaceData(database, workspace.id, now);
  return { id: workspace.id, expiresAt: workspace.expiresAt, created: true };
}

// Ganti peran memakai ruang demo yang sama; sesi lama dicabut di transaksi yang sama.
function continueWorkspace(database, currentAuth, nowIso) {
  if (!currentAuth || currentAuth.workspaceExpiresAt <= nowIso) {
    return null;
  }
  if (!revokeSession(database, currentAuth.sessionId, nowIso)) {
    return null;
  }
  touchWorkspace(database, currentAuth.workspaceId, nowIso);
  return { id: currentAuth.workspaceId, expiresAt: currentAuth.workspaceExpiresAt };
}

function issueSession(database, workspace, role, nowIso) {
  const token = randomBytes(32).toString('base64url');
  const session = {
    id: randomUUID(),
    workspaceId: workspace.id,
    tokenHash: hashToken(token),
    role,
    createdAt: nowIso,
    expiresAt: workspace.expiresAt,
  };
  insertSession(database, session);
  return { token, session };
}

export function startDemoSession(database, { role, currentAuth, now, ttlMinutes }) {
  return withTransaction(database, () => {
    const nowIso = now.toISOString();
    const workspace =
      continueWorkspace(database, currentAuth, nowIso) ??
      openWorkspace(database, now, ttlMinutes);
    const { token, session } = issueSession(database, workspace, role, nowIso);
    return {
      token,
      auth: toAuth({ ...session, workspaceExpiresAt: workspace.expiresAt }),
      workspaceCreated: workspace.created === true,
    };
  });
}

function toAuth(session) {
  return {
    sessionId: session.id,
    workspaceId: session.workspaceId,
    role: session.role,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    workspaceExpiresAt: session.workspaceExpiresAt,
  };
}

// Hasil { auth } untuk sesi aktif, atau { problem: 'invalid' | 'expired' }.
export function resolveDemoSession(database, token, now) {
  const row = token ? findSessionByTokenHash(database, hashToken(token)) : undefined;
  if (!row || row.revoked_at) {
    return { problem: 'invalid' };
  }
  const nowIso = now.toISOString();
  if (row.expires_at <= nowIso || row.workspace_expires_at <= nowIso) {
    return { problem: 'expired' };
  }
  return {
    auth: toAuth({
      id: row.id,
      workspaceId: row.workspace_id,
      role: row.role,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      workspaceExpiresAt: row.workspace_expires_at,
    }),
  };
}

// Setelah keluar, ruang demo tidak dapat dijangkau lagi sehingga datanya langsung dihapus.
export function endDemoSession(database, auth) {
  return withTransaction(database, () => {
    if (!revokeSession(database, auth.sessionId, new Date().toISOString())) {
      return false;
    }
    deleteWorkspace(database, auth.workspaceId);
    return true;
  });
}

export function describeSession(auth) {
  return {
    role: auth.role,
    roleLabel: demoRoles[auth.role],
    startedAt: auth.createdAt,
    expiresAt: auth.expiresAt,
  };
}
