import { useCallback, useEffect, useState } from 'react';
import { listTransactions } from '../lib/transactions-api.js';

const initialState = { status: 'loading', data: null, error: null };

function startLoading(previous) {
  return { ...previous, status: previous.data ? 'refreshing' : 'loading', error: null };
}

// Data halaman sebelumnya tetap tampil saat filter/halaman baru dimuat atau gagal.
export function useTransactions({ search, date, limit, offset }) {
  const [state, setState] = useState(initialState);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState(startLoading);
    listTransactions({ search, date, limit, offset }, controller.signal)
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState((previous) => ({ ...previous, status: 'error', error }));
        }
      });
    return () => controller.abort();
  }, [search, date, limit, offset, version]);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, reload };
}
