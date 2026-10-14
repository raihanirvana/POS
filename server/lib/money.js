// Aturan PRD: diskon = pembulatan(subtotal × persen / 100), total = subtotal − diskon.
export function calculateTotals(lines, discountPercent) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  return { subtotal, discountAmount, total: subtotal - discountAmount };
}
