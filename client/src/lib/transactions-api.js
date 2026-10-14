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

function isTransaction(value) {
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
