# Tiket pengembangan Seduh POS fullstack

Stack: React + Vite, Express, SQLite (node:sqlite), CSS biasa. JavaScript ESM. Node.js minimal 22.13; .nvmrc memakai 22.20.0.

Kerjakan **satu tiket per tahap**. Setiap tiket mempunyai dependensi, kriteria penerimaan, dan verifikasi tanpa unit test. Jangan lanjut otomatis ke seluruh backlog. Gunakan npm run check serta curl/browser/manual sesuai fitur. Aturan 25 baris dihitung termasuk baris kosong, komentar, dan JSX; format kode sebelum lint.

| Tiket | Pekerjaan | Dependensi | Status |
| --- | --- | --- | --- |
| [POS-001](POS-001.md) | Fondasi proyek dan aturan kualitas | — | Selesai |
| [POS-002](POS-002.md) | Skema database, migrasi, dan seed | POS-001 | Selesai |
| [POS-003](POS-003.md) | Sesi demo dan hak akses | POS-002 | Selesai |
| [POS-004](POS-004.md) | API produk dan stok | POS-003 | Selesai |
| [POS-005](POS-005.md) | API checkout dan transaksi atomik | POS-004 | Selesai |
| [POS-006](POS-006.md) | Shell React dan masuk demo | POS-003 | Selesai |
| [POS-007](POS-007.md) | Halaman produk React | POS-004, POS-006 | Selesai |
| [POS-008](POS-008.md) | Kasir React dan pembayaran | POS-005, POS-006 | Selesai |
| [POS-009](POS-009.md) | Struk dan riwayat transaksi | POS-008 | Selesai |
| [POS-010](POS-010.md) | Dashboard dan laporan penjualan | POS-005, POS-006 | Selesai |
| [POS-011](POS-011.md) | Pengaturan kedai dan reset ruang demo | POS-007, POS-009, POS-010 | Selesai |
| [POS-012](POS-012.md) | Pemeriksaan integrasi dan penyempurnaan demo | POS-009, POS-010, POS-011 | Selesai |
| [POS-013](POS-013.md) | Deployment fullstack dan panduan portfolio | POS-012 | Tertunda; service Free dibuat, deploy menunggu gangguan Render pulih |

## Urutan kerja

Urutan default mengikuti nomor tiket. POS-006 hanya tergantung POS-003, tetapi dikerjakan setelah endpoint produk/transaksi agar penghubungan UI lebih mudah. POS-013 menangani hosting fullstack; link Sites yang sekarang tetap prototype HTML.

## Definisi selesai setiap tiket

- Kriteria penerimaan terkait tercapai; tidak menandai fitur yang masih placeholder sebagai selesai.
- npm run check lolos untuk perubahan implementasi.
- Verifikasi API/browser/manual relevan dicatat di tiket.
- Tidak ada unit test, rahasia, env, database runtime, atau dependency terpasang yang di-commit.
- Dokumentasi sesuai perilaku nyata dan status tiket diperbarui.

## Batas portfolio

Login adalah sesi demo dengan peran pemilik/kasir, tanpa akun pelanggan atau password produksi. Pembayaran tetap simulasi. Setiap pengunjung menggunakan ruang data sendiri. Payment gateway, akuntansi, banyak cabang, stok bahan baku, dan operasi toko produksi tidak termasuk backlog awal.
