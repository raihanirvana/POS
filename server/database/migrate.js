import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { withTransaction } from './transaction.js';

const migrationsDirectory = fileURLToPath(new URL('./migrations/', import.meta.url));
const migrationFilePattern = /^(\d{3})_([a-z0-9_]+)\.sql$/;

function readMigrationFile(fileName) {
  const [, version, name] = fileName.match(migrationFilePattern);
  const sql = readFileSync(`${migrationsDirectory}${fileName}`, 'utf8');
  const checksum = createHash('sha256').update(sql).digest('hex');
  return { version: Number(version), name, sql, checksum };
}

export function loadMigrations() {
  const migrations = readdirSync(migrationsDirectory)
    .filter((fileName) => migrationFilePattern.test(fileName))
    .sort()
    .map(readMigrationFile);
  migrations.forEach((migration, index) => {
    if (migration.version !== index + 1) {
      throw new Error(`Versi migrasi harus berurutan; ditemukan ${migration.version}.`);
    }
  });
  return migrations;
}

function ensureMigrationLog(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY CHECK (version > 0),
      name TEXT NOT NULL,
      checksum TEXT NOT NULL CHECK (length(checksum) = 64),
      applied_at TEXT NOT NULL
    ) STRICT;
  `);
}

function readAppliedMigrations(database) {
  const rows = database
    .prepare('SELECT version, name, checksum FROM schema_migrations ORDER BY version')
    .all();
  return new Map(rows.map((row) => [row.version, row]));
}

function verifyAppliedMigration(row, migration) {
  if (!migration) {
    throw new Error(`Database memakai migrasi ${row.version} yang tidak dikenal kode.`);
  }
  if (migration.name !== row.name || migration.checksum !== row.checksum) {
    const label = `${String(row.version).padStart(3, '0')}_${row.name}`;
    throw new Error(`Migrasi ${label} berubah setelah diterapkan.`);
  }
}

function verifyAppliedMigrations(applied, migrations) {
  let expectedVersion = 1;
  for (const row of applied.values()) {
    if (row.version !== expectedVersion) {
      throw new Error(`Log migrasi tidak berurutan; versi ${expectedVersion} hilang.`);
    }
    verifyAppliedMigration(row, migrations[row.version - 1]);
    expectedVersion += 1;
  }
}

function recordMigration(database, migration) {
  database
    .prepare(
      `INSERT INTO schema_migrations (version, name, checksum, applied_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(migration.version, migration.name, migration.checksum, new Date().toISOString());
}

function applyMigration(database, migration, migrations) {
  return withTransaction(database, () => {
    const applied = readAppliedMigrations(database);
    verifyAppliedMigrations(applied, migrations);
    if (applied.has(migration.version)) {
      return false;
    }
    if (migration.version !== applied.size + 1) {
      throw new Error(
        `Migrasi ${migration.version} tidak bisa diterapkan di luar urutan.`,
      );
    }
    database.exec(migration.sql);
    recordMigration(database, migration);
    return true;
  });
}

// Menerapkan migrasi yang belum tercatat, satu transaksi per migrasi.
export function migrateDatabase(database) {
  const migrations = loadMigrations();
  ensureMigrationLog(database);
  const applied = readAppliedMigrations(database);
  verifyAppliedMigrations(applied, migrations);
  const pending = migrations.filter((migration) => !applied.has(migration.version));
  const appliedNow = pending.filter((migration) =>
    applyMigration(database, migration, migrations),
  );
  return {
    applied: appliedNow.map(({ version, name }) => ({ version, name })),
    version: migrations.length,
  };
}
