import { config } from '../server/config.js';
import { openDatabase } from '../server/database/connection.js';
import { migrateDatabase } from '../server/database/migrate.js';

const database = openDatabase(config.databasePath);
try {
  const result = migrateDatabase(database);
  for (const migration of result.applied) {
    console.log(
      `Diterapkan: ${String(migration.version).padStart(3, '0')}_${migration.name}`,
    );
  }
  if (result.applied.length === 0) {
    console.log(`Skema sudah terbaru (versi ${result.version}).`);
  }
} catch (error) {
  console.error(`Migrasi gagal: ${error.message}`);
  process.exitCode = 1;
} finally {
  database.close();
}
