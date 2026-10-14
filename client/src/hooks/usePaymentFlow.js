import { useState } from 'react';
import { buildCheckoutBody } from '../lib/checkout.js';

const stockErrors = ['INSUFFICIENT_STOCK', 'PRODUCT_UNAVAILABLE'];

// Sukses: kosongkan pesanan, buka struk, muat ulang stok. Stok/produk berubah: muat ulang
// menu agar pesanan disesuaikan; pesanan tidak dikosongkan saat gagal.
function useOutcomeHandler({ cart, reloadProducts, setOpen }) {
  function handle(outcome) {
    if (outcome.result) {
      cart.clear();
      setOpen(false);
      cart.setReceipt({ ...outcome.result, previewTotal: outcome.previewTotal });
      reloadProducts();
    } else if (stockErrors.includes(outcome.error?.code)) {
      reloadProducts();
    }
  }
  return { receipt: cart.receipt, handle, closeReceipt: () => cart.setReceipt(null) };
}

function createConfirmHandler(cart, preview, handle) {
  return async (payment) => {
    const order = { ...cart.order, discountPercent: preview.discountPercent };
    const result = await cart.checkout.submit(
      buildCheckoutBody(order, payment),
      preview.total,
    );
    handle(result);
  };
}

export function usePaymentFlow({ cart, preview, reloadProducts }) {
  const [open, setOpen] = useState(false);
  const outcome = useOutcomeHandler({ cart, reloadProducts, setOpen });
  const confirm = createConfirmHandler(cart, preview, outcome.handle);
  function openPayment() {
    if (cart.checkout.status === 'failed') {
      cart.checkout.abandon();
    }
    setOpen(true);
  }
  return {
    ...outcome,
    open,
    confirm,
    openPayment,
    retry: async () => outcome.handle(await cart.checkout.retry()),
    close: () => setOpen(false),
  };
}
