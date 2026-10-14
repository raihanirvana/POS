import { Icon } from '../components/Icon.jsx';
import { PageHeader } from '../components/PageHeader.jsx';

function PrototypeLink({ hash }) {
  return (
    <a
      className="secondary-button"
      href={`/prototype/index.html#${hash}`}
      target="_blank"
      rel="noreferrer"
    >
      Lihat rancangan di prototype
      <Icon name="external" size={14} />
    </a>
  );
}

// Halaman fitur yang belum dihubungkan ditandai jujur sebagai belum tersedia.
export function PlaceholderPage({ route }) {
  return (
    <>
      <PageHeader title={route.title} subtitle={route.subtitle} />
      <section className="panel upcoming-panel" aria-labelledby="upcoming-title">
        <span className="upcoming-icon">
          <Icon name={route.icon} size={26} />
        </span>
        <div>
          <span className="stage-label">Belum tersedia · {route.ticket}</span>
          <h2 id="upcoming-title">Halaman ini sedang dihubungkan ke server.</h2>
          <p>{route.upcoming}</p>
          <PrototypeLink hash={route.prototypeHash} />
        </div>
      </section>
    </>
  );
}
