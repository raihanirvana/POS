export function ErrorNotice({ title = 'Belum berhasil', error, onRetry, retryLabel }) {
  return (
    <div className="error-notice" role="alert">
      <strong>{title}</strong>
      <p>{error.message}</p>
      {error.requestId ? <small>Kode permintaan: {error.requestId}</small> : null}
      {onRetry ? (
        <button type="button" className="secondary-button" onClick={onRetry}>
          {retryLabel ?? 'Coba lagi'}
        </button>
      ) : null}
    </div>
  );
}
