# API Seduh POS

API JSON satu origin dengan React. Prefix `/api`. Seluruh endpoint di tabel kontrak sudah diimplementasikan: healthcheck, sesi demo, produk, transaksi, dashboard, laporan, pengaturan, dan reset demo. Semua respons `/api` memakai `Cache-Control: no-store`.

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
- Dengan sesi aktif: **ganti peran** pada ruang demo yang sama. Token lama dicabut, token baru diterbitkan, dan masa berlaku ruang demo tidak diperpanjang. Waktu dan sesi diperiksa ulang setelah kunci tulis didapat; bila workspace berakhir ketika request menunggu, login membuat workspace baru menurut batas kapasitas.

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

## Transaksi — POS-005

Kasir dan pemilik. Tanpa sesi 401. Transaksi workspace lain atau ID salah format mendapat 404.

### POST /api/transactions

Checkout simulasi. Server menghitung harga, subtotal, diskon, total, dan kembalian dari **harga database saat ini**. Harga, total, peran, atau workspace dari klien tidak diterima (field tersebut ditolak 400).

```json
{
  "idempotencyKey": "4f1c0a3e-checkout-01",
  "items": [
    { "productId": "…", "quantity": 2 },
    { "productId": "…", "quantity": 1 }
  ],
  "discountPercent": 10,
  "customerName": "Raka",
  "orderType": "dine_in",
  "paymentMethod": "cash",
  "amountReceived": 100000
}
```

| Field | Aturan |
| --- | --- |
| `idempotencyKey` | Wajib, 8–100 karakter `A-Z a-z 0-9 - _`. Buat satu key per konfirmasi bayar dan pakai ulang saat retry |
| `items` | 1–50 item; `productId` UUID; `quantity` integer 1–100.000; produk tidak boleh ganda; hanya dua field itu |
| `discountPercent` | Opsional, integer 0–100, default 0. Diskon = round(subtotal × persen / 100) |
| `customerName` | Opsional, ≤60 karakter; kosong menjadi `Pelanggan` |
| `orderType` | `dine_in` atau `takeaway` |
| `paymentMethod` | `cash` atau `qris` (simulasi, tanpa payment gateway) |
| `amountReceived` | Wajib untuk `cash` (integer rupiah 0–1.000.000.000.000, harus ≥ total). Tidak boleh dikirim untuk `qris`, termasuk `null`; QRIS selalu sebesar total |

Subtotal maksimal Rp1.000.000.000.000. Seluruh proses berjalan dalam satu transaksi SQLite (`BEGIN IMMEDIATE`): sesi diperiksa ulang, idempotency key dicek, harga dibaca, stok dikurangi bersyarat (`stock >= qty`), lalu transaksi, item, dan snapshot toko disimpan. Jika satu langkah gagal, tidak ada stok atau transaksi yang berubah.

| Status | Kode | Kapan |
| --- | --- | --- |
| 201 | — | Transaksi baru; `replayed: false` |
| 200 | — | Key yang sama dengan payload sama; transaksi yang sama dikembalikan, `replayed: true`, stok tidak berubah lagi |
| 400 | `VALIDATION_ERROR` | Body tidak valid; `fields.amountReceived` untuk uang kurang (`Uang kurang Rp4.000. Minimal Rp84.000.`) |
| 409 | `IDEMPOTENCY_CONFLICT` | Key yang sama dengan payload berbeda |
| 409 | `PRODUCT_UNAVAILABLE` | Produk dihapus atau bukan milik workspace sesi |
| 409 | `INSUFFICIENT_STOCK` | Stok tidak cukup; pesan menyebut sisa stok |
| 401 | `UNAUTHENTICATED`/`SESSION_EXPIRED` | Sesi dicabut atau kedaluwarsa saat checkout menunggu |

Nomor transaksi `SDH-YYYYMMDD-NNN` berurutan per hari Asia/Jakarta per workspace. Respons 201/200:

