import { productFieldId } from '../../hooks/useProductForm.js';
import { menuImage } from '../../lib/menu-images.js';

function PresetOption({ preset, form, first }) {
  const checked = form.values.imageKey === preset.key;
  return (
    <label className={checked ? 'preset-option selected' : 'preset-option'}>
      <input
        type="radio"
        name="imageKey"
        id={first ? productFieldId('imageKey') : undefined}
        value={preset.key}
        checked={checked}
        onChange={() => form.setField('imageKey', preset.key)}
      />
      <img src={menuImage(preset.key)} alt="" width="64" height="64" />
      <span>{preset.label}</span>
    </label>
  );
}

function PresetError({ error }) {
  return error ? (
    <small id="product-image-error" className="field-error">
      {error}
    </small>
  ) : null;
}

// Foto hanya dari preset lokal yang sesuai kategori terpilih.
export function ImagePresetPicker({ form, presets }) {
  const options = presets.filter((preset) => preset.category === form.values.category);
  const error = form.errors.imageKey;
  return (
    <fieldset
      className="preset-picker"
      aria-describedby={error ? 'product-image-error' : undefined}
    >
      <legend>Foto menu</legend>
      <div className="preset-options">
        {options.map((preset, index) => (
          <PresetOption
            key={preset.key}
            preset={preset}
            form={form}
            first={index === 0}
          />
        ))}
      </div>
      <PresetError error={error} />
    </fieldset>
  );
}
