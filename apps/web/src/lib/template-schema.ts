export interface OnlyOfficeTemplateConfig {
  enabled: boolean;
  documentType: 'word' | 'cell' | 'slide';
  fileType: 'docx' | 'xlsx' | 'pdf';
  templateKey: string;
  s3Bucket: string;
  s3ObjectKey: string;
  callbackUrl: string;
  lastSyncedAt?: string;
}

export interface DisposisiRecipientItem {
  id: string;
  label: string;
  jabatan: string;
  enabled: boolean;
}

export interface LembarDisposisiTemplate {
  id: 'lembar-disposisi';
  namaTemplate: string;
  versi: string;
  kopInstansi: string;
  kopUnit: string;
  judulDokumen: string;
  labelAgenda: string;
  labelSifat: string;
  labelTertanda1: string;
  jabatanTertanda1: string;
  namaTertanda1: string;
  labelTertanda2: string;
  jabatanTertanda2: string;
  namaTertanda2: string;
  judulKolomTujuan: string;
  judulKolomInstruksi: string;
  daftarTujuan: DisposisiRecipientItem[];
  pilihanInstruksiCepat: string[];
  labelCatatanSekcam: string;
  labelKembaliKepada: string;
  labelTanggalKembali: string;
  catatanKaki: string;
  onlyOffice: OnlyOfficeTemplateConfig;
}

export interface BukuAgendaColumnItem {
  key: string;
  label: string;
  widthPercent: number;
  enabled: boolean;
}

export interface BukuAgendaTemplate {
  id: 'buku-agenda';
  namaTemplate: string;
  versi: string;
  kopPemerintah: string;
  kopKecamatan: string;
  judulDokumen: string;
  alamatKantor: string;
  kolomTabel: BukuAgendaColumnItem[];
  jabatanKiri: string;
  namaPejabatKiri: string;
  pangkatPejabatKiri: string;
  nipPejabatKiri: string;
  jabatanKanan: string;
  namaPejabatKanan: string;
  pangkatPejabatKanan: string;
  nipPejabatKanan: string;
  kotaTanggal: string;
  onlyOffice: OnlyOfficeTemplateConfig;
}

export interface JenisCutiTemplateItem {
  id: string;
  nomorFormulir: number;
  kode: string;
  namaFormulir: string;
}

export interface SuratCutiTemplate {
  id: 'surat-cuti';
  namaTemplate: string;
  versi: string;
  kotaSurat: string;
  tujuanYth: string;
  tujuanCqBaris1: string;
  tujuanCqBaris2: string;
  tujuanDi: string;
  judulBagianDataPegawai: string;
  judulBagianJenisCuti: string;
  judulBagianAlasanCuti: string;
  judulBagianLamaCuti: string;
  judulBagianCatatanCuti: string;
  judulBagianAlamatCuti: string;
  judulBagianPertimbanganAtasan: string;
  judulBagianKeputusanPejabat: string;
  daftarJenisCuti: JenisCutiTemplateItem[];
  atasanDefaultJabatan: string;
  atasanDefaultNama: string;
  atasanDefaultNip: string;
  pejabatDefaultJabatan: string;
  pejabatDefaultNama: string;
  pejabatDefaultPangkat: string;
  pejabatDefaultNip: string;
  onlyOffice: OnlyOfficeTemplateConfig;
}

export interface DocumentTemplateRegistry {
  updatedAt: string;
  updatedBy: string;
  lembarDisposisi: LembarDisposisiTemplate;
  bukuAgenda: BukuAgendaTemplate;
  suratCuti: SuratCutiTemplate;
}

export const STORAGE_KEY_TEMPLATES = 'tamalate_templates_v1';

