import { createHash, randomUUID } from 'node:crypto';
import { HttpError } from '../lib/http-error.js';
import { jakartaDateKey } from '../lib/jakarta-time.js';
import { calculateTotals, formatRupiah } from '../lib/money.js';
import { findSettings } from '../repositories/settings-repository.js';
import {
  decrementStock,
  findLastNumberSuffix,
  findProductsForCheckout,
  findTransactionByIdempotencyKey,
  insertTransaction,
  insertTransactionItem,
} from '../repositories/transaction-repository.js';
import { invalidCheckout, maxRupiah } from '../validation/transaction-validation.js';
import { getTransactionDetail } from './transaction-query-service.js';
import { withWorkspaceAccess } from './workspace-access.js';

const staffAccess = {
  roles: ['owner', 'cashier'],
  forbiddenMessage: 'Peran ini tidak dapat membuat transaksi.',
};

// Hash payload ternormalisasi (tanpa idempotencyKey) untuk mendeteksi replay berbeda.
function hashCheckout(input) {
  const payload = JSON.stringify([
    input.items.map((item) => [item.productId, item.quantity]),
    input.discountPercent,
    input.customerName,
    input.orderType,
    input.paymentMethod,
    input.amountReceived,
  ]);
  return createHash('sha256').update(payload).digest('hex');
}

function findReplay(database, workspaceId, input, requestHash) {
  const existing = findTransactionByIdempotencyKey(
    database,
    workspaceId,
    input.idempotencyKey,
  );
  if (!existing) {
    return null;
  }
  if (existing.request_hash !== requestHash) {
    throw new HttpError(
      409,
      'IDEMPOTENCY_CONFLICT',
      'Kunci idempotensi sudah dipakai untuk pesanan yang berbeda.',
    );
  }
  return getTransactionDetail(database, workspaceId, existing.id);
}

function priceLine(product, item) {
  if (!product) {
    throw new HttpError(
      409,
      'PRODUCT_UNAVAILABLE',
      'Ada menu di pesanan yang sudah dihapus. Muat ulang menu.',
    );
  }
  if (product.stock < item.quantity) {
    throw new HttpError(
      409,
      'INSUFFICIENT_STOCK',
      `Stok ${product.name} tinggal ${product.stock}. Periksa kembali pesanan.`,
    );
  }
  return { product, productId: product.id, unitPrice: product.price, ...item };
}

// Harga selalu dari database saat ini; harga dari klien tidak pernah dipakai.
function priceLines(database, workspaceId, items) {
  const ids = items.map((item) => item.productId);
  const products = findProductsForCheckout(database, workspaceId, ids);
  const byId = new Map(products.map((product) => [product.id, product]));
  return items.map((item) => priceLine(byId.get(item.productId), item));
}

function settlePayment(input, total) {
  if (input.paymentMethod === 'qris') {
    return { paymentMethod: 'qris', amountReceived: total, changeAmount: 0 };
  }
  if (input.amountReceived < total) {
    const shortfall = formatRupiah(total - input.amountReceived);
    throw invalidCheckout({
      amountReceived: `Uang kurang ${shortfall}. Minimal ${formatRupiah(total)}.`,
    });
  }
  const changeAmount = input.amountReceived - total;
  return { paymentMethod: 'cash', amountReceived: input.amountReceived, changeAmount };
}

function reserveStock(database, workspaceId, lines, nowIso) {
  for (const line of lines) {
    if (decrementStock(database, workspaceId, line, nowIso) !== 1) {
      throw new HttpError(
        409,
        'INSUFFICIENT_STOCK',
        'Stok berubah. Periksa kembali pesanan.',
      );
    }
  }
}

function nextTransactionNumber(database, workspaceId, now) {
  const prefix = `SDH-${jakartaDateKey(now).replaceAll('-', '')}-`;
  const last = findLastNumberSuffix(database, workspaceId, prefix);
  return `${prefix}${String(last + 1).padStart(3, '0')}`;
}

// Identitas toko disalin ke transaksi agar struk lama tidak ikut berubah.
function storeSnapshot(database, workspaceId) {
  const settings = findSettings(database, workspaceId);
  if (!settings) {
    throw new Error(`Pengaturan workspace ${workspaceId} tidak ditemukan.`);
  }
  return {
    storeName: settings.store_name,
    storeAddress: settings.store_address,
    receiptMessage: settings.receipt_message,
  };
}

function priceOrder(database, workspaceId, input) {
  const lines = priceLines(database, workspaceId, input.items);
  const totals = calculateTotals(lines, input.discountPercent);
  if (totals.subtotal > maxRupiah) {
    throw invalidCheckout({ items: 'Total pesanan melebihi batas demo.' });
  }
  return { lines, totals, payment: settlePayment(input, totals.total) };
}

function buildTransactionRow(context, input, order) {
  const { database, current, requestHash, now } = context;
  return {
    id: randomUUID(),
    workspaceId: current.workspaceId,
    number: nextTransactionNumber(database, current.workspaceId, now),
    idempotencyKey: input.idempotencyKey,
    requestHash,
    createdAt: now.toISOString(),
    cashierRole: current.role,
    customerName: input.customerName,
    orderType: input.orderType,
    discountPercent: input.discountPercent,
    ...order.totals,
    ...order.payment,
    ...storeSnapshot(database, current.workspaceId),
  };
}

function insertLines(database, transaction, lines) {
  lines.forEach((line, index) => {
    insertTransactionItem(database, {
      workspaceId: transaction.workspaceId,
      transactionId: transaction.id,
      lineNumber: index + 1,
      productId: line.productId,
      productName: line.product.name,
      productCategory: line.product.category,
      productImageKey: line.product.image_key,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.unitPrice * line.quantity,
    });
  });
}

function recordSale(context, input) {
  const { database, current } = context;
  const order = priceOrder(database, current.workspaceId, input);
  const transaction = buildTransactionRow(context, input, order);
  reserveStock(database, current.workspaceId, order.lines, transaction.createdAt);
  insertTransaction(database, transaction);
  insertLines(database, transaction, order.lines);
  return transaction.id;
}

// Satu transaksi SQLite: cek sesi, replay, harga, stok, simpan. Gagal di mana pun → rollback.
export function checkout(database, auth, input, now) {
  const requestHash = hashCheckout(input);
  return withWorkspaceAccess(database, auth, staffAccess, (current) => {
    const replay = findReplay(database, current.workspaceId, input, requestHash);
    if (replay) {
      return { transaction: replay, replayed: true };
    }
    const context = { database, current, requestHash, now };
    const transactionId = recordSale(context, input);
    const transaction = getTransactionDetail(
      database,
      current.workspaceId,
      transactionId,
    );
    return { transaction, replayed: false };
  });
}
