import { HttpError } from '../lib/http-error.js';

const bodyErrors = {
  'entity.parse.failed': {
    status: 400,
    code: 'INVALID_JSON',
    message: 'Format JSON tidak valid.',
  },
  'entity.too.large': {
    status: 413,
    code: 'BODY_TOO_LARGE',
    message: 'Ukuran JSON maksimal 100 KB.',
  },
  'charset.unsupported': {
    status: 415,
    code: 'UNSUPPORTED_MEDIA_TYPE',
    message: 'Gunakan charset UTF-8 untuk JSON.',
  },
  'encoding.unsupported': {
    status: 415,
    code: 'UNSUPPORTED_MEDIA_TYPE',
    message: 'Encoding permintaan tidak didukung.',
  },
};

export function apiNotFound(_request, response) {
  response.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Endpoint API tidak ditemukan.' },
  });
}

function describeError(error) {
  if (error instanceof HttpError) {
    return { status: error.status, code: error.code, message: error.message };
  }
  return (
    bodyErrors[error.type] ?? {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Permintaan belum bisa diproses.',
    }
  );
}

export function errorHandler(error, request, response, _next) {
  const { status, code, message } = describeError(error);
  if (status >= 500) {
    console.error(`[${request.requestId}] ${error.message}`);
  }
  response.status(status).json({
    error: {
      code,
      message,
      requestId: request.requestId,
    },
  });
}
