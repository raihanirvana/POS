# Verifikasi tanpa unit test

## Setiap tiket implementasi

1. Baca kriteria penerimaan di tiket.
2. Jalankan `npm run format`, lalu `npm run check`.
3. Jalankan aplikasi dan periksa API/browser untuk fitur yang berubah.
4. Catat perintah, hasil, browser/viewport, dan keterbatasan di bagian Bukti selesai.
5. Tandai tiket selesai hanya setelah seluruh kriterianya tercapai.

## Persiapan deployment — POS-013

Target dipilih: Render Free, satu origin React + Express, SQLite sementara. Detail dan
langkah live ada di [DEPLOYMENT.md](DEPLOYMENT.md). Deployment publik belum diverifikasi.

- [x] Build dengan environment Render (`NODE_ENV=production`, `HOST=0.0.0.0`,
  `TRUST_PROXY=1`, `VITE_DEMO_EPHEMERAL_STORAGE=true`) lolos lint/format/build.
- [x] Sintaks shell dan YAML diperiksa; flag create cocok dengan Render CLI v2.29.0.
- [x] Server produksi lokal: semua route HTML dan health API 200, login/checkout jalan.
- [x] Proxy HTTPS simulasi: cookie Secure/HttpOnly/SameSite dan HSTS; origin asing 403.
- [x] Chrome 360/768/1280: catatan data sementara tampil tanpa scroll horizontal.
- [x] File SQLite dihapus saat API berhenti: sesi lama 401, browser kembali ke halaman
  masuk, dan login baru membuat data contoh. Restart memakai file sama mempertahankan sesi.
- [ ] Login/workspace Render, validasi Blueprint dengan layanan Render, dan deploy sukses.
- [ ] Cookie, health, checkout, isolasi dan reset diuji pada URL HTTPS publik sebenarnya.
- [ ] Workflow GitHub Actions benar-benar lolos; URL live dicatat setelah diperiksa.

Tidak membuat unit test. Database pengembangan tidak disentuh. Tidak ada disk berbayar
atau backup lintas restart yang dijanjikan untuk target Free.

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

Periksa di SQLite bahwa kedua jar memakai workspace berbeda dan `token_hash` tidak sama dengan isi cookie. Coba body dengan `workspaceId`, peran asing, cookie lama setelah logout/ganti peran, dan sesi kedaluwarsa (`DEMO_TTL_MINUTES=1`). Sebelum POS-004 belum ada endpoint pemilik, jadi uji 403 memakai harness sementara di luar repo yang memasang `requireSession` + `requireRole('owner')` asli. Sejak POS-004, 403 diuji dengan `POST/PATCH/DELETE /api/products` memakai sesi kasir.

## Produk — POS-004

Masuk sebagai pemilik A, pemilik B, dan kasir C (tiga cookie jar), lalu:

```sh
curl -b a.txt 'http://127.0.0.1:3001/api/products?category=Kopi&search=latte'
curl -b a.txt -X POST -H 'content-type: application/json' \
  -d '{"name":"Vanilla Latte","category":"Kopi","price":32000,"stock":12}' \
  http://127.0.0.1:3001/api/products                                   # 201, imageKey latte
curl -b a.txt -X PATCH -H 'content-type: application/json' \
  -d '{"category":"Non-kopi"}' http://127.0.0.1:3001/api/products/<id> # imageKey matcha
curl -b c.txt -X DELETE http://127.0.0.1:3001/api/products/<id>        # 403
curl -b b.txt -X DELETE http://127.0.0.1:3001/api/products/<id-A>      # 404
```

Coba juga harga/stok string, pecahan, dan di luar batas; nama kosong/terlalu panjang; field `workspaceId`; foto yang tidak sesuai kategori; stok 0; serta `search` berisi `%` atau kutip. Hapus produk yang pernah terjual, lalu periksa di SQLite bahwa jumlah dan total `transaction_items` dengan nama itu tidak berubah. Restart API dan bandingkan daftar produk.

## Checkout — POS-005

Gunakan cookie kasir dan ID produk dari `GET /api/products`:

```sh
curl -b c.txt -X POST -H 'content-type: application/json' -d '{
  "idempotencyKey":"prd-scenario-0001",
  "items":[{"productId":"<kopi>","quantity":2},{"productId":"<croissant>","quantity":1}],
  "discountPercent":10,"orderType":"dine_in","paymentMethod":"cash","amountReceived":100000
}' http://127.0.0.1:3001/api/transactions   # 201, total 72000, kembalian 28000
```

