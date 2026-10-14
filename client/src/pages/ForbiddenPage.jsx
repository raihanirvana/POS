import { Icon } from '../components/Icon.jsx';
import { Link } from '../components/Link.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { homePath } from '../lib/routes.js';

export function ForbiddenPage({ route }) {
  return (
    <>
      <PageHeader title={route.title} subtitle="Halaman khusus pemilik kedai." />
      <section className="panel upcoming-panel" aria-labelledby="forbidden-title">
        <span className="upcoming-icon">
          <Icon name="lock" size={26} />
        </span>
        <div>
          <h2 id="forbidden-title">Peran kasir tidak bisa membuka halaman ini.</h2>
          <p>
            Server juga menolak akses ini. Gunakan tombol ganti peran di bagian atas untuk
            mencoba sebagai pemilik pada ruang demo yang sama.
          </p>
          <Link className="primary-button" to={homePath}>
            Kembali ke kasir
          </Link>
        </div>
      </section>
    </>
  );
}
