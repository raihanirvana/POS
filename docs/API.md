# API Seduh POS

API JSON satu origin dengan React. Prefix `/api`. Saat ini **hanya healthcheck yang diimplementasikan**; endpoint di bawah merupakan kontrak untuk tiket berikutnya.

## Endpoint aktif — POS-001

`GET /api/health` memeriksa SQLite dengan query `SELECT 1` sebelum mengirim HTTP 200:

```json
{
  "status": "ok",
  "service": "seduh-pos-api",
  "database": "connected",
  "timestamp": "2026-10-14T00:00:00.000Z"
}
```

Waktu di atas hanya contoh format ISO UTC. Waktu UI bisnis menggunakan Asia/Jakarta pada tiket fitur laporan.

Respons mempunyai `X-Request-Id`. Endpoint API yang tidak ditemukan mengembalikan HTTP 404:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Endpoint API tidak ditemukan."
  }
}
```

Payload JSON tidak valid mendapat 400. Ukuran JSON dibatasi 100 KB; payload lebih besar mendapat 413 dengan kode BODY_TOO_LARGE. Error internal tidak membocorkan stack atau lokasi database ke browser. Aturan validasi fitur/otorisasi mengikuti tiket terkait.

## Kontrak yang direncanakan

| Metode | Path | Akses | Tiket |
| --- | --- | --- | --- |
| POST | /api/demo/sessions | Publik, membuat ruang demo baru | POS-003 |
| GET | /api/session | Sesi demo | POS-003 |
| DELETE | /api/session | Sesi demo | POS-003 |
| GET | /api/products | Kasir/pemilik | POS-004 |
| POST | /api/products | Pemilik | POS-004 |
| PATCH | /api/products/:id | Pemilik | POS-004 |
| DELETE | /api/products/:id | Pemilik | POS-004 |
| POST | /api/transactions | Kasir/pemilik | POS-005 |
| GET | /api/transactions | Kasir/pemilik | POS-005 |
| GET | /api/transactions/:id | Kasir/pemilik | POS-005 |
| GET | /api/dashboard | Pemilik | POS-010 |
| GET | /api/reports | Pemilik | POS-010 |
| GET | /api/reports/export | Pemilik | POS-010 |
| GET | /api/settings | Kasir/pemilik | POS-011 |
| PATCH | /api/settings | Pemilik | POS-011 |
| POST | /api/demo/reset | Pemilik | POS-011 |

Workspace dan peran berasal dari sesi server. Pengunjung tidak bisa memilih workspace orang lain melalui query/payload. Semua uang berupa integer rupiah. Pembayaran tetap simulasi. Backend menghitung harga/diskon/total/kembalian dan mengubah stok atomik.

Detail payload dan response fitur ditambahkan bersama implementasi tiket masing-masing agar dokumentasi tidak mendahului perilaku aktual.
