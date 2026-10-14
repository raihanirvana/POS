import { Link } from '../components/Link.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { homePath } from '../lib/routes.js';

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="Halaman tidak ditemukan"
        subtitle="Alamat ini tidak ada di Seduh POS."
      />
      <section className="panel">
        <p>Periksa kembali alamatnya atau buka halaman kasir.</p>
        <Link className="primary-button" to={homePath}>
          Ke halaman kasir
        </Link>
      </section>
    </>
  );
}
