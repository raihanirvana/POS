// Body checkout tanpa harga/total: server menghitung semuanya dari harga database.
export function buildCheckoutBody(order, payment) {
  const body = {
    items: order.items.map(({ productId, quantity }) => ({ productId, quantity })),
    discountPercent: order.discountPercent,
    customerName: order.customerName.trim(),
    orderType: order.orderType,
    paymentMethod: payment.method,
  };
  if (payment.method === 'cash') {
    body.amountReceived = payment.amountReceived;
  }
  return body;
}

// Hasil tidak pasti: server mungkin sudah menyimpan transaksi. Kirim ulang dengan key sama.
export function isUncertainFailure(error) {
  return (
    error.status === 0 ||
    error.status === 408 ||
    error.status >= 500 ||
    error.code === 'INVALID_RESPONSE'
  );
}

export function amountFieldError(error) {
  const message = error?.fields?.amountReceived;
  return typeof message === 'string' && message.trim() ? message : null;
}

// randomUUID hanya ada di konteks aman; fallback untuk akses http lewat IP lokal.
export function newIdempotencyKey() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Saran uang tunai: uang pas lalu pembulatan ke atas pecahan umum.
export function quickCashOptions(total) {
  const rounded = [10000, 20000, 50000, 100000].map(
    (step) => Math.ceil(total / step) * step,
  );
  return [...new Set([total, ...rounded])].filter((value) => value >= total).slice(0, 4);
}
