import { jakartaTime } from '../lib/jakarta-time.js';
import {
  countTransactions,
  findTransaction,
  findTransactionItems,
  listTransactions,
} from '../repositories/transaction-repository.js';
import { transactionNotFound } from '../validation/transaction-validation.js';

function toItemResponse(row) {
  return {
    lineNumber: row.line_number,
    productId: row.product_id,
    name: row.product_name,
    category: row.product_category,
    imageKey: row.product_image_key,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    lineTotal: row.line_total,
  };
}

function toDetailResponse(row, items) {
  return {
    id: row.id,
    number: row.number,
    createdAt: row.created_at,
    cashierRole: row.cashier_role,
    customerName: row.customer_name,
    orderType: row.order_type,
    items: items.map(toItemResponse),
    subtotal: row.subtotal,
    discountPercent: row.discount_percent,
    discountAmount: row.discount_amount,
    total: row.total,
    paymentMethod: row.payment_method,
    amountReceived: row.amount_received,
    changeAmount: row.change_amount,
    store: {
      name: row.store_name,
      address: row.store_address,
      receiptMessage: row.receipt_message,
    },
  };
}

export function getTransactionDetail(database, workspaceId, transactionId) {
  const row = findTransaction(database, workspaceId, transactionId);
  if (!row) {
    throw transactionNotFound();
  }
  const items = findTransactionItems(database, workspaceId, transactionId);
  return toDetailResponse(row, items);
}

function toSummaryResponse(row) {
  return {
    id: row.id,
    number: row.number,
    createdAt: row.created_at,
    customerName: row.customer_name,
    orderType: row.order_type,
    itemCount: row.item_count,
    total: row.total,
    paymentMethod: row.payment_method,
  };
}

// Tanggal adalah hari Asia/Jakarta: [00.00 WIB, 00.00 WIB hari berikutnya) dalam UTC.
function dateRange(dateKey) {
  if (!dateKey) {
    return {};
  }
  const start = jakartaTime(dateKey, '00:00:00.000');
  const end = new Date(start.getTime() + 86400000);
  // SQLite menyimpan tahun 0000–9999; batasi perbandingan ke ISO empat digit.
  return {
    from: start.getUTCFullYear() < 0 ? '0000-01-01T00:00:00.000Z' : start.toISOString(),
    to: end.getUTCFullYear() > 9999 ? undefined : end.toISOString(),
  };
}

export function listWorkspaceTransactions(database, workspaceId, query) {
  const filters = { ...query, ...dateRange(query.date) };
  const rows = listTransactions(database, workspaceId, filters);
  return {
    transactions: rows.map(toSummaryResponse),
    total: countTransactions(database, workspaceId, filters),
    limit: query.limit,
    offset: query.offset,
  };
}
