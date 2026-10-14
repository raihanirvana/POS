// Sel yang diawali = + - @ atau tab/CR bisa dieksekusi sebagai formula oleh spreadsheet;
// diberi awalan kutip tunggal. Semua sel dikutip dan tanda kutip digandakan.
const formulaStart = /^[=+\-@\t\r]/;

export function csvCell(value) {
  const text = String(value ?? '');
  const safe = formulaStart.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

// BOM agar Excel membaca UTF-8; baris dipisah CRLF sesuai RFC 4180.
const byteOrderMark = String.fromCharCode(0xfeff);

export function toCsv(rows) {
  return `${byteOrderMark}${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
