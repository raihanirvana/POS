# Seduh POS — portfolio fullstack

Demo aplikasi kasir kedai kopi untuk menunjukkan hasil jasa pembuatan web: React + Vite di frontend, Express + SQLite (`node:sqlite`) di backend. Pengunjung masuk sebagai **Kasir** atau **Pemilik** tanpa daftar, lalu mencoba transaksi lengkap di ruang data miliknya sendiri. Semua tiket POS-001 sampai POS-012 selesai; service Render Free POS-013 sudah dibuat, tetapi deploy tertunda karena gangguan Render. Belum ada URL live yang diverifikasi. Lihat [panduan deploy](docs/DEPLOYMENT.md), [daftar tiket](docs/tickets/README.md), [PRD](PRD.md), dan [aturan proyek](AGENTS.md).

## Yang bisa dicoba

- **Masuk demo** sebagai Kasir atau Pemilik. Ganti peran pada ruang demo yang sama dari bagian atas, atau keluar (ruang demo dihapus).
- **Kasir:** menu bergambar, pencarian dan kategori, pesanan dengan jumlah, pelanggan, jenis pesanan, dan diskon. Pembayaran tunai (kembalian) atau QRIS simulasi, lalu struk yang bisa dicetak.
- **Transaksi:** riwayat dengan pencarian, filter tanggal WIB, paginasi, dan buka ulang/cetak struk lama.
- **Dashboard** (pemilik): penjualan hari ini, grafik 7 hari, favorit, stok menipis, dan transaksi terbaru.
- **Produk** (pemilik): tambah, edit, dan hapus menu dengan foto preset; stok langsung terpakai di Kasir.
- **Laporan** (pemilik): periode tanggal, pendapatan setelah diskon (bukan laba), tunai/QRIS, per hari, produk terlaris, dan ekspor CSV.
- **Pengaturan** (pemilik): identitas toko di struk baru, dan reset data contoh.

## Batasan demo

- **Login:** login demo tanpa password; peran hanya membatasi fitur di demo, bukan autentikasi produksi.
- **Pembayaran:** sepenuhnya simulasi. QRIS tidak memakai kode QR atau payment gateway; struk diberi label demo.
- **Ruang demo:** maksimal 12 jam (`DEMO_TTL_MINUTES`). Pesanan yang sedang dibuat hanya ada di memori tab. Pada target Render Free, SQLite sementara: sleep/restart/deploy ulang dapat menghapus sesi dan data lebih awal; pengunjung masuk lagi untuk data contoh baru.
- **Rate limit:** hitungan per IP ada di memori proses dan hilang saat restart. Setiap limiter menyimpan maksimal 10.000 IP; IP baru ditolak sementara saat penuh. Banyak instance memerlukan penyimpanan hitungan bersama.
- **Kapasitas ruang demo:** dihitung dari SQLite. Batas tetap dihitung dari workspace yang tersimpan selama file database masih tersedia; proses yang berbagi database juga berbagi jumlah workspace.
- **Browser:** diverifikasi di Google Chrome (headless, Playwright) pada lebar 360, 768, dan 1280px. Firefox, Safari, dialog cetak sistem, printer fisik, dan pembukaan CSV di Excel belum diuji.
- **Hosting:** `.openai/hosting.json` masih menunjuk prototype statis di Sites. Backend Express **belum dideploy**; konfigurasi Render Free satu service ada di `render.yaml`, tanpa disk berbayar. Server gratis tidur setelah 15 menit tanpa traffic dan butuh waktu untuk aktif lagi.

## Menjalankan

Gunakan Node.js minimal 22.13.0 (`.nvmrc`: 22.20.0). Pada Node 22, `node:sqlite` masih mengeluarkan experimental warning. Dari folder `seduh-pos`:

```sh
npm install
npm run dev          # Vite di http://localhost:5173, API di http://127.0.0.1:3001
```

Untuk mode produksi lokal:

```sh
npm run build
npm start            # React + API pada http://127.0.0.1:3001
```

Migrasi SQLite berjalan otomatis saat API start (`data/seduh.sqlite`, diabaikan Git). `npm run db:migrate` dan `npm run db:seed` aman dijalankan berulang. Prototype HTML lama tetap tersedia di `/prototype/index.html`. Jika port 5173 terpakai, jalankan `WEB_PORT=5174 npm run dev`.

## Konfigurasi

Salin `.env.example` menjadi `.env` bila perlu; semua nilai punya default.

