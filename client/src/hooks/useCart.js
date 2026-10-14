import { useContext } from 'react';
import { CartContext } from '../cart/cart-context.js';

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error('useCart harus dipakai di dalam CartProvider.');
  }
  return value;
}
