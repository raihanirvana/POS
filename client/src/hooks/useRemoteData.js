import { useCallback, useEffect, useState } from 'react';

// Memuat data dengan abort setiap kali `load` berganti (pemanggil memberi fungsi stabil
// lewat useCallback). Data lama tetap tampil saat memuat ulang atau gagal.
export function useRemoteData(load) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({
      ...previous,
      status: previous.data ? 'refreshing' : 'loading',
      error: null,
    }));
    load(controller.signal)
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState((previous) => ({ ...previous, status: 'error', error }));
        }
      });
    return () => controller.abort();
  }, [load, version]);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, reload };
}
