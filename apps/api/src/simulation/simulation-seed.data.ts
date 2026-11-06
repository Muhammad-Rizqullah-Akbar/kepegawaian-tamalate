export interface PegawaiSeed {
  nip: string;
  nama: string;
  gol: string;
  pangkat: string;
  jabatan: string;
  unit: string;
  skLama: string;
  mkgLama: string;
  gajiLama: string;
  mkgBaru: string;
  gajiBaru: string;
  sisaCutiN2: number;
  sisaCutiN1: number;
  sisaCutiN: number;
  skorDisiplin: number;
  avatar: string;
}

export interface SuratSeed {
  agenda: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalAgenda: string;
  asal: string;
  perihal: string;
  sifat: 'B' | 'R' | 'SR';
  lampiran: string;
  status: 'baru' | 'disposisi' | 'proses' | 'selesai' | 'terlambat';
  tahap: number;
  penanggungJawab: string;
  disposisi: {
    diketahuiSekcam: boolean;
    parafSekcamOleh: string;
    tanggalSekcam: string;
    catatanSekcam: string;
    rekomendasiSekcam: string[];
    hasParafCamat: boolean;
    parafOleh: string;
    tanggalDisposisi: string;
    instruksi: string;
    diteruskan: string[];
    tteCert: string | null;
  };
  tindakLanjut: {
    petugas: string;
    catatan: string;
    tanggal: string;
  };
  arsip: {
    kodeKlasifikasi: string;
    lokasiFisik: string;
    tahun: string;
    retensiTahun: number;
    statusArsip: 'aktif' | 'inaktif' | 'permanen';
  };
}

export interface UsulanSeed {
  id: string;
  jenis: 'kgb' | 'pangkat' | 'cuti' | 'pensiun';
  nomorUsulan: string;
  pegawaiNip: string;
  nama: string;
  gol: string;
  golBaru?: string;
  pangkat: string;
  pangkatBaru?: string;
  jabatan: string;
  unit: string;
  mkgLama: string;
  mkgBaru: string;
  gajiLama?: string;
  gajiBaru?: string;
  jenisCuti?: string;
  lamaHari?: number;
  tmtRencana: string;
  tanggalUsulan: string;
  tahap: number;
  status: 'proses' | 'selesai' | 'perbaikan';
  catatanKasubag: string;
  parafSekcam: { nama: string; tanggal: string; disetujui: boolean } | null;
  penetapanCamat: { nama: string; tanggal: string; nomorSk: string; tteCert: string } | null;
  berkas: Record<string, 'ada' | 'kurang' | 'perbaikan'>;
}

