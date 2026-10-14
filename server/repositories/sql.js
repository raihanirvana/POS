// Pola LIKE dengan %, _, dan \ diperlakukan sebagai teks; dipakai bersama ESCAPE '\'.
export function likePattern(search) {
  return search ? `%${search.replace(/[\\%_]/g, (match) => `\\${match}`)}%` : null;
}
