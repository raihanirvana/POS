// Error yang aman ditampilkan ke browser: status, kode, dan pesan sudah ditentukan.
// `fields` opsional berisi pesan per field untuk form.
export class HttpError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
