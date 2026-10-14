import { useState } from 'react';
import {
  changedFields,
  emptyProductValues,
  imageForCategory,
  productFields,
  productToValues,
  toProductPayload,
  validateProduct,
} from '../lib/product-form.js';
import { createProduct, updateProduct } from '../lib/products-api.js';

export function productFieldId(key) {
  return `product-${key}`;
}

async function saveProduct(product, payload) {
  if (!product) {
    return createProduct(payload);
  }
  const changes = changedFields(payload, product);
  return Object.keys(changes).length > 0 ? updateProduct(product.id, changes) : product;
}

// Error per field dari server ditampilkan di field-nya; error lain di atas tombol simpan.
function splitServerError(error) {
  const fields = error.code === 'VALIDATION_ERROR' && error.fields ? error.fields : {};
  const known = Object.entries(fields).filter(
    ([key, message]) =>
      productFields.includes(key) && typeof message === 'string' && message.trim(),
  );
  const fieldErrors = Object.fromEntries(known);
  const general =
    known.length > 0 && known.length === Object.keys(fields).length ? null : error;
  return { fieldErrors, general };
}

function focusFirstInvalid(errors) {
  const first = productFields.find((key) => errors[key]);
  requestAnimationFrame(() => document.getElementById(productFieldId(first))?.focus());
}

function useFormValues(product, presets) {
  const [values, setValues] = useState(() =>
    product ? productToValues(product) : emptyProductValues(),
  );
  const [errors, setErrors] = useState({});
  function setField(key, value) {
    setValues((previous) =>
      key === 'category'
        ? {
            ...previous,
            category: value,
            imageKey: imageForCategory(value, previous.imageKey, presets),
          }
        : { ...previous, [key]: value },
    );
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }
  return { values, errors, setErrors, setField };
}

function showServerError(error, context) {
  const { fieldErrors, general } = splitServerError(error);
  context.form.setErrors(fieldErrors);
  context.setSubmitError(general);
  context.setSaving(false);
  focusFirstInvalid(fieldErrors);
}

async function submitProduct(context, event) {
  event.preventDefault();
  const { form, presets, saving, product, onSaved } = context;
  if (saving) {
    return;
  }
  const found = validateProduct(form.values, presets);
  form.setErrors(found);
  if (Object.keys(found).length > 0) {
    focusFirstInvalid(found);
    return;
  }
  context.setSaving(true);
  context.setSubmitError(null);
  try {
    onSaved(await saveProduct(product, toProductPayload(form.values)));
  } catch (error) {
    showServerError(error, context);
  }
}

export function useProductForm({ product, presets, onSaved }) {
  const form = useFormValues(product, presets);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const context = { form, product, presets, onSaved, saving, setSaving, setSubmitError };
  return {
    ...form,
    saving,
    submitError,
    submit: (event) => submitProduct(context, event),
  };
}
