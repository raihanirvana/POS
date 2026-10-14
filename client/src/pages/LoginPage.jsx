import { useEffect, useState } from 'react';
import { Brand } from '../components/Brand.jsx';
import { ErrorNotice } from '../components/ErrorNotice.jsx';
import { Icon } from '../components/Icon.jsx';
import { useSession } from '../hooks/useSession.js';
import { RoleOption } from './RoleOption.jsx';

const roleOptions = [
  {
    role: 'cashier',
    title: 'Kasir',
    icon: 'register',
    description: 'Layani pesanan: pilih menu, terima pembayaran, dan buka struk.',
    pages: 'Halaman: Kasir dan Transaksi',
  },
  {
    role: 'owner',
    title: 'Pemilik',
    icon: 'store',
    description: 'Pantau penjualan, kelola menu dan stok, serta atur identitas kedai.',
    pages: 'Halaman: semua menu',
  },
];

const facts = [
  'Tanpa daftar dan tanpa password',
  'Setiap kunjungan mendapat ruang data sendiri dengan menu dan transaksi contoh',
  'Pembayaran tunai dan QRIS hanya simulasi',
];

function LoginIntro() {
  return (
    <div className="login-intro">
      <Brand />
      <span className="banner-tag">Demo interaktif</span>
      <h1 id="login-title">Coba kasir Seduh langsung dari browser.</h1>
      <ul className="login-facts">
        {facts.map((fact) => (
          <li key={fact}>
            <Icon name="check" size={16} />
            {fact}
          </li>
        ))}
      </ul>
    </div>
  );
}

function useRoleChoice() {
  const { startSession } = useSession();
  const [pendingRole, setPendingRole] = useState(null);
  const [failure, setFailure] = useState(null);
  async function choose(role) {
    setPendingRole(role);
    setFailure(null);
    try {
      await startSession(role);
    } catch (error) {
      setFailure({ role, error });
      setPendingRole(null);
    }
  }
  return { pendingRole, failure, choose };
}

function RoleChoices({ choice }) {
  return (
    <>
      {roleOptions.map((option) => (
        <RoleOption
          key={option.role}
          option={option}
          pendingRole={choice.pendingRole}
          onChoose={choice.choose}
        />
      ))}
      {choice.failure ? (
        <ErrorNotice
          error={choice.failure.error}
          onRetry={() => choice.choose(choice.failure.role)}
        />
      ) : null}
    </>
  );
}

function LoginPanel({ notice, choice }) {
  return (
    <section className="login-panel" aria-label="Pilih peran demo">
      {notice ? (
        <p className="login-notice" role="status">
          {notice}
        </p>
      ) : null}
      <h2>Masuk sebagai</h2>
      <RoleChoices choice={choice} />
      <p className="login-footnote">
        Peran bisa diganti kapan saja dari bagian atas aplikasi.
      </p>
    </section>
  );
}

export function LoginPage() {
  const { notice } = useSession();
  const choice = useRoleChoice();
  useEffect(() => {
    document.title = 'Masuk demo · Seduh POS';
  }, []);
  return (
    <main id="main" className="login-page" aria-labelledby="login-title">
      <LoginIntro />
      <LoginPanel notice={notice} choice={choice} />
    </main>
  );
}
