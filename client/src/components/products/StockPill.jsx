// Ambang stok menipis sama dengan dashboard prototype (≤ 10 unit).
export function StockPill({ stock }) {
  if (stock === 0) {
    return <span className="pill pill--empty">Habis</span>;
  }
  return <span className={stock <= 10 ? 'pill pill--low' : 'pill'}>{stock} unit</span>;
}
