import { useCallback, useEffect, useState } from 'react';
import { getTransaction } from '../lib/transactions-api.js';

// Struk lama selalu dimuat ulang dari server (snapshot), bukan dari data daftar.
export function useTransactionDetail(id) {
  const [state, setState] = useState({
    status: 'loading',
    transaction: null,
    error: null,
  });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', transaction: null, error: null });
    getTransaction(id, controller.signal)
      .then((transaction) => setState({ status: 'ready', transaction, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ status: 'error', transaction: null, error });
        }
      });
    return () => controller.abort();
  }, [id, version]);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, reload };
}
