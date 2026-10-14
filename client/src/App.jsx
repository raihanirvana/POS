import { AppShell } from './components/AppShell.jsx';
import { Redirect } from './components/Redirect.jsx';
import { ErrorScreen, LoadingScreen } from './components/StatusScreen.jsx';
import { useSession } from './hooks/useSession.js';
import { useLocation } from './lib/router.js';
import { findRoute, homePath, loginHref, loginPath, safeNextPath } from './lib/routes.js';
import { ForbiddenPage } from './pages/ForbiddenPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { PlaceholderPage } from './pages/PlaceholderPage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { SessionProvider } from './session/SessionProvider.jsx';

// Halaman yang sudah dihubungkan ke API; route lain masih placeholder.
const livePages = { '/produk': ProductsPage };

// Pembatasan di UI hanya memudahkan navigasi; server tetap menolak dengan 401/403.
function RouteContent({ route, role }) {
  if (!route) {
    return <NotFoundPage />;
  }
  if (!route.roles.includes(role)) {
    return <ForbiddenPage route={route} />;
  }
  const Page = livePages[route.path];
  return Page ? <Page /> : <PlaceholderPage route={route} />;
}

function SignedInRoutes({ pathname, session }) {
  if (pathname === '/') {
    return <Redirect to={homePath} />;
  }
  const route = findRoute(pathname);
  return (
    <AppShell route={route} pathname={pathname}>
      <RouteContent route={route} role={session.role} />
    </AppShell>
  );
}

function AppRoutes() {
  const { pathname, searchParams } = useLocation();
  const state = useSession();
  if (state.status === 'loading') {
    return <LoadingScreen />;
  }
  if (state.status === 'error') {
    return <ErrorScreen error={state.error} onRetry={state.reload} />;
  }
  if (pathname === loginPath) {
    const next = safeNextPath(searchParams.get('lanjut'), state.session?.role);
    return state.session ? <Redirect to={next} /> : <LoginPage />;
  }
  if (!state.session) {
    return <Redirect to={loginHref(pathname)} />;
  }
  return <SignedInRoutes pathname={pathname} session={state.session} />;
}

export function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  );
}
