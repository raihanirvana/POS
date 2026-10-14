import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { HttpError } from '../lib/http-error.js';
import { seedWorkspaceData } from '../database/seed/index.js';
import { withTransaction } from '../database/transaction.js';
import {
  findSessionByTokenHash,
  findSessionById,
  insertSession,
  revokeSession,
} from '../repositories/session-repository.js';
import {
  countWorkspaces,
  deleteExpiredWorkspaces,
  deleteWorkspace,
  insertWorkspace,
  touchWorkspace,
} from '../repositories/workspace-repository.js';

export const demoRoles = { owner: 'Pemilik', cashier: 'Kasir' };

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

// Kapasitas global membatasi pertumbuhan database dari demo publik.
function assertCapacity(database, maxWorkspaces) {
  if (countWorkspaces(database) >= maxWorkspaces) {
    throw new HttpError(
      503,
      'DEMO_CAPACITY',
      'Ruang demo sedang penuh. Coba lagi beberapa saat lagi.',
    );
  }
}

function openWorkspace(database, now, limits) {
  const createdAt = now.toISOString();
  deleteExpiredWorkspaces(database, createdAt);
  assertCapacity(database, limits.maxWorkspaces);
  const workspace = {
    id: randomUUID(),
    createdAt,
    expiresAt: new Date(now.getTime() + limits.ttlMinutes * 60000).toISOString(),
  };
  insertWorkspace(database, workspace);
  seedWorkspaceData(database, workspace.id, now);
  return { id: workspace.id, expiresAt: workspace.expiresAt, created: true };
}

// Ganti peran memakai ruang demo yang sama; sesi lama dicabut di transaksi yang sama.
function continueWorkspace(database, currentAuth, now) {
  const current = currentAuth
    ? resolveDemoSessionById(database, currentAuth.sessionId, now).auth
    : null;
  if (!current || current.workspaceId !== currentAuth.workspaceId) {
    return null;
  }
  const nowIso = now.toISOString();
  if (!revokeSession(database, current.sessionId, nowIso)) {
    return null;
  }
  touchWorkspace(database, current.workspaceId, nowIso);
  return { id: current.workspaceId, expiresAt: current.workspaceExpiresAt };
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

export function startDemoSession(database, { role, currentAuth, limits }) {
  return withTransaction(database, () => {
    const now = new Date();
    const nowIso = now.toISOString();
    const workspace =
      continueWorkspace(database, currentAuth, now) ??
      openWorkspace(database, now, limits);
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
function resolveStoredSession(row, now) {
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

export function resolveDemoSession(database, token, now) {
  const row = token ? findSessionByTokenHash(database, hashToken(token)) : undefined;
  return resolveStoredSession(row, now);
}

export function resolveDemoSessionById(database, sessionId, now) {
  return resolveStoredSession(findSessionById(database, sessionId), now);
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
