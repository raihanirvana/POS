# Verifikasi tanpa unit test

## Setiap tiket implementasi

1. Baca kriteria penerimaan di tiket.
2. Jalankan `npm run format`, lalu `npm run check`.
3. Jalankan aplikasi dan periksa API/browser untuk fitur yang berubah.
4. Catat perintah, hasil, browser/viewport, dan keterbatasan di bagian Bukti selesai.
5. Tandai tiket selesai hanya setelah seluruh kriterianya tercapai.

## Fondasi — POS-001

```sh
npm run dev
curl -i http://127.0.0.1:3001/api/health
curl -i http://127.0.0.1:3001/api/tidak-ada
```

Harapan: health 200 dengan `database: connected`, endpoint tak tersedia 404 JSON. http://localhost:5173 menampilkan koneksi backend; `/prototype/index.html` membuka demo HTML.

Sesudah mematikan development server:

```sh
npm run build
npm start
```

Buka http://127.0.0.1:3001. Build React, health API, dan prototype harus tersedia melalui server Express yang sama. Restart API dan pastikan lokasi database tetap sama.

Aturan fungsi 25 baris dapat diperiksa dengan ESLint stdin menggunakan kode sementara; jangan menambahkan unit test atau fixture pelanggaran ke source aplikasi.

## Database — POS-002

Gunakan database sementara agar data pengembangan tidak tersentuh:

```sh
export DATABASE_PATH=/tmp/seduh-verify.sqlite
npm run db:migrate   # "Diterapkan: 001_initial_schema"
npm run db:migrate   # "Skema sudah terbaru (versi 1)."
npm run db:seed      # "Seed workspace contoh-seduh: 9 produk, N transaksi."
npm run db:seed      # "... seed dilewati."
```

Bandingkan hash `sqlite_master` sebelum dan sesudah migrasi kedua. Coba UPDATE/INSERT invalid lewat `node:sqlite` (harga < 1.000, stok negatif, diskon > 100, total/kembalian salah, tanggal bukan ISO, idempotency key ganda, produk workspace lain); semuanya harus ditolak. Jalankan API dengan `DATABASE_PATH` yang sama, hentikan, jalankan lagi, lalu pastikan jumlah data tidak berubah.

## Sesi demo — POS-003

Jalankan API pada database sementara, lalu gunakan dua cookie jar:

```sh
curl -i http://127.0.0.1:3001/api/session                       # 401 UNAUTHENTICATED
curl -c a.txt -X POST -H 'content-type: application/json' \
  -d '{"role":"owner"}' http://127.0.0.1:3001/api/demo/sessions  # 201, Set-Cookie HttpOnly
curl -c b.txt -X POST -H 'content-type: application/json' \
  -d '{"role":"cashier"}' http://127.0.0.1:3001/api/demo/sessions
curl -b a.txt http://127.0.0.1:3001/api/session                  # owner
curl -b b.txt http://127.0.0.1:3001/api/session                  # cashier
curl -b a.txt -c a.txt -X DELETE http://127.0.0.1:3001/api/session  # 204
```

Periksa di SQLite bahwa kedua jar memakai workspace berbeda dan `token_hash` tidak sama dengan isi cookie. Coba body dengan `workspaceId`, peran asing, cookie lama setelah logout/ganti peran, dan sesi kedaluwarsa (`DEMO_TTL_MINUTES=1`). Sebelum POS-004 belum ada endpoint pemilik, jadi uji 403 memakai harness sementara di luar repo yang memasang `requireSession` + `requireRole('owner')` asli. Setelah POS-004, ulangi dengan `POST /api/products` memakai sesi kasir.

## Checklist fitur untuk POS-012

Belum dijalankan untuk fullstack; isi setelah tiket terkait selesai.

- [ ] Dua pengunjung memiliki ruang data berbeda; logout dan sesi expired ditolak.
- [ ] Kasir tidak bisa memakai API pengelolaan pemilik.
- [ ] CRUD produk tetap tersimpan setelah restart server.
- [ ] Checkout contoh Rp80.000, diskon 10%, uang Rp100.000: total Rp72.000, kembalian Rp28.000.
- [ ] Uang kurang, qty negatif/pecahan, stok kurang, harga manipulasi, dan workspace asing ditolak.
- [ ] Checkout bersamaan untuk stok terakhir tidak menyebabkan stok negatif.
- [ ] Retry checkout dengan key sama tidak menambah transaksi atau mengurangi stok lagi.
- [ ] Snapshot struk tidak berubah setelah harga atau identitas toko diedit.
- [ ] Dashboard, laporan, rentang tanggal Jakarta, dan CSV sesuai data server.
- [ ] Reset hanya menghapus data ruang demo yang dipilih.
- [ ] API/network error mempunyai pesan dan jalur retry yang jelas.
- [ ] Seluruh halaman tidak melebar pada mobile, tablet, dan desktop.
- [ ] Dialog/keyboard/focus, reduced motion, print preview, dan input markup diperiksa.
- [ ] Hosting yang benar-benar dipakai dicatat; backend tidak diklaim live sebelum verifikasi.
