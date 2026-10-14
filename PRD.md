# PRD — Seduh POS

Versi 1.0 · 14 Oktober 2026 · Status: rancangan demo portfolio

> Pengembangan berikutnya: versi fullstack React + Vite, Express, dan SQLite dikerjakan per tiket dalam [docs/tickets/README.md](docs/tickets/README.md). Versi HTML di bawah menjadi acuan desain/perilaku. POS-001 menyiapkan fondasi, POS-002 menyiapkan skema database, migrasi, dan seed, POS-003 menyiapkan sesi demo pemilik/kasir di server, POS-004 menyiapkan API produk, POS-005 menyiapkan API checkout/transaksi atomik, POS-006 menyiapkan shell React serta masuk demo, POS-007 menyiapkan halaman Produk, POS-008 menyiapkan halaman Kasir serta pembayaran simulasi, POS-009 menyiapkan struk serta riwayat transaksi, dan POS-010 menyiapkan dashboard serta laporan; pengaturan toko dan reset demo belum selesai sampai tiket masing-masing ditutup. Aturan baru: fungsi maksimal 25 baris dan verifikasi tanpa unit test.

## 1. Gambaran produk

Seduh POS adalah contoh aplikasi kasir berbasis web untuk satu kedai kopi. Calon klien dapat mencoba transaksi dari memilih menu hingga membaca struk, lalu melihat stok dan laporan yang ikut berubah. Produk ini menunjukkan kemampuan jasa pembuatan web melalui pengalaman yang bisa dicoba, bukan hanya gambar desain.

Demo dibuat dengan HTML, CSS, dan JavaScript biasa. Data tersimpan pada browser masing-masing pengunjung. Seluruh pembayaran adalah simulasi; aplikasi belum ditujukan untuk operasional toko sungguhan.

## 2. Tujuan dan indikator keberhasilan

| Tujuan | Indikator penerimaan demo |
| --- | --- |
| Membantu calon klien memahami hasil jasa | Bisa masuk demo tanpa daftar dan menyelesaikan satu transaksi dalam 3 menit |
| Menampilkan aplikasi yang terasa utuh | Pembayaran mengubah riwayat, stok, dashboard, dan laporan |
| Menampilkan kualitas antarmuka | Kasir bisa digunakan pada laptop, tablet, dan ponsel tanpa scroll horizontal halaman |
| Memudahkan presentasi berulang | Data contoh tersedia; reset mengembalikan seluruh data awal setelah konfirmasi |

Metrik bisnis setelah portfolio dipublikasikan: jumlah pengunjung demo, proporsi klik kontak, dan jumlah pertanyaan calon klien. Pengukuran analitik dan kontak nyata merupakan tahap berikutnya, belum ada pada demo ini.

## 3. Pengguna

- **Calon klien:** pemilik kedai/UMKM yang mengevaluasi contoh aplikasi sebelum memesan jasa.
- **Kasir:** persona untuk alur memilih produk, mengatur jumlah, menerima pembayaran, dan mencetak struk.
- **Pemilik:** persona untuk memantau penjualan, mengelola produk, dan membaca laporan.

Pada demo semua halaman dapat diakses tanpa autentikasi. Kasir dan pemilik adalah persona desain; belum ada pembatasan akses berdasarkan peran.

## 4. Cakupan versi pertama

| Prioritas | Fitur | Perilaku yang diharapkan |
| --- | --- | --- |
| P0 | Kasir | Produk bergambar, pencarian, kategori, stok, keranjang, jumlah, hapus item |
| P0 | Checkout | Nama pelanggan opsional, makan di tempat/bawa pulang, diskon persentase 0–100% |
| P0 | Pembayaran | Tunai dengan validasi uang diterima dan kembalian; QRIS dengan konfirmasi simulasi |
| P0 | Struk | Nomor transaksi, toko, waktu, item, diskon, total, metode, uang/kembalian; cetak browser |
| P0 | Riwayat | Pencarian nomor/pelanggan, filter tanggal, detail transaksi, buka ulang struk |
| P0 | Dashboard | Penjualan hari ini, transaksi, rata-rata transaksi, stok menipis, grafik 7 hari |
| P1 | Produk | Tambah, edit, hapus; nama, kategori, harga, stok; foto preset sesuai kategori |
| P1 | Laporan | Filter tanggal awal/akhir, pendapatan, jumlah transaksi, produk terjual, ekspor CSV |
| P1 | Pengaturan | Nama toko, alamat, pesan penutup struk; tersimpan pada browser |
| P1 | Reset | Konfirmasi sebelum mengembalikan data contoh, pengaturan, dan keranjang |
| P1 | PRD web | Dokumen dapat dibaca melalui tombol Panduan & PRD dan file Markdown |

Di luar cakupan: login sungguhan, backend/database bersama, multi cabang, pajak, biaya layanan, pembelian supplier, bahan baku/resep, refund, integrasi printer thermal langsung, QRIS asli, akuntansi, barcode, pengiriman, dan analitik pengunjung.

## 5. Alur utama

1. Pengunjung membuka halaman kasir dengan produk dan transaksi contoh yang sudah tersedia.
2. Cari produk atau pilih kategori, lalu tambahkan ke pesanan.
3. Atur jumlah, pelanggan, jenis pesanan, dan diskon jika diperlukan.
4. Buka pembayaran, pilih tunai atau simulasi QRIS.
5. Untuk tunai, masukkan nominal yang mencukupi. Untuk QRIS, konfirmasi pembayaran simulasi.
6. Sistem menyimpan transaksi, mengurangi stok, mengosongkan keranjang, dan membuka struk.
7. Pengunjung melihat hasilnya di Dashboard, Transaksi, dan Laporan.

