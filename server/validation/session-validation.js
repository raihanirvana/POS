import { HttpError } from '../lib/http-error.js';
import { demoRoles } from '../services/demo-session-service.js';
import { isPlainObject } from './common.js';

// Hanya peran yang diterima. Workspace selalu ditentukan server, tidak dari payload.
export function parseDemoSessionBody(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Kirim JSON berisi peran demo.');
  }
  if (Object.keys(body).some((key) => key !== 'role')) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Hanya field role yang diterima.');
  }
  if (typeof body.role !== 'string' || !Object.hasOwn(demoRoles, body.role)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Peran harus owner atau cashier.');
  }
  return { role: body.role };
}
