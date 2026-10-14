# Seduh POS — portfolio fullstack

Pengembangan React + Vite, Express, dan SQLite dilakukan per tiket. **POS-001 sampai POS-007 sudah selesai**: fondasi proyek; skema database, migrasi, dan seed; sesi demo pemilik/kasir dengan ruang data per pengunjung; API produk dan stok; API checkout dan transaksi atomik; shell React dengan halaman masuk demo; serta halaman Produk untuk pemilik (daftar, cari, filter, tambah, edit, hapus). Halaman Kasir, Transaksi, Dashboard, Laporan, dan Pengaturan masih ditandai "Belum tersedia" sampai tiketnya selesai. Lihat [daftar tiket](docs/tickets/README.md) dan [aturan proyek](AGENTS.md).

## Menjalankan fullstack

Gunakan Node.js minimal 22.13.0. `.nvmrc` memilih 22.20.0. SQLite memakai modul `node:sqlite` bawaan Node sehingga tidak perlu memasang database server. Pada Node 22 modul ini masih mengeluarkan experimental warning.

Dari folder `seduh-pos`:

```sh
npm install
npm run dev
```

Buka http://localhost:5173. API berjalan di http://127.0.0.1:3001; frontend meneruskan `/api` melalui proxy Vite. Tanpa sesi, aplikasi membuka `/masuk` untuk memilih peran demo **Kasir** atau **Pemilik**. Setelah masuk, menu mengikuti peran, refresh tetap masuk, dan tombol di bagian atas dipakai untuk ganti peran atau keluar. Demo desain sebelumnya ada di http://localhost:5173/prototype/index.html.

Jika port frontend 5173 sudah digunakan proyek lain, atur `WEB_PORT=5174` pada `.env` atau jalankan `WEB_PORT=5174 npm run dev`. Port API dapat diubah lewat `PORT`. Server tidak mengambil alih proses lain.

Konfigurasi opsional: salin `.env.example` menjadi `.env`. Default tetap dapat berjalan tanpa `.env`. Untuk hosting, gunakan `HOST=0.0.0.0` dan `PORT` yang ditentukan penyedia. Jika HOST adalah `0.0.0.0` atau `::`, target proxy pengembangan tetap memakai loopback.

`DEMO_TTL_MINUTES` mengatur umur ruang demo dan sesinya (default 720 menit). `TRUST_PROXY` dibiarkan `false` saat lokal; isi jumlah hop atau alamat reverse proxy HTTPS saat hosting agar cookie sesi mendapat atribut `Secure`. Nilai `true` ditolak karena memercayai semua proxy.

## Kualitas dan build

```sh
npm run format
npm run check
npm run build
npm start
```

Setelah build, `npm start` menyajikan frontend React dan API pada http://127.0.0.1:3001. Output React ada di `client/dist/`. SQLite dibuat di `data/seduh.sqlite` secara otomatis dan migrasi dijalankan saat API start. Runtime data tidak masuk Git.

Database dapat disiapkan manual dengan `npm run db:migrate` dan diisi workspace contoh dengan `npm run db:seed`. Keduanya aman dijalankan berulang. Detail skema ada di [DATABASE.md](docs/DATABASE.md).

ESLint menetapkan maksimum **25 baris per fungsi**, termasuk komentar, baris kosong, callback, IIFE, dan JSX. Inline disable dilarang. Prettier menjaga format dan lebar kode; kode tidak boleh dipadatkan untuk mengakali batas. Pemeriksaan diterapkan pada kode fullstack aktif; prototype dan build output dikecualikan.

Tidak ada unit test. Verifikasi memakai lint, format, build, curl/API, dan browser/manual. Detail ada di [panduan verifikasi](docs/VERIFICATION.md).

## Struktur fullstack

```text
client/
  src/components/    shell, navigasi, dialog, dan komponen kecil lain
  src/pages/         halaman masuk, Produk, placeholder fitur, 403, dan 404
  src/components/products/  tabel, form, dan dialog produk
  src/assets/menu/   foto menu preset lokal (sumber di SOURCES.md)
  src/hooks/         state sesi, aksi akun, daftar produk, dan form
  src/session/       context sesi
  src/lib/           API client, router History API, daftar route, format, ikon, aturan form produk
  dist/              hasil build (diabaikan Git)
server/
  database/          koneksi, migrasi SQL, transaksi, dan seed
  lib/               waktu Asia/Jakarta, rupiah, katalog produk, cookie sesi, HttpError
  middleware/        konteks request, sesi/peran, dan error
  repositories/      query SQLite per tabel
  services/          aturan bisnis (sesi demo, produk, checkout/transaksi)
  validation/        validasi body request
  routes/            endpoint API
scripts/             perintah db:migrate dan db:seed
docs/
  tickets/           backlog, kriteria selesai, bukti verifikasi
data/                database lokal (diabaikan Git)
dist/                prototype HTML terdahulu
```

Kontrak dan status endpoint ada di [API.md](docs/API.md). `.openai/hosting.json` masih menunjuk prototype statis di Sites. Backend Express belum dideploy ke link tersebut; hosting Node.js dengan disk persisten ditangani pada POS-013.

---

## Prototype HTML

Demo portfolio POS kedai kopi dengan HTML, CSS, dan JavaScript biasa. Gunakan [PRD.md](PRD.md) untuk membaca persyaratan produk, atau buka halaman Panduan & PRD dari aplikasi.

### Menjalankan prototype

Buka `dist/index.html` langsung di browser, atau jalankan dari folder ini:

```sh
python3 -m http.server 8080 --directory dist
```

Lalu buka http://localhost:8080. Tidak ada proses build atau instalasi dependency aplikasi.

### Yang bisa dicoba pada prototype

Kasir, pencarian/kategori, keranjang, diskon, pembayaran simulasi tunai/QRIS, cetak struk, dashboard, produk CRUD, riwayat transaksi, laporan dengan filter dan CSV, pengaturan toko, serta reset demo.

Data tersimpan di localStorage browser dan tidak tersinkronisasi. Pembayaran adalah simulasi. Peran belum dibatasi. Gunakan satu tab; ini contoh portfolio, belum sistem operasional produksi.

### Struktur prototype

- `dist/index.html`: kerangka antarmuka.
- `dist/styles.css`: desain responsif.
- `dist/app.js`: logika aplikasi dan persistensi.
- `dist/prd.html`: PRD yang bisa dibaca di browser.
- `dist/assets/`: foto menu lokal dari Unsplash.
- `PRD.md`: persyaratan produk.
- `DESIGN.md`: keputusan desain menggunakan frontend-design.

Font Plus Jakarta Sans dimuat dari Google Fonts; tanpa jaringan aplikasi memakai font sistem. Foto menu bersifat ilustrasi dan tidak mewakili foto produk bisnis tertentu. Tidak ada nomor WhatsApp fiktif atau payment gateway aktif.

### Verifikasi prototype

Diuji pada Google Chrome melalui Playwright: pencarian/kategori, batas stok, diskon 10%, tunai kurang, kembalian, pembayaran QRIS simulasi, struk, persistensi, produk CRUD, riwayat/filter, CSV, pengaturan/reset, escaping masukan, snapshot harga transaksi, serta kegagalan penyimpanan yang tidak mengubah transaksi atau stok. Keenam halaman diperiksa pada lebar 360, 390, 768, dan 1024px; tampilan desktop diperiksa pada 1440px. Checkout ponsel dan PRD web juga dicoba.

Cetak memakai dialog cetak browser; integrasi printer fisik belum diuji. Firefox dan Safari belum diuji. Screenshot contoh ada di folder `screenshots/`.
