import { seedWorkspaceData } from '../database/seed/index.js';
import { findSettings, updateSettings } from '../repositories/settings-repository.js';
import { clearWorkspaceData } from '../repositories/workspace-repository.js';
import { withOwnerWorkspace } from './workspace-access.js';

function toSettingsResponse(row) {
  return {
    storeName: row.store_name,
    storeAddress: row.store_address,
    receiptMessage: row.receipt_message,
    updatedAt: row.updated_at,
  };
}

export function getWorkspaceSettings(database, workspaceId) {
  const row = findSettings(database, workspaceId);
  if (!row) {
    throw new Error(`Pengaturan workspace ${workspaceId} tidak ditemukan.`);
  }
  return toSettingsResponse(row);
}

// Hanya struk baru yang memakai identitas baru; transaksi lama menyimpan snapshot.
export function updateWorkspaceSettings(database, auth, changes, now) {
  return withOwnerWorkspace(database, auth, (workspaceId) => {
    updateSettings(database, workspaceId, changes, now.toISOString());
    return getWorkspaceSettings(database, workspaceId);
  });
}

// Satu transaksi: hapus data workspace sesi lalu seed ulang. Gagal di tengah = rollback.
export function resetWorkspace(database, auth, now) {
  return withOwnerWorkspace(database, auth, (workspaceId) => {
    clearWorkspaceData(database, workspaceId);
    const seeded = seedWorkspaceData(database, workspaceId, now);
    return { products: seeded.products, transactions: seeded.transactions };
  });
}
