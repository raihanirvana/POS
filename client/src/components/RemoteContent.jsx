import { ErrorNotice } from './ErrorNotice.jsx';

function FirstLoad({ state, labels }) {
  if (state.status === 'error') {
    return (
      <ErrorNotice title={labels.error} error={state.error} onRetry={state.reload} />
    );
  }
  return (
    <p className="empty-state" role="status">
      {labels.loading}
    </p>
  );
}

// Memuat pertama: pesan/ error. Memuat ulang: konten lama tetap tampil dan diredupkan.
export function RemoteContent({ state, labels, children }) {
  if (!state.data) {
    return <FirstLoad state={state} labels={labels} />;
  }
  const refreshing = state.status === 'refreshing';
  return (
    <div className={refreshing ? 'refreshing' : undefined} aria-busy={refreshing}>
      {state.error ? (
        <ErrorNotice title={labels.stale} error={state.error} onRetry={state.reload} />
      ) : null}
      {children(state.data)}
    </div>
  );
}
