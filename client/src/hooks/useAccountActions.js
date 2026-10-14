import { useCallback, useState } from 'react';
import { navigate } from '../lib/router.js';
import { findRoute, homePath } from '../lib/routes.js';
import { useSession } from './useSession.js';

function useRunner() {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const run = useCallback(async (kind, action) => {
    setPending(kind);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError({ kind, error: caught });
    } finally {
      setPending(null);
    }
  }, []);
  return { pending, error, run, dismissError: () => setError(null) };
}

// Ganti peran memakai ruang demo yang sama; keluar menghapus ruang demo di server.
export function useAccountActions() {
  const { session, startSession, signOut } = useSession();
  const runner = useRunner();
  const [confirming, setConfirming] = useState(false);
  const otherRole = session.role === 'owner' ? 'cashier' : 'owner';
  const switchRole = () =>
    runner.run('switch', async () => {
      const next = await startSession(otherRole);
      if (!findRoute(window.location.pathname)?.roles.includes(next.role)) {
        navigate(homePath, { replace: true });
      }
    });
  const confirmSignOut = () => runner.run('logout', signOut);
  return {
    ...runner,
    otherRole,
    confirming,
    switchRole,
    confirmSignOut,
    askSignOut: () => setConfirming(true),
    cancelSignOut: () => setConfirming(false),
  };
}
