# API Seduh POS

API JSON satu origin dengan React. Prefix `/api`. Saat ini **healthcheck, sesi demo, dan produk** sudah diimplementasikan; endpoint lain di tabel rencana merupakan kontrak untuk tiket berikutnya. Semua respons `/api` memakai `Cache-Control: no-store`.

## Endpoint aktif — POS-001

`GET /api/health` memeriksa SQLite dengan query `SELECT 1` sebelum mengirim HTTP 200:

```json
{
  "status": "ok",
  "service": "seduh-pos-api",
  "database": "connected",
  "timestamp": "2026-10-14T00:00:00.000Z"
}
```

Waktu di atas hanya contoh format ISO UTC. Waktu UI bisnis menggunakan Asia/Jakarta pada tiket fitur laporan.

Respons mempunyai `X-Request-Id`. Endpoint API yang tidak ditemukan mengembalikan HTTP 404:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Endpoint API tidak ditemukan."
  }
}
```

Payload JSON tidak valid mendapat 400. Ukuran JSON dibatasi 100 KB; payload lebih besar mendapat 413 dengan kode BODY_TOO_LARGE. Error internal tidak membocorkan stack atau lokasi database ke browser. Aturan validasi fitur/otorisasi mengikuti tiket terkait.

Charset atau content encoding yang tidak didukung mendapat 415 `UNSUPPORTED_MEDIA_TYPE`, bukan error server 500.

## Sesi demo — POS-003

Login demo tanpa password dengan peran **pemilik** (`owner`) atau **kasir** (`cashier`). Ini bukan autentikasi akun produksi: siapa pun dapat membuka ruang demo sebagai peran mana pun. Peran dipakai untuk menunjukkan pembatasan fitur, bukan sebagai kontrol keamanan.

Sesi disimpan di server. Browser hanya menerima cookie `seduh_session`, yaitu token acak 32 byte (base64url). Database menyimpan hash SHA-256 token, bukan tokennya. Atribut cookie: `HttpOnly`, `SameSite=Strict`, `Path=/api`, `Expires` sesuai akhir ruang demo, dan `Secure` jika request HTTPS. Di belakang reverse proxy, `Secure` hanya muncul bila `TRUST_PROXY` diisi jumlah hop/alamat proxy. Workspace dan peran setiap request dibaca dari tabel `sessions`; header, query, atau body tidak dapat memilihnya.

### POST /api/demo/sessions

Publik. Body hanya boleh berisi `role`:

```json
{ "role": "cashier" }
```

- Tanpa sesi aktif: membuat ruang demo baru, mengisi data contoh, dan menerbitkan sesi dalam satu transaksi SQLite. Ruang demo yang sudah kedaluwarsa ikut dibersihkan.
- Dengan sesi aktif: **ganti peran** pada ruang demo yang sama. Token lama dicabut, token baru diterbitkan, dan masa berlaku ruang demo tidak diperpanjang.

HTTP 201:

```json
{
  "session": {
    "role": "cashier",
    "roleLabel": "Kasir",
    "startedAt": "2026-10-14T16:37:19.760Z",
    "expiresAt": "2026-10-15T04:37:19.760Z"
  },
  "workspaceCreated": true
}
```

Body selain objek JSON, field selain `role` (misalnya `workspaceId`), atau peran selain `owner`/`cashier` mendapat 400 `VALIDATION_ERROR`.

### GET /api/session

HTTP 200 `{ "session": { ... } }` dengan bentuk yang sama seperti di atas. Tanpa sesi mendapat 401.

### DELETE /api/session

Keluar dari demo dan menghapus cookie. Jika sesi masih aktif saat transaksi logout berjalan, seluruh data workspace dihapus. Token diperiksa kembali di dalam transaksi: logout yang tertunda dengan token yang sudah dicabut tidak menghapus workspace sesi penggantinya. Selalu 204, juga tanpa sesi.

### Error sesi dan peran

| Status | Kode | Kapan |
| --- | --- | --- |
| 401 | `UNAUTHENTICATED` | Tanpa cookie, token salah format/tidak dikenal, sesi dicabut karena ganti peran, atau ruang demo sudah dihapus |
| 401 | `SESSION_EXPIRED` | Sesi atau ruang demo melewati `expiresAt` |
| 403 | `FORBIDDEN` | Peran sesi tidak termasuk peran endpoint (misalnya kasir memanggil endpoint pemilik) |

Untuk 401 dengan cookie yang tidak valid atau kedaluwarsa, respons juga menghapus cookie. Umur ruang demo diatur `DEMO_TTL_MINUTES` (default 720 menit = 12 jam).

## Error validasi

Error 400 `VALIDATION_ERROR` dapat membawa `fields` berisi pesan per field untuk form:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data produk.",
    "fields": { "price": "Harga harus bilangan bulat Rp1.000 sampai Rp10.000.000." },
    "requestId": "…"
  }
}
```

