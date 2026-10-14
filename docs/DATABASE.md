# Database Seduh POS

SQLite melalui `node:sqlite`. Skema ada di `server/database/migrations/`; semua tabel memakai `STRICT` sehingga tipe kolom ditegakkan SQLite.

## Perintah

```sh
npm run db:migrate   # terapkan migrasi yang belum tercatat
npm run db:seed      # migrasi + isi workspace contoh "contoh-seduh" bila belum terisi
```

`npm run dev:api` dan `npm start` juga menjalankan migrasi sebelum API menerima request. Lokasi file mengikuti `DATABASE_PATH` (default `data/seduh.sqlite`, diabaikan Git).

## Migrasi

- File `NNN_nama.sql` dibaca berurutan; nomor harus berurutan mulai `001`.
- Setiap migrasi berjalan dalam `BEGIN IMMEDIATE … COMMIT`. Jika satu statement gagal, seluruh migrasi itu di-rollback dan tidak dicatat.
- `schema_migrations` menyimpan versi, nama, checksum SHA-256, dan waktu penerapan. Nama/checksum yang berubah, versi asing, atau urutan log yang berlubang membuat migrasi berhenti. Pemeriksaan diulang di dalam transaksi sebelum penerapan agar startup bersamaan tetap konsisten. Migrasi yang sudah diterapkan **tidak boleh diedit**; perubahan skema dibuat sebagai file baru.
- Versi `001_initial_schema` tetap utuh. Versi `002_persistence_integrity` menutup perubahan kepemilikan produk dan memperketat format jam timestamp.

## Tabel

| Tabel | Isi | Catatan |
| --- | --- | --- |
| `demo_workspaces` | Ruang data per pengunjung | `seeded_at` menandai seed sudah dijalankan |
| `sessions` | Sesi demo | `token_hash` SHA-256 (64 hex), peran `owner`/`cashier` |
| `settings` | Nama, alamat, pesan struk | Satu baris per workspace |
| `products` | Menu dan stok | `seed_key` unik per workspace untuk data contoh |
| `transactions` | Header penjualan | Snapshot identitas toko, peran kasir, diskon, pembayaran |
| `transaction_items` | Baris penjualan | Snapshot nama/kategori/foto/harga; `product_id` menjadi NULL saat menu dihapus |

Semua tabel domain memiliki `workspace_id` dengan `ON DELETE CASCADE` ke `demo_workspaces`. Indeks utama: `transactions (workspace_id, created_at)` untuk filter tanggal, `products (workspace_id, category, name)`, dan `sessions (workspace_id, expires_at)`. Trigger menolak item transaksi yang menunjuk produk workspace lain. `products.workspace_id` tidak boleh diubah agar referensi struk lama tidak menyeberang workspace.

## Aturan data

- Waktu disimpan sebagai ISO UTC dari `Date#toISOString()` (`2026-10-14T03:00:00.000Z`); format lain ditolak CHECK. Batas hari Asia/Jakarta dikonversi ke UTC sebelum query.
- SQLite menerima jam `24:00`, tetapi aplikasi memakai `00:00` pada hari berikutnya. Migrasi 002 menormalisasi timestamp lama pada instant yang sama; trigger menolak jam 24 pada INSERT/UPDATE berikutnya, termasuk kolom waktu nullable.
- Uang adalah integer rupiah. Harga 1.000–10.000.000, stok 0–100.000, qty 1–100.000, diskon 0–100%.
- CHECK memastikan `discount_amount = round(subtotal × persen / 100)`, `total = subtotal − diskon`, `line_total = harga × qty`, uang diterima ≥ total, kembalian = diterima − total, dan QRIS tidak punya kembalian.
- `subtotal = Σ line_total` tidak bisa ditegakkan CHECK SQLite; service checkout (POS-005) wajib menghitungnya di server, memakai `server/lib/money.js`.
- `idempotency_key` dan `number` unik per workspace. Seed memakai key `seed-<nomor>`.
- Foto produk berupa kunci preset (`iced-coffee`, `latte`, `americano`, `matcha`, `chocolate`, `croissant`, `tea`, `cinnamon`), bukan URL bebas.

Jika database lama sudah berisi item yang merujuk produk workspace lain, migrasi 002 berhenti dan rollback. Data tersebut harus dikoreksi secara eksplisit; migrasi tidak menebak pemilik yang benar atau memindahkan data pengunjung.

## Sesi demo

- Setiap login tanpa sesi aktif membuat satu `demo_workspaces` baru beserta seed dan sesi dalam satu transaksi. Ruang demo kedaluwarsa dihapus pada saat yang sama.
- Ganti peran mencabut sesi lama (`revoked_at`) lalu menerbitkan sesi baru di workspace yang sama. Hanya ada satu sesi aktif per workspace.
- `sessions.expires_at` sama dengan `demo_workspaces.expires_at`; ganti peran tidak memperpanjang ruang demo. `last_active_at` diperbarui saat ganti peran.
- Logout mencabut sesi dengan update bersyarat dalam transaksi sebelum menghapus workspace (CASCADE ke sesi, produk, transaksi, pengaturan). Jika sesi sudah dicabut saat pergantian peran, logout tertunda tidak menghapus workspace/sesi yang baru.

## Seed

`seedWorkspaceData(database, workspaceId, now)` tidak membuka transaksi sendiri sehingga bisa digabung dengan pembuatan sesi (POS-003) atau reset (POS-011). `seedWorkspace()` membungkusnya dalam satu transaksi. Seed dilewati jika `seeded_at` sudah terisi; reset harus menghapus data dan mengosongkan `seeded_at` dalam transaksi yang sama.

Isi seed: pengaturan Seduh Coffee, 9 menu dari prototype, dan transaksi 7 hari terakhir menurut Asia/Jakarta (4–6 per hari mulai 10.00 WIB, sebagian diskon 10%, tunai/QRIS). Jadwal yang masih di masa depan dilewati, jadi seed sebelum 10.00 WIB belum punya transaksi hari ini. Stok menu adalah stok saat ini; transaksi contoh tidak mengurangi stok lagi.
