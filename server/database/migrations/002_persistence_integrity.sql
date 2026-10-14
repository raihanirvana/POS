-- Perbaikan POS-002 tanpa mengubah migrasi 001 yang sudah diterapkan.
-- Workspace produk adalah identitas kepemilikan yang tidak boleh dipindah.

-- Data yang sudah tercampur tidak boleh dilanjutkan tanpa koreksi eksplisit.
CREATE TEMP TABLE migration_product_ownership_guard (
  valid INTEGER NOT NULL CHECK (valid = 1)
);

INSERT INTO migration_product_ownership_guard (valid)
SELECT 0 FROM transaction_items AS item
JOIN products AS product ON product.id = item.product_id
WHERE item.workspace_id != product.workspace_id
LIMIT 1;

DROP TABLE migration_product_ownership_guard;

CREATE TRIGGER products_workspace_immutable
BEFORE UPDATE OF workspace_id ON products
WHEN NEW.workspace_id IS NOT OLD.workspace_id
BEGIN
  SELECT RAISE(ABORT, 'workspace_id produk tidak boleh diubah');
END;

-- strftime() mempertahankan jam 24:00, sedangkan Date#toISOString() memakai
-- 00:00 pada hari berikutnya. Normalisasi data lama pada instant yang sama.

UPDATE demo_workspaces
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', created_at, '+0 seconds')
WHERE substr(created_at, 12, 2) = '24';

UPDATE demo_workspaces
SET last_active_at = strftime('%Y-%m-%dT%H:%M:%fZ', last_active_at, '+0 seconds')
WHERE substr(last_active_at, 12, 2) = '24';

UPDATE demo_workspaces
SET expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', expires_at, '+0 seconds')
WHERE substr(expires_at, 12, 2) = '24';

UPDATE demo_workspaces
SET seeded_at = strftime('%Y-%m-%dT%H:%M:%fZ', seeded_at, '+0 seconds')
WHERE substr(seeded_at, 12, 2) = '24';

UPDATE sessions
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', created_at, '+0 seconds')
WHERE substr(created_at, 12, 2) = '24';

UPDATE sessions
SET expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', expires_at, '+0 seconds')
WHERE substr(expires_at, 12, 2) = '24';

UPDATE sessions
SET revoked_at = strftime('%Y-%m-%dT%H:%M:%fZ', revoked_at, '+0 seconds')
WHERE substr(revoked_at, 12, 2) = '24';

UPDATE settings
SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', updated_at, '+0 seconds')
WHERE substr(updated_at, 12, 2) = '24';

UPDATE products
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', created_at, '+0 seconds')
WHERE substr(created_at, 12, 2) = '24';

UPDATE products
SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', updated_at, '+0 seconds')
WHERE substr(updated_at, 12, 2) = '24';

UPDATE transactions
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', created_at, '+0 seconds')
WHERE substr(created_at, 12, 2) = '24';

-- Timestamp wajib kanonis pada INSERT maupun UPDATE berikutnya.

CREATE TRIGGER demo_workspaces_canonical_time_insert
BEFORE INSERT ON demo_workspaces
WHEN substr(NEW.created_at, 12, 2) = '24'
  OR substr(NEW.last_active_at, 12, 2) = '24'
  OR substr(NEW.expires_at, 12, 2) = '24'
  OR substr(NEW.seeded_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'demo_workspaces: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER demo_workspaces_canonical_time_update
BEFORE UPDATE ON demo_workspaces
WHEN substr(NEW.created_at, 12, 2) = '24'
  OR substr(NEW.last_active_at, 12, 2) = '24'
  OR substr(NEW.expires_at, 12, 2) = '24'
  OR substr(NEW.seeded_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'demo_workspaces: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER sessions_canonical_time_insert
BEFORE INSERT ON sessions
WHEN substr(NEW.created_at, 12, 2) = '24'
  OR substr(NEW.expires_at, 12, 2) = '24'
  OR substr(NEW.revoked_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'sessions: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER sessions_canonical_time_update
BEFORE UPDATE ON sessions
WHEN substr(NEW.created_at, 12, 2) = '24'
  OR substr(NEW.expires_at, 12, 2) = '24'
  OR substr(NEW.revoked_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'sessions: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER settings_canonical_time_insert
BEFORE INSERT ON settings
WHEN substr(NEW.updated_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'settings: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER settings_canonical_time_update
BEFORE UPDATE ON settings
WHEN substr(NEW.updated_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'settings: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER products_canonical_time_insert
BEFORE INSERT ON products
WHEN substr(NEW.created_at, 12, 2) = '24'
  OR substr(NEW.updated_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'products: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER products_canonical_time_update
BEFORE UPDATE ON products
WHEN substr(NEW.created_at, 12, 2) = '24'
  OR substr(NEW.updated_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'products: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER transactions_canonical_time_insert
BEFORE INSERT ON transactions
WHEN substr(NEW.created_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'transactions: waktu harus memakai jam 00 sampai 23');
END;

CREATE TRIGGER transactions_canonical_time_update
BEFORE UPDATE ON transactions
WHEN substr(NEW.created_at, 12, 2) = '24'
BEGIN
  SELECT RAISE(ABORT, 'transactions: waktu harus memakai jam 00 sampai 23');
END;
