import { useSessionState } from '../hooks/useSessionState.js';
import { SessionContext } from './session-context.js';

export function SessionProvider({ children }) {
  const value = useSessionState();
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
