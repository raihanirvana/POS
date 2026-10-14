export function findSessionByTokenHash(database, tokenHash) {
  return database
    .prepare(
      `SELECT session.id, session.workspace_id, session.role, session.created_at,
         session.expires_at, session.revoked_at, workspace.expires_at AS workspace_expires_at
       FROM sessions AS session
       JOIN demo_workspaces AS workspace ON workspace.id = session.workspace_id
       WHERE session.token_hash = ?`,
    )
    .get(tokenHash);
}

export function findSessionById(database, sessionId) {
  return database
    .prepare(
      `SELECT session.id, session.workspace_id, session.role, session.created_at,
         session.expires_at, session.revoked_at, workspace.expires_at AS workspace_expires_at
       FROM sessions AS session
       JOIN demo_workspaces AS workspace ON workspace.id = session.workspace_id
       WHERE session.id = ?`,
    )
    .get(sessionId);
}

export function insertSession(database, session) {
  database
    .prepare(
      `INSERT INTO sessions (id, workspace_id, token_hash, role, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      session.id,
      session.workspaceId,
      session.tokenHash,
      session.role,
      session.createdAt,
      session.expiresAt,
    );
}

// Mengembalikan true hanya jika sesi masih aktif saat dicabut.
export function revokeSession(database, sessionId, nowIso) {
  const result = database
    .prepare('UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
    .run(nowIso, sessionId);
  return result.changes === 1;
}
