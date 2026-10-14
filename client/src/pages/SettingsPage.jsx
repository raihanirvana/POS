import { PageHeader } from '../components/PageHeader.jsx';
import { RemoteContent } from '../components/RemoteContent.jsx';
import { ResetPanel } from '../components/settings/ResetPanel.jsx';
import { SettingsForm } from '../components/settings/SettingsForm.jsx';
import { useSettingsPage } from '../hooks/useSettingsPage.js';

const settingsLabels = {
  loading: 'Memuat pengaturan…',
  error: 'Pengaturan belum bisa dimuat',
  stale: 'Pengaturan belum diperbarui',
};

function IdentityPanel({ page }) {
  const { state, handleSaved, disabled, onSaving } = page;
  return (
    <section className="panel" aria-labelledby="identity-title">
      <h2 id="identity-title">Identitas kedai</h2>
      <p className="panel-subtitle">
        Tampil pada struk baru. Struk lama tetap memakai identitas saat transaksi dibuat.
      </p>
      <RemoteContent state={state} labels={settingsLabels}>
        {(settings) => (
          <SettingsForm
            key={settings.updatedAt}
            saved={settings}
            onSaved={handleSaved}
            disabled={disabled}
            onSaving={onSaving}
          />
        )}
      </RemoteContent>
    </section>
  );
}

export function SettingsPage() {
  const page = useSettingsPage();
  return (
    <>
      <PageHeader
        title="Pengaturan toko"
        subtitle="Buat pengalaman ini terasa seperti kedaimu."
      />
      <p className="save-notice" role="status">
        {page.notice}
      </p>
      <IdentityPanel page={page} />
      <ResetPanel reset={page.reset} disabled={page.resetDisabled} />
    </>
  );
}
