import { useCallback, useEffect, useState } from 'react';
import { endSession, getSession, onUnauthorized, startDemoSession } from '../lib/api.js';

const initialState = { status: 'loading', session: null, error: null, notice: null };

const notices = {
  SESSION_EXPIRED: 'Sesi demo berakhir. Masuk lagi untuk membuka ruang demo baru.',
  UNAUTHENTICATED: 'Sesi tidak lagi berlaku. Masuk lagi untuk melanjutkan.',
  SIGNED_OUT: 'Kamu sudah keluar. Data ruang demo tadi sudah dihapus.',
};

function signedOut(notice = null) {
  return { status: 'ready', session: null, error: null, notice };
}

function signedIn(session) {
  return { status: 'ready', session, error: null, notice: null };
}

async function fetchSession(signal, setState) {
  try {
    const { session } = await getSession(signal);
    setState(signedIn(session));
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    if (error.status === 401) {
      const expired = error.code === 'SESSION_EXPIRED';
      setState(signedOut(expired ? notices.SESSION_EXPIRED : null));
      return;
    }
    setState({ ...initialState, status: 'error', error });
  }
}

// 401 dari endpoint mana pun mengosongkan sesi, tetapi hanya jika sebelumnya masuk.
function useUnauthorizedReset(setState) {
  useEffect(
    () =>
      onUnauthorized((error) => {
        const notice = notices[error.code] ?? notices.UNAUTHENTICATED;
        setState((previous) => (previous.session ? signedOut(notice) : previous));
      }),
    [setState],
  );
}

export function useSessionState() {
  const [state, setState] = useState(initialState);
  const reload = useCallback(() => {
    setState(initialState);
    const controller = new AbortController();
    fetchSession(controller.signal, setState);
    return () => controller.abort();
  }, []);
  useEffect(() => reload(), [reload]);
  useUnauthorizedReset(setState);
  // Tanpa sesi aktif membuat ruang demo baru; dengan sesi aktif mengganti peran.
  const startSession = useCallback(async (role) => {
    const { session } = await startDemoSession(role);
    setState(signedIn(session));
    return session;
  }, []);
  const signOut = useCallback(async () => {
    await endSession();
    setState(signedOut(notices.SIGNED_OUT));
  }, []);
  return { ...state, reload, startSession, signOut };
}
