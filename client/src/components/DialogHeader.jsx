import { Icon } from './Icon.jsx';

function CloseButton({ onClose, disabled, label }) {
  return (
    <button
      type="button"
      className="icon-button"
      onClick={onClose}
      disabled={disabled}
      aria-label={label}
    >
      <Icon name="close" />
    </button>
  );
}

export function DialogHeader({
  titleId,
  title,
  subtitle,
  onClose,
  disabled,
  closeLabel,
}) {
  return (
    <div className="dialog-header">
      <div>
        <h2 id={titleId}>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <CloseButton onClose={onClose} disabled={disabled} label={closeLabel} />
    </div>
  );
}
