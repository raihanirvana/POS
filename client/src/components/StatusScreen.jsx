import { Brand } from './Brand.jsx';
import { ErrorNotice } from './ErrorNotice.jsx';

export function LoadingScreen({ label = 'Memuat ruang demo…' }) {
  return (
    <div className="status-screen">
      <Brand />
      <p className="loading-label" role="status">
        <span className="spinner" aria-hidden="true" />
        {label}
      </p>
    </div>
  );
}

export function ErrorScreen({ error, onRetry }) {
  return (
    <div className="status-screen">
      <Brand />
      <ErrorNotice title="Sesi belum bisa dimuat" error={error} onRetry={onRetry} />
    </div>
  );
}