Alur pengelolaan: Produk → tambah/edit → simpan → menu kasir diperbarui. Penghapusan perlu konfirmasi dan menghapus produk dari keranjang; snapshot transaksi lama tetap tersedia.

## 6. Aturan bisnis

- Semua nilai rupiah menggunakan bilangan bulat; jumlah produk harus bilangan bulat positif.
- Diskon = pembulatan(subtotal × persentase / 100). Total = subtotal − diskon.
- Penjualan hari ini dihitung menurut zona waktu Asia/Jakarta. Filter laporan mencakup kedua tanggal batas.
- Stok nol menonaktifkan penambahan produk. Jumlah keranjang tidak boleh melebihi stok saat ini.
- Stok diperiksa kembali saat konfirmasi bayar, termasuk jika produk diedit setelah masuk keranjang.
- Uang tunai harus sama dengan atau lebih besar daripada total. Kembalian = diterima − total.
- Pembayaran tidak bisa dilakukan dengan keranjang kosong; satu konfirmasi menghasilkan satu transaksi.
- Harga dan nama produk disalin ke transaksi saat pembayaran agar perubahan produk tidak mengubah transaksi lama.
- Total laporan memakai nilai bersih setelah diskon. Ringkasan produk menampilkan jumlah unit, bukan laba.
- Data contoh menggunakan tanggal relatif terhadap hari saat demo diinisialisasi. Seed merupakan data ilustrasi.
- Reset memerlukan konfirmasi karena menghapus percobaan pengunjung pada browser tersebut.
- Data disimpan sebelum UI menampilkan pembayaran berhasil. Jika penyimpanan gagal, transaksi tidak dianggap selesai.

## 7. Data

| Entitas | Atribut |
| --- | --- |
| Produk | ID, nama, kategori, harga rupiah, stok unit, foto lokal, deskripsi |
| Keranjang | ID produk, jumlah; nama/harga/stock dibaca dari daftar produk terkini |
| Transaksi | ID unik, waktu ISO, pelanggan, jenis pesanan, item snapshot, subtotal, persen/nilai diskon, total, metode, diterima, kembalian |
| Pengaturan | Nama toko, alamat toko, pesan penutup struk |

Browser menyimpan satu dokumen JSON berversi melalui localStorage. Tidak ada data yang dikirim ke server pembayaran. Data antar browser/perangkat tidak tersinkronisasi. Dua tab yang mengubah data bersamaan belum mendukung transaksi atomik; gunakan satu tab untuk demo.

## 8. Antarmuka

Identitas contoh: Seduh, kedai kopi lingkungan dengan menu kopi susu, espresso, matcha, teh, dan pastry. Warna hijau daun menunjukkan tindakan utama; foto menu membantu mengenali produk; panel pesanan memisahkan pemilihan menu dan pembayaran.

Desktop: sidebar navigasi, menu di tengah, pesanan di kanan. Tablet: navigasi lebih ringkas dan produk dua kolom. Ponsel: navigasi horizontal, menu dua kolom, panel pesanan dibuka dari tombol bawah. Seluruh antarmuka berbahasa Indonesia dengan rupiah.

## 9. Persyaratan nonfungsional

- Tidak memerlukan proses build, akun, atau pemasangan framework untuk menjalankan demo.
- Seluruh gambar menu disimpan lokal; font web memiliki fallback jika jaringan tidak tersedia.
- Form memiliki label, navigasi keyboard, focus terlihat, dialog dapat ditutup dengan Escape, dan dukungan reduced motion.
- Data masukan pengguna di-escape sebelum dimasukkan ke HTML.
- Tabel panjang dapat discroll di dalam area tabel tanpa memperlebar halaman.
- Foto menggunakan ukuran yang sesuai dan lazy loading untuk mengurangi pemuatan awal.
- Target browser: Chrome, Edge, Firefox, Safari modern. Verifikasi di browser yang tersedia dicatat dalam README.

## 10. Kriteria penerimaan

| Skenario | Hasil |
| --- | --- |
| Tambah 2 kopi Rp28.000 dan 1 croissant Rp24.000, diskon 10% | Subtotal Rp80.000; diskon Rp8.000; total Rp72.000 |
| Bayar Rp100.000 untuk pesanan tersebut | Kembalian Rp28.000; stok kopi −2 dan croissant −1 |
| Bayar tunai kurang dari total | Pesan menunjukkan kekurangan dan transaksi tidak dibuat |
| Konfirmasi QRIS simulasi | Transaksi metode QRIS tersimpan tanpa menghubungi payment gateway |
| Tambah melebihi stok | Jumlah tetap pada batas stok dan pengguna mendapat penjelasan |
| Buka ulang browser | Produk, transaksi, dan pengaturan tetap tersedia pada origin yang sama |
| Edit harga setelah penjualan | Struk lama tetap menggunakan harga saat penjualan |
| Filter laporan dan ekspor | CSV sesuai transaksi yang masuk rentang pilihan |
| Reset lalu batalkan | Data tetap; konfirmasi reset mengembalikan contoh awal |
| Masukkan markup dalam nama pelanggan/produk | Ditampilkan sebagai teks biasa |

## 11. Pengembangan untuk klien sungguhan

Tahap 1: sepakati alur usaha, branding, perangkat, pajak, dan kebutuhan laporan bersama klien. Tahap 2: bangun backend, autentikasi/peran, database transaksi atomik, audit trail, backup, dan kebijakan data. Tahap 3: integrasi pembayaran resmi, printer, inventori bahan baku, refund, dan fitur cabang sesuai kebutuhan.

Harga jasa, durasi pengerjaan, dan nomor kontak sengaja belum ditetapkan. Semua perlu diisi dengan informasi bisnis pemilik jasa sebelum portfolio digunakan untuk menerima pesanan.
