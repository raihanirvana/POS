# PRD — Seduh POS

Versi 2.0 · 15 Oktober 2026 · Status: demo portfolio fullstack (React + Express + SQLite)

> Versi 1.0 adalah prototype HTML/localStorage di `dist/`. Prototype itu masih dapat dibuka di `/prototype/index.html`, dan PRD lamanya ada di `dist/prd.html`. Dokumen ini menjelaskan versi fullstack yang dibangun per tiket di [docs/tickets/README.md](docs/tickets/README.md). Kontrak API ada di [docs/API.md](docs/API.md), dan skema data di [docs/DATABASE.md](docs/DATABASE.md).

## 1. Gambaran produk

Seduh POS adalah contoh aplikasi kasir berbasis web untuk satu kedai kopi. Calon klien dapat mencoba transaksi dari memilih menu hingga membaca struk, lalu melihat stok, riwayat, dashboard, dan laporan yang ikut berubah. Produk ini menunjukkan kemampuan jasa pembuatan web melalui pengalaman yang bisa dicoba, bukan hanya gambar desain.

Frontend React berjalan di browser. Express menyajikan API dan menyimpan data di SQLite di server. Setiap pengunjung mendapat ruang demo sendiri dengan data contoh yang bisa diubah tanpa memengaruhi pengunjung lain. Seluruh pembayaran adalah simulasi; aplikasi belum ditujukan untuk operasional toko sungguhan.

## 2. Tujuan dan indikator keberhasilan

| Tujuan | Indikator penerimaan demo |
| --- | --- |
| Membantu calon klien memahami hasil jasa | Bisa masuk demo tanpa daftar dan menyelesaikan satu transaksi dalam 3 menit |
| Menampilkan aplikasi yang terasa utuh | Pembayaran mengubah riwayat, stok, dashboard, dan laporan |
| Menampilkan kualitas antarmuka | Semua halaman bisa dipakai di laptop, tablet, dan ponsel tanpa scroll horizontal halaman |
| Menampilkan kualitas backend | Harga, total, stok, dan peran divalidasi server; checkout atomik dan aman diulang |
| Memudahkan presentasi berulang | Data contoh tersedia; reset mengembalikan data awal ruang demo setelah konfirmasi |

Metrik bisnis setelah portfolio dipublikasikan: jumlah pengunjung demo, proporsi klik kontak, dan jumlah pertanyaan calon klien. Pengukuran analitik dan kontak nyata merupakan tahap berikutnya, belum ada pada demo ini.

## 3. Pengguna dan peran

- **Calon klien:** pemilik kedai/UMKM yang mengevaluasi contoh aplikasi sebelum memesan jasa.
- **Kasir:** memilih produk, mengatur jumlah, menerima pembayaran, dan membuka struk. Akses: Kasir dan Transaksi.
- **Pemilik:** semua akses kasir, ditambah Dashboard, Produk, Laporan, dan Pengaturan.

Masuk demo memakai sesi server **tanpa password**, dengan memilih peran Kasir atau Pemilik. Peran bisa diganti pada ruang demo yang sama. Pembatasan peran ditegakkan di API (403) dan tercermin di menu. Ini login demo, bukan autentikasi akun produksi.

## 4. Cakupan versi fullstack

| Prioritas | Fitur | Perilaku yang diharapkan |
| --- | --- | --- |
| P0 | Masuk demo | Pilih peran; sesi cookie HttpOnly; ruang data per pengunjung; ganti peran; keluar menghapus ruang demo |
| P0 | Kasir | Menu dari API dengan foto, pencarian, kategori, stok; pesanan dengan jumlah dan hapus item |
| P0 | Checkout | Nama pelanggan opsional, makan di tempat/bawa pulang, diskon persentase 0–100% |
| P0 | Pembayaran | Tunai dengan validasi uang diterima dan kembalian; QRIS hanya konfirmasi simulasi; aman dari klik ganda dan retry jaringan |
| P0 | Struk | Nomor, toko, waktu WIB, item, diskon, total, metode, uang/kembalian; cetak hanya area struk |
| P0 | Riwayat | Pencarian nomor/pelanggan, filter tanggal, paginasi, buka ulang struk |
| P0 | Dashboard | Penjualan hari ini, transaksi, rata-rata, stok menipis, grafik 7 hari, favorit, transaksi terbaru |
| P1 | Produk | Tambah, edit, hapus; nama, kategori, harga, stok, deskripsi, label; foto preset sesuai kategori |
| P1 | Laporan | Periode tanggal, pendapatan setelah diskon, jumlah transaksi, unit terjual, metode, per hari, ekspor CSV |
| P1 | Pengaturan | Nama toko, alamat, dan pesan penutup struk disimpan per ruang demo di server |
| P1 | Reset | Konfirmasi lalu kembalikan data contoh ruang demo sendiri; pesanan yang sedang dibuat dibatalkan |

