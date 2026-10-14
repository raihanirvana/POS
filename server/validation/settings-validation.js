import { HttpError } from '../lib/http-error.js';
import { assertJsonObject, readText } from './common.js';

// Batas sama dengan CHECK tabel settings (migrasi 001).
const settingsRules = {
  storeName: [60, 'Nama toko wajib diisi, maksimal 60 karakter.'],
  storeAddress: [150, 'Alamat wajib diisi, maksimal 150 karakter.'],
  receiptMessage: [200, 'Pesan struk wajib diisi, maksimal 200 karakter.'],
};

export function parseSettingsPatch(body) {
  assertJsonObject(body, Object.keys(settingsRules), 'Kirim pengaturan dalam JSON.');
  const keys = Object.keys(body);
  if (keys.length === 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Tidak ada perubahan pengaturan.');
  }
  const values = {};
  const errors = {};
  for (const key of keys) {
    const [max, message] = settingsRules[key];
    const result = readText(body[key], 1, max);
    if (result) {
      values[key] = result.value;
    } else {
      errors[key] = message;
    }
  }
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Periksa kembali pengaturan.', errors);
  }
  return values;
}

// Reset menghapus percobaan pengunjung, jadi API meminta konfirmasi eksplisit.
export function parseResetBody(body) {
  assertJsonObject(body, ['confirmation'], 'Kirim konfirmasi reset dalam JSON.');
  if (body.confirmation !== 'reset') {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Konfirmasi reset diperlukan.', {
      confirmation: 'Kirim "reset" untuk mengonfirmasi.',
    });
  }
}
