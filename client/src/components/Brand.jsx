export function Brand({ compact = false }) {
  return (
    <span className={compact ? 'brand brand--compact' : 'brand'}>
      <span className="brand-mark" aria-hidden="true">
        s<span>•</span>
      </span>
      <span className="brand-text">
        seduh<small>Point of sale</small>
      </span>
    </span>
  );
}
