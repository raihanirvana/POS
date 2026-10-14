import { Icon } from '../components/Icon.jsx';

export function RoleOption({ option, pendingRole, onChoose }) {
  const pending = pendingRole === option.role;
  return (
    <button
      type="button"
      className="role-option"
      onClick={() => onChoose(option.role)}
      disabled={pendingRole !== null}
      aria-busy={pending}
    >
      <span className="role-icon">
        <Icon name={option.icon} size={22} />
      </span>
      <span className="role-copy">
        <strong>
          {pending ? 'Menyiapkan ruang demo…' : `Masuk sebagai ${option.title}`}
        </strong>
        <span>{option.description}</span>
        <small>{option.pages}</small>
      </span>
      <Icon name="arrow" />
    </button>
  );
}
