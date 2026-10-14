import { formatToday } from '../lib/format.js';
import { AccountActions } from './AccountActions.jsx';

export function Topbar({ route }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        Ruang demo <span aria-hidden="true">/</span>{' '}
        <strong>{route?.label ?? 'Halaman'}</strong>
      </div>
      <div className="topbar-right">
        <span className="demo-badge">Demo interaktif</span>
        <span className="today">{formatToday()}</span>
        <AccountActions />
      </div>
    </header>
  );
}
