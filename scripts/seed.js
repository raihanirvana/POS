import { config } from '../server/config.js';
import { openDatabase } from '../server/database/connection.js';
import { migrateDatabase } from '../server/database/migrate.js';
import { ensureWorkspace, seedWorkspace } from '../server/database/seed/index.js';

// Workspace contoh untuk pengembangan lokal. Ruang demo pengunjung dibuat per sesi (POS-003).
const seedWorkspaceId = 'contoh-seduh';
const seedWorkspaceLifetimeDays = 365;

const database = openDatabase(config.databasePath);
try {
  migrateDatabase(database);
  const now = new Date();
  ensureWorkspace(database, seedWorkspaceId, now, seedWorkspaceLifetimeDays);
  const result = seedWorkspace(database, seedWorkspaceId, now);
  const summary = `${result.products} produk, ${result.transactions} transaksi`;
  console.log(
    result.seeded
      ? `Seed workspace ${seedWorkspaceId}: ${summary}.`
      : `Workspace ${seedWorkspaceId} sudah berisi data contoh; seed dilewati.`,
  );
} catch (error) {
  console.error(`Seed gagal: ${error.message}`);
  process.exitCode = 1;
} finally {
  database.close();
}
