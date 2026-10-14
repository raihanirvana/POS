export function findSettings(database, workspaceId) {
  return database
    .prepare(
      `SELECT store_name, store_address, receipt_message, updated_at
       FROM settings WHERE workspace_id = ?`,
    )
    .get(workspaceId);
}

const settingsColumns = {
  storeName: 'store_name',
  storeAddress: 'store_address',
  receiptMessage: 'receipt_message',
};

// Nama kolom hanya dari daftar tetap; nilai lewat parameter.
export function updateSettings(database, workspaceId, changes, nowIso) {
  const keys = Object.keys(changes).filter((key) => Object.hasOwn(settingsColumns, key));
  const assignments = keys.map((key) => `${settingsColumns[key]} = $${key}`);
  const values = Object.fromEntries(keys.map((key) => [key, changes[key]]));
  return database
    .prepare(
      `UPDATE settings SET ${[...assignments, 'updated_at = $now'].join(', ')}
       WHERE workspace_id = $workspaceId`,
    )
    .run({ ...values, now: nowIso, workspaceId }).changes;
}
