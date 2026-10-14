-- Skema awal Seduh POS. Semua waktu memakai ISO UTC dari Date#toISOString()
-- (contoh 2026-10-14T03:00:00.000Z) agar perbandingan string sama dengan urutan waktu.
-- Semua nilai uang adalah integer rupiah. Foto disimpan sebagai kunci preset, bukan URL.

CREATE TABLE demo_workspaces (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  last_active_at TEXT NOT NULL
    CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', last_active_at) IS last_active_at),
  expires_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', expires_at) IS expires_at),
  seeded_at TEXT CHECK (
    seeded_at IS NULL OR strftime('%Y-%m-%dT%H:%M:%fZ', seeded_at) IS seeded_at
  ),
  CHECK (expires_at > created_at)
) STRICT;

CREATE INDEX demo_workspaces_expires_idx ON demo_workspaces (expires_at);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  workspace_id TEXT NOT NULL REFERENCES demo_workspaces (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  role TEXT NOT NULL CHECK (role IN ('owner', 'cashier')),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  expires_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', expires_at) IS expires_at),
  revoked_at TEXT CHECK (
    revoked_at IS NULL OR strftime('%Y-%m-%dT%H:%M:%fZ', revoked_at) IS revoked_at
  ),
  CHECK (expires_at > created_at)
) STRICT;

CREATE INDEX sessions_workspace_expires_idx ON sessions (workspace_id, expires_at);
CREATE INDEX sessions_expires_idx ON sessions (expires_at);

CREATE TABLE settings (
  workspace_id TEXT PRIMARY KEY REFERENCES demo_workspaces (id) ON DELETE CASCADE,
  store_name TEXT NOT NULL CHECK (length(trim(store_name)) BETWEEN 1 AND 60),
  store_address TEXT NOT NULL CHECK (length(trim(store_address)) BETWEEN 1 AND 150),
  receipt_message TEXT NOT NULL CHECK (length(trim(receipt_message)) BETWEEN 1 AND 200),
  updated_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) IS updated_at)
) STRICT;

CREATE TABLE products (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  workspace_id TEXT NOT NULL REFERENCES demo_workspaces (id) ON DELETE CASCADE,
  seed_key TEXT CHECK (seed_key IS NULL OR length(seed_key) BETWEEN 1 AND 30),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 60),
  category TEXT NOT NULL CHECK (category IN ('Kopi', 'Non-kopi', 'Pastry')),
  price INTEGER NOT NULL CHECK (price BETWEEN 1000 AND 10000000),
  stock INTEGER NOT NULL CHECK (stock BETWEEN 0 AND 100000),
  image_key TEXT NOT NULL CHECK (
    image_key IN ('iced-coffee', 'latte', 'americano', 'matcha', 'chocolate', 'croissant', 'tea', 'cinnamon')
  ),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 100),
  tag TEXT CHECK (tag IS NULL OR length(trim(tag)) BETWEEN 1 AND 30),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  updated_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) IS updated_at),
  UNIQUE (workspace_id, seed_key)
) STRICT;

CREATE INDEX products_workspace_category_idx ON products (workspace_id, category, name);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  workspace_id TEXT NOT NULL REFERENCES demo_workspaces (id) ON DELETE CASCADE,
  number TEXT NOT NULL CHECK (length(number) BETWEEN 1 AND 40),
  idempotency_key TEXT NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 100),
  request_hash TEXT NOT NULL CHECK (length(request_hash) = 64),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  cashier_role TEXT NOT NULL CHECK (cashier_role IN ('owner', 'cashier')),
  customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) BETWEEN 1 AND 60),
  order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway')),
  subtotal INTEGER NOT NULL CHECK (subtotal BETWEEN 1000 AND 1000000000000),
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
  discount_amount INTEGER NOT NULL,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris')),
  amount_received INTEGER NOT NULL CHECK (amount_received <= 1000000000000),
  change_amount INTEGER NOT NULL,
  store_name TEXT NOT NULL CHECK (length(trim(store_name)) BETWEEN 1 AND 60),
  store_address TEXT NOT NULL CHECK (length(trim(store_address)) BETWEEN 1 AND 150),
  receipt_message TEXT NOT NULL CHECK (length(trim(receipt_message)) BETWEEN 1 AND 200),
  -- Sama dengan Math.round(subtotal * persen / 100) untuk bilangan positif.
  CHECK (discount_amount = (subtotal * discount_percent + 50) / 100),
  CHECK (total = subtotal - discount_amount),
  CHECK (amount_received >= total),
  CHECK (change_amount = amount_received - total),
  CHECK (payment_method = 'cash' OR amount_received = total),
  UNIQUE (workspace_id, id),
  UNIQUE (workspace_id, number),
  UNIQUE (workspace_id, idempotency_key)
) STRICT;

CREATE INDEX transactions_workspace_created_idx ON transactions (workspace_id, created_at);

-- Item menyimpan snapshot nama/kategori/foto/harga; product_id hanya referensi
-- dan menjadi NULL bila menu dihapus sehingga struk lama tetap utuh.
CREATE TABLE transaction_items (
  id INTEGER PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  line_number INTEGER NOT NULL CHECK (line_number BETWEEN 1 AND 100),
  product_id TEXT REFERENCES products (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL CHECK (length(trim(product_name)) BETWEEN 1 AND 60),
  product_category TEXT NOT NULL CHECK (product_category IN ('Kopi', 'Non-kopi', 'Pastry')),
  product_image_key TEXT NOT NULL CHECK (
    product_image_key IN ('iced-coffee', 'latte', 'americano', 'matcha', 'chocolate', 'croissant', 'tea', 'cinnamon')
  ),
  unit_price INTEGER NOT NULL CHECK (unit_price BETWEEN 1000 AND 10000000),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 100000),
  line_total INTEGER NOT NULL,
  CHECK (line_total = unit_price * quantity),
  UNIQUE (transaction_id, line_number),
  FOREIGN KEY (workspace_id, transaction_id)
    REFERENCES transactions (workspace_id, id) ON DELETE CASCADE
) STRICT;

CREATE INDEX transaction_items_transaction_idx ON transaction_items (transaction_id);
CREATE INDEX transaction_items_workspace_product_idx
  ON transaction_items (workspace_id, product_id);

-- Item tidak boleh menunjuk produk milik ruang demo lain.
CREATE TRIGGER transaction_items_same_workspace
BEFORE INSERT ON transaction_items
WHEN NEW.product_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM products WHERE id = NEW.product_id AND workspace_id = NEW.workspace_id
)
BEGIN
  SELECT RAISE(ABORT, 'transaction_items.product_id berasal dari workspace lain');
END;

CREATE TRIGGER transaction_items_same_workspace_update
BEFORE UPDATE OF product_id, workspace_id ON transaction_items
WHEN NEW.product_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM products WHERE id = NEW.product_id AND workspace_id = NEW.workspace_id
)
BEGIN
  SELECT RAISE(ABORT, 'transaction_items.product_id berasal dari workspace lain');
END;
