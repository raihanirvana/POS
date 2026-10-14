import { useHealth } from '../hooks/useHealth.js';

const labels = {
  loading: 'Menghubungkan ke backend…',
  ready: 'Backend dan database terhubung',
  error: 'Backend belum terhubung',
};

const descriptions = {
  loading: 'Memeriksa koneksi server dan SQLite.',
  ready: 'React, Express, dan SQLite siap untuk tiket berikutnya.',
};

export function HealthStatus() {
  const status = useHealth();
  return (
    <div className={`health-status health-status--${status.state}`} role="status">
      <span className="status-dot" aria-hidden="true" />
      <div>
        <strong>{labels[status.state]}</strong>
        <p>{status.message ?? descriptions[status.state]}</p>
      </div>
    </div>
  );
}