Kirim ulang body yang sama (200, `replayed: true`, stok tetap), lalu ubah diskon dengan key yang sama (409). Coba uang kurang, qty 0/pecahan/string, field `total`/`unitPrice`, produk terhapus, dan stok kurang bersama item lain; stok dan jumlah transaksi harus tetap. Untuk race, jalankan dua proses API pada `DATABASE_PATH` yang sama, set stok 1, lalu kirim beberapa checkout paralel ke kedua port: hanya satu 201. Ubah harga dan `settings.store_name`, lalu bandingkan detail transaksi lama dan baru.

Coba QRIS dengan `amountReceived: null` (400), diskon 100% (total 0), subtotal tepat Rp1 triliun (diterima), dan subtotal di atas batas (400 tanpa perubahan stok). Filter tanggal dengan bulan/hari tidak valid harus 400, tanggal kabisat valid serta tahun 0000/9999 harus 200. Pastikan nomor setelah akhiran 999 adalah 1000.

Pada database sementara, pasang trigger yang menggagalkan INSERT item kedua. Checkout harus 500 dan semua stok, header transaksi, serta item pertama kembali seperti semula; hapus trigger lalu coba key yang sama (201). Uji juga sesi yang dicabut saat checkout menunggu kunci SQLite: 401, cookie dihapus, tanpa mutasi. Kegagalan buatan ini hanya untuk verifikasi rollback, bukan perubahan skema aplikasi.

## Shell React — POS-006

Setelah `npm run build`, jalankan `npm start` (atau `npm run dev`) pada database sementara lalu buka browser:

1. `/kasir` tanpa sesi diarahkan ke `/masuk?lanjut=/kasir`. Masuk sebagai Kasir: menu hanya Kasir dan Transaksi. Refresh tetap masuk.
2. Buka `/dashboard` sebagai kasir: halaman "Peran kasir tidak bisa membuka halaman ini". Tombol **Ganti ke Pemilik** memunculkan 6 menu di ruang demo yang sama.
3. **Keluar** membuka dialog (Escape menutup). Konfirmasi kembali ke `/masuk` dengan pesan data dihapus, dan cookie hilang.
4. `?lanjut=` berisi URL luar atau halaman yang tidak diizinkan untuk peran itu kembali ke `/kasir`.
5. DevTools: `localStorage` dan `sessionStorage` kosong, `document.cookie` tidak memuat `seduh_session` (HttpOnly).
6. Matikan jaringan atau blokir `/api/session`: layar error dengan **Coba lagi**. Ubah `sessions.expires_at` ke masa lalu lalu refresh: halaman masuk menampilkan "Sesi demo berakhir".
7. Lebar 360, 768, dan 1280px tanpa scroll horizontal halaman. Tab pertama memunculkan skip link; fokus memakai outline kuning.
8. Simulasikan DELETE sesi 500: pesan error harus terlihat di dalam dialog, retry bekerja, dan Batal/Escape tidak menghapus data. Retry dari notifikasi setelah dialog ditutup harus membuka konfirmasi lagi. Escape saat request masih berjalan tidak menutup dialog.
9. Simulasikan respons sukses sesi berupa HTML, JSON rusak, `null`, atau bentuk sesi invalid: tampilkan pesan "Respons server tidak valid" dengan retry, bukan error teknis atau layar kosong. Error JSON dengan message/requestId non-string memakai fallback yang aman. Setelah logout, judul tab harus "Masuk demo · Seduh POS".
10. Tunda respons ganti owner ke kasir lalu navigasikan ke Dashboard sebelum respons tiba: tujuan akhirnya `/kasir`. Melalui API client asli, 403 tidak mengeluarkan sesi UI; 401 pada request produk mengarahkan ke halaman masuk dengan notice.

Respons 401 untuk `GET /api/session` saat belum masuk tampil sebagai log jaringan merah di console browser. Itu perilaku kontrak API, bukan error JavaScript.

## Halaman Produk — POS-007

Masuk sebagai Pemilik lalu buka `/produk`:

