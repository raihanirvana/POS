import { useRef, useState } from 'react';
import {
  changedSettings,
  settingsLimits,
  validateSettings,
} from '../lib/settings-form.js';
import { updateSettings } from '../lib/settings-api.js';

const fieldKeys = Object.keys(settingsLimits);

function focusFirst(errors) {
  const first = fieldKeys.find((key) => errors[key]);
  document.getElementById(`settings-${first}`)?.focus();
}

function splitServerError(error) {
  const fields = error.code === 'VALIDATION_ERROR' && error.fields ? error.fields : {};
  const known = Object.entries(fields).filter(
    ([key, message]) => fieldKeys.includes(key) && typeof message === 'string',
  );
  return {
    fieldErrors: Object.fromEntries(known),
    general: known.length > 0 ? null : error,
  };
}

function useSettingsValues(saved) {
  const [values, setValues] = useState(() => ({ ...saved }));
  const [errors, setErrors] = useState({});
  function setField(key, value) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }
  return { values, errors, setErrors, setField };
}

async function saveChanges(changes, form, onSaved) {
  try {
    onSaved(await updateSettings(changes), true);
    return null;
  } catch (error) {
    const { fieldErrors, general } = splitServerError(error);
    form.setErrors(fieldErrors);
    requestAnimationFrame(() => focusFirst(fieldErrors));
    return general;
  }
}

function useSaving(onSaving) {
  const [saving, setSaving] = useState(false);
  const current = useRef(false);
  function setBusy(value) {
    current.current = value;
    setSaving(value);
    onSaving(value);
  }
  return { saving, current, setBusy };
}

async function submitSettings(event, form, context) {
  event.preventDefault();
  const { saved, onSaved, disabled, busy, setSubmitError } = context;
  if (disabled || busy.current.current) {
    return;
  }
  const found = validateSettings(form.values);
  form.setErrors(found);
  const changes = changedSettings(form.values, saved);
  if (Object.keys(found).length > 0) {
    focusFirst(found);
  } else if (Object.keys(changes).length === 0) {
    onSaved(saved, false);
  } else {
    busy.setBusy(true);
    setSubmitError(null);
    setSubmitError(await saveChanges(changes, form, onSaved));
    busy.setBusy(false);
  }
}

// Tanpa perubahan tidak ada request; perubahan dan reset tidak boleh bertabrakan.
export function useSettingsForm({ saved, onSaved, disabled, onSaving }) {
  const form = useSettingsValues(saved);
  const busy = useSaving(onSaving);
  const [submitError, setSubmitError] = useState(null);
  const context = { saved, onSaved, disabled, busy, setSubmitError };
  return {
    ...form,
    saving: busy.saving,
    submitError,
    submit: (event) => submitSettings(event, form, context),
  };
}
