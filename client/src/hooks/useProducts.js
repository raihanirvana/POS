import { useCallback, useEffect, useState } from 'react';
import { listProducts } from '../lib/products-api.js';

const initialState = { status: 'loading', products: [], catalog: null, error: null };

// Data lama tetap tampil saat memuat ulang (status "refreshing").
function startLoading(previous) {
  return {
    ...previous,
    status: previous.catalog ? 'refreshing' : 'loading',
    error: null,
  };
}

export function useProducts({ category, search }) {
  const [state, setState] = useState(initialState);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState(startLoading);
    listProducts({ category, search }, controller.signal)
      .then(({ products, catalog }) => {
        setState({ status: 'ready', products, catalog, error: null });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState((previous) => ({ ...previous, status: 'error', error }));
        }
      });
    return () => controller.abort();
  }, [category, search, version]);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, reload };
}
