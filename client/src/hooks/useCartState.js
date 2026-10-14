import { useMemo, useRef, useState } from 'react';
import { addToCart, reconcileCart, setCartQuantity } from '../lib/cart.js';
import { useCheckout } from './useCheckout.js';

const emptyOrder = {
  items: [],
  customerName: '',
  orderType: 'dine_in',
  discountText: '0',
};

function orderActions(setOrder, orderRef) {
  const change = (update) =>
    setOrder((previous) => ({ ...previous, ...update(previous) }));
  return {
    add: (product) =>
      change((order) => ({ items: addToCart(order.items, product) ?? order.items })),
    setQuantity: (productId, quantity) =>
      change((order) => ({ items: setCartQuantity(order.items, productId, quantity) })),
    setCustomerName: (customerName) => change(() => ({ customerName })),
    setOrderType: (orderType) => change(() => ({ orderType })),
    setDiscountText: (discountText) => change(() => ({ discountText })),
    clear: () => setOrder(emptyOrder),
    // Mengembalikan pesan perubahan agar kasir tahu kenapa pesanan disesuaikan.
    reconcile: (products) => {
      const { messages } = reconcileCart(orderRef.current.items, products);
      change((order) => ({ items: reconcileCart(order.items, products).items }));
      return messages;
    },
  };
}

// Keranjang di memori browser saja; terkunci selama pembayaran berjalan/tidak pasti.
export function useCartState() {
  const [order, setOrder] = useState(emptyOrder);
  const [receipt, setReceipt] = useState(null);
  const orderRef = useRef(order);
  orderRef.current = order;
  const checkout = useCheckout();
  const locked = checkout.status === 'submitting' || checkout.status === 'uncertain';
  // setOrder dan orderRef stabil, jadi aksi cukup dibuat sekali.
  const actions = useMemo(() => orderActions(setOrder, orderRef), []);
  return { order, receipt, setReceipt, checkout, locked, ...actions };
}