1. Daftar 9 menu seed dengan foto lokal. Filter kategori dan pencarian (`latte`, `%`) memanggil API dan menampilkan kondisi kosong yang jelas.
2. **Tambah produk** lalu simpan kosong: pesan di field Nama dan Harga, fokus ke Nama, tidak ada request. Isi nama `<img src=x onerror=alert(1)>`, kategori Pastry, stok 0: tersimpan dan tampil sebagai teks dengan pill "Habis".
3. Edit harga satu menu: DevTools Network menunjukkan PATCH hanya berisi field yang berubah. Ganti kategori di form: foto kembali ke default kategori baru.
4. Hapus menu: dialog konfirmasi (Escape membatalkan). Setelah dihapus, refresh dan bandingkan dengan `GET /api/products`.
5. Blokir request di DevTools atau matikan server: form menampilkan "Produk belum tersimpan" dengan nilai tetap utuh; dialog hapus menampilkan error dan "Coba hapus lagi"; daftar menampilkan "Daftar belum diperbarui" dengan Coba lagi.
6. Sebagai Kasir, `/produk` menampilkan halaman 403 dan menu Produk tidak ada.
7. Lebar 360px: baris tabel menjadi kartu tanpa scroll horizontal. 768px: tabel muat dengan tombol Edit ikon saja.
8. Tunda request simpan: kolom, kategori, foto, dan tombol tutup terkunci; Escape tidak menutup form. Error 400 memfokuskan kolom yang salah, dan field error non-string tidak membuat UI crash.
9. Saat form edit harga terbuka, checkout menu yang sama lewat API. Simpan harga lalu pastikan PATCH tidak membawa stok dan stok hasil checkout tetap benar. Edit tanpa perubahan tidak mengirim request; struk lama mempertahankan harga awal.
10. Simulasikan respons daftar dengan tag objek, preset null, kategori/label salah tipe, stok negatif, atau katalog kosong: pesan error dengan retry, tombol tambah tidak aktif, dan tidak ada halaman kosong. Setelah GET gagal, `aria-busy` harus false.
11. Coba 60 emoji (diterima), 61 emoji serta karakter kontrol/surrogate invalid (ditolak tanpa request), stok/harga pecahan atau melewati batas, dan harga dengan nol di depan (pratinjau sesuai nominal). Refresh dan restart API mempertahankan perubahan.

## Kasir — POS-008

Masuk sebagai Kasir di `/kasir`:

1. Tambah 2 Kopi Susu Seduh dan 1 Butter Croissant, nama Raka, diskon 10%: pratinjau Rp80.000 − Rp8.000 = Rp72.000. Bayar Rp70.000: "Uang kurang Rp 2.000" dan konfirmasi nonaktif. Bayar Rp100.000: kembalian Rp28.000. Konfirmasi membuka struk; stok kartu menjadi 33 dan 17, dan pesanan kosong.
2. Klik ganda tombol konfirmasi: DevTools Network hanya menunjukkan satu POST.
3. DevTools → Network → Offline tepat setelah menekan konfirmasi (atau blokir respons): dialog "Pembayaran belum pasti tersimpan", pesanan terkunci. Kembali online lalu **Kirim ulang pembayaran**: body memakai `idempotencyKey` yang sama, dan transaksi hanya tercatat sekali.
4. Ubah stok/harga produk di SQLite atau lewat akun pemilik setelah item masuk pesanan: stok kurang → "Stok berubah" dan jumlah disesuaikan tanpa mengosongkan pesanan; harga berubah → struk memberi tahu total final berbeda dari pratinjau.
5. QRIS: hanya teks simulasi, tanpa gambar atau kode QR.
6. Lebar 360px: tombol "Lihat pesanan" di bawah membuka dialog pesanan (Escape menutup); bayar dari dialog itu lalu struk. Lebar 768px dan 1280px: panel pesanan di samping.
7. Teruskan request ke server lalu ganti respons menjadi 408: pembayaran harus tetap terkunci sebagai hasil tidak pasti. Retry harus memakai key/body sama, menghasilkan satu transaksi dan sekali pengurangan stok. Lakukan juga untuk respons struk rusak (alamat/pesan toko objek, tanggal salah tipe, atau total/item tidak konsisten).
8. Tunda respons checkout setelah server menyimpan, gunakan Back/pindah halaman, lalu kembali ke Kasir: struk transaksi itu masih tersedia. Pada retry setelah harga berubah, catatan struk membandingkan total final dengan pratinjau awal, bukan harga menu terbaru.
9. Hapus/habiskan produk terakhir sebelum bayar: setelah 409 dan penyesuaian pesanan, konfirmasi nonaktif dan ada petunjuk memilih menu lagi. Diskon 100% pada item yang tersedia tetap bisa dibayar Rp0; respons hilang lalu buka ulang memulihkan nominal 0.
10. Ubah harga agar uang pas awal menjadi kurang: setelah 400, isi nominal lebih tinggi dan pastikan pesan kekurangan lama hilang. Nominal lebih dari Rp1 triliun nonaktif sebelum request; pesan field non-string tidak membuat halaman kosong dan detail field yang valid terlihat.

## Struk dan riwayat — POS-009

