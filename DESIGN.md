# Arah desain Seduh POS

Produk: demo POS kedai kopi untuk calon klien jasa pembuatan web. Tugas utama: menyelesaikan pesanan dan memahami hasil penjualan.

- Daun `#285A46`: navigasi aktif, tombol bayar, identitas kedai.
- Kertas `#FFFFFF`: permukaan kerja dan struk.
- Embun `#F3F6F4`: latar aplikasi.
- Tinta `#24362D`: judul dan isi.
- Jeruk `#F5CC70`: penanda demo dan sorotan menu.
- Batu `#66756C`: informasi sekunder.

Tipografi: Plus Jakarta Sans untuk antarmuka, sistem sans-serif sebagai fallback. Judul memakai bobot 700, isi 400–500, angka harga 700 dengan tabular numerals.

Layout: navigasi kedai di kiri, menu di tengah, pesanan tetap di kanan. Teks rata kiri; harga dan total rata kanan. Kartu dipakai khusus produk yang bisa dipilih; laporan menggunakan tabel dan grafik.

```text
Desktop
┌────────────┬───────────────────────────┬─────────────────┐
│ Seduh      │ Kasir / tanggal           │ Pesanan baru    │
│            │ Sorotan menu kopi         │ Nama pelanggan  │
│ Kasir      │ Cari menu / kategori      │ Makan / bungkus │
│ Dashboard  │ ┌──────┐ ┌──────┐ ┌─────┐ │ Item & jumlah   │
│ Produk     │ │ foto │ │ foto │ │foto │ │                 │
│ Transaksi  │ └──────┘ └──────┘ └─────┘ │ Diskon & total  │
│ Laporan    │ ┌──────┐ ┌──────┐ ┌─────┐ │ Bayar           │
│ Pengaturan │ │ foto │ │ foto │ │foto │ │                 │
└────────────┴───────────────────────────┴─────────────────┘
Mobile: navigasi horizontal, menu dua kolom, tombol pesanan tetap di bawah membuka panel pesanan.
```

Review brief: hindari hero marketing besar yang menggeser menu; pakai sorotan kecil yang relevan untuk kedai. Hindari dashboard dengan semua informasi dalam kartu identik; gunakan struktur kasir dan tabel. Foto minuman menjadi elemen utama; dekorasi lainnya minimal. Radius produk 16px, input 10px, tombol 10px. Tidak ada animasi masuk otomatis. Focus terlihat dan reduced motion dihormati.
