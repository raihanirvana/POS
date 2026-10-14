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

// Menghapus data domain satu workspace (item ikut terhapus lewat CASCADE) dan menandai
// workspace belum di-seed. Sesi tidak disentuh agar pengguna tetap masuk.
export function clearWorkspaceData(database, workspaceId) {
  database.prepare('DELETE FROM transactions WHERE workspace_id = ?').run(workspaceId);
  database.prepare('DELETE FROM products WHERE workspace_id = ?').run(workspaceId);
  database.prepare('DELETE FROM settings WHERE workspace_id = ?').run(workspaceId);
  database
    .prepare('UPDATE demo_workspaces SET seeded_at = NULL WHERE id = ?')
    .run(workspaceId);
}
