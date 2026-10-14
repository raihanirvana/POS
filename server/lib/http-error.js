// Error yang aman ditampilkan ke browser: status, kode, dan pesan sudah ditentukan.
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}
