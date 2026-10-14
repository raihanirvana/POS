function FieldMessage({ id, error, hint }) {
  if (error) {
    return (
      <small id={`${id}-error`} className="field-error">
        {error}
      </small>
    );
  }
  return hint ? (
    <small id={`${id}-hint`} className="field-hint">
      {hint}
    </small>
  ) : null;
}

export function FormField({ id, label, optional, hint, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional ? <span className="optional"> (opsional)</span> : null}
      </label>
      {children}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}