```json
{
  "transaction": {
    "id": "fd185ed8-6a97-41d0-a697-99ca00053101",
    "number": "SDH-20261015-001",
    "createdAt": "2026-10-14T17:27:17.020Z",
    "cashierRole": "cashier",
    "customerName": "Raka",
    "orderType": "dine_in",
    "items": [
      {
        "lineNumber": 1,
        "productId": "9739b8e2-…",
        "name": "Kopi Susu Seduh",
        "category": "Kopi",
        "imageKey": "iced-coffee",
        "unitPrice": 28000,
        "quantity": 2,
        "lineTotal": 56000
      },
      {
        "lineNumber": 2,
        "productId": "da61fdf2-…",
        "name": "Butter Croissant",
        "category": "Pastry",
        "imageKey": "croissant",
        "unitPrice": 24000,
        "quantity": 1,
        "lineTotal": 24000
      }
    ],
    "subtotal": 80000,
    "discountPercent": 10,
    "discountAmount": 8000,
    "total": 72000,
    "paymentMethod": "cash",
    "amountReceived": 100000,
    "changeAmount": 28000,
    "store": {
      "name": "Seduh Coffee",
      "address": "Jl. Melati No. 12, Jakarta",
      "receiptMessage": "Terima kasih sudah singgah. Sampai seduhan berikutnya!"
    }
  },
  "replayed": false
}
```

Item dan `store` adalah snapshot saat penjualan; perubahan harga, penghapusan menu, atau perubahan pengaturan toko tidak mengubah transaksi lama. `productId` item bernilai `null` jika menu sudah dihapus. Replay membandingkan payload setelah trim/default diterapkan; urutan item juga harus tetap sama saat retry.

### GET /api/transactions

Query opsional: `search` (≤60, nomor atau nama pelanggan), `date` (`YYYY-MM-DD`, tanggal kalender valid, satu hari Asia/Jakarta), `limit` (1–100, default 50), `offset` (0–100.000, default 0). Urutan terbaru dulu. Tanggal seperti `2026-13-01`, `2026-01-00`, atau `2026-02-30` mendapat 400 `VALIDATION_ERROR` dengan `fields.date`.

```json
{
  "transactions": [
    {
      "id": "…",
      "number": "SDH-20261015-001",
      "createdAt": "2026-10-14T17:27:17.020Z",
      "customerName": "Raka",
      "orderType": "dine_in",
      "itemCount": 3,
      "total": 72000,
      "paymentMethod": "cash"
    }
  ],
  "total": 32,
  "limit": 50,
  "offset": 0
}
```

### GET /api/transactions/:id

HTTP 200 `{ "transaction": { … } }` dengan bentuk yang sama seperti respons checkout.

## Dashboard dan laporan — POS-010

Khusus pemilik: kasir mendapat 403 dan tanpa sesi 401. Semua angka dihitung server dari transaksi workspace sesi. Query dalam satu dashboard/laporan memakai snapshot transaksi baca SQLite yang sama. **Pendapatan** adalah total setelah diskon; laporan tidak menghitung laba. Hari dan periode memakai kalender Asia/Jakarta: periode `from`–`to` inklusif dikonversi ke UTC `[00.00 WIB from, 00.00 WIB hari setelah to)`.

### GET /api/dashboard

```json
{
  "today": "2026-10-15",
  "summary": { "revenue": 72000, "transactionCount": 1, "averageTransaction": 72000 },
  "salesByDay": [{ "date": "2026-10-09", "revenue": 261200, "transactionCount": 4 }, …],
  "topProducts": [{ "id": "…", "name": "Cinnamon Roll", "category": "Pastry", "imageKey": "cinnamon", "quantity": 11 }],
  "lowStockThreshold": 10,
  "lowStock": [{ "id": "…", "name": "Cinnamon Roll", "category": "Pastry", "stock": 8, "imageKey": "cinnamon" }],
  "recentTransactions": [{ "id": "…", "number": "SDH-20261015-001", … }]
}
```

- `summary` untuk hari ini (WIB). `averageTransaction = round(revenue / transactionCount)`, atau 0.
- `salesByDay` berisi tepat 7 hari sampai hari ini; hari tanpa transaksi bernilai 0.
- `topProducts` berisi 4 produk dengan unit terjual terbanyak sepanjang waktu, dari snapshot item. Pengelompokan per produk, atau per nama snapshot bila menu sudah dihapus. `id` adalah key kelompok yang stabil; nama mengikuti waktu transaksi terakhir (id item menjadi pemutus seri). Nama menu yang sama tidak menggabungkan produk aktif yang berbeda.
- `lowStock` berisi produk dengan stok ≤ 10. `recentTransactions` berisi 5 transaksi terbaru dengan bentuk sama seperti daftar transaksi.

