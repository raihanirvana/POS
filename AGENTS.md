# Aturan proyek Seduh POS

## Cara bekerja

- Kerjakan satu tiket dari `docs/tickets/README.md` dalam satu tahap. Mulai dari dependensi yang sudah selesai.
- Baca tiket dan kriteria penerimaannya sebelum mengubah kode. Jangan otomatis mengerjakan semua tiket berikutnya.
- Perbarui status dan bukti verifikasi tiket setelah kriteria penerimaan benar-benar tercapai.
- Pertahankan desain Seduh dalam `DESIGN.md` dan gunakan skill frontend-design untuk perubahan antarmuka.

## Kualitas kode

- Setiap fungsi maksimal **25 baris**, termasuk baris kosong, komentar, dan JSX. Berlaku juga untuk callback, arrow function, dan IIFE.
- Pecah kode berdasarkan tanggung jawab. Gunakan nama yang menjelaskan tujuan fungsi.
- Jangan memadatkan banyak statement ke satu baris, memanjangkan satu baris untuk mengakali batas, atau menonaktifkan aturan ESLint.
- Gunakan JavaScript ESM, komponen React kecil, serta pemisahan route, service, repository, dan validasi di server saat fitur tersebut diperlukan.
- Jalankan `npm run lint` dan `npm run build` sebelum menandai tiket implementasi selesai.

## Verifikasi

- **Tidak membuat unit test**, sesuai instruksi pemilik proyek.
- Verifikasi melalui lint, build, curl/API smoke check, dan percobaan browser/manual sesuai perubahan.
- Catat hasil yang benar-benar dicoba. Jangan mengklaim browser atau deployment yang belum diverifikasi.

## Data dan hosting

- Harga, diskon, total, otorisasi, dan perubahan stok divalidasi di server; frontend bukan sumber kebenaran.
- Data pengunjung demo dipisahkan per ruang demo. Jangan membagikan data atau hak akses antar ruang demo.
- Jangan commit `.env`, database SQLite, token, atau data runtime.
- `dist/` adalah prototype HTML terdahulu. Kode fullstack dikembangkan di `client/` dan `server/`; hasil React berada di `client/dist/`.
- `.openai/hosting.json` saat ini menunjuk hosting prototype statis. Keputusan hosting fullstack ditangani pada tiket POS-013; jangan mengubah project_id atau mengklaim backend telah dipublikasikan.
