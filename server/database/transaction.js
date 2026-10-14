// Menjalankan pekerjaan sinkron dalam satu transaksi SQLite. BEGIN IMMEDIATE
// mengambil kunci tulis di awal agar proses lain tidak menyela di tengah jalan.
export function withTransaction(database, work) {
  database.exec('BEGIN IMMEDIATE');
  try {
    const result = work();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    // isTransaction belum ada sebelum Node 22.16; saat itu ROLLBACK tetap dicoba.
    if (database.isTransaction !== false) {
      database.exec('ROLLBACK');
    }
    throw error;
  }
}
