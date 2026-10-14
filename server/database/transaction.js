// Menjalankan pekerjaan sinkron dalam satu transaksi SQLite.
function runTransaction(database, begin, work) {
  database.exec(begin);
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

// Kunci tulis diambil di awal agar proses lain tidak menyela mutasi.
export function withTransaction(database, work) {
  return runTransaction(database, 'BEGIN IMMEDIATE', work);
}

// BEGIN deferred menjaga snapshot pembacaan tanpa mengambil kunci tulis.
export function withReadTransaction(database, work) {
  return runTransaction(database, 'BEGIN', work);
}
