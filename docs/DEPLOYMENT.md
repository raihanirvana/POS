# Deploy demo Seduh POS ke Render Free

Target yang dipilih pemilik: satu Web Service **Free**, React + Express pada origin yang
sama, SQLite sementara. Service sudah dibuat; deploy belum berjalan karena gangguan
Render Free. Belum ada URL publik yang diverifikasi. Hosting Sites prototype
tetap terpisah dan `.openai/hosting.json` tidak berubah.

## Service yang sudah dibuat

- ID: `srv-db7vpv8n74is73d81st0`, nama `seduh-pos`, plan Free, region Singapore.
- [Dashboard](https://dashboard.render.com/web/srv-db7vpv8n74is73d81st0).
- Alamat yang diberikan Render: `https://seduh-pos.onrender.com` (belum demo live).
- Login CLI selesai; workspace disetel dan Blueprint `valid: true`.
- Build/start, Node 22.20.0, HOST, TRUST_PROXY, DATABASE_PATH, dan catatan halaman masuk
  diperiksa pada konfigurasi service melalui API Render.
- Pembuatan service dan percobaan deploy mengembalikan 503 `deploys is currently
  unavailable`; daftar deploy kosong. Render sedang
  [menjeda deploy Free](https://status.render.com/incidents/8tsd93r1wbmz).

Setelah gangguan pulih, gunakan service ini; jangan jalankan `--create` lagi:

```sh
RENDER_SERVICE_ID=srv-db7vpv8n74is73d81st0 npm run deploy:render
```

## Yang perlu disiapkan

1. Buat akun di [Render](https://dashboard.render.com/), bisa memakai GitHub.
2. Hubungkan GitHub dari Account Settings → Git Deployment Credentials. Berikan akses ke
   `raihanirvana/POS`, terutama bila repo private.
3. Untuk deploy dari terminal, install [Render CLI](https://render.com/docs/cli).
   Mesin pengembangan ini sudah memiliki CLI v2.29.0 di `~/.local/bin/render`.

Login browser menyimpan token di konfigurasi CLI di luar repo. Tidak perlu menempelkan
API key di chat atau menambahkannya ke source code.

## Deploy melalui script

Dari root Git repo (folder lokal `seduh-pos`):

```sh
npm run render:login
```

Browser terbuka: masuk ke akun Render, pilih **Authorize CLI**, kembali ke terminal dan
pilih workspace. Akun itu perlu memiliki akses ke repo GitHub.

Untuk membuat service pertama, setelah perubahan konfigurasi dipush ke `main`:

```sh
npm run deploy:render -- --create
```

Script membuat Web Service paket **Free**, region Singapore, branch `main`, dan langsung
memulai build. Tidak membuat database terpisah atau disk berbayar. Perintah `--create`
khusus pembuatan service; jangan diulang untuk redeploy karena akan mencoba membuat
service tambahan. Jika nama sudah terpakai, tentukan nama lain:

```sh
RENDER_SERVICE_NAME=seduh-pos-raihan npm run deploy:render -- --create
```

Jika `--create` gagal, periksa `render services --output json` dahulu: service bisa
sudah dibuat walaupun deploy pertama gagal. Pakai ID yang ada untuk redeploy.

Simpan ID `srv-...` dari respons. Pantau deploy di dashboard atau CLI:

```sh
~/.local/bin/render deploys list srv-ID_SERVICE --output json
```

Setelah service dibuat, push ke `main` akan memicu auto-deploy bila akses GitHub sudah
terhubung. Untuk redeploy manual dan menunggu sampai selesai:

```sh
RENDER_SERVICE_ID=srv-ID_SERVICE npm run deploy:render
```

`RENDER_SERVICE_ID` bukan rahasia. Untuk mesin yang lokasi CLI-nya berbeda, gunakan
`RENDER_CLI=/path/to/render` saat menjalankan script. Script tidak menampilkan token.

## Alternatif lewat dashboard

Pakai **New → Blueprint**, pilih repo POS dan branch `main`, lalu terapkan `render.yaml`.
Pilih salah satu cara pembuatan service (script atau Blueprint) agar tidak membuat dua
service. Perubahan YAML hanya otomatis diterapkan bila service dikelola sebagai Blueprint;
service yang dibuat lewat CLI mengelola konfigurasi langsung melalui CLI/dashboard.

Jika membuat **New → Web Service** secara manual, gunakan konfigurasi berikut:

| Pengaturan | Nilai |
| --- | --- |
| Repository / branch | `raihanirvana/POS` / `main` |
| Root Directory | Kosong; root Git sudah berisi `package.json` |
| Runtime / region / plan | Node / Singapore / **Free** |
| Build Command | `npm ci --include=dev && npm run check` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| `NODE_VERSION` | `22.20.0` |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `TRUST_PROXY` | `1` (proxy Render; perlu verifikasi pada URL live) |
| `DATABASE_PATH` | `./data/seduh.sqlite` |
| `VITE_DEMO_EPHEMERAL_STORAGE` | `true` |

Jangan set `PORT`: server membaca port yang disediakan Render. `ALLOWED_ORIGINS` tetap
kosong untuk satu origin; bukan wildcard. Tidak perlu seed manual: migrasi otomatis saat
start, data contoh dibuat ketika pengunjung masuk. Dependency dev sengaja disertakan
saat build karena Vite, ESLint, dan Prettier diperlukan meski `NODE_ENV=production`.

## Batas yang disepakati untuk paket Free

- Server tidur setelah 15 menit tanpa traffic; bangun kembali bisa sekitar satu menit.
- File SQLite tidak persisten. Sleep, restart, dan deploy ulang dapat menghapus seluruh
  ruang demo, sesi, produk, pengaturan, dan transaksi percobaan. Masuk kembali membuat
  data contoh baru. Batas 12 jam adalah batas maksimum sesi, bukan jaminan data bertahan.
- Catatan data sementara muncul di halaman masuk untuk build Render Free. Variabel
  `VITE_DEMO_EPHEMERAL_STORAGE` dibaca saat build; perubahan memerlukan build ulang.
- Tidak ada backup/restore yang dijanjikan untuk hosting Free ini. Persistensi dan backup
  memerlukan disk berbayar atau migrasi database, di luar keputusan hosting saat ini.
- Paket gratis memiliki kuota bandwidth/build; periksa usage di dashboard. Jangan
  menambahkan disk atau meningkatkan compute plan bila ingin tetap memakai layanan gratis.

Rujukan: [Render Free](https://render.com/docs/free),
[Blueprint spec](https://render.com/docs/blueprint-spec),
[CLI](https://render.com/docs/cli), dan [versi Node](https://render.com/docs/node-version).

## Verifikasi setelah deploy

1. Ambil URL dari Render Dashboard. Jangan menebak subdomain dari nama service.
2. Buka `/api/health` → 200, SQLite connected; `/masuk` dan setiap route React langsung
   harus memuat aplikasi. Gambar lokal dan `/prototype/index.html` harus tersedia.
3. Masuk sebagai pemilik: cookie `seduh_session` harus `Secure`, `HttpOnly`,
   `SameSite=Strict`. Periksa HSTS dan login/checkout same-origin tanpa error 403.
4. Coba checkout, struk, produk, laporan, dan dua pengunjung terpisah. Kasir tidak boleh
   mengakses mutasi pemilik. Origin asing tetap harus ditolak.
5. Restart/redeploy: bila data hilang, sesi lama harus kembali ke halaman masuk;
   login baru mendapat data contoh. Hasil live harus dicatat, bukan diasumsikan.
6. Isi URL dan hasil sebenarnya di README, VERIFICATION, dan tiket POS-013.

## CI dan presentasi

GitHub Actions menjalankan `npm ci --include=dev` dan `npm run check` pada push `main`
dan pull request. Build Render juga menjalankan check sehingga perubahan yang gagal
lint/format/build tidak diterapkan. Tidak ada unit test.

Sebelum presentasi, buka link beberapa menit lebih awal untuk membangunkan service.
Masuk sebagai Pemilik, tunjukkan satu pembayaran tunai beserta kembalian/struk, buka
riwayat dan laporan, lalu ganti peran ke Kasir. Pengunjung lain mendapat data terpisah.
Jelaskan bahwa pembayaran simulasi dan data percobaan bisa direset.
