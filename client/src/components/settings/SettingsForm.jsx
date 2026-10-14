import { useSettingsForm } from '../../hooks/useSettingsForm.js';
import { inputA11y } from '../../lib/form-a11y.js';
import { characterCount, settingsLimits } from '../../lib/settings-form.js';
import { ErrorNotice } from '../ErrorNotice.jsx';
import { FormField } from '../FormField.jsx';

const fields = [
  { key: 'storeName', label: 'Nama toko' },
  { key: 'storeAddress', label: 'Alamat' },
  { key: 'receiptMessage', label: 'Pesan penutup struk', multiline: true },
];

function SettingsField({ form, field }) {
  const id = `settings-${field.key}`;
  const error = form.errors[field.key];
  const hint = `${characterCount(form.values[field.key])}/${settingsLimits[field.key]} karakter`;
  const props = {
    ...inputA11y(id, error, hint),
    className: 'input',
    value: form.values[field.key],
    onChange: (event) => form.setField(field.key, event.target.value),
  };
  return (
    <FormField id={id} label={field.label} hint={hint} error={error}>
      {field.multiline ? (
        <textarea {...props} rows={3} />
      ) : (
        <input {...props} autoComplete="off" />
      )}
    </FormField>
  );
}

// Struk baru memakai identitas ini; struk lama tetap memakai snapshot saat transaksi.
export function SettingsForm({ saved, onSaved, disabled, onSaving }) {
  const form = useSettingsForm({ saved, onSaved, disabled, onSaving });
  return (
    <form className="settings-form" onSubmit={form.submit} noValidate>
      <fieldset disabled={form.saving || disabled}>
        <legend className="visually-hidden">Identitas kedai</legend>
        {fields.map((field) => (
          <SettingsField key={field.key} form={form} field={field} />
        ))}
      </fieldset>
      {form.submitError ? (
        <ErrorNotice title="Pengaturan belum tersimpan" error={form.submitError} />
      ) : null}
      <button type="submit" className="primary-button" disabled={form.saving || disabled}>
        {form.saving ? 'Menyimpan…' : 'Simpan pengaturan'}
      </button>
    </form>
  );
}