### GET /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD

`from` dan `to` wajib, berupa tanggal kalender yang valid, dengan `from ≤ to` dan rentang maksimal 366 hari. Pelanggaran mendapat 400 `VALIDATION_ERROR` dengan `fields.from`/`fields.to`.

```json
{
  "period": { "from": "2026-10-09", "to": "2026-10-15" },
  "summary": {
    "revenue": 1993600,
    "transactionCount": 31,
    "averageTransaction": 64310,
    "unitsSold": 77,
    "subtotalBeforeDiscount": 2050000,
    "discountTotal": 56400
  },
  "byPaymentMethod": {
    "cash": { "revenue": 920000, "transactionCount": 17 },
    "qris": { "revenue": 1073600, "transactionCount": 14 }
  },
  "byDay": [{ "date": "2026-10-09", "revenue": 261200, "transactionCount": 4 }, …],
  "topProducts": [{ "id": "…", "name": "…", "category": "…", "imageKey": "…", "quantity": 11 }]
}
```

`byDay` mencakup setiap hari dalam periode, termasuk yang bernilai 0. Jumlah pendapatan/transaksi harian dan menurut metode sama dengan ringkasan. `topProducts` berisi maksimal 10 produk menurut unit dalam periode.

### GET /api/reports/export?from=…&to=…

Validasi sama dengan `/api/reports`. HTTP 200 `text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="seduh-laporan-FROM-sampai-TO.csv"`, dan `X-Row-Count`. Isinya UTF-8 dengan BOM dan baris CRLF. Kolomnya: Nomor transaksi, Waktu (WIB), Pelanggan, Jenis pesanan, Metode pembayaran, Jumlah item, Subtotal (Rp), Diskon (%), Diskon (Rp), Total setelah diskon (Rp), Uang diterima (Rp), Kembalian (Rp).

Urutan baris dari yang terlama. Semua sel dikutip dan tanda kutip digandakan. Sel yang diawali `=`, `+`, `-`, `@`, tab, atau CR diberi awalan `'` agar tidak dieksekusi sebagai formula spreadsheet. Periode kosong menghasilkan header saja.

## Pengaturan dan reset demo — POS-011

### GET /api/settings

Kasir dan pemilik. Hasil `{ "settings": { "storeName", "storeAddress", "receiptMessage", "updatedAt" } }` untuk workspace sesi.

### PATCH /api/settings

Pemilik. Field opsional, minimal satu: `storeName` (1–60 karakter setelah trim), `storeAddress` (1–150), dan `receiptMessage` (1–200). Karakter kontrol ditolak; field lain atau body kosong mendapat 400. Sesi diperiksa ulang di dalam transaksi tulis.

Identitas baru hanya dipakai transaksi berikutnya. Struk lama tetap memakai snapshot `store` saat penjualan.

### POST /api/demo/reset

Pemilik. Body wajib `{ "confirmation": "reset" }`; tanpa konfirmasi itu mendapat 400. Langkahnya berjalan dalam satu transaksi SQLite `BEGIN IMMEDIATE`:

1. Sesi diperiksa ulang.
2. Transaksi, item, produk, dan pengaturan **workspace sesi saja** dihapus.
3. `seeded_at` dikosongkan, lalu seed contoh dijalankan ulang dengan tanggal relatif terbaru.

Bila ada langkah yang gagal, seluruh perubahan di-rollback. Sesi tetap berlaku dan workspace lain tidak tersentuh. Hasil 200 `{ "reset": true, "products": 9, "transactions": 30 }`; jumlah transaksi bergantung jam saat reset.

ID produk berganti setelah reset, sehingga replay idempotency key lama dengan produk lama mendapat 409 `PRODUCT_UNAVAILABLE`, bukan transaksi ganda. Reset tidak memperpanjang masa berlaku workspace/sesi. Frontend mengunci keranjang selama request dan mengabaikan respons pembayaran yang dibatalkan oleh reset. Endpoint reset belum memiliki idempotency key: retry sesudah respons hilang menjalankan reset baru.

