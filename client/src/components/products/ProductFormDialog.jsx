import { useModalDialog } from '../../hooks/useModalDialog.js';
import { useProductForm } from '../../hooks/useProductForm.js';
import { formatRupiah } from '../../lib/format.js';
import { priceHint } from '../../lib/product-form.js';
import { ErrorNotice } from '../ErrorNotice.jsx';
import { Icon } from '../Icon.jsx';
import { ImagePresetPicker } from './ImagePresetPicker.jsx';
import { CategoryField, TextField } from './ProductFields.jsx';

function DialogHeader({ editing, onClose, disabled }) {
  return (
    <div className="dialog-header">
      <div>
        <h2 id="product-form-title">{editing ? 'Edit produk' : 'Tambah produk'}</h2>
        <p>Lengkapi menu yang ingin ditampilkan di kasir.</p>
      </div>
      <button
        type="button"
        className="icon-button"
        onClick={onClose}
        disabled={disabled}
        aria-label="Tutup form"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

function MainFields({ form, catalog }) {
  const hint = priceHint(form.values.price, formatRupiah);
  return (
    <>
      <TextField form={form} field="name" label="Nama produk" autoFocus />
      <CategoryField form={form} categories={catalog.categories} />
      <div className="two-fields">
        <TextField form={form} field="price" label="Harga (Rp)" hint={hint} numeric />
        <TextField
          form={form}
          field="stock"
          label="Stok (unit)"
          hint="0 berarti habis"
          numeric
        />
      </div>
    </>
  );
}

function ExtraFields({ form, catalog }) {
  return (
    <>
      <TextField
        form={form}
        field="description"
        label="Deskripsi singkat"
        optional
        hint="Maksimal 100 karakter"
      />
      <TextField form={form} field="tag" label="Label" optional hint="Contoh: Favorit" />
      <ImagePresetPicker form={form} presets={catalog.imagePresets} />
    </>
  );
}

function FormActions({ saving, onClose }) {
  return (
    <div className="dialog-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={onClose}
        disabled={saving}
      >
        Batal
      </button>
      <button type="submit" className="primary-button" disabled={saving}>
        {saving ? 'Menyimpan…' : 'Simpan produk'}
      </button>
    </div>
  );
}

function ProductForm({ form, product, catalog, onClose }) {
  return (
    <form onSubmit={form.submit} aria-busy={form.saving} noValidate>
      <DialogHeader editing={Boolean(product)} onClose={onClose} disabled={form.saving} />
      <fieldset className="product-form-fields" disabled={form.saving}>
        <MainFields form={form} catalog={catalog} />
        <ExtraFields form={form} catalog={catalog} />
      </fieldset>
      {form.submitError ? (
        <ErrorNotice title="Produk belum tersimpan" error={form.submitError} />
      ) : null}
      <FormActions saving={form.saving} onClose={onClose} />
    </form>
  );
}

// Escape menutup dialog, kecuali saat penyimpanan masih berjalan.
export function ProductFormDialog({ product, catalog, onSaved, onClose }) {
  const form = useProductForm({ product, presets: catalog.imagePresets, onSaved });
  const dialogRef = useModalDialog(true);
  function handleCancel(event) {
    event.preventDefault();
    if (!form.saving) {
      onClose();
    }
  }
  return (
    <dialog
      ref={dialogRef}
      className="form-dialog"
      onCancel={handleCancel}
      aria-labelledby="product-form-title"
    >
      <ProductForm form={form} product={product} catalog={catalog} onClose={onClose} />
    </dialog>
  );
}
