import { useEffect, useMemo, useState } from 'react';
import { cartLines, cartTotals, readDiscountPercent } from '../lib/cart.js';
import { filterMenu } from '../lib/menu-filter.js';
import { useCart } from './useCart.js';
import { useProducts } from './useProducts.js';
import { usePaymentFlow } from './usePaymentFlow.js';

const allProducts = { category: '', search: '' };

// Setiap kali menu dimuat ulang, pesanan disesuaikan dengan stok/produk terbaru.
function useCartReconcile(cart, products) {
  const [messages, setMessages] = useState([]);
  const { reconcile, locked } = cart;
  useEffect(() => {
    if (products.status === 'ready' && !locked) {
      const changes = reconcile(products.products);
      if (changes.length > 0) {
        setMessages(changes);
      }
    }
  }, [products.products, products.status, reconcile, locked]);
  return { messages, dismiss: () => setMessages([]) };
}

function useOrderPreview(cart, products) {
  return useMemo(() => {
    const lines = cartLines(cart.order.items, products);
    const discountPercent = readDiscountPercent(cart.order.discountText);
    return { lines, discountPercent, ...cartTotals(lines, discountPercent ?? 0) };
  }, [cart.order.items, cart.order.discountText, products]);
}

export function useCashierPage() {
  const cart = useCart();
  const products = useProducts(allProducts);
  const [filters, setFilters] = useState({ category: '', search: '' });
  const preview = useOrderPreview(cart, products.products);
  const stockNotice = useCartReconcile(cart, products);
  const payment = usePaymentFlow({ cart, preview, reloadProducts: products.reload });
  const menu = useMemo(
    () => filterMenu(products.products, filters),
    [products.products, filters],
  );
  return { cart, products, filters, setFilters, menu, preview, stockNotice, payment };
}