export const INITIAL_PEGAWAI: PegawaiSeed[] = [
  {
    nip: '197508121999031002',
    nama: 'H. Andi Saputra, S.Sos., M.Si',
    gol: 'IV/b',
    pangkat: 'Pembina Tk.I',
    jabatan: 'Camat Tamalate',
    unit: 'Kecamatan Tamalate',
    skLama: '821.2/041/BKPSDMD/2024',
    mkgLama: '24 Tahun',
    gajiLama: 'Rp 5.120.000',
    mkgBaru: '26 Tahun',
    gajiBaru: 'Rp 5.480.000',
    sisaCutiN2: 0,
    sisaCutiN1: 6,
    sisaCutiN: 12,
    skorDisiplin: 100,
    avatar: 'AS',
  },
  {
    nip: '198807072010061010',
    nama: 'Bambang Sutrisno, S.STP., M.Si',
    gol: 'IV/a',
    pangkat: 'Pembina',
    jabatan: 'Sekretaris Camat (Sekcam)',
    unit: 'Kecamatan Tamalate',
    skLama: '823.3/110/BKPSDMD/2025',
    mkgLama: '16 Tahun',
    gajiLama: 'Rp 4.450.000',
    mkgBaru: '18 Tahun',
    gajiBaru: 'Rp 4.780.000',
    sisaCutiN2: 0,
    sisaCutiN1: 6,
    sisaCutiN: 12,
    skorDisiplin: 100,
    avatar: 'BS',
  },
  {
    nip: '198501012010011001',
    nama: 'Budi Hartono, S.Sos',
    gol: 'III/c',
    pangkat: 'Penata',
    jabatan: 'Kasubag Umum dan Kepegawaian',
    unit: 'Subbagian Umum & Kepegawaian',
    skLama: '822.3/101/BKPSDMD/2024',
    mkgLama: '18 Tahun',
    gajiLama: 'Rp 3.850.000',
    mkgBaru: '20 Tahun',
    gajiBaru: 'Rp 4.150.000',
    sisaCutiN2: 0,
    sisaCutiN1: 6,
    sisaCutiN: 12,
    skorDisiplin: 97,
    avatar: 'BH',
  },
  {
    nip: '198703152011012002',
    nama: 'Siti Maryam, S.E',
    gol: 'III/d',
    pangkat: 'Penata Tk.I',
    jabatan: 'Kasi Pemerintahan & Kinerja Lurah',
    unit: 'Seksi Pemerintahan',
    skLama: '822.3/102/BKPSDMD/2024',
    mkgLama: '20 Tahun',
    gajiLama: 'Rp 3.950.000',
    mkgBaru: '22 Tahun',
    gajiBaru: 'Rp 4.400.000',
    sisaCutiN2: 0,
    sisaCutiN1: 5,
    sisaCutiN: 12,
    skorDisiplin: 98,
    avatar: 'SM',
  },
  {
    nip: '198205202008011003',
    nama: 'Arif Rahman, S.AP., M.M',
    gol: 'III/b',
    pangkat: 'Penata Muda Tk.I',
    jabatan: 'Kasubag Perencanaan & Keuangan',
    unit: 'Subbagian Perencanaan',
    skLama: '822.3/103/BKPSDMD/2024',
    mkgLama: '14 Tahun',
    gajiLama: 'Rp 3.600.000',
    mkgBaru: '16 Tahun',
    gajiBaru: 'Rp 3.750.000',
    sisaCutiN2: 1,
    sisaCutiN1: 6,
    sisaCutiN: 10,
    skorDisiplin: 99,
    avatar: 'AR',
  },
  {
    nip: '198904122014022004',
    nama: 'Dewi Anggraini, S.IP',
    gol: 'III/d',
    pangkat: 'Penata Tk.I',
    jabatan: 'Kasi Pemberdayaan Masyarakat & Kesos',
    unit: 'Seksi PMK & Kesos',
    skLama: '822.3/104/BKPSDMD/2024',
    mkgLama: '12 Tahun',
    gajiLama: 'Rp 3.700.000',
    mkgBaru: '14 Tahun',
    gajiBaru: 'Rp 4.050.000',
    sisaCutiN2: 0,
    sisaCutiN1: 6,
    sisaCutiN: 12,
    skorDisiplin: 95,
    avatar: 'DA',
  },
  {
    nip: '199011052015031005',
    nama: 'Riyan Saputra, S.Kom',
    gol: 'III/c',
    pangkat: 'Penata',
    jabatan: 'Pranata Komputer & Pengolah Data',
    unit: 'Subbagian Umum & Kepegawaian',
    skLama: '822.3/105/BKPSDMD/2024',
    mkgLama: '10 Tahun',
    gajiLama: 'Rp 3.550.000',
    mkgBaru: '12 Tahun',
    gajiBaru: 'Rp 3.850.000',
    sisaCutiN2: 0,
    sisaCutiN1: 4,
    sisaCutiN: 12,
    skorDisiplin: 93,
    avatar: 'RS',
  },
  {
    nip: '197805122003122014',
    nama: 'Hj. Sri Handayani, S.Sos',
    gol: 'III/d',
    pangkat: 'Penata Tk.I',
    jabatan: 'Kasi Trantib & Penegakan Perda',
    unit: 'Seksi Trantib',
    skLama: '822.3/114/BKPSDMD/2024',
    mkgLama: '22 Tahun',
    gajiLama: 'Rp 4.500.000',
    mkgBaru: '24 Tahun',
    gajiBaru: 'Rp 4.880.000',
    sisaCutiN2: 0,
    sisaCutiN1: 6,
    sisaCutiN: 12,
    skorDisiplin: 98,
    avatar: 'SH',
  },
  {
    nip: '198006102005011009',
    nama: 'Hendra Wijaya, S.Sos',
    gol: 'II/d',
    pangkat: 'Pengatur Tk.I',
    jabatan: 'Operator Pengendali Surat',
    unit: 'Subbagian Umum & Kepegawaian',
    skLama: '800.1/109/BKPSDMD/2025',
    mkgLama: '18 Tahun',
    gajiLama: 'Rp 2.950.000',
    mkgBaru: '20 Tahun',
    gajiBaru: 'Rp 3.250.000',
    sisaCutiN2: 0,
    sisaCutiN1: 3,
    sisaCutiN: 8,
    skorDisiplin: 81,
    avatar: 'HW',
  },
  {
    nip: '199112252013071007',
    nama: 'Eko Susanto, S.STP., M.Si',
    gol: 'III/d',
    pangkat: 'Penata Tk.I',
    jabatan: 'Lurah Tanjung Merdeka',
    unit: 'Kelurahan Tanjung Merdeka',
    skLama: '823.3/107/BKPSDMD/2025',
    mkgLama: '12 Tahun',
    gajiLama: 'Rp 3.680.000',
    mkgBaru: '14 Tahun',
    gajiBaru: 'Rp 3.920.000',
    sisaCutiN2: 0,
    sisaCutiN1: 5,
    sisaCutiN: 12,
    skorDisiplin: 99,
    avatar: 'ES',
  },
];

