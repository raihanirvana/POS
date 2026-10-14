import { hasMenuImage } from './menu-images.js';
import { isDateKey, periodError, presetPeriod } from './report-period.js';
import { isSummary } from './transactions-api.js';

const isCount = (value) => Number.isSafeInteger(value) && value >= 0;
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const categories = ['Kopi', 'Non-kopi', 'Pastry'];
const sum = (rows, field) => rows.reduce((total, row) => total + row[field], 0);

function isDay(day) {
  return isDateKey(day?.date) && isCount(day.revenue) && isCount(day.transactionCount);
}

function isProduct(product) {
  return (
    isText(product?.id) &&
    isText(product.name) &&
    categories.includes(product.category) &&
    hasMenuImage(product.imageKey)
  );
}

function isTopProducts(products, limit) {
  return (
    Array.isArray(products) &&
    products.length <= limit &&
    products.every(
      (product) =>
        isProduct(product) && isCount(product.quantity) && product.quantity > 0,
    ) &&
    new Set(products.map((product) => product.id)).size === products.length
  );
}

function isSalesSummary(summary) {
  const valid = ['revenue', 'transactionCount', 'averageTransaction'].every((key) =>
    isCount(summary?.[key]),
  );
  if (!valid) {
    return false;
  }
  const average = summary.transactionCount
    ? Math.round(summary.revenue / summary.transactionCount)
    : 0;
  return summary.averageTransaction === average;
}

function isPeriod(period) {
  return isDateKey(period?.from) && isDateKey(period.to) && !periodError(period);
}

function isDays(days, period) {
  if (!isPeriod(period) || !Array.isArray(days) || !days.every(isDay)) {
    return false;
  }
  const start = Date.parse(`${period.from}T00:00:00Z`);
  const end = Date.parse(`${period.to}T00:00:00Z`);
  return (
    days.length === (end - start) / 86400000 + 1 &&
    days.every(
      (day, index) =>
        day.date === new Date(start + index * 86400000).toISOString().slice(0, 10),
    )
  );
}

function hasSameTotals(rows, summary) {
  return (
    sum(rows, 'revenue') === summary.revenue &&
    sum(rows, 'transactionCount') === summary.transactionCount
  );
}

function isLowStock(items, threshold) {
  return (
    isCount(threshold) &&
    Array.isArray(items) &&
    items.every(
      (item) => isProduct(item) && isCount(item.stock) && item.stock <= threshold,
    )
  );
}

export function isDashboard(payload) {
  return (
    isDateKey(payload?.today) &&
    isSalesSummary(payload.summary) &&
    isDays(payload.salesByDay, presetPeriod(payload.today, 7)) &&
    hasSameTotals(payload.salesByDay.slice(-1), payload.summary) &&
    isTopProducts(payload.topProducts, 4) &&
    isLowStock(payload.lowStock, payload.lowStockThreshold) &&
    Array.isArray(payload.recentTransactions) &&
    payload.recentTransactions.length <= 5 &&
    payload.recentTransactions.every(isSummary)
  );
}

function isReportSummary(summary) {
  return (
    isSalesSummary(summary) &&
    ['unitsSold', 'subtotalBeforeDiscount', 'discountTotal'].every((key) =>
      isCount(summary[key]),
    ) &&
    summary.revenue === summary.subtotalBeforeDiscount - summary.discountTotal
  );
}

function isPaymentSplit(methods, summary) {
  const keys = ['cash', 'qris'];
  return (
    keys.every(
      (key) => isCount(methods?.[key]?.revenue) && isCount(methods[key].transactionCount),
    ) &&
    hasSameTotals(
      keys.map((key) => methods[key]),
      summary,
    )
  );
}

export function isReport(payload, requested) {
  return (
    isPeriod(payload?.period) &&
    payload.period.from === requested.from &&
    payload.period.to === requested.to &&
    isReportSummary(payload.summary) &&
    isPaymentSplit(payload.byPaymentMethod, payload.summary) &&
    isDays(payload.byDay, payload.period) &&
    hasSameTotals(payload.byDay, payload.summary) &&
    isTopProducts(payload.topProducts, 10)
  );
}
