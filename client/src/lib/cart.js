// Keranjang hanya menyimpan pilihan pengguna: productId, jumlah, dan nama untuk pesan.
// Harga dan stok selalu dibaca dari daftar produk terbaru dari server.
export function addToCart(items, product) {
  const existing = items.find((item) => item.productId === product.id);
  const quantity = (existing?.quantity ?? 0) + 1;
  if (quantity > product.stock) {
    return null;
  }
  return existing
    ? items.map((item) => (item.productId === product.id ? { ...item, quantity } : item))
    : [...items, { productId: product.id, name: product.name, quantity: 1 }];
}

export function setCartQuantity(items, productId, quantity) {
  return quantity <= 0
    ? items.filter((item) => item.productId !== productId)
    : items.map((item) => (item.productId === productId ? { ...item, quantity } : item));
}

export function cartLines(items, products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return items.map((item) => {
    const product = byId.get(item.productId) ?? null;
    const unitPrice = product?.price ?? 0;
    return { ...item, product, unitPrice, lineTotal: unitPrice * item.quantity };
  });
}

// Rumus sama dengan server: diskon = round(subtotal × persen / 100).
export function cartTotals(lines, discountPercent) {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  return { subtotal, discountAmount, total: subtotal - discountAmount };
}

function reconcileItem(item, product) {
  if (!product || product.stock === 0) {
    const reason = product ? 'stoknya habis' : 'tidak lagi tersedia';
    return { item: null, message: `${item.name} ${reason}; dihapus dari pesanan.` };
  }
  if (item.quantity > product.stock) {
    const message = `Stok ${product.name} tinggal ${product.stock}; jumlah disesuaikan.`;
    return { item: { ...item, name: product.name, quantity: product.stock }, message };
  }
  return { item: { ...item, name: product.name }, message: null };
}

// Menyesuaikan keranjang dengan stok/produk terbaru dan menjelaskan perubahannya.
export function reconcileCart(items, products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const results = items.map((item) => reconcileItem(item, byId.get(item.productId)));
  return {
    items: results.map((result) => result.item).filter(Boolean),
    messages: results.map((result) => result.message).filter(Boolean),
  };
}

export function readDiscountPercent(text) {
  const trimmed = text.trim();
  if (trimmed === '') {
    return 0;
  }
  const value = /^\d{1,3}$/.test(trimmed) ? Number(trimmed) : Number.NaN;
  return value >= 0 && value <= 100 ? value : null;
}
