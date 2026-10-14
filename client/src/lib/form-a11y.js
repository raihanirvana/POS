// Atribut aksesibilitas input: error lebih diutamakan daripada petunjuk.
export function inputA11y(id, error, hint) {
  let describedBy;
  if (error) {
    describedBy = `${id}-error`;
  } else if (hint) {
    describedBy = `${id}-hint`;
  }
  return {
    id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
  };
}
