import { navigate } from '../lib/router.js';

function isPlainLeftClick(event) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

// Tautan internal tanpa reload; ctrl/cmd-klik tetap membuka tab baru seperti biasa.
export function Link({ to, onClick, children, ...props }) {
  function handleClick(event) {
    onClick?.(event);
    if (!event.defaultPrevented && isPlainLeftClick(event)) {
      event.preventDefault();
      navigate(to);
    }
  }
  return (
    <a href={to} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
