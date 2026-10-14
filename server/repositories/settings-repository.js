export function findSettings(database, workspaceId) {
  return database
    .prepare(
      `SELECT store_name, store_address, receipt_message, updated_at
       FROM settings WHERE workspace_id = ?`,
    )
    .get(workspaceId);
}