| Variabel | Default | Fungsi |
| --- | --- | --- |
| `HOST` / `PORT` / `WEB_PORT` | `127.0.0.1` / `3001` / `5173` | Alamat API dan dev server; gunakan `HOST=0.0.0.0` saat hosting |
| `DATABASE_PATH` | `./data/seduh.sqlite` | Lokasi file SQLite; gunakan disk persisten jika data harus bertahan. Render Free memakai file sementara |
| `VITE_DEMO_EPHEMERAL_STORAGE` | `false` | `true` saat build untuk menampilkan catatan data sementara di halaman masuk |
| `DEMO_TTL_MINUTES` | `720` | Umur ruang demo dan sesinya |
| `TRUST_PROXY` | `false` | Jumlah hop/alamat reverse proxy HTTPS agar cookie mendapat `Secure`; `true` ditolak |
| `ALLOWED_ORIGINS` | kosong | Origin HTTP(S) tambahan, dipisah koma; tanpa path/kredensial/query/fragment. Dinormalisasi, nilai invalid menggagalkan startup |
| `DEMO_SESSION_LIMIT` | `30` | Maksimal masuk/ganti peran per IP per 10 menit |
| `API_RATE_LIMIT` | `300` | Maksimal request API per IP per menit |
| `DEMO_MAX_WORKSPACES` | `500` | Maksimal ruang demo aktif di server (lebih dari itu → 503) |

## Keamanan demo

- **Data:** workspace dan peran berasal dari sesi server, query SQLite berparameter, dan harga/total/stok dihitung server. Checkout memakai transaksi atomik dan idempotency key.
- **Sesi:** cookie `seduh_session` bersifat HttpOnly + SameSite=Strict (+ Secure di HTTPS), dan database hanya menyimpan hash token.
- **Mutasi:** POST/PATCH/DELETE dengan `Origin` asing atau `Sec-Fetch-Site: cross-site` ditolak 403. Body JSON maksimal 100 KB.
- **Header:** CSP (`script-src 'self'`), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, dan HSTS saat HTTPS.

Detail ada di [API.md](docs/API.md#keamanan-dan-batas).

## Deploy Render Free

Service **seduh-pos** sudah dibuat pada Render Free Singapore dengan ID
`srv-db7vpv8n74is73d81st0`. Login CLI sudah selesai dan Blueprint valid. Saat verifikasi,
Render menjeda deploy Free karena [gangguan builds/deploys](https://status.render.com/incidents/8tsd93r1wbmz).
Belum ada deploy yang berjalan. Dashboard:
[service Seduh POS](https://dashboard.render.com/web/srv-db7vpv8n74is73d81st0).

Setelah gangguan pulih, lanjutkan ke service yang sama:

```sh
RENDER_SERVICE_ID=srv-db7vpv8n74is73d81st0 npm run deploy:render
```

Untuk setup akun/service baru di mesin lain:

```sh
npm run render:login                 # otorisasi di browser, lalu pilih workspace
npm run deploy:render -- --create    # sekali untuk membuat service Free
```

Alternatif: **New → Blueprint**, pilih repo dan terapkan `render.yaml`. Pilih satu cara
pembuatan service. Root Directory kosong: root Git sudah berisi `package.json`.
Panduan lengkap, redeploy, batas data sementara, dan pemeriksaan URL live ada di
[DEPLOYMENT.md](docs/DEPLOYMENT.md). Service telah mendapat alamat
`https://seduh-pos.onrender.com`, tetapi aplikasi di
alamat tersebut belum diverifikasi dan belum siap diklaim sebagai demo live.

## Kualitas

```sh
npm run format
npm run check        # ESLint (maks 25 baris per fungsi, tanpa inline disable) + Prettier + build
```

Tidak ada unit test, sesuai instruksi pemilik proyek. Verifikasi memakai lint, format, build, curl/API, dan browser; langkahnya ada di [panduan verifikasi](docs/VERIFICATION.md), dan bukti per tiket ada di `docs/tickets/`.

GitHub Actions menjalankan check pada push `main` dan pull request; build Render juga
menjalankan check sebelum start. [CI untuk commit persiapan 40c61bb](https://github.com/raihanirvana/POS/actions/runs/38645180637)
sudah selesai sukses.

## Struktur

```text
client/src/
  pages/             Masuk, Kasir, Dashboard, Produk, Transaksi, Laporan, Pengaturan, 403, 404
  components/        shell, dialog, dan komponen per fitur (cashier, products, receipt, …)
  hooks/ cart/ session/   state sesi, keranjang/pembayaran, dan data remote
  lib/               API client, router History API, route, format, aturan form
  assets/menu/       foto menu lokal (sumber di SOURCES.md)
server/
  database/          koneksi, migrasi SQL, transaksi, seed
  middleware/        konteks request, sesi/peran, origin, rate limit, header, error
  repositories/      query SQLite
  services/          aturan bisnis (sesi, produk, checkout, laporan, pengaturan)
  validation/        validasi request
  routes/            endpoint API
scripts/             db:migrate, db:seed, dan deploy Render CLI
docs/                API, DATABASE, VERIFICATION, tiket
dist/                prototype HTML terdahulu
```

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
