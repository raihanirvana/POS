import { createHash, randomUUID } from 'node:crypto';
import { withTransaction } from '../transaction.js';
import { seedProducts, seedSettings } from './menu.js';
import { buildSampleTransactions } from './sample-transactions.js';

const dayInMs = 24 * 60 * 60 * 1000;

export function ensureWorkspace(database, workspaceId, now, lifetimeDays) {
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + lifetimeDays * dayInMs).toISOString();
  database
    .prepare(
      `INSERT INTO demo_workspaces (id, created_at, last_active_at, expires_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (id) DO NOTHING`,
    )
    .run(workspaceId, nowIso, nowIso, expiresAt);
}

function insertSettings(database, workspaceId, nowIso) {
  database
    .prepare(
      `INSERT INTO settings (workspace_id, store_name, store_address, receipt_message, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      workspaceId,
      seedSettings.storeName,
      seedSettings.storeAddress,
      seedSettings.receiptMessage,
      nowIso,
    );
}

function insertProducts(database, workspaceId, nowIso) {
  const statement = database.prepare(
    `INSERT INTO products (id, workspace_id, seed_key, name, category, price, stock,
       image_key, description, tag, created_at, updated_at)
     VALUES ($id, $workspaceId, $seedKey, $name, $category, $price, $stock,
       $imageKey, $description, $tag, $now, $now)`,
  );
  const productIds = new Map();
  for (const product of seedProducts) {
    const id = randomUUID();
    statement.run({ ...product, id, workspaceId, tag: product.tag ?? null, now: nowIso });
    productIds.set(product.seedKey, id);
  }
  return productIds;
}

function hashSeedRequest(transaction) {
  const lines = transaction.lines.map((line) => [line.product.seedKey, line.quantity]);
  const payload = JSON.stringify([
    transaction.number,
    lines,
    transaction.discountPercent,
  ]);
  return createHash('sha256').update(payload).digest('hex');
}

function transactionParams(workspaceId, transaction) {
  return {
    ...seedSettings,
    id: randomUUID(),
    workspaceId,
    number: transaction.number,
    idempotencyKey: `seed-${transaction.number}`,
    requestHash: hashSeedRequest(transaction),
    createdAt: transaction.createdAt,
    customerName: transaction.customerName,
    orderType: transaction.orderType,
    subtotal: transaction.subtotal,
    discountPercent: transaction.discountPercent,
    discountAmount: transaction.discountAmount,
    total: transaction.total,
    paymentMethod: transaction.paymentMethod,
    amountReceived: transaction.amountReceived,
    changeAmount: transaction.changeAmount,
  };
}

function insertTransactionRow(database, workspaceId, transaction) {
  const params = transactionParams(workspaceId, transaction);
  database
    .prepare(
      `INSERT INTO transactions (id, workspace_id, number, idempotency_key, request_hash,
         created_at, cashier_role, customer_name, order_type, subtotal, discount_percent,
         discount_amount, total, payment_method, amount_received, change_amount,
         store_name, store_address, receipt_message)
       VALUES ($id, $workspaceId, $number, $idempotencyKey, $requestHash,
         $createdAt, 'cashier', $customerName, $orderType, $subtotal, $discountPercent,
         $discountAmount, $total, $paymentMethod, $amountReceived, $changeAmount,
         $storeName, $storeAddress, $receiptMessage)`,
    )
    .run(params);
  return params.id;
}

function insertTransactionLines(database, workspaceId, transactionId, context) {
  const statement = database.prepare(
    `INSERT INTO transaction_items (workspace_id, transaction_id, line_number, product_id,
       product_name, product_category, product_image_key, unit_price, quantity, line_total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  context.lines.forEach((line, index) => {
    const { product } = line;
    statement.run(
      workspaceId,
      transactionId,
      index + 1,
      context.productIds.get(product.seedKey),
      product.name,
      product.category,
      product.imageKey,
      line.unitPrice,
      line.quantity,
      line.unitPrice * line.quantity,
    );
  });
}

function insertTransactions(database, workspaceId, productIds, now) {
  const transactions = buildSampleTransactions(now);
  for (const transaction of transactions) {
    const transactionId = insertTransactionRow(database, workspaceId, transaction);
    const context = { lines: transaction.lines, productIds };
    insertTransactionLines(database, workspaceId, transactionId, context);
  }
  return transactions.length;
}

// Mengisi data contoh satu workspace tanpa membuka transaksi sendiri, agar bisa
// digabung dengan pembuatan workspace/sesi atau reset dalam satu transaksi.
export function seedWorkspaceData(database, workspaceId, now) {
  const workspace = database
    .prepare('SELECT seeded_at FROM demo_workspaces WHERE id = ?')
    .get(workspaceId);
  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} tidak ditemukan.`);
  }
  if (workspace.seeded_at) {
    return { seeded: false, products: 0, transactions: 0 };
  }
  const nowIso = now.toISOString();
  insertSettings(database, workspaceId, nowIso);
  const productIds = insertProducts(database, workspaceId, nowIso);
  const transactions = insertTransactions(database, workspaceId, productIds, now);
  database
    .prepare('UPDATE demo_workspaces SET seeded_at = ? WHERE id = ?')
    .run(nowIso, workspaceId);
  return { seeded: true, products: productIds.size, transactions };
}

export function seedWorkspace(database, workspaceId, now = new Date()) {
  return withTransaction(database, () => seedWorkspaceData(database, workspaceId, now));
}