Di luar cakupan: akun/password produksi, multi cabang, pajak, biaya layanan, pembelian supplier, bahan baku/resep, laba, refund, integrasi printer thermal langsung, QRIS/payment gateway asli, akuntansi, barcode, pengiriman, dan analitik pengunjung.

## 5. Alur utama

1. Pengunjung membuka aplikasi dan memilih **Masuk sebagai Kasir** atau **Pemilik**. Server membuat ruang demo berisi menu dan transaksi contoh.
2. Di Kasir, cari produk atau pilih kategori, lalu tambahkan ke pesanan.
3. Atur jumlah, pelanggan, jenis pesanan, dan diskon jika diperlukan.
4. Buka pembayaran, lalu pilih tunai atau QRIS simulasi.
5. Untuk tunai, masukkan nominal yang mencukupi. Untuk QRIS, konfirmasi pembayaran simulasi.
6. Server menghitung ulang harga dan total, mengurangi stok, dan menyimpan transaksi beserta snapshot secara atomik. UI lalu mengosongkan pesanan dan membuka struk.
7. Pengunjung melihat hasilnya di Transaksi, serta di Dashboard dan Laporan (pemilik).

Alur pengelolaan: Produk → tambah/edit → simpan → menu kasir memakai data terbaru. Penghapusan perlu konfirmasi; snapshot transaksi lama tetap tersedia.

## 6. Aturan bisnis

- Semua nilai rupiah menggunakan bilangan bulat; jumlah produk harus bilangan bulat positif.
- Diskon = pembulatan(subtotal × persentase / 100). Total = subtotal − diskon. Server menghitung dari harga database saat bayar; harga atau total dari browser tidak dipercaya.
- Penjualan hari ini dihitung menurut zona waktu Asia/Jakarta. Periode laporan mencakup kedua tanggal batas.
- Stok nol menonaktifkan penambahan produk. Jumlah pesanan tidak boleh melebihi stok saat ini, dan batasnya dijelaskan di kartu menu dan baris pesanan.
- Stok diperiksa ulang dan dikurangi secara atomik saat konfirmasi bayar. Bila stok atau produk berubah, pembayaran ditolak tanpa mengubah stok, lalu pesanan disesuaikan dengan penjelasan.
- Uang tunai harus sama dengan atau lebih besar daripada total. Kembalian = diterima − total.
- Pembayaran tidak bisa dilakukan dengan pesanan kosong. Satu konfirmasi menghasilkan satu transaksi: idempotency key yang sama tidak membuat transaksi atau pengurangan stok kedua.
- Nama, kategori, foto, dan harga produk, serta identitas toko, disalin ke transaksi saat pembayaran. Perubahan atau penghapusan produk dan pengaturan tidak mengubah struk lama.
- Total laporan memakai nilai setelah diskon dan disebut pendapatan, bukan laba. Ringkasan produk menampilkan jumlah unit.
- Data contoh menggunakan tanggal relatif terhadap saat ruang demo dibuat atau di-reset. Seed merupakan data ilustrasi.
- Reset memerlukan konfirmasi, hanya memengaruhi ruang demo pengunjung itu, dan berjalan dalam satu transaksi database.
- Transaksi tersimpan sebelum UI menampilkan pembayaran berhasil. Jika hasil penyimpanan tidak pasti (jaringan putus), UI mengunci pesanan dan hanya mengizinkan kirim ulang dengan key yang sama.

## 7. Data

| Entitas | Atribut |
| --- | --- |
| Ruang demo | ID, waktu dibuat, kedaluwarsa (default 12 jam), status seed |
| Sesi | Hash token, peran (pemilik/kasir), kedaluwarsa, status dicabut |
| Produk | ID, nama, kategori, harga rupiah, stok unit, kunci foto preset, deskripsi, label |
| Transaksi | Nomor per hari WIB, waktu, pelanggan, jenis pesanan, item snapshot, subtotal, persen/nilai diskon, total, metode, diterima, kembalian, snapshot toko, idempotency key |
| Pengaturan | Nama toko, alamat toko, pesan penutup struk |

Data disimpan di SQLite di server dan dibatasi per ruang demo. Browser hanya menyimpan cookie sesi HttpOnly; pesanan yang sedang dibuat ada di memori tab. Tidak ada data yang dikirim ke server pembayaran. Ruang demo kedaluwarsa dihapus otomatis saat pengunjung baru masuk; keluar dari demo langsung menghapus ruang demo.

Hosting demo yang dipilih adalah Render Free dengan SQLite sementara. Sleep, restart,
dan deploy ulang dapat menghapus sesi serta seluruh data percobaan sebelum batas 12 jam.
Pengunjung masuk lagi untuk mendapat data contoh baru. Catatan ditampilkan di halaman
masuk. Persistensi lintas restart dan backup hosting tidak termasuk target gratis ini;
deployment publik belum diverifikasi. Detail ada di [panduan deploy](docs/DEPLOYMENT.md).

