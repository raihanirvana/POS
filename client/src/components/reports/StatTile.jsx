import { Icon } from '../Icon.jsx';

export function StatTile({ icon, label, value, note }) {
  return (
    <div className="stat-tile">
      <span className="stat-icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {note ? <span className="stat-note">{note}</span> : null}
    </div>
  );
}
