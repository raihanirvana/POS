import { useContext } from 'react';
import { SessionContext } from '../session/session-context.js';

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession harus dipakai di dalam SessionProvider.');
  }
  return value;
}
