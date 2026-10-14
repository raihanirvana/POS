import { useAccountActions } from '../hooks/useAccountActions.js';
import { roleLabels } from '../lib/format.js';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import { ErrorNotice } from './ErrorNotice.jsx';
import { Icon } from './Icon.jsx';

function AccountError({ actions }) {
  const retry = actions.error.kind === 'switch' ? actions.switchRole : actions.askSignOut;
  return (
    <div className="account-error">
      <ErrorNotice
        title="Aksi belum berhasil"
        error={actions.error.error}
        onRetry={retry}
      />
      <button type="button" className="text-button" onClick={actions.dismissError}>
        Tutup
      </button>
    </div>
  );
}

function SignOutMessage({ actions }) {
  return (
    <>
      <p>
        Ruang demo ini beserta produk dan transaksi percobaanmu akan dihapus. Kamu bisa
        masuk lagi untuk mendapat data contoh baru.
      </p>
      {actions.error?.kind === 'logout' ? (
        <ErrorNotice title="Belum bisa keluar" error={actions.error.error} />
      ) : null}
    </>
  );
}

function SignOutDialog({ actions }) {
  const failed = actions.error?.kind === 'logout';
  return (
    <ConfirmDialog
      open={actions.confirming}
      title="Keluar dari demo?"
      confirmLabel={failed ? 'Coba keluar lagi' : 'Keluar dan hapus data'}
      busy={actions.pending === 'logout'}
      onConfirm={actions.confirmSignOut}
      onCancel={actions.cancelSignOut}
    >
      <SignOutMessage actions={actions} />
    </ConfirmDialog>
  );
}

function SwitchRoleButton({ actions }) {
  const label = `Ganti ke ${roleLabels[actions.otherRole]}`;
  return (
    <button
      type="button"
      className="secondary-button compact-button"
      onClick={actions.switchRole}
      disabled={actions.pending !== null}
      aria-label={label}
      title={label}
    >
      <Icon name="swap" size={16} />
      <span className="button-text">
        {actions.pending === 'switch' ? 'Mengganti…' : label}
      </span>
    </button>
  );
}

function SignOutButton({ actions }) {
  return (
    <button
      type="button"
      className="secondary-button compact-button"
      onClick={actions.askSignOut}
      disabled={actions.pending !== null}
      aria-label="Keluar dari demo"
      title="Keluar dari demo"
    >
      <Icon name="logout" size={16} />
      <span className="button-text">Keluar</span>
    </button>
  );
}

export function AccountActions() {
  const actions = useAccountActions();
  return (
    <div className="account-actions">
      <SwitchRoleButton actions={actions} />
      <SignOutButton actions={actions} />
      <SignOutDialog actions={actions} />
      {actions.error && !actions.confirming ? <AccountError actions={actions} /> : null}
    </div>
  );
}
