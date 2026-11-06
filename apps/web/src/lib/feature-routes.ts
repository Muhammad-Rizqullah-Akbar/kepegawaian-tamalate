/**
 * Peta rute eksekusi per fitur.
 * Setiap fitur wajib menunjuk ke layar yang benar-benar menjalankannya,
 * bukan sekadar halaman deskripsi. Bila belum ada layar, nilainya null
 * dan halaman detail menampilkan status jujur, bukan tombol palsu.
 */
export interface FeatureRoute {
  readonly href: string;
  readonly label: string;
  readonly note: string;
}

export const FEATURE_ROUTES: Readonly<Record<string, FeatureRoute>> = {
  A1: { href: '/status', label: 'Periksa sesi dan kesehatan layanan', note: 'Login HMAC aktif di /api/v1/auth/login. Passkey belum diaktifkan.' },
  A2: { href: '/pengajuan', label: 'Buka matriks kewenangan', note: 'Setiap transisi diperiksa terhadap position_code, 403 bila jabatan salah.' },
  A3: { href: '/pegawai', label: 'Buka direktori pegawai', note: 'Enam pegawai seed dengan NIP unik terverifikasi.' },
  A4: { href: '/pegawai', label: 'Lihat riwayat jabatan', note: 'Assignment berversi dengan valid_from dan valid_to.' },
  A5: { href: '/pegawai', label: 'Lihat penugasan pejabat', note: 'Position assignment menyimpan legal_basis.' },
  A6: { href: '/pegawai', label: 'Lihat delegasi', note: 'Delegasi memuat scope_position dan rentang tanggal.' },
  A7: { href: '/admin', label: 'Buka parameter dinamis', note: 'Registry parameter bertipe dengan validasi skema.' },
  A8: { href: '/admin', label: 'Buka kalender hari kerja', note: 'Dipakai guard kuota cuti dan SLA.' },
  A9: { href: '/pengajuan', label: 'Verifikasi rantai audit', note: 'Uji langsung lewat /api/v1/submissions/{id}/audit, hasil valid:true.' },
  A10: { href: '/status', label: 'Pantau notifikasi', note: 'K9 belum diaktifkan, status jujur ditampilkan.' },
  A11: { href: '/pengajuan', label: 'Buka kotak masuk jabatan', note: 'Daftar pengajuan terfilter per state.' },
  B1: { href: '/register', label: 'Buku Agenda Surat Masuk', note: 'Subject type register.incoming_agenda terdaftar di K5.' },
  B2: { href: '/register', label: 'Buku Agenda Surat Keluar', note: 'Terhubung K4 penomoran naskah yang terbukti atomik.' },
  B4: { href: '/register', label: 'Buku Penjagaan KGB', note: 'Sumber data deteksi BUP untuk SOP-02.' },
  B5: { href: '/register', label: 'Buku Pencatatan Dokumen', note: 'Log dokumen tanpa duplikasi metadata.' },
  B6: { href: '/register', label: 'Buku Register Usulan', note: 'Mengikuti 17 kolom Format KGB.' },
  B7: { href: '/register', label: 'Buku Agenda Cetak Fisik', note: 'Cetak meniru fisik dengan AST berversi.' },
  C2: { href: '/admin', label: 'Uji alokasi nomor', note: 'POST /api/v1/numbering/allocate, 100 paralel tanpa gap.' },
  I1: { href: '/sop/SOP-05', label: 'Ajukan cuti', note: 'Form langsung dari workspace SOP-05.' },
  I2: { href: '/sop/SOP-05', label: 'Uji guard kuota', note: '13 hari ditolak 422, guard aktif.' },
  E1: { href: '/sop/SOP-01', label: 'Buka SOP Pensiun', note: 'Workspace 10 state resmi.' },
  E2: { href: '/sop/SOP-01', label: 'Draf usulan pensiun', note: 'Form dari workspace SOP-01.' },
  E3: { href: '/sop/SOP-01', label: 'Verifikasi berjenjang', note: 'Matriks kewenangan per transisi.' },
  F1: { href: '/sop/SOP-02', label: 'Buka SOP KGB', note: 'Workspace 9 state resmi.' },
  G1: { href: '/sop/SOP-03', label: 'Buka SOP Pangkat', note: 'Workspace 8 state resmi.' },
  H1: { href: '/sop/SOP-04', label: 'Buka SOP Pembinaan', note: 'Workspace 5 state resmi.' },
  J1: { href: '/sop/SOP-06', label: 'Buka SOP Pengarsipan', note: 'Workspace 6 state resmi.' },
  K1: { href: '/admin', label: 'Manajemen modul', note: 'Dikendalikan manifest fitur.' },
  K2: { href: '/admin', label: 'Parameter dinamis', note: 'Registry bertipe.' },
  K3: { href: '/admin', label: 'Template berversi', note: 'valid_from dan valid_to.' },
  K4: { href: '/admin', label: 'Policy pack BUP', note: 'BUP sebagai data berversi.' },
  K5: { href: '/admin', label: 'Jejak audit', note: 'Rantai SHA-256 terverifikasi.' },
  K6: { href: '/admin', label: 'Konfigurasi sistem', note: 'Kelompok K administrasi.' },
};

export function routeFor(code: string): FeatureRoute | null {
  return FEATURE_ROUTES[code.toUpperCase()] ?? null;
}
