import { useEffect } from 'react';
import { navigate } from '../lib/router.js';

export function Redirect({ to }) {
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);
  return null;
}
