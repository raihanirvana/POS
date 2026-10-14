// Menu mengikuti hak akses API: kasir hanya kasir dan transaksi; pemilik semua halaman.
export const appRoutes = [
  {
    path: '/kasir',
    label: 'Kasir',
    icon: 'register',
    roles: ['owner', 'cashier'],
    title: 'Kasir',
    subtitle: 'Seduhan yang baik dimulai dari sini.',
    ticket: 'POS-008',
    upcoming: 'Pilih menu, atur pesanan, dan bayar tunai atau QRIS simulasi.',
    prototypeHash: 'kasir',
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'grid',
    roles: ['owner'],
    title: 'Dashboard',
    subtitle: 'Lihat cerita kedaimu hari ini.',
    ticket: 'POS-010',
    upcoming: 'Penjualan hari ini, rata-rata transaksi, stok menipis, dan grafik 7 hari.',
    prototypeHash: 'dashboard',
  },
  {
    path: '/produk',
    label: 'Produk',
    icon: 'box',
    roles: ['owner'],
    title: 'Produk',
    subtitle: 'Menu yang diracik, stok yang terjaga.',
    ticket: 'POS-007',
    upcoming: 'Tambah, ubah, dan hapus menu beserta harga, stok, dan foto preset.',
    prototypeHash: 'produk',
  },
  {
    path: '/transaksi',
    label: 'Transaksi',
    icon: 'receipt',
    roles: ['owner', 'cashier'],
    title: 'Transaksi',
    subtitle: 'Setiap pesanan, tercatat dengan rapi.',
    ticket: 'POS-009',
    upcoming:
      'Riwayat, pencarian nomor atau pelanggan, filter tanggal, dan buka ulang struk.',
    prototypeHash: 'transaksi',
  },
  {
    path: '/laporan',
    label: 'Laporan',
    icon: 'chart',
    roles: ['owner'],
    title: 'Laporan penjualan',
    subtitle: 'Kenali angka di balik setiap seduhan.',
    ticket: 'POS-010',
    upcoming: 'Pendapatan per periode, produk terjual, dan ekspor CSV.',
    prototypeHash: 'laporan',
  },
  {
    path: '/pengaturan',
    label: 'Pengaturan',
    icon: 'settings',
    roles: ['owner'],
    title: 'Pengaturan toko',
    subtitle: 'Buat pengalaman ini terasa seperti kedaimu.',
    ticket: 'POS-011',
    upcoming: 'Nama toko, alamat, pesan struk, dan reset ruang demo.',
    prototypeHash: 'pengaturan',
  },
];

export const homePath = '/kasir';
export const loginPath = '/masuk';

export function findRoute(pathname) {
  return appRoutes.find((route) => route.path === pathname);
}

export function routesForRole(role) {
  return appRoutes.filter((route) => route.roles.includes(role));
}

// Hanya route aplikasi yang dikenal dan diizinkan untuk peran itu boleh menjadi tujuan
// setelah masuk; nilai lain (termasuk URL luar) kembali ke halaman kasir.
export function safeNextPath(value, role) {
  return findRoute(value)?.roles.includes(role) ? value : homePath;
}

export function loginHref(pathname) {
  return findRoute(pathname) ? `${loginPath}?lanjut=${pathname}` : loginPath;
}
