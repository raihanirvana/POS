export function apiNotFound(_request, response) {
  response.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Endpoint API tidak ditemukan.' },
  });
}

function describeError(error) {
  if (error.type === 'entity.parse.failed') {
    return { status: 400, code: 'INVALID_JSON', message: 'Format JSON tidak valid.' };
  }
  if (error.type === 'entity.too.large') {
    return {
      status: 413,
      code: 'BODY_TOO_LARGE',
      message: 'Ukuran JSON maksimal 100 KB.',
    };
  }
  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'Permintaan belum bisa diproses.',
  };
}

export function errorHandler(error, request, response, _next) {
  const { status, code, message } = describeError(error);
  console.error(`[${request.requestId}] ${error.message}`);
  response.status(status).json({
    error: {
      code,
      message,
      requestId: request.requestId,
    },
  });
}
