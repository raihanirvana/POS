import { apiRequest, invalidResponse } from './api.js';
import { validateSettings } from './settings-form.js';

const settingsFields = ['storeName', 'storeAddress', 'receiptMessage'];

function settingsResponse(payload) {
  const settings = payload?.settings;
  const valid = settingsFields.every(
    (field) => typeof settings?.[field] === 'string' && settings[field].trim().length > 0,
  );
  const timestamp = settings?.updatedAt;
  if (
    !valid ||
    Object.keys(validateSettings(settings)).length > 0 ||
    typeof timestamp !== 'string' ||
    !Number.isFinite(Date.parse(timestamp))
  ) {
    throw invalidResponse();
  }
  return settings;
}

export async function getSettings(signal) {
  return settingsResponse(await apiRequest('/settings', { signal }));
}

export async function updateSettings(changes) {
  return settingsResponse(
    await apiRequest('/settings', { method: 'PATCH', body: changes }),
  );
}

export async function resetDemo() {
  const payload = await apiRequest('/demo/reset', {
    method: 'POST',
    body: { confirmation: 'reset' },
  });
  if (
    payload?.reset !== true ||
    !Number.isSafeInteger(payload.products) ||
    payload.products <= 0 ||
    !Number.isSafeInteger(payload.transactions) ||
    payload.transactions < 0
  ) {
    throw invalidResponse();
  }
  return payload;
}