export const INITIAL_SURAT: SuratSeed[] = [
  {
    agenda: '0213/2026',
    nomorSurat: '800.1.2/412/BKPSDMD/VI/2026',
    tanggalSurat: '04-11-2026',
    tanggalAgenda: '05-11-2026',
    asal: 'BKPSDMD Kota Makassar',
    perihal: 'Verifikasi Berkas Usulan Kenaikan Gaji Berkala (KGB) & Pangkat Periode Oktober',
    sifat: 'B',
    lampiran: '1 Berkas Daftar Nominatif',
    status: 'baru',
    tahap: 1,
    penanggungJawab: 'Kasubag Umum dan Kepegawaian',
    disposisi: {
      diketahuiSekcam: true,
      parafSekcamOleh: 'Bambang Sutrisno, S.STP., M.Si (Sekcam)',
      tanggalSekcam: '05-11-2026',
      catatanSekcam: 'Telah diperiksa, mohon arahan Bapak Camat untuk ditindaklanjuti Subbag Umpeg.',
      rekomendasiSekcam: ['1', '7'],
      hasParafCamat: false,
      parafOleh: 'H. Andi Saputra, S.Sos., M.Si (Camat)',
      tanggalDisposisi: '',
      instruksi: '',
      diteruskan: ['7'],
      tteCert: null,
    },
    tindakLanjut: {
      petugas: 'Budi Hartono, S.Sos',
      catatan: '',
      tanggal: '',
    },
    arsip: {
      kodeKlasifikasi: '800.1.3',
      lokasiFisik: 'Lemari A · Rak 2 · Map Kepegawaian',
      tahun: '2026',
      retensiTahun: 5,
      statusArsip: 'aktif',
    },
  },
  {
    agenda: '0214/2026',
    nomorSurat: '005/188/SETDAKO/XI/2026',
    tanggalSurat: '04-11-2026',
    tanggalAgenda: '05-11-2026',
    asal: 'Sekretariat Daerah Kota Makassar',
    perihal: 'Undangan Rapat Koordinasi Evaluasi Kinerja Kewilayahan & Kedisiplinan ASN',
    sifat: 'B',
    lampiran: '1 Lembar Jadwal',
    status: 'disposisi',
    tahap: 2,
    penanggungJawab: 'Sekcam & Kasi Pemerintahan',
    disposisi: {
      diketahuiSekcam: true,
      parafSekcamOleh: 'Bambang Sutrisno, S.STP., M.Si (Sekcam)',
      tanggalSekcam: '05-11-2026',
      catatanSekcam: 'Siapkan bahan rekap presensi dan laporan kinerja 10 kelurahan.',
      rekomendasiSekcam: ['1', '2', '7'],
      hasParafCamat: true,
      parafOleh: 'H. Andi Saputra, S.Sos., M.Si (Camat)',
      tanggalDisposisi: '05-11-2026',
      instruksi: 'Sekcam & Kasi Pemerintahan hadiri dan siapkan bahan evaluasi tepat waktu.',
      diteruskan: ['1', '2', '7'],
      tteCert: 'BSRE-TML-2026-0214',
    },
    tindakLanjut: {
      petugas: 'Siti Maryam, S.E',
      catatan: 'Bahan paparan evaluasi kinerja lurah sedang dirampungkan.',
      tanggal: '05-11-2026',
    },
    arsip: {
      kodeKlasifikasi: '005',
      lokasiFisik: 'Lemari B · Rak 1 · Map Undangan',
      tahun: '2026',
      retensiTahun: 2,
      statusArsip: 'aktif',
    },
  },
  {
    agenda: '0210/2026',
    nomorSurat: '660.1/092/DLH/X/2026',
    tanggalSurat: '01-11-2026',
    tanggalAgenda: '02-11-2026',
    asal: 'Dinas Lingkungan Hidup Kota Makassar',
    perihal: 'Penertiban Armada Pengangkutan Sampah & Retribusi Wilayah Tanjung Bunga',
    sifat: 'R',
    lampiran: '2 Berkas Peta Jalur',
    status: 'terlambat',
    tahap: 2,
    penanggungJawab: 'Kasi Pengelolaan Kebersihan',
    disposisi: {
      diketahuiSekcam: true,
      parafSekcamOleh: 'Bambang Sutrisno, S.STP., M.Si (Sekcam)',
      tanggalSekcam: '02-11-2026',
      catatanSekcam: 'Segera koordinasikan dengan pengawas armada kelurahan.',
      rekomendasiSekcam: ['6', '3'],
      hasParafCamat: true,
      parafOleh: 'H. Andi Saputra, S.Sos., M.Si (Camat)',
      tanggalDisposisi: '02-11-2026',
      instruksi: 'Turun lapangan bersama Kasi Trantib dan laporkan dokumentasi hari ini.',
      diteruskan: ['6', '3'],
      tteCert: 'BSRE-TML-2026-0210',
    },
    tindakLanjut: {
      petugas: 'Hj. Sri Handayani, S.Sos',
      catatan: 'Menunggu berita acara penertiban dari Kelurahan Maccini Sombala.',
      tanggal: '04-11-2026',
    },
    arsip: {
      kodeKlasifikasi: '660.1',
      lokasiFisik: 'Lemari C · Rak 3 · Map Kebersihan',
      tahun: '2026',
      retensiTahun: 5,
      statusArsip: 'aktif',
    },
  },
  {
    agenda: '0208/2026',
    nomorSurat: '700/311/INSPEKTORAT/X/2026',
    tanggalSurat: '28-10-2026',
    tanggalAgenda: '29-10-2026',
    asal: 'Inspektorat Daerah Kota Makassar',
    perihal: 'Tindak Lanjut Laporan Hasil Pemeriksaan (LHP) Penatausahaan Aset Kecamatan',
    sifat: 'R',
    lampiran: '1 Bundel Matriks LHP',
    status: 'proses',
    tahap: 3,
    penanggungJawab: 'Kasubag Perencanaan & Keuangan',
    disposisi: {
      diketahuiSekcam: true,
      parafSekcamOleh: 'Bambang Sutrisno, S.STP., M.Si (Sekcam)',
      tanggalSekcam: '29-10-2026',
      catatanSekcam: 'Rekonsiliasi kartu inventaris barang (KIB) sebelum batas SLA.',
      rekomendasiSekcam: ['8', '9'],
      hasParafCamat: true,
      parafOleh: 'H. Andi Saputra, S.Sos., M.Si (Camat)',
      tanggalDisposisi: '29-10-2026',
      instruksi: 'Selesaikan matriks tindak lanjut LHP dan serahkan bukti fisik ke Inspektorat.',
      diteruskan: ['8', '9'],
      tteCert: 'BSRE-TML-2026-0208',
    },
    tindakLanjut: {
      petugas: 'Arif Rahman, S.AP., M.M',
      catatan: 'Berita acara rekonsiliasi aset kendaraan dinas telah diverifikasi Kasubag.',
      tanggal: '03-11-2026',
    },
    arsip: {
      kodeKlasifikasi: '700',
      lokasiFisik: 'Lemari A · Rak 1 · Map Pengawasan',
      tahun: '2026',
      retensiTahun: 10,
      statusArsip: 'permanen',
    },
  },
  {
    agenda: '0199/2026',
    nomorSurat: '800.1.11/045/TML/X/2026',
    tanggalSurat: '20-10-2026',
    tanggalAgenda: '21-10-2026',
    asal: 'Kelurahan Barombong',
    perihal: 'Laporan Rekapitulasi Kehadiran Apel Pagi & Disiplin Pegawai Bulan Oktober 2026',
    sifat: 'B',
    lampiran: '1 Berkas Rekap',
    status: 'selesai',
    tahap: 5,
    penanggungJawab: 'Kasubag Umum dan Kepegawaian',
    disposisi: {
      diketahuiSekcam: true,
      parafSekcamOleh: 'Bambang Sutrisno, S.STP., M.Si (Sekcam)',
      tanggalSekcam: '21-10-2026',
      catatanSekcam: 'Telah direkap ke dalam matriks evaluasi TPP kecamatan.',
      rekomendasiSekcam: ['7'],
      hasParafCamat: true,
      parafOleh: 'H. Andi Saputra, S.Sos., M.Si (Camat)',
      tanggalDisposisi: '21-10-2026',
      instruksi: 'Arsipkan pada bundel presensi tahunan dan sinkronkan ke aplikasi e-Kinerja.',
      diteruskan: ['7'],
      tteCert: 'BSRE-TML-2026-0199',
    },
    tindakLanjut: {
      petugas: 'Budi Hartono, S.Sos',
      catatan: 'Seluruh data kehadiran Kelurahan Barombong telah diverifikasi dan diarsipkan.',
      tanggal: '23-10-2026',
    },
    arsip: {
      kodeKlasifikasi: '800.1.6',
      lokasiFisik: 'Lemari A · Rak 4 · Bundel Presensi 2026',
      tahun: '2026',
      retensiTahun: 5,
      statusArsip: 'aktif',
    },
  },
];