export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplateRegistry = {
  updatedAt: '2026-11-06T07:00:00.000Z',
  updatedBy: 'Sistem Tata Naskah Kecamatan Tamalate',
  lembarDisposisi: {
    id: 'lembar-disposisi',
    namaTemplate: 'Lembar Disposisi Resmi Kecamatan Tamalate (A4 Tegak)',
    versi: '2026.1',
    kopInstansi: 'PEMERINTAH KOTA MAKASSAR',
    kopUnit: 'KECAMATAN TAMALATE',
    judulDokumen: 'LEMBAR DISPOSISI',
    labelAgenda: 'NOMOR AGENDA / REGISTRASI',
    labelSifat: 'SIFAT SURAT',
    labelTertanda1: 'TERTANDA 1: SEKRETARIS CAMAT (PARAF CUKUP MENGETAHUI - OPSIONAL)',
    jabatanTertanda1: 'Sekretaris Camat Tamalate',
    namaTertanda1: 'Ir. H. Syamsul Bahri, M.Si (Sekcam)',
    labelTertanda2: 'TERTANDA 2: CAMAT TAMALATE (DISPOSISI & TANDA TANGAN UTAMA)',
    jabatanTertanda2: 'Camat Tamalate',
    namaTertanda2: 'Drs. H. Fahyuddin Yusuf, M.Si (Camat)',
    judulKolomTujuan: 'DITERUSKAN KEPADA:',
    judulKolomInstruksi: 'INSTRUKSI / INFORMASI*',
    daftarTujuan: [
      { id: '1', label: 'Sekcam Tamalate', jabatan: 'Sekcam', enabled: true },
      { id: '2', label: 'Kasubag. Umum dan Kepegawaian', jabatan: 'Kasubag Umpeg', enabled: true },
      { id: '3', label: 'Kasubag. Keuangan, Evaluasi dan Pelaporan', jabatan: 'Kasubag Keuangan', enabled: true },
      { id: '4', label: 'Kasi. Pemerintahan, Kinerja Lurah dan RT/RW', jabatan: 'Kasi Pemerintahan', enabled: true },
      { id: '5', label: 'Kasi. Ketertiban Umum dan Ketentraman Masyarakat', jabatan: 'Kasi Trantib', enabled: true },
      { id: '6', label: 'Kasi. Perekonomian, Pembangunan, Sosial dan Penerangan Jalan', jabatan: 'Kasi Ekbang', enabled: true },
      { id: '7', label: 'Kasi. Pengelolaan Kebersihan dan Pertamanan', jabatan: 'Kasi Kebersihan', enabled: true },
      { id: '8', label: 'Kasi. Pemberdayaan Masyarakat dan Kesejahteraan Sosial', jabatan: 'Kasi PMKS', enabled: true },
      { id: '9', label: 'Para Lurah Se-Kec. Tamalate', jabatan: 'Para Lurah', enabled: true },
      { id: '10', label: 'Koordinator/Staf Pelaksana Teknis', jabatan: 'Koordinator/Staf', enabled: true },
    ],
    pilihanInstruksiCepat: [
      'DiTL sesuai ketentuan',
      'Koordinasikan & laporkan hasil',
      'Hadiri / wakili pimpinan',
      'Telaah teknis & siapkan konsep jawaban',
      'Untuk diketahui dan diarsipkan',
    ],
    labelCatatanSekcam: 'Catatan Telaah Sekcam (Opsional):',
    labelKembaliKepada: 'Sesudah digunakan harap segera dikembalikan - Kepada :',
    labelTanggalKembali: 'Tanggal :',
    catatanKaki: '*Coret yang tidak perlu',
    onlyOffice: {
      enabled: true,
      documentType: 'word',
      fileType: 'docx',
      templateKey: 'tpl-lembar-disposisi-tamalate-2026',
      s3Bucket: 'tamalate-vault',
      s3ObjectKey: 'templates/lembar-disposisi-2026.docx',
      callbackUrl: '/api/v1/simulation/templates/onlyoffice-callback',
      lastSyncedAt: '2026-11-06T07:00:00.000Z',
    },
  },
  bukuAgenda: {
    id: 'buku-agenda',
    namaTemplate: 'Buku Agenda Pengendalian Naskah Dinas (A4 Melintang)',
    versi: '2026.1',
    kopPemerintah: 'PEMERINTAH KOTA MAKASSAR',
    kopKecamatan: 'KECAMATAN TAMALATE',
    judulDokumen: 'BUKU AGENDA PENGENDALIAN NASKAH DINAS',
    alamatKantor: 'Jalan Danau Tanjung Bunga Utara Nomor 181, Kota Makassar, Sulawesi Selatan',
    kolomTabel: [
      { key: 'no', label: 'NO', widthPercent: 4, enabled: true },
      { key: 'instansiTujuan', label: 'INSTANSI YG DI TUJUKAN', widthPercent: 18, enabled: true },
      { key: 'nomorSurat', label: 'NO. SURAT', widthPercent: 15, enabled: true },
      { key: 'tanggalSurat', label: 'TANGGAL SURAT', widthPercent: 10, enabled: true },
      { key: 'perihal', label: 'PERIHAL', widthPercent: 23, enabled: true },
      { key: 'penanggungJawab', label: 'PENANGGUNG JAWAB', widthPercent: 14, enabled: true },
      { key: 'tanggalPenerimaan', label: 'TANGGAL SURAT', widthPercent: 10, enabled: true },
      { key: 'keterangan', label: 'KET.', widthPercent: 6, enabled: true },
    ],
    jabatanKiri: 'Camat Tamalate',
    namaPejabatKiri: 'H. Andi Saputra, S.Sos',
    pangkatPejabatKiri: 'Pembina Tk. I, IV/b',
    nipPejabatKiri: 'NIP 19720310 199403 1 008',
    jabatanKanan: 'Operator Pengendali Surat',
    namaPejabatKanan: 'Fajar Pratama',
    pangkatKanan: 'Subbagian Umum dan Kepegawaian',
    pangkatPejabatKanan: 'Subbagian Umum dan Kepegawaian',
    nipPejabatKanan: 'NIP 19900418 201503 1 002',
    kotaTanggal: 'Makassar',
    onlyOffice: {
      enabled: true,
      documentType: 'cell',
      fileType: 'xlsx',
      templateKey: 'tpl-buku-agenda-tamalate-2026',
      s3Bucket: 'tamalate-vault',
      s3ObjectKey: 'templates/buku-agenda-2026.xlsx',
      callbackUrl: '/api/v1/simulation/templates/onlyoffice-callback',
      lastSyncedAt: '2026-11-06T07:00:00.000Z',
    },
  },
  suratCuti: {
    id: 'surat-cuti',
    namaTemplate: 'Formulir Permohonan dan Pemberian Cuti (SURAT CUTI 2026)',
    versi: '2026.1',
    kotaSurat: 'Makassar',
    tujuanYth: 'Yth. Wali Kota Makassar',
    tujuanCqBaris1: 'Cq. Kepala Badan Kepegawaian dan',
    tujuanCqBaris2: 'Pengembangan SDM Daerah Kota Makassar',
    tujuanDi: 'Makassar',
    judulBagianDataPegawai: 'DATA PEGAWAI',
    judulBagianJenisCuti: 'JENIS CUTI YANG DIAMBIL',
    judulBagianAlasanCuti: 'ALASAN CUTI',
    judulBagianLamaCuti: 'LAMA CUTI',
    judulBagianCatatanCuti: 'CATATAN CUTI',
    judulBagianAlamatCuti: 'ALAMAT SELAMA MENJALANKAN CUTI',
    judulBagianPertimbanganAtasan: 'PERTIMBANGAN ATASAN LANGSUNG',
    judulBagianKeputusanPejabat: 'KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI',
    daftarJenisCuti: [
      { id: 'tahunan', nomorFormulir: 1, kode: '800.1.11.4', namaFormulir: 'Cuti Tahunan' },
      { id: 'besar', nomorFormulir: 2, kode: '800.1.11.2', namaFormulir: 'Cuti Besar' },
      { id: 'sakit', nomorFormulir: 3, kode: '800.1.11.3', namaFormulir: 'Cuti Sakit' },
      { id: 'melahirkan', nomorFormulir: 4, kode: '800.1.11.5', namaFormulir: 'Cuti Melahirkan' },
      { id: 'alasan-penting', nomorFormulir: 5, kode: '800.1.11.6', namaFormulir: 'Cuti Karena Alasan Penting' },
      { id: 'luar-tanggungan', nomorFormulir: 6, kode: '800.1.11.7', namaFormulir: 'Cuti di Luar Tanggungan Negara' },
    ],
    atasanDefaultJabatan: 'Kasubag Umum & Kepegawaian',
    atasanDefaultNama: 'Muhammad Rizal Saputra, S.IP',
    atasanDefaultNip: '19800101 200601 2 001',
    pejabatDefaultJabatan: 'Camat Tamalate',
    pejabatDefaultNama: 'Drs. H. Fahyuddin Yusuf, M.Si',
    pejabatDefaultPangkat: 'Pembina',
    pejabatDefaultNip: '19700101 199003 1 001',
    onlyOffice: {
      enabled: true,
      documentType: 'word',
      fileType: 'docx',
      templateKey: 'tpl-surat-cuti-tamalate-2026',
      s3Bucket: 'tamalate-vault',
      s3ObjectKey: 'templates/surat-cuti-2026.docx',
      callbackUrl: '/api/v1/simulation/templates/onlyoffice-callback',
      lastSyncedAt: '2026-11-06T07:00:00.000Z',
    },
  },
} as DocumentTemplateRegistry;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';

