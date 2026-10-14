import { useCallback, useEffect, useState } from 'react';

// Pesan sukses singkat yang hilang sendiri setelah beberapa detik.
export function useTimedNotice(duration = 5000) {
  const [message, setMessage] = useState(null);
  useEffect(() => {
    if (!message) {
      return undefined;
    }
    const timer = setTimeout(() => setMessage(null), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);
  const show = useCallback((text) => setMessage(text), []);
  return { message, show };
}
