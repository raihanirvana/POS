import { useState } from 'react';
import { deleteProduct } from '../lib/products-api.js';

// 404 berarti menu sudah terhapus (misalnya dari tab lain): dianggap selesai.
async function removeProduct(product) {
  try {
    await deleteProduct(product.id);
    return null;
  } catch (error) {
    return error.status === 404 ? null : error;
  }
}

export function useProductDelete(onDeleted) {
  const [target, setTarget] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  async function confirm() {
    setPending(true);
    setError(null);
    const failure = await removeProduct(target);
    setPending(false);
    setError(failure);
    if (!failure) {
      onDeleted(target);
      setTarget(null);
    }
  }
  function open(product) {
    setError(null);
    setTarget(product);
  }
  return { target, pending, error, confirm, open, cancel: () => setTarget(null) };
}
