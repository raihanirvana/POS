import { useEffect, useState } from 'react';
import { getHealth } from '../lib/api.js';

async function loadHealth(signal, setStatus) {
  try {
    const health = await getHealth(signal);
    setStatus({ state: 'ready', health });
  } catch (error) {
    if (error.name !== 'AbortError') {
      setStatus({ state: 'error', message: error.message });
    }
  }
}

export function useHealth() {
  const [status, setStatus] = useState({ state: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    loadHealth(controller.signal, setStatus);
    return () => controller.abort();
  }, []);
  return status;
}