export function loadTemplateRegistry(): DocumentTemplateRegistry {
  if (typeof window === 'undefined') return DEFAULT_DOCUMENT_TEMPLATES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (raw) {
      const parsed = JSON.parse(raw) as DocumentTemplateRegistry;
      if (parsed && parsed.lembarDisposisi && parsed.bukuAgenda && parsed.suratCuti) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_DOCUMENT_TEMPLATES;
}

export function saveTemplateRegistry(
  registry: DocumentTemplateRegistry,
  actorRole = 'Admin Tata Naskah',
): DocumentTemplateRegistry {
  const next: DocumentTemplateRegistry = {
    ...registry,
    updatedAt: new Date().toISOString(),
    updatedBy: actorRole,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('tamalate-templates-sync'));
    } catch {
      // ignore quota error
    }
    fetch(`${API_BASE}/simulation/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registry: next, actorRole }),
    }).catch(() => {});
  }
  return next;
}

export async function fetchRemoteTemplateRegistry(): Promise<DocumentTemplateRegistry> {
  try {
    const res = await fetch(`${API_BASE}/simulation/templates`);
    if (res.ok) {
      const data = (await res.json()) as DocumentTemplateRegistry;
      if (data && data.lembarDisposisi && typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // fallback to local
  }
  return loadTemplateRegistry();
}

export function resetTemplateRegistry(): DocumentTemplateRegistry {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(DEFAULT_DOCUMENT_TEMPLATES));
      window.dispatchEvent(new CustomEvent('tamalate-templates-sync'));
    } catch {
      // ignore
    }
    fetch(`${API_BASE}/simulation/templates/reset`, { method: 'POST' }).catch(() => {});
  }
  return DEFAULT_DOCUMENT_TEMPLATES;
}
