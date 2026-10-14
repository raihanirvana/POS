import { apiRequest, invalidResponse } from './api.js';

function isMoney(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isItem(item) {
  return (
    typeof item?.name === 'string' &&
    isMoney(item.unitPrice) &&
    item.unitPrice >= 1000 &&
    item.unitPrice <= 10000000 &&
    Number.isSafeInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 100000 &&
    isMoney(item.lineTotal) &&
    item.lineTotal === item.unitPrice * item.quantity
  );
}

function isStore(store) {
  return ['name', 'address', 'receiptMessage'].every(
    (field) => typeof store?.[field] === 'string' && store[field].trim().length > 0,
  );
}

const moneyFields = [
  'subtotal',
  'discountAmount',
  'total',
  'amountReceived',
  'changeAmount',
];

function hasValidTotals(value) {
  return (
    moneyFields.every((field) => isMoney(value[field])) &&
    value.subtotal <= 1000000000000 &&
    value.amountReceived <= 1000000000000 &&
    Number.isInteger(value.discountPercent) &&
    value.discountPercent >= 0 &&
    value.discountPercent <= 100 &&
    value.subtotal === value.items.reduce((sum, item) => sum + item.lineTotal, 0) &&
    value.discountAmount === Math.round((value.subtotal * value.discountPercent) / 100) &&
    value.total === value.subtotal - value.discountAmount &&
    value.amountReceived >= value.total &&
    value.changeAmount === value.amountReceived - value.total &&
    (value.paymentMethod !== 'qris' || value.amountReceived === value.total)
  );
}

export function isTransaction(value) {
  return (
    typeof value?.id === 'string' &&
    typeof value.number === 'string' &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    typeof value.customerName === 'string' &&
    ['dine_in', 'takeaway'].includes(value.orderType) &&
    ['cash', 'qris'].includes(value.paymentMethod) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.length <= 50 &&
    value.items.every(isItem) &&
    hasValidTotals(value) &&
    isStore(value.store)
  );
}

export async function createTransaction(body) {
  const payload = await apiRequest('/transactions', { method: 'POST', body });
  if (!isTransaction(payload?.transaction) || typeof payload.replayed !== 'boolean') {
    throw invalidResponse();
  }
  return payload;
}

function isSummary(value) {
  return (
    typeof value?.id === 'string' &&
    typeof value.number === 'string' &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    typeof value.customerName === 'string' &&
    ['dine_in', 'takeaway'].includes(value.orderType) &&
    ['cash', 'qris'].includes(value.paymentMethod) &&
    Number.isSafeInteger(value.itemCount) &&
    value.itemCount > 0 &&
    isMoney(value.total)
  );
}

function transactionListResponse(payload) {
  const valid =
    Array.isArray(payload?.transactions) &&
    payload.transactions.every(isSummary) &&
    Number.isSafeInteger(payload.total) &&
    payload.total >= payload.transactions.length &&
    Number.isSafeInteger(payload.limit) &&
    payload.limit >= 1 &&
    payload.limit <= 100 &&
    payload.transactions.length <= payload.limit &&
    Number.isSafeInteger(payload.offset) &&
    payload.offset >= 0 &&
    payload.offset <= 100000 &&
    (payload.transactions.length === 0 ||
      payload.offset + payload.transactions.length <= payload.total);
  if (!valid) {
    throw invalidResponse();
  }
  return payload;
}

export async function listTransactions({ search, date, limit, offset }, signal) {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search) {
    query.set('search', search);
  }
  if (date) {
    query.set('date', date);
  }
  const payload = await apiRequest(`/transactions?${query}`, { signal });
  return transactionListResponse(payload);
}

export async function getTransaction(id, signal) {
  const payload = await apiRequest(`/transactions/${encodeURIComponent(id)}`, { signal });
  if (!isTransaction(payload?.transaction)) {
    throw invalidResponse();
  }
  return payload.transaction;
}
