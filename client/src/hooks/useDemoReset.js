import { useState } from 'react';
import { resetDemo } from '../lib/settings-api.js';
import { useCart } from './useCart.js';

async function runReset(cart) {
  try {
    const result = await resetDemo();
    cart.resetAll();
    return { result };
  } catch (error) {
    return { error };
  }
}

function useResetDialog() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  return {
    confirming,
    error,
    setError,
    close: () => setConfirming(false),
    open: () => {
      setError(null);
      setConfirming(true);
    },
  };
}

// Reset berjalan atomik di server; setelah berhasil, keranjang di frontend dibatalkan.
export function useDemoReset(onDone) {
  const cart = useCart();
  const dialog = useResetDialog();
  async function confirm() {
    if (!cart.beginReset()) {
      return;
    }
    dialog.setError(null);
    const outcome = await runReset(cart);
    cart.endReset();
    dialog.setError(outcome.error ?? null);
    if (outcome.result) {
      dialog.close();
      onDone(outcome.result);
    }
  }
  return { ...dialog, pending: cart.resetting, confirm, cancel: dialog.close };
}
