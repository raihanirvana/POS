import { useCartState } from '../hooks/useCartState.js';
import { CartContext } from './cart-context.js';

// Dipasang di atas shell agar pesanan tetap ada saat pindah halaman; hilang saat keluar.
export function CartProvider({ children }) {
  const value = useCartState();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