## 8. Antarmuka

Identitas contoh: Seduh, kedai kopi lingkungan dengan menu kopi susu, espresso, matcha, teh, dan pastry. Warna hijau daun menunjukkan tindakan utama; foto menu membantu mengenali produk; panel pesanan memisahkan pemilihan menu dan pembayaran. Detail desain ada di [DESIGN.md](DESIGN.md).

- **Desktop:** sidebar navigasi, menu di tengah, pesanan di kanan.
- **Tablet:** sidebar ikon dan produk dua kolom.
- **Ponsel:** navigasi horizontal, tabel menjadi kartu, dan panel pesanan dibuka dari tombol bawah sebagai dialog.

Seluruh antarmuka berbahasa Indonesia dengan rupiah dan waktu WIB.

## 9. Persyaratan nonfungsional

- **Keamanan demo:**
  - Workspace dan peran berasal dari sesi server. Query SQL berparameter. Cookie HttpOnly + SameSite=Strict (+ Secure di HTTPS).
  - Mutasi dari origin lain ditolak.
  - Body JSON maksimal 100 KB. Login demo dan request API dibatasi per IP, dan jumlah ruang demo aktif dibatasi.
  - Header CSP, nosniff, dan frame-deny dikirim.
- **Keandalan data:** checkout, mutasi produk/pengaturan, dan reset berjalan dalam transaksi SQLite dengan pemeriksaan ulang sesi. Constraint database menjaga harga, stok, dan total tetap valid.
- **Aksesibilitas:** form memiliki label dan pesan error per field; navigasi keyboard; focus terlihat; dialog modal dapat ditutup dengan Escape dan mengembalikan fokus; dukungan reduced motion. Grafik memiliki tooltip keyboard dan tampilan tabel.
- **Keamanan masukan:** masukan pengguna dirender sebagai teks (React), dan CSV dilindungi dari formula injection.
- **Tata letak:** tabel panjang menjadi kartu di ponsel atau bergulir di dalam area tabel tanpa memperlebar halaman.
- **Aset:** seluruh gambar menu disimpan lokal; font web memiliki fallback jika jaringan tidak tersedia.
- **Pengembangan:** Node.js ≥ 22.13 (`node:sqlite`). Fungsi maksimal 25 baris. Verifikasi melalui lint/format/build, curl, dan browser — tanpa unit test.
- **Browser:** Chrome, Edge, Firefox, dan Safari modern. Browser yang benar-benar diverifikasi dicatat di README dan tiket.

## 10. Kriteria penerimaan

| Skenario | Hasil |
| --- | --- |
| Tambah 2 kopi Rp28.000 dan 1 croissant Rp24.000, diskon 10% | Subtotal Rp80.000; diskon Rp8.000; total Rp72.000 |
| Bayar Rp100.000 untuk pesanan tersebut | Kembalian Rp28.000; stok kopi −2 dan croissant −1 |
| Bayar tunai kurang dari total | Pesan menunjukkan kekurangan dan transaksi tidak dibuat |
| Konfirmasi QRIS simulasi | Transaksi metode QRIS tersimpan tanpa menghubungi payment gateway |
| Tambah melebihi stok | Jumlah tetap pada batas stok dan pengguna mendapat penjelasan |
| Buka ulang browser | Produk, transaksi, dan pengaturan tetap tersedia selama sesi dan file database masih berlaku; jika hosting Free mereset data, pengunjung masuk lagi |
| Edit harga setelah penjualan | Struk lama tetap menggunakan harga saat penjualan |
| Filter laporan dan ekspor | CSV sesuai transaksi yang masuk rentang pilihan |
| Reset lalu batalkan | Data tetap; konfirmasi reset mengembalikan contoh awal |
| Masukkan markup dalam nama pelanggan/produk | Ditampilkan sebagai teks biasa |
| Dua pengunjung bersamaan | Data, transaksi, dan reset satu pengunjung tidak terlihat atau berpengaruh pada yang lain |

Bukti verifikasi tiap skenario dicatat di [docs/tickets/POS-012.md](docs/tickets/POS-012.md).

## 11. Pengembangan untuk klien sungguhan

- **Tahap 1:** sepakati alur usaha, branding, perangkat, pajak, dan kebutuhan laporan bersama klien.
- **Tahap 2:** ganti login demo dengan akun/password atau SSO, manajemen pengguna, audit trail, backup terjadwal, kebijakan data, dan database/penyimpanan rate limit bersama untuk banyak instance.
- **Tahap 3:** integrasi pembayaran resmi, printer, inventori bahan baku, refund, laba, dan fitur cabang sesuai kebutuhan.

Harga jasa, durasi pengerjaan, dan nomor kontak sengaja belum ditetapkan. Semua perlu diisi dengan informasi bisnis pemilik jasa sebelum portfolio digunakan untuk menerima pesanan.
