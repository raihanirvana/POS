import { useEffect, useRef } from 'react';
import { useSession } from '../hooks/useSession.js';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

// Setelah pindah halaman, fokus dipindah ke konten agar pembaca layar mengikuti.
function useRouteFocus(pathname, title) {
  const mainRef = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    document.title = `${title} · Seduh POS`;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname, title]);
  return mainRef;
}

export function AppShell({ route, pathname, children }) {
  const { session } = useSession();
  const mainRef = useRouteFocus(pathname, route?.title ?? 'Halaman tidak ditemukan');
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      <Sidebar session={session} pathname={pathname} />
      <div className="workspace">
        <Topbar route={route} />
        <main id="main" ref={mainRef} tabIndex={-1}>
          {children}
        </main>
        <footer className="workspace-footer">
          Demo portfolio: login tanpa password dan pembayaran simulasi.
        </footer>
      </div>
    </div>
  );
}
