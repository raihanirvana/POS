import { useRef, useState } from 'react';

function resetCart(actions, checkout, setReceipt) {
  actions.clear();
  setReceipt(null);
  checkout.abandon();
}

// Kunci reset bertahan saat pindah halaman; gagal reset tidak menghapus pesanan.
export function useCartReset(actions, checkout, setReceipt) {
  const [resetting, setResetting] = useState(false);
  const pending = useRef(false);
  function beginReset() {
    if (pending.current) {
      return false;
    }
    pending.current = true;
    setResetting(true);
    return true;
  }
  function endReset() {
    pending.current = false;
    setResetting(false);
  }
  return {
    resetting,
    beginReset,
    endReset,
    resetAll: () => resetCart(actions, checkout, setReceipt),
  };
}
