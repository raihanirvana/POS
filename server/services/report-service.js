import { jakartaDateKey, jakartaTime, shiftDateKey } from '../lib/jakarta-time.js';
import {
  lowStockProducts,
  salesByDay,
  salesByMethod,
  summarizeSales,
  topProducts,
  unitsSold,
} from '../repositories/report-repository.js';
import { listTransactions } from '../repositories/transaction-repository.js';
import { withReadTransaction } from '../database/transaction.js';

export const lowStockThreshold = 10;

// Periode inklusif WIB → rentang UTC [00.00 WIB hari awal, 00.00 WIB setelah hari akhir).
export function periodRange({ from, to }) {
  const start = jakartaTime(from, '00:00:00.000');
  const end = new Date(jakartaTime(to, '00:00:00.000').getTime() + 86400000);
  return {
    start: start.getUTCFullYear() < 0 ? '0000-01-01T00:00:00.000Z' : start.toISOString(),
    end: end.toISOString(),
  };
}

function toSummary(row) {
  return {
    revenue: row.revenue,
    transactionCount: row.count,
    averageTransaction: row.count > 0 ? Math.round(row.revenue / row.count) : 0,
  };
}

// Hari tanpa transaksi tetap muncul dengan nilai 0 agar grafik/tabel konsisten.
function fillDays({ from, to }, rows) {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const days = [];
  for (let day = from; day <= to; day = shiftDateKey(day, 1)) {
    const row = byDay.get(day);
    days.push({
      date: day,
      revenue: row?.revenue ?? 0,
      transactionCount: row?.count ?? 0,
    });
    if (day === to) {
      break;
    }
  }
  return days;
}

function toTopProduct(row) {
  return {
    id: row.group_key,
    name: row.name,
    category: row.category,
    imageKey: row.image_key,
    quantity: row.quantity,
  };
}

function toLowStock(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    stock: row.stock,
    imageKey: row.image_key,
  };
}

function toRecent(row) {
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

const allTime = { start: '0000-01-01T00:00:00.000Z', end: '9999-12-31T23:59:59.999Z' };

function buildDashboard(database, workspaceId, now) {
  const today = jakartaDateKey(now);
  const week = { from: shiftDateKey(today, -6), to: today };
  const recentFilter = { limit: 5, offset: 0 };
  return {
    today,
    summary: toSummary(
      summarizeSales(database, workspaceId, periodRange({ from: today, to: today })),
    ),
    salesByDay: fillDays(week, salesByDay(database, workspaceId, periodRange(week))),
    topProducts: topProducts(database, workspaceId, allTime, 4).map(toTopProduct),
    lowStockThreshold,
    lowStock: lowStockProducts(database, workspaceId, lowStockThreshold).map(toLowStock),
    recentTransactions: listTransactions(database, workspaceId, recentFilter).map(
      toRecent,
    ),
  };
}

function methodTotals(rows) {
  const empty = { revenue: 0, transactionCount: 0 };
  const result = { cash: { ...empty }, qris: { ...empty } };
  for (const row of rows) {
    result[row.method] = { revenue: row.revenue, transactionCount: row.count };
  }
  return result;
}

// Pendapatan = total setelah diskon. Laporan sengaja tidak menghitung laba.
function buildReport(database, workspaceId, period) {
  const range = periodRange(period);
  const totals = summarizeSales(database, workspaceId, range);
  return {
    period,
    summary: {
      ...toSummary(totals),
      unitsSold: unitsSold(database, workspaceId, range),
      subtotalBeforeDiscount: totals.subtotal,
      discountTotal: totals.discount,
    },
    byPaymentMethod: methodTotals(salesByMethod(database, workspaceId, range)),
    byDay: fillDays(period, salesByDay(database, workspaceId, range)),
    topProducts: topProducts(database, workspaceId, range, 10).map(toTopProduct),
  };
}

// Semua query membaca snapshot yang sama, termasuk saat API lain sedang checkout.
export function getDashboard(database, workspaceId, now) {
  return withReadTransaction(database, () => buildDashboard(database, workspaceId, now));
}

export function getReport(database, workspaceId, period) {
  return withReadTransaction(database, () => buildReport(database, workspaceId, period));
}
