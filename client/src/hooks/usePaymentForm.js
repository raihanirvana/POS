import { useState } from 'react';

function readAmount(text) {
  const trimmed = text.trim();
  const amount = /^\d{1,13}$/.test(trimmed) ? Number(trimmed) : null;
  return amount !== null && amount <= 1000000000000 ? amount : null;
}

function canPay(preview, input, amount) {
  const valid =
    preview.lines.length > 0 &&
    preview.discountPercent !== null &&
    preview.subtotal <= 1000000000000 &&
    preview.lines.every((line) => line.product && line.quantity <= line.product.stock);
  return (
    valid && (input.method === 'qris' || (amount !== null && amount >= preview.total))
  );
}

// Saat pembayaran belum pasti, form diisi dari percobaan yang tersimpan dan dikunci.
function useSavedPaymentInput(cart) {
  const saved = cart.checkout.attempt?.body;
  const [method, setMethod] = useState(saved?.paymentMethod ?? 'cash');
  const [amountText, setAmountText] = useState(
    saved?.amountReceived !== undefined ? String(saved.amountReceived) : '',
  );
  function change(setValue, value) {
    if (cart.checkout.status === 'failed') {
      cart.checkout.abandon();
    }
    setValue(value);
  }
  return {
    method,
    setMethod: (value) => change(setMethod, value),
    amountText,
    setAmountText: (value) => change(setAmountText, value),
  };
}

export function usePaymentForm(page) {
  const { cart, preview, payment } = page;
  const input = useSavedPaymentInput(cart);
  const amount = readAmount(input.amountText);
  const status = cart.checkout.status;
  const enough = canPay(preview, input, amount);
  function submit(event) {
    event.preventDefault();
    if (status === 'uncertain') {
      payment.retry();
    } else if (enough && status !== 'submitting') {
      payment.confirm({ method: input.method, amountReceived: amount });
    }
  }
  const locked = status === 'submitting' || status === 'uncertain';
  return { ...input, amount, enough, status, locked, submit };
}
