import { likePattern } from './sql.js';

const transactionColumns = `id, number, created_at, cashier_role, customer_name, order_type,
  subtotal, discount_percent, discount_amount, total, payment_method, amount_received,
  change_amount, store_name, store_address, receipt_message`;

export function findTransactionByIdempotencyKey(database, workspaceId, idempotencyKey) {
  return database
    .prepare(
      `SELECT id, request_hash FROM transactions
       WHERE workspace_id = ? AND idempotency_key = ?`,
    )
    .get(workspaceId, idempotencyKey);
}

// Jumlah placeholder mengikuti jumlah ID (maksimal 50); nilai tetap lewat parameter.
export function findProductsForCheckout(database, workspaceId, productIds) {
  const placeholders = productIds.map(() => '?').join(', ');
  return database
    .prepare(
      `SELECT id, name, category, image_key, price, stock FROM products
       WHERE workspace_id = ? AND id IN (${placeholders})`,
    )
    .all(workspaceId, ...productIds);
}

// Bersyarat: stok tidak pernah negatif walau ada penulis lain.
export function decrementStock(database, workspaceId, line, nowIso) {
  return database
    .prepare(
      `UPDATE products SET stock = stock - $quantity, updated_at = $now
       WHERE workspace_id = $workspaceId AND id = $productId AND stock >= $quantity`,
    )
    .run({ workspaceId, productId: line.productId, quantity: line.quantity, now: nowIso })
    .changes;
}

export function findLastNumberSuffix(database, workspaceId, prefix) {
  return database
    .prepare(
      `SELECT COALESCE(MAX(CAST(substr(number, length($prefix) + 1) AS INTEGER)), 0) AS last
       FROM transactions
       WHERE workspace_id = $workspaceId AND substr(number, 1, length($prefix)) = $prefix`,
    )
    .get({ workspaceId, prefix }).last;
}

export function insertTransaction(database, transaction) {
  database
    .prepare(
      `INSERT INTO transactions (id, workspace_id, number, idempotency_key, request_hash,
         created_at, cashier_role, customer_name, order_type, subtotal, discount_percent,
         discount_amount, total, payment_method, amount_received, change_amount,
         store_name, store_address, receipt_message)
       VALUES ($id, $workspaceId, $number, $idempotencyKey, $requestHash,
         $createdAt, $cashierRole, $customerName, $orderType, $subtotal, $discountPercent,
         $discountAmount, $total, $paymentMethod, $amountReceived, $changeAmount,
         $storeName, $storeAddress, $receiptMessage)`,
    )
    .run(transaction);
}

export function insertTransactionItem(database, item) {
  database
    .prepare(
      `INSERT INTO transaction_items (workspace_id, transaction_id, line_number, product_id,
         product_name, product_category, product_image_key, unit_price, quantity, line_total)
       VALUES ($workspaceId, $transactionId, $lineNumber, $productId, $productName,
         $productCategory, $productImageKey, $unitPrice, $quantity, $lineTotal)`,
    )
    .run(item);
}

export function findTransaction(database, workspaceId, transactionId) {
  return database
    .prepare(
      `SELECT ${transactionColumns} FROM transactions WHERE workspace_id = ? AND id = ?`,
    )
    .get(workspaceId, transactionId);
}

export function findTransactionItems(database, workspaceId, transactionId) {
  return database
    .prepare(
      `SELECT line_number, product_id, product_name, product_category, product_image_key,
         unit_price, quantity, line_total
       FROM transaction_items
       WHERE workspace_id = ? AND transaction_id = ?
       ORDER BY line_number`,
    )
    .all(workspaceId, transactionId);
}

const listFilter = `WHERE workspace_id = $workspaceId
  AND ($from IS NULL OR created_at >= $from)
  AND ($to IS NULL OR created_at < $to)
  AND ($pattern IS NULL
    OR number LIKE $pattern ESCAPE '\\'
    OR customer_name LIKE $pattern ESCAPE '\\')`;

function listParams(workspaceId, filters) {
  return {
    workspaceId,
    from: filters.from ?? null,
    to: filters.to ?? null,
    pattern: likePattern(filters.search),
  };
}

export function listTransactions(database, workspaceId, filters) {
  return database
    .prepare(
      `SELECT id, number, created_at, customer_name, order_type, total, payment_method,
         (SELECT SUM(quantity) FROM transaction_items AS item
          WHERE item.transaction_id = transactions.id) AS item_count
       FROM transactions ${listFilter}
       ORDER BY created_at DESC, rowid DESC
       LIMIT $limit OFFSET $offset`,
    )
    .all({
      ...listParams(workspaceId, filters),
      limit: filters.limit,
      offset: filters.offset,
    });
}

export function countTransactions(database, workspaceId, filters) {
  return database
    .prepare(`SELECT COUNT(*) AS total FROM transactions ${listFilter}`)
    .get(listParams(workspaceId, filters)).total;
}