export const INITIAL_USULAN: UsulanSeed[] = [
  {
    id: 'KGB-2026-001',
    jenis: 'kgb',
    nomorUsulan: '822.3/041/KGB-TML/2026',
    pegawaiNip: '198501012010011001',
    nama: 'Budi Hartono, S.Sos',
    gol: 'III/c',
    pangkat: 'Penata',
    jabatan: 'Kasubag Umum dan Kepegawaian',
    unit: 'Subbagian Umum & Kepegawaian',
    mkgLama: '18 Tahun',
    mkgBaru: '20 Tahun',
    gajiLama: 'Rp 3.850.000',
    gajiBaru: 'Rp 4.150.000',
    tmtRencana: '01 Desember 2026',
    tanggalUsulan: '01-11-2026',
    tahap: 2,
    status: 'proses',
    catatanKasubag: 'SK Pangkat terakhir dan SKP 2 tahun bernilai Baik telah terlampir.',
    parafSekcam: null,
    penetapanCamat: null,
    berkas: {
      'sk-pangkat': 'ada',
      'sk-kgb-lama': 'ada',
      'skp-2-tahun': 'ada',
      'spmt': 'ada',
    },
  },
  {
    id: 'KGB-2026-002',
    jenis: 'kgb',
    nomorUsulan: '822.3/042/KGB-TML/2026',
    pegawaiNip: '198703152011012002',
    nama: 'Siti Maryam, S.E',
    gol: 'III/d',
    pangkat: 'Penata Tk.I',
    jabatan: 'Kasi Pemerintahan & Kinerja Lurah',
    unit: 'Seksi Pemerintahan',
    mkgLama: '20 Tahun',
    mkgBaru: '22 Tahun',
    gajiLama: 'Rp 3.950.000',
    gajiBaru: 'Rp 4.400.000',
    tmtRencana: '01 Desember 2026',
    tanggalUsulan: '28-10-2026',
    tahap: 4,
    status: 'proses',
    catatanKasubag: 'Seluruh syarat berkas lengkap dan sesuai masa kerja.',
    parafSekcam: { nama: 'Bambang Sutrisno, S.STP., M.Si', tanggal: '02-11-2026', disetujui: true },
    penetapanCamat: null,
    berkas: {
      'sk-pangkat': 'ada',
      'sk-kgb-lama': 'ada',
      'skp-2-tahun': 'ada',
      'spmt': 'ada',
    },
  },
  {
    id: 'PANGKAT-2026-001',
    jenis: 'pangkat',
    nomorUsulan: '823.3/012/KP-TML/2026',
    pegawaiNip: '198205202008011003',
    nama: 'Arif Rahman, S.AP., M.M',
    gol: 'III/b',
    golBaru: 'III/c',
    pangkat: 'Penata Muda Tk.I',
    pangkatBaru: 'Penata',
    jabatan: 'Kasubag Perencanaan & Keuangan',
    unit: 'Subbagian Perencanaan',
    mkgLama: '14 Tahun',
    mkgBaru: '16 Tahun',
    tmtRencana: '01 April 2027',
    tanggalUsulan: '02-11-2026',
    tahap: 3,
    status: 'proses',
    catatanKasubag: 'Ijazah S2 Magister Manajemen dan STLUD telah diverifikasi.',
    parafSekcam: { nama: 'Bambang Sutrisno, S.STP., M.Si', tanggal: '04-11-2026', disetujui: true },
    penetapanCamat: null,
    berkas: {
      'sk-kp-terakhir': 'ada',
      'skp-2-tahun': 'ada',
      'ijazah-transkrip': 'ada',
      'uraian-tugas': 'ada',
    },
  },
  {
    id: 'CUTI-2026-001',
    jenis: 'cuti',
    nomorUsulan: '851/088/CUTI-TML/2026',
    pegawaiNip: '199011052015031005',
    nama: 'Riyan Saputra, S.Kom',
    gol: 'III/c',
    pangkat: 'Penata',
    jabatan: 'Pranata Komputer & Pengolah Data',
    unit: 'Subbagian Umum & Kepegawaian',
    mkgLama: '10 Tahun',
    mkgBaru: '10 Tahun',
    jenisCuti: '1. Cuti Tahunan',
    lamaHari: 3,
    tmtRencana: '12 November 2026 s.d. 14 November 2026',
    tanggalUsulan: '04-11-2026',
    tahap: 5,
    status: 'selesai',
    catatanKasubag: 'Kuota sisa cuti tahun berjalan masih 12 hari, pelimpahan tugas harian aman.',
    parafSekcam: { nama: 'Bambang Sutrisno, S.STP., M.Si', tanggal: '04-11-2026', disetujui: true },
    penetapanCamat: {
      nama: 'H. Andi Saputra, S.Sos., M.Si',
      tanggal: '05-11-2026',
      nomorSk: '851/088/SK-CUTI/TML/XI/2026',
      tteCert: 'BSRE-TML-CUTI-088',
    },
    berkas: {
      'form-cuti': 'ada',
      'pelimpahan-tugas': 'ada',
      'rekap-kehadiran': 'ada',
    },
  },
  {
    id: 'PENSIUN-2026-001',
    jenis: 'pensiun',
    nomorUsulan: '882/004/BUP-TML/2026',
    pegawaiNip: '197805122003122014',
    nama: 'Hj. Sri Handayani, S.Sos',
    gol: 'III/d',
    pangkat: 'Penata Tk.I',
    jabatan: 'Kasi Trantib & Penegakan Perda',
    unit: 'Seksi Trantib',
    mkgLama: '22 Tahun',
    mkgBaru: '24 Tahun',
    gajiLama: 'Rp 4.500.000',
    gajiBaru: 'Rp 4.880.000',
    tmtRencana: '01 Desember 2027 (BUP)',
    tanggalUsulan: '01-11-2026',
    tahap: 2,
    status: 'proses',
    catatanKasubag: 'DPCP, Akta Nikah, dan Surat Pernyataan Tidak Pernah Dijatuhi Hukuman Disiplin Berat lengkap.',
    parafSekcam: null,
    penetapanCamat: null,
    berkas: {
      'dpcp': 'ada',
      'sk-cpns-pns': 'ada',
      'sk-kp-terakhir': 'ada',
      'kartu-keluarga': 'ada',
      'pas-foto': 'kurang',
    },
  },
];