## Produk — POS-004

Semua endpoint produk memerlukan sesi (tanpa sesi 401). Data selalu dibatasi workspace sesi; produk milik workspace lain atau ID yang salah format mendapat 404 `NOT_FOUND`, sehingga keberadaannya tidak bocor. Kasir yang memanggil POST/PATCH/DELETE mendapat 403 `FORBIDDEN`. Setiap mutasi memeriksa ulang sesi, masa berlaku, dan peran setelah mendapat kunci transaksi SQLite. Token yang sudah dicabut ketika request menunggu mendapat 401 tanpa mengubah produk; cookie lama ikut dihapus.

Bentuk produk:

```json
{
  "id": "2423b98b-f641-4760-8256-83d3072b1caf",
  "name": "Kopi Susu Seduh",
  "category": "Kopi",
  "price": 28000,
  "stock": 35,
  "imageKey": "iced-coffee",
  "description": "Espresso, susu & gula aren",
  "tag": "Favorit",
  "createdAt": "2026-10-14T17:04:58.800Z",
  "updatedAt": "2026-10-14T17:04:58.800Z"
}
```

### GET /api/products

Kasir dan pemilik. Query opsional `category` (`Kopi`, `Non-kopi`, `Pastry`) dan `search` (maksimal 60 karakter; mencari di nama dan deskripsi, tidak peka huruf besar/kecil untuk huruf ASCII; `%` dan `_` diperlakukan sebagai teks). Kategori lain, kategori ganda, atau kata kunci terlalu panjang mendapat 400. Parameter lain seperti `workspaceId` diabaikan. Urutan mengikuti waktu dibuat.

```json
{
  "products": [ … ],
  "filters": { "category": "Kopi", "search": "latte" },
  "catalog": {
    "categories": ["Kopi", "Non-kopi", "Pastry"],
    "imagePresets": [{ "key": "latte", "label": "Latte", "category": "Kopi" }, …]
  }
}
```

### POST /api/products

Pemilik. Wajib: `name` (1–60 karakter setelah trim), `category`, `price` (integer 1.000–10.000.000), `stock` (integer 0–100.000). Opsional: `description` (≤100, default kosong), `tag` (≤30 atau `null`), `imageKey` (preset yang **sesuai kategori**; default `latte`/`matcha`/`croissant`). Angka harus berupa number JSON, bukan string. Karakter kontrol C0/C1/DEL dan Unicode dengan surrogate yang tidak berpasangan ditolak; emoji valid dihitung per karakter Unicode. Field lain (`id`, `workspaceId`, `seedKey`, …) ditolak 400. Hasil: 201 `{ "product": { … } }`.

### PATCH /api/products/:id

Pemilik. Field sama seperti POST, semuanya opsional, minimal satu. Body kosong mendapat 400. Jika `category` berubah tanpa `imageKey`, foto lama dipertahankan bila sesuai kategori baru; jika tidak, kembali ke foto default kategori. Hasil: 200 `{ "product": { … } }`. Stok yang dikirim adalah nilai baru, bukan selisih.

### DELETE /api/products/:id

Pemilik. Hasil 204. Struk lama tetap utuh karena item transaksi menyimpan snapshot nama, kategori, foto, dan harga; referensi `product_id` pada item menjadi `NULL`.

## Kontrak yang direncanakan

| Metode | Path | Akses | Tiket |
| --- | --- | --- | --- |
| POST | /api/demo/sessions | Publik — aktif | POS-003 |
| GET | /api/session | Sesi demo — aktif | POS-003 |
| DELETE | /api/session | Publik, idempoten — aktif | POS-003 |
| GET | /api/products | Kasir/pemilik — aktif | POS-004 |
| POST | /api/products | Pemilik — aktif | POS-004 |
| PATCH | /api/products/:id | Pemilik — aktif | POS-004 |
| DELETE | /api/products/:id | Pemilik — aktif | POS-004 |
| POST | /api/transactions | Kasir/pemilik | POS-005 |
| GET | /api/transactions | Kasir/pemilik | POS-005 |
| GET | /api/transactions/:id | Kasir/pemilik | POS-005 |
| GET | /api/dashboard | Pemilik | POS-010 |
| GET | /api/reports | Pemilik | POS-010 |
| GET | /api/reports/export | Pemilik | POS-010 |
| GET | /api/settings | Kasir/pemilik | POS-011 |
| PATCH | /api/settings | Pemilik | POS-011 |
| POST | /api/demo/reset | Pemilik | POS-011 |

Workspace dan peran berasal dari sesi server. Pengunjung tidak bisa memilih workspace orang lain melalui query/payload. Semua uang berupa integer rupiah. Pembayaran tetap simulasi. Backend menghitung harga/diskon/total/kembalian dan mengubah stok atomik.

Detail payload dan response fitur ditambahkan bersama implementasi tiket masing-masing agar dokumentasi tidak mendahului perilaku aktual.