1. Buat satu penjualan di `/kasir`. Struk sukses punya tombol **Cetak struk**.
2. Buka `/transaksi`: total sesuai `GET /api/transactions`, 20 baris per halaman, **Berikutnya** menampilkan sisa transaksi. Cari nama pelanggan atau nomor transaksi; filter **Hari ini** dan tanggal lain (hari Asia/Jakarta).
3. Ubah nama/harga produk dan identitas toko (lewat Produk, atau SQLite sebelum POS-011), lalu **Lihat struk** transaksi lama: nama, harga, dan toko tetap seperti saat penjualan.
4. **Cetak struk** atau Ctrl+P saat isi struk siap: print preview hanya berisi struk (tanpa sidebar, tombol, atau catatan). Ctrl+P di halaman lain, atau ketika detail masih memuat/error, tetap mencetak halaman biasa.
5. Escape menutup dialog struk dan fokus kembali ke tombol **Lihat struk**.
6. Workspace lain: `GET /api/transactions/<id>` → 404 dan daftar tidak memuat ID transaksi asal. Nomor transaksi bisa sama antar workspace; hasil pencarian hanya boleh berisi transaksi workspace sesi sendiri.
7. Lebar 360px: baris riwayat menjadi kartu tanpa scroll horizontal; dialog struk muat.
8. Ketik kata kunci dan klik Berikutnya sebelum debounce selesai: hasil kembali ke halaman pertama. Kurangi data pada database sementara ketika request halaman berikutnya gagal, lalu Coba lagi: offset di luar rentang otomatis dikoreksi. Respons limit/offset invalid menampilkan error dan retry.
9. Coba nama pelanggan dan menu 60 karakter tanpa spasi pada 360/768/1280px: tabel serta dialog tidak melebar, dan hasil PDF tetap memuat seluruh teks. Cetak 50 item: setiap nama, total, dan footer ada pada PDF beberapa halaman; header UI/tombol tidak tercetak.
10. Tunda detail struk atau blokir request-nya, lalu emulasikan print: halaman riwayat tetap terlihat, portal loading/error tersembunyi, dan hasil cetak tidak kosong. Tombol Cetak nonaktif sampai struk siap.

## Dashboard dan laporan — POS-010

Masuk sebagai Pemilik dan buat satu penjualan (contoh PRD Rp72.000):

1. `/dashboard`: Penjualan hari ini Rp72.000, 1 transaksi, rata-rata Rp72.000, dan stok menipis sama dengan `GET /api/dashboard`. Grafik 7 kolom dengan hari ini disorot dan diberi label. Hover/Tab ke kolom memunculkan tooltip, dan "Lihat data sebagai tabel" menampilkan 7 baris.
2. Jumlahkan 7 nilai grafik lalu bandingkan dengan `/laporan` preset 7 hari dan jumlah baris CSV-nya.
3. `/laporan`:
   - Tanggal awal setelah tanggal akhir → pesan error, Ekspor nonaktif, dan angka lama tetap.
   - Periode tanpa transaksi → nol dan "Belum ada transaksi".
   - Preset 30 hari → 30 kolom; lebih dari 31 hari → tabel.
4. API: `?from=2026-10-14&to=2026-10-01`, `2026-02-30`, dan rentang lebih dari 366 hari → 400. Kasir → 403, tanpa sesi → 401.
5. Batas tengah malam: transaksi pukul 23:59:59.999 WIB masuk hari itu, sedangkan 00:00:00.000 WIB masuk hari berikutnya.
6. CSV: buka di spreadsheet. Nama pelanggan `=HYPERLINK(...)` tampil sebagai teks berawalan `'`, dan huruf Indonesia/emoji terbaca (BOM UTF-8).

Review POS-010 juga menguji ganti periode saat request tertunda/gagal (ekspor tetap nonaktif), respons JSON/CSV rusak, periode tahun 0000/9999, dua API checkout bersamaan dengan laporan, menu bernama sama, pelanggan 60 karakter di dashboard, dan 30 tooltip keyboard pada layar 360px. Detail bukti ada di [POS-010](tickets/POS-010.md). Regresi POS-005, POS-006, POS-008, dan POS-009 dijalankan ulang tanpa unit test.

## Pengaturan dan reset — POS-011

