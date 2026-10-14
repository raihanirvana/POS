import { jakartaDateKey, jakartaTime, shiftDateKey } from '../../lib/jakarta-time.js';
import { calculateTotals } from '../../lib/money.js';
import { seedProducts } from './menu.js';

const customers = ['Raka', 'Nadia', 'Bima', 'Sinta', 'Dimas', 'Laras'];
const minutesBetweenOrders = 43;
const daysOfHistory = 7;

function ordersOnDay(daysAgo) {
  return daysAgo === 0 ? 5 : 4 + (daysAgo % 3);
}

function buildLines(daysAgo, index) {
  const first = seedProducts[(daysAgo + index) % seedProducts.length];
  const second = seedProducts[(daysAgo + index + 3) % seedProducts.length];
  return [
    { product: first, unitPrice: first.price, quantity: 1 + (index % 2) },
    { product: second, unitPrice: second.price, quantity: 1 },
  ];
}

function buildPayment(index, total) {
  if (index % 2 === 1) {
    return { paymentMethod: 'qris', amountReceived: total, changeAmount: 0 };
  }
  const amountReceived = Math.ceil(total / 50000) * 50000;
  return { paymentMethod: 'cash', amountReceived, changeAmount: amountReceived - total };
}

function buildTransaction(dateKey, daysAgo, index) {
  const openingTime = jakartaTime(dateKey, '10:00:00.000').getTime();
  const lines = buildLines(daysAgo, index);
  const discountPercent = index === 3 ? 10 : 0;
  const totals = calculateTotals(lines, discountPercent);
  return {
    number: `SDH-${dateKey.replaceAll('-', '')}-${String(index + 1).padStart(3, '0')}`,
    createdAt: new Date(openingTime + index * minutesBetweenOrders * 60000).toISOString(),
    customerName: customers[index],
    orderType: index % 2 === 1 ? 'takeaway' : 'dine_in',
    lines,
    discountPercent,
    ...totals,
    ...buildPayment(index, totals.total),
  };
}

// Transaksi contoh 7 hari terakhir (Asia/Jakarta) relatif terhadap `now`.
// Jadwal yang masih di masa depan dilewati agar tidak ada penjualan fiktif setelah `now`.
export function buildSampleTransactions(now) {
  const todayKey = jakartaDateKey(now);
  const transactions = [];
  for (let daysAgo = daysOfHistory - 1; daysAgo >= 0; daysAgo -= 1) {
    const dateKey = shiftDateKey(todayKey, -daysAgo);
    for (let index = 0; index < ordersOnDay(daysAgo); index += 1) {
      transactions.push(buildTransaction(dateKey, daysAgo, index));
    }
  }
  const nowIso = now.toISOString();
  return transactions.filter((transaction) => transaction.createdAt <= nowIso);
}
