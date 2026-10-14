import { likePattern } from './sql.js';

const productColumns = `id, name, category, price, stock, image_key, description, tag,
  created_at, updated_at`;

// Nama kolom hanya berasal dari daftar ini; nilai selalu lewat parameter.
const updatableColumns = {
  name: 'name',
  category: 'category',
  price: 'price',
  stock: 'stock',
  imageKey: 'image_key',
  description: 'description',
  tag: 'tag',
};

export function listProducts(database, workspaceId, { category, search }) {
  return database
    .prepare(
      `SELECT ${productColumns} FROM products
       WHERE workspace_id = $workspaceId
         AND ($category IS NULL OR category = $category)
         AND ($pattern IS NULL
           OR name LIKE $pattern ESCAPE '\\'
           OR description LIKE $pattern ESCAPE '\\')
       ORDER BY created_at, rowid`,
    )
    .all({ workspaceId, category: category ?? null, pattern: likePattern(search) });
}

export function findProduct(database, workspaceId, productId) {
  return database
    .prepare(`SELECT ${productColumns} FROM products WHERE workspace_id = ? AND id = ?`)
    .get(workspaceId, productId);
}

export function insertProduct(database, product) {
  database
    .prepare(
      `INSERT INTO products (id, workspace_id, name, category, price, stock, image_key,
         description, tag, created_at, updated_at)
       VALUES ($id, $workspaceId, $name, $category, $price, $stock, $imageKey,
         $description, $tag, $now, $now)`,
    )
    .run(product);
}

export function updateProduct(database, workspaceId, productId, changes) {
  const keys = Object.keys(changes).filter((key) => Object.hasOwn(updatableColumns, key));
  const assignments = keys.map((key) => `${updatableColumns[key]} = $${key}`);
  const values = Object.fromEntries(keys.map((key) => [key, changes[key]]));
  return database
    .prepare(
      `UPDATE products SET ${assignments.join(', ')}, updated_at = $updatedAt
       WHERE workspace_id = $workspaceId AND id = $productId`,
    )
    .run({ ...values, updatedAt: changes.updatedAt, workspaceId, productId }).changes;
}

// Item struk lama tetap ada: transaction_items.product_id menjadi NULL (ON DELETE SET NULL).
export function deleteProduct(database, workspaceId, productId) {
  return database
    .prepare('DELETE FROM products WHERE workspace_id = ? AND id = ?')
    .run(workspaceId, productId).changes;
}
