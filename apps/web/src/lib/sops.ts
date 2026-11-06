export interface SopDef {
  readonly code: string;
  readonly nomor: string;
  readonly nama: string;
  readonly aktivitas: number;
  readonly subjectType: string;
  readonly states: readonly { code: string; label: string; activityRef: string; external?: boolean }[];
}

export const SOPS: readonly SopDef[] = [
  {
    code: 'SOP-01', nomor: '02.10/SOP.AP/TM/IX/2016', nama: 'Pengajuan Pensiun PNS', aktivitas: 10, subjectType: 'pension.case',
    states: [
      { code: 'CALON', label: 'Calon BUP', activityRef: 'A1' },
      { code: 'DRAFT', label: 'Draf Usulan', activityRef: 'A2' },
      { code: 'VERIFIED', label: 'Diverifikasi Kasubbag', activityRef: 'A3' },
      { code: 'PARAF_SEKCAM', label: 'Paraf Sekcam', activityRef: 'A4' },
      { code: 'SIGNED_CAMAT', label: 'Ditandatangani Camat', activityRef: 'A5' },
      { code: 'AGENDA_KELUAR', label: 'Agenda Keluar', activityRef: 'A7' },
      { code: 'EXPEDITED', label: 'Ekspedisi', activityRef: 'A8' },
      { code: 'SENT_EXTERNAL', label: 'Dikirim BKPSDM', activityRef: 'A9', external: true },
      { code: 'RETURNED_EXTERNAL', label: 'Tanda Terima Kembali', activityRef: 'A9', external: true },
      { code: 'ARCHIVED', label: 'Diarsipkan', activityRef: 'A10' },
    ],
  },
  {
    code: 'SOP-02', nomor: '02.05/SOP.AP/TM/IX/2016', nama: 'Pengurusan Kenaikan Gaji Berkala', aktivitas: 9, subjectType: 'kgb.request',
    states: [
      { code: 'WATCH', label: 'Pencermatan Buku KGB', activityRef: 'A1' },
      { code: 'COLLECTING', label: 'Pengumpulan Syarat', activityRef: 'A2' },
      { code: 'CHECKED', label: 'Diperiksa Kasubbag', activityRef: 'A3' },
      { code: 'COMPLETED_REQ', label: 'Syarat Lengkap', activityRef: 'A4' },
      { code: 'PARAF_SEKCAM', label: 'Paraf Sekcam', activityRef: 'A5' },
      { code: 'SIGNED_CAMAT', label: 'Tanda Tangan Camat', activityRef: 'A6' },
      { code: 'AGENDA_KELUAR', label: 'Agenda Keluar', activityRef: 'A7' },
      { code: 'EXPEDITED', label: 'Ekspedisi', activityRef: 'A8' },
      { code: 'RECEIPTED', label: 'Tanda Terima', activityRef: 'A9' },
    ],
  },
  {
    code: 'SOP-03', nomor: '02.09/SOP.AP/TM/IX/2016', nama: 'Pengusulan Kenaikan Pangkat', aktivitas: 8, subjectType: 'promotion.request',
    states: [
      { code: 'CANDIDATE', label: 'Identifikasi Kandidat', activityRef: 'A1' },
      { code: 'DRAFT', label: 'Daftar Usulan', activityRef: 'A2' },
      { code: 'LEGALISIR', label: 'Legalisir Disiapkan', activityRef: 'A3' },
      { code: 'VERIFIED', label: 'Verifikasi Kasubbag', activityRef: 'A4' },
      { code: 'PARAF_SEKCAM', label: 'Paraf Sekcam dan Kasi', activityRef: 'A5' },
      { code: 'SIGNED_CAMAT', label: 'Verifikasi dan Tanda Tangan Camat', activityRef: 'A6' },
      { code: 'SENT_EXTERNAL', label: 'Dikirim BKPSDM', activityRef: 'A7', external: true },
      { code: 'SORTED', label: 'Sortir Rangkap', activityRef: 'A8' },
    ],
  },
  {
    code: 'SOP-04', nomor: '02.06/SOP.AP/TM/IX/2016', nama: 'Pembinaan Pegawai', aktivitas: 5, subjectType: 'coaching.case',
    states: [
      { code: 'ATTENDANCE', label: 'Rekapitulasi Presensi', activityRef: 'A1' },
      { code: 'REPORTED', label: 'Laporan Pegawai Bermasalah', activityRef: 'A2' },
      { code: 'COORDINATED', label: 'Koordinasi Sekcam', activityRef: 'A3' },
      { code: 'VERIFIED_CAMAT', label: 'Verifikasi Camat', activityRef: 'A4' },
      { code: 'REPORTED_BKPSDM', label: 'Dilaporkan ke BKPSDM', activityRef: 'A5', external: true },
    ],
  },
  {
    code: 'SOP-05', nomor: '02.08/SOP.AP/TM/IX/2016', nama: 'Permohonan Cuti', aktivitas: 9, subjectType: 'leave.request',
    states: [
      { code: 'DRAFT', label: 'Pengajuan Pegawai', activityRef: 'A1' },
      { code: 'VALIDATED', label: 'Validasi Kelengkapan dan Kuota', activityRef: 'A2' },
      { code: 'PARAF_SEKCAM', label: 'Paraf Sekcam', activityRef: 'A3' },
      { code: 'APPROVED_CAMAT', label: 'Disetujui Camat', activityRef: 'A4' },
      { code: 'SENT_EXTERNAL', label: 'Registrasi BKPSDM', activityRef: 'A5', external: true },
      { code: 'RETURNED_EXTERNAL', label: 'Surat Cuti Diterima dari BKPSDM', activityRef: 'A6', external: true },
      { code: 'RECEIPTED', label: 'Diserahkan ke Pegawai', activityRef: 'A7' },
      { code: 'ARCHIVED', label: 'Diarsipkan', activityRef: 'A9' },
    ],
  },
  {
    code: 'SOP-06', nomor: '02.04/SOP.AP/TM/IX/2016', nama: 'Pengarsipan Surat', aktivitas: 4, subjectType: 'archive.batch',
    states: [
      { code: 'RECORDED', label: 'Pencatatan Dokumen', activityRef: 'A1' },
      { code: 'CLASSIFIED', label: 'Klasifikasi Kode Tata Naskah', activityRef: 'A2' },
      { code: 'NUMBERED', label: 'Penomoran Naskah', activityRef: 'A3' },
      { code: 'ACTIVE', label: 'Arsip Aktif', activityRef: 'A4' },
      { code: 'INACTIVE', label: 'Arsip Inaktif', activityRef: 'A4' },
      { code: 'VITAL', label: 'Arsip Vital', activityRef: 'A4' },
    ],
  },
];

export const SOPS_INDEX: ReadonlyMap<string, SopDef> = new Map(SOPS.map((s) => [s.code, s]));