## Keamanan dan batas

Berlaku untuk semua endpoint `/api` (POS-012):

| Status | Kode | Kapan |
| --- | --- | --- |
| 403 | `ORIGIN_REJECTED` | POST/PATCH/DELETE dengan header `Origin` selain origin aplikasi (atau `ALLOWED_ORIGINS`), atau tanpa `Origin` tetapi `Sec-Fetch-Site: cross-site`/`same-site` |
| 413 | `BODY_TOO_LARGE` | Body JSON lebih dari 100 KB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Charset/encoding body tidak didukung |
| 429 | `RATE_LIMITED` | Melebihi `API_RATE_LIMIT` request per IP per menit (default 300), atau `DEMO_SESSION_LIMIT` POST `/api/demo/sessions` per IP per 10 menit (default 30); disertai `Retry-After` dalam detik |
| 503 | `DEMO_CAPACITY` | Membuka ruang demo baru saat ruang demo aktif sudah mencapai `DEMO_MAX_WORKSPACES` (default 500). Ganti peran pada ruang demo yang ada tetap diizinkan |

Origin dibandingkan dalam bentuk kanonis HTTP(S), sehingga nama host dan port bawaan dinormalisasi. `ALLOWED_ORIGINS` menerima daftar origin yang valid (root slash opsional), bukan wildcard, `null`, atau URL dengan kredensial/path/query/fragment. Ini pemeriksaan origin, bukan konfigurasi CORS.

Klien non-browser tanpa `Origin`/`Sec-Fetch-Site` (misalnya curl) tetap diterima. Cookie sudah `SameSite=Strict`, dan body mutasi wajib JSON.

Semua respons membawa:

- `Content-Security-Policy` (`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; …`);
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`, `Cross-Origin-Opener-Policy: same-origin`, dan `Permissions-Policy`;
- `Strict-Transport-Security` saat request HTTPS.

Hitungan rate limit ada di memori proses dan hilang saat restart; banyak instance membutuhkan penyimpanan hitungan bersama. Setiap limiter dibatasi 10.000 entri IP. IP baru mendapat 429 saat penyimpanan penuh; entri aktif tidak digusur, dan entri kedaluwarsa dibersihkan paling sering sekali per detik saat diperlukan.

Kapasitas workspace dihitung dari tabel SQLite di dalam transaksi tulis setelah pembersihan data kedaluwarsa. Batas tetap berlaku sesudah restart serta pada proses yang berbagi database yang sama.

## Ringkasan endpoint

| Metode | Path | Akses | Tiket |
| --- | --- | --- | --- |
| POST | /api/demo/sessions | Publik — aktif | POS-003 |
| GET | /api/session | Sesi demo — aktif | POS-003 |
| DELETE | /api/session | Publik, idempoten — aktif | POS-003 |
| GET | /api/products | Kasir/pemilik — aktif | POS-004 |
| POST | /api/products | Pemilik — aktif | POS-004 |
| PATCH | /api/products/:id | Pemilik — aktif | POS-004 |
| DELETE | /api/products/:id | Pemilik — aktif | POS-004 |
| POST | /api/transactions | Kasir/pemilik — aktif | POS-005 |
| GET | /api/transactions | Kasir/pemilik — aktif | POS-005 |
| GET | /api/transactions/:id | Kasir/pemilik — aktif | POS-005 |
| GET | /api/dashboard | Pemilik — aktif | POS-010 |
| GET | /api/reports | Pemilik — aktif | POS-010 |
| GET | /api/reports/export | Pemilik — aktif | POS-010 |
| GET | /api/settings | Kasir/pemilik — aktif | POS-011 |
| PATCH | /api/settings | Pemilik — aktif | POS-011 |
| POST | /api/demo/reset | Pemilik — aktif | POS-011 |

Workspace dan peran berasal dari sesi server. Pengunjung tidak bisa memilih workspace orang lain melalui query/payload. Semua uang berupa integer rupiah. Pembayaran tetap simulasi. Backend menghitung harga/diskon/total/kembalian dan mengubah stok atomik.

Detail payload dan response fitur ditambahkan bersama implementasi tiket masing-masing agar dokumentasi tidak mendahului perilaku aktual.
