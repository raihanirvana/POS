// Semua agregasi dibatasi workspace dan rentang UTC [start, end) hasil konversi WIB.
// Hari Jakarta = date(created_at, '+7 hours') karena WIB tidak memakai DST.
const periodFilter = `workspace_id = $workspaceId
  AND created_at >= $start AND created_at < $end`;

export function summarizeSales(database, workspaceId, range) {
  return database
    .prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue,
         COALESCE(SUM(subtotal), 0) AS subtotal,
         COALESCE(SUM(discount_amount), 0) AS discount
       FROM transactions WHERE ${periodFilter}`,
    )
    .get({ workspaceId, ...range });
}

export function salesByDay(database, workspaceId, range) {
  return database
    .prepare(
      `SELECT date(created_at, '+7 hours') AS day, COUNT(*) AS count,
         SUM(total) AS revenue
       FROM transactions WHERE ${periodFilter}
       GROUP BY day ORDER BY day`,
    )
    .all({ workspaceId, ...range });
}

export function salesByMethod(database, workspaceId, range) {
  return database
    .prepare(
      `SELECT payment_method AS method, COUNT(*) AS count, SUM(total) AS revenue
       FROM transactions WHERE ${periodFilter}
       GROUP BY payment_method`,
    )
    .all({ workspaceId, ...range });
}

export function unitsSold(database, workspaceId, range) {
  return database
    .prepare(
      `SELECT COALESCE(SUM(item.quantity), 0) AS units
       FROM transaction_items AS item
       JOIN transactions AS tx
         ON tx.workspace_id = item.workspace_id AND tx.id = item.transaction_id
       WHERE tx.workspace_id = $workspaceId
         AND tx.created_at >= $start AND tx.created_at < $end`,
    )
    .get({ workspaceId, ...range }).units;
}

// Nama snapshot mengikuti waktu penjualan terakhir, dengan id item sebagai tie-breaker.
export function topProducts(database, workspaceId, range, limit) {
  return database
    .prepare(
      `WITH scoped AS (
         SELECT item.*, tx.created_at,
           COALESCE(item.product_id, 'snapshot:' || item.product_name) AS group_key
         FROM transaction_items AS item JOIN transactions AS tx
           ON tx.workspace_id = item.workspace_id AND tx.id = item.transaction_id
         WHERE tx.workspace_id = $workspaceId
           AND tx.created_at >= $start AND tx.created_at < $end
       ), ranked AS (
         SELECT *, SUM(quantity) OVER (PARTITION BY group_key) AS sold,
           ROW_NUMBER() OVER (PARTITION BY group_key ORDER BY created_at DESC, id DESC) AS rank
         FROM scoped
       ) SELECT group_key, product_name AS name, product_category AS category,
           product_image_key AS image_key, sold AS quantity
         FROM ranked WHERE rank = 1 ORDER BY quantity DESC, name, group_key LIMIT $limit`,
    )
    .all({ workspaceId, ...range, limit });
}

export function lowStockProducts(database, workspaceId, threshold) {
  return database
    .prepare(
      `SELECT id, name, category, stock, image_key FROM products
       WHERE workspace_id = ? AND stock <= ?
       ORDER BY stock, name`,
    )
    .all(workspaceId, threshold);
}

export function exportTransactions(database, workspaceId, range) {
  return database
    .prepare(
      `SELECT number, created_at, customer_name, order_type, payment_method,
         (SELECT SUM(quantity) FROM transaction_items AS item
          WHERE item.transaction_id = transactions.id) AS item_count,
         subtotal, discount_percent, discount_amount, total, amount_received, change_amount
       FROM transactions WHERE ${periodFilter}
       ORDER BY created_at, rowid`,
    )
    .all({ workspaceId, ...range });
}
