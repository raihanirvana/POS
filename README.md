# Seduh POS

Demo portfolio POS kedai kopi dengan HTML, CSS, dan JavaScript biasa. Gunakan [PRD.md](PRD.md) untuk membaca persyaratan produk, atau buka halaman Panduan & PRD dari aplikasi.

## Menjalankan

Buka `dist/index.html` langsung di browser, atau jalankan dari folder ini:

```sh
python3 -m http.server 8080 --directory dist
```

Lalu buka http://localhost:8080. Tidak ada proses build atau instalasi dependency aplikasi.

## Yang bisa dicoba

Kasir, pencarian/kategori, keranjang, diskon, pembayaran simulasi tunai/QRIS, cetak struk, dashboard, produk CRUD, riwayat transaksi, laporan dengan filter dan CSV, pengaturan toko, serta reset demo.

Data tersimpan di localStorage browser dan tidak tersinkronisasi. Pembayaran adalah simulasi. Peran belum dibatasi. Gunakan satu tab; ini contoh portfolio, belum sistem operasional produksi.

## Struktur

- `dist/index.html`: kerangka antarmuka.
- `dist/styles.css`: desain responsif.
- `dist/app.js`: logika aplikasi dan persistensi.
- `dist/prd.html`: PRD yang bisa dibaca di browser.
- `dist/assets/`: foto menu lokal dari Unsplash.
- `PRD.md`: persyaratan produk.
- `DESIGN.md`: keputusan desain menggunakan frontend-design.

Font Plus Jakarta Sans dimuat dari Google Fonts; tanpa jaringan aplikasi memakai font sistem. Foto menu bersifat ilustrasi dan tidak mewakili foto produk bisnis tertentu. Tidak ada nomor WhatsApp fiktif atau payment gateway aktif.

## Verifikasi

Diuji pada Google Chrome melalui Playwright: pencarian/kategori, batas stok, diskon 10%, tunai kurang, kembalian, pembayaran QRIS simulasi, struk, persistensi, produk CRUD, riwayat/filter, CSV, pengaturan/reset, escaping masukan, snapshot harga transaksi, serta kegagalan penyimpanan yang tidak mengubah transaksi atau stok. Keenam halaman diperiksa pada lebar 360, 390, 768, dan 1024px; tampilan desktop diperiksa pada 1440px. Checkout ponsel dan PRD web juga dicoba.

Cetak memakai dialog cetak browser; integrasi printer fisik belum diuji. Firefox dan Safari belum diuji. Screenshot contoh ada di folder `screenshots/`.
