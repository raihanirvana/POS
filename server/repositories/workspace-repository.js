export function insertWorkspace(database, workspace) {
  database
    .prepare(
      `INSERT INTO demo_workspaces (id, created_at, last_active_at, expires_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(workspace.id, workspace.createdAt, workspace.createdAt, workspace.expiresAt);
}

export function touchWorkspace(database, workspaceId, nowIso) {
  database
    .prepare('UPDATE demo_workspaces SET last_active_at = ? WHERE id = ?')
    .run(nowIso, workspaceId);
}

// Menghapus ruang demo beserta sesi, produk, transaksi, dan pengaturannya (CASCADE).
export function deleteWorkspace(database, workspaceId) {
  database.prepare('DELETE FROM demo_workspaces WHERE id = ?').run(workspaceId);
}

export function deleteExpiredWorkspaces(database, nowIso) {
  return database.prepare('DELETE FROM demo_workspaces WHERE expires_at <= ?').run(nowIso)
    .changes;
}
