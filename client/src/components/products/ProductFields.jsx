import { inputA11y } from '../../lib/form-a11y.js';
import { productFieldId } from '../../hooks/useProductForm.js';
import { FormField } from '../FormField.jsx';

export function TextField({ form, field, label, optional, hint, autoFocus, numeric }) {
  const id = productFieldId(field);
  const error = form.errors[field];
  return (
    <FormField id={id} label={label} optional={optional} hint={hint} error={error}>
      <input
        {...inputA11y(id, error, hint)}
        className="input"
        value={form.values[field]}
        onChange={(event) => form.setField(field, event.target.value)}
        autoFocus={autoFocus}
        inputMode={numeric ? 'numeric' : undefined}
        autoComplete="off"
      />
    </FormField>
  );
}

export function CategoryField({ form, categories }) {
  const id = productFieldId('category');
  const error = form.errors.category;
  return (
    <FormField id={id} label="Kategori" error={error}>
      <select
        {...inputA11y(id, error)}
        className="input"
        value={form.values.category}
        onChange={(event) => form.setField('category', event.target.value)}
      >
        {categories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
    </FormField>
  );
}