1. `/pengaturan` sebagai Pemilik: kosongkan Nama toko lalu simpan → pesan error dan fokus, tanpa request. Ubah nama dan pesan struk → "Pengaturan disimpan.", dan PATCH hanya berisi field yang berubah. Refresh → nilai tetap.
2. Buat transaksi, ubah nama toko lagi, lalu buka struk transaksi itu di `/transaksi`: nama dan pesan toko lama tetap.
3. Browser A: isi pesanan di Kasir (atau buat pembayaran yang belum pasti), lalu **Reset data contoh** → dialog (Escape membatalkan) → konfirmasi. Pengaturan kembali "Seduh Coffee", menu dan transaksi contoh kembali, dan pesanan di Kasir kosong dan tidak terkunci.
4. Browser B (workspace lain yang sudah diubah): pengaturan, produk, transaksi, dan stoknya tidak berubah.
5. Kasir: `/pengaturan` → halaman 403. `PATCH /api/settings` dan `POST /api/demo/reset` → 403, sedangkan `GET /api/settings` → 200.
6. API: reset tanpa `{"confirmation":"reset"}` → 400; field asing/kosong/terlalu panjang pada PATCH → 400 dengan `fields`.
7. Tunda respons pembayaran yang sudah di-commit, browser Back ke Pengaturan, reset, lalu buat pesanan baru: respons lama tidak menghapus pesanan atau membuka struk lama. Ulangi dengan respons gagal lama sesudah pembayaran baru berhasil.
8. Tunda reset lalu browser Back ke Kasir: menu/checkout tetap terkunci sampai selesai. Klik konfirmasi dua kali → satu POST; Escape tidak menutup saat sibuk.
9. PATCH tertunda menonaktifkan reset; GET setelah simpan menonaktifkan editor sampai data terbaru tiba. Respons pengaturan/reset invalid menampilkan error, tanpa klaim sukses.
10. Trigger seed gagal → rollback persis; sesi yang dicabut/berakhir atau berganti peran saat request menunggu kunci ditolak tanpa perubahan. Bukti review dan regresi POS-007/008/010 ada di [POS-011](tickets/POS-011.md).

## Checklist integrasi — POS-012

Dijalankan 15 Oktober 2026 pada build produksi, mode dev (proxy Vite), dan Google Chrome headless/Playwright. Bukti lengkap ada di [POS-012](tickets/POS-012.md).

- [x] Dua pengunjung memiliki ruang data berbeda; logout dan sesi expired ditolak.
- [x] Kasir tidak bisa memakai API pengelolaan pemilik.
- [x] CRUD produk tetap tersimpan setelah restart server.
- [x] Checkout contoh Rp80.000, diskon 10%, uang Rp100.000: total Rp72.000, kembalian Rp28.000.
- [x] Uang kurang, qty negatif/pecahan, stok kurang, harga manipulasi, dan workspace asing ditolak.
- [x] Checkout bersamaan untuk stok terakhir tidak menyebabkan stok negatif.
- [x] Retry checkout dengan key sama tidak menambah transaksi atau mengurangi stok lagi.
- [x] Snapshot struk tidak berubah setelah harga atau identitas toko diedit.
- [x] Dashboard, laporan, rentang tanggal Jakarta, dan CSV sesuai data server.
- [x] Reset hanya menghapus data ruang demo yang dipilih.
- [x] API/network error mempunyai pesan dan jalur retry yang jelas.
- [x] Seluruh halaman tidak melebar pada mobile, tablet, dan desktop.
- [x] Dialog/keyboard/focus, reduced motion, print preview, dan input markup diperiksa.
- [x] Mutasi dari origin lain ditolak; body besar, rate login/API, dan kapasitas ruang demo dibatasi.
- [x] Hosting yang benar-benar dipakai dicatat; backend tidak diklaim live (deployment = POS-013).

Review tambahan POS-012 memeriksa origin kanonis dan konfigurasi invalid, 10.000 IP dan pemulihan jendela satu menit lewat HTTP aktual, kapasitas setelah restart/dua API, serta login yang berakhir saat menunggu kunci SQLite. Browser produksi dan proxy Vite diuji, prototype tetap berjalan, dan audit dependency produksi melaporkan 0 kerentanan saat verifikasi. Detail ada di [POS-012](tickets/POS-012.md).

### Pemeriksaan keamanan cepat

```sh
curl -i -X POST -H 'content-type: application/json' -H 'Origin: https://evil.example' \
  -d '{"role":"owner"}' http://127.0.0.1:3001/api/demo/sessions          # 403 ORIGIN_REJECTED
curl -sI http://127.0.0.1:3001/ | grep -i -E 'content-security|x-frame'  # header keamanan
DEMO_SESSION_LIMIT=2 npm start   # login ke-3 dari IP sama → 429 RATE_LIMITED + Retry-After
DEMO_MAX_WORKSPACES=1 npm start  # ruang demo ke-2 → 503 DEMO_CAPACITY
```
