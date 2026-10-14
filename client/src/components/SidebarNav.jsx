import { useEffect, useRef } from 'react';
import { routesForRole } from '../lib/routes.js';
import { Icon } from './Icon.jsx';
import { Link } from './Link.jsx';

// Di ponsel navigasi bergulir horizontal; item aktif digeser agar terlihat.
function useActiveItemVisible(pathname) {
  const navRef = useRef(null);
  useEffect(() => {
    const active = navRef.current?.querySelector('[aria-current="page"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname]);
  return navRef;
}

export function SidebarNav({ role, pathname }) {
  const navRef = useActiveItemVisible(pathname);
  return (
    <nav ref={navRef} className="sidebar-nav" aria-label="Menu utama">
      {routesForRole(role).map((route) => (
        <Link
          key={route.path}
          to={route.path}
          className={route.path === pathname ? 'nav-item active' : 'nav-item'}
          aria-current={route.path === pathname ? 'page' : undefined}
          title={route.label}
        >
          <Icon name={route.icon} />
          <span className="nav-text">{route.label}</span>
        </Link>
      ))}
    </nav>
  );
}
