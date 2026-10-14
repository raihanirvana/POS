import { formatTime, roleLabels } from '../lib/format.js';
import { homePath } from '../lib/routes.js';
import { Brand } from './Brand.jsx';
import { Icon } from './Icon.jsx';
import { Link } from './Link.jsx';
import { SidebarNav } from './SidebarNav.jsx';

function WorkspaceChip({ session }) {
  return (
    <div className="store-chip">
      <Icon name="store" />
      <span>
        Ruang demo {roleLabels[session.role].toLowerCase()}
        <small>Berlaku sampai {formatTime(session.expiresAt)}</small>
      </span>
    </div>
  );
}

function DemoNote() {
  return (
    <div className="demo-note">
      <strong>
        <span className="demo-dot" aria-hidden="true" />
        Versi demo
      </strong>
      <p>Bebas mencoba. Data hanya milik ruang demomu dan semua pembayaran simulasi.</p>
    </div>
  );
}

function Profile({ session }) {
  return (
    <div className="profile">
      <span className="avatar" aria-hidden="true">
        {session.roleLabel.charAt(0)}
      </span>
      <span>
        {session.roleLabel}
        <small>Login demo</small>
      </span>
    </div>
  );
}

function SidebarFooter({ session }) {
  return (
    <div className="sidebar-bottom">
      <a
        className="guide-link"
        href="/prototype/prd.html"
        target="_blank"
        rel="noreferrer"
      >
        <Icon name="book" size={16} />
        Panduan & PRD
        <Icon name="external" size={14} />
      </a>
      <DemoNote />
      <Profile session={session} />
    </div>
  );
}

export function Sidebar({ session, pathname }) {
  return (
    <aside className="sidebar">
      <Link to={homePath} className="brand-link" aria-label="Seduh POS, halaman kasir">
        <Brand />
      </Link>
      <WorkspaceChip session={session} />
      <p className="nav-label">Ruang kerja</p>
      <SidebarNav role={session.role} pathname={pathname} />
      <SidebarFooter session={session} />
    </aside>
  );
}
