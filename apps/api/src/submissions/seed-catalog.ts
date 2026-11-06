import type { PrismaClient } from '@prisma/client';

/**
 * Enam SOP resmi Kecamatan Tamalate, sumber PDF di
 * Documents/03_Riset_Dan_Analisis/SOP_Tamalate/SOP-Tamalate/
 * Nomor dokumen dan urutan aktivitas diambil dari Kepegawaian-Tamalate.v1-arsip.md.
 * State di bawah memetakan aktivitas SOP ke status workflow digital.
 */
export interface SeedState {
  readonly code: string;
  readonly label: string;
  readonly external?: boolean;
  readonly activityRef?: string;
}

export interface SeedSop {
  readonly code: string;
  readonly nomorDokumen: string;
  readonly nama: string;
  readonly jumlahAktivitas: number;
  readonly states: readonly SeedState[];
}

export const SEED_SOPS: readonly SeedSop[] = [
  {
    code: 'SOP-01',
    nomorDokumen: '02.10/SOP.AP/TM/IX/2016',
    nama: 'Pengajuan Pensiun PNS',
    jumlahAktivitas: 10,
    states: [
      { code: 'CALON', label: 'Calon BUP', activityRef: 'A1' },
      { code: 'DRAFT', label: 'Draf Usulan', activityRef: 'A2' },
      { code: 'VERIFIED', label: 'Diverifikasi Kasubbag', activityRef: 'A3' },
      { code: 'PARAF_SEKCAM', label: 'Paraf Sekcam', activityRef: 'A4' },
      { code: 'SIGNED_CAMAT', label: 'Ditandatangani Camat', activityRef: 'A5' },
      { code: 'AGENDA_KELUAR', label: 'Agenda Keluar', activityRef: 'A7' },
      { code: 'EXPEDITED', label: 'Ekspedisi', activityRef: 'A8' },
      { code: 'SENT_EXTERNAL', label: 'Dikirim BKPSDM', external: true, activityRef: 'A9' },
      { code: 'RETURNED_EXTERNAL', label: 'Tanda Terima Kembali', external: true, activityRef: 'A9' },
      { code: 'ARCHIVED', label: 'Diarsipkan', activityRef: 'A10' },
    ],
  },
  {
    code: 'SOP-02',
    nomorDokumen: '02.05/SOP.AP/TM/IX/2016',
    nama: 'Pengurusan Kenaikan Gaji Berkala',
    jumlahAktivitas: 9,
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
    code: 'SOP-03',
    nomorDokumen: '02.09/SOP.AP/TM/IX/2016',
    nama: 'Pengusulan Kenaikan Pangkat',
    jumlahAktivitas: 8,
    states: [
      { code: 'CANDIDATE', label: 'Identifikasi Kandidat', activityRef: 'A1' },
      { code: 'DRAFT', label: 'Daftar Usulan', activityRef: 'A2' },
      { code: 'LEGALISIR', label: 'Legaliser Disiapkan', activityRef: 'A3' },
      { code: 'VERIFIED', label: 'Verifikasi Kasubbag', activityRef: 'A4' },
      { code: 'PARAF_SEKCAM', label: 'Paraf Sekcam dan Kasi', activityRef: 'A5' },
      { code: 'SIGNED_CAMAT', label: 'Verifikasi dan Tanda Tangan Camat', activityRef: 'A6' },
      { code: 'SENT_EXTERNAL', label: 'Dikirim BKPSDM', external: true, activityRef: 'A7' },
      { code: 'SORTED', label: 'Sortir Rangkap', activityRef: 'A8' },
    ],
  },
  {
    code: 'SOP-04',
    nomorDokumen: '02.06/SOP.AP/TM/IX/2016',
    nama: 'Pembinaan Pegawai',
    jumlahAktivitas: 5,
    states: [
      { code: 'ATTENDANCE', label: 'Rekapitulasi Presensi', activityRef: 'A1' },
      { code: 'REPORTED', label: 'Laporan Pegawai Bermasalah', activityRef: 'A2' },
      { code: 'COORDINATED', label: 'Koordinasi Sekcam', activityRef: 'A3' },
      { code: 'VERIFIED_CAMAT', label: 'Verifikasi Camat', activityRef: 'A4' },
      { code: 'REPORTED_BKPSDM', label: 'Dilaporkan ke BKPSDM', external: true, activityRef: 'A5' },
    ],
  },
  {
    code: 'SOP-05',
    nomorDokumen: '02.08/SOP.AP/TM/IX/2016',
    nama: 'Permohonan Cuti',
    jumlahAktivitas: 9,
    states: [
      { code: 'DRAFT', label: 'Pengajuan Pegawai', activityRef: 'A1' },
      { code: 'VALIDATED', label: 'Validasi Kelengkapan dan Kuota', activityRef: 'A2' },
      { code: 'PARAF_SEKCAM', label: 'Paraf Sekcam', activityRef: 'A3' },
      { code: 'APPROVED_CAMAT', label: 'Disetujui Camat', activityRef: 'A4' },
      { code: 'SENT_EXTERNAL', label: 'Registrasi BKPSDM', external: true, activityRef: 'A5' },
      { code: 'RETURNED_EXTERNAL', label: 'Surat Cuti Diterima dari BKPSDM', external: true, activityRef: 'A6' },
      { code: 'RECEIPTED', label: 'Diserahkan ke Pegawai', activityRef: 'A7' },
      { code: 'ARCHIVED', label: 'Diarsipkan', activityRef: 'A9' },
    ],
  },
  {
    code: 'SOP-06',
    nomorDokumen: '02.04/SOP.AP/TM/IX/2016',
    nama: 'Pengarsipan Surat',
    jumlahAktivitas: 4,
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

export async function seedCatalog(prisma: PrismaClient): Promise<number> {
  // Hapus SOP sintetis lama jika ada (A.FONDASI, B.REGISTER, dst).
  const synthetic = [
    'A.FONDASI', 'B.REGISTER', 'C.NASKAH', 'D.SURAT_MASUK', 'E.PENSIUN',
    'F.KGB', 'G.PANGKAT', 'H.PEMBINAAN', 'I.CUTI', 'J.ARSIP', 'K.ADMIN', 'L.LINTAS',
  ];
  for (const code of synthetic) {
    const existing = await prisma.sopDefinition.findUnique({ where: { code } });
    if (existing) {
      await prisma.workflowState.deleteMany({ where: { version: { sopId: existing.id } } });
      await prisma.workflowVersion.deleteMany({ where: { sopId: existing.id } });
      await prisma.sopDefinition.delete({ where: { id: existing.id } });
    }
  }

  for (const sop of SEED_SOPS) {
    const definition = await prisma.sopDefinition.upsert({
      where: { code: sop.code },
      update: { nama: sop.nama },
      create: { code: sop.code, nama: sop.nama },
    });

    const version = await prisma.workflowVersion.upsert({
      where: { sopId_version: { sopId: definition.id, version: 1 } },
      update: {},
      create: {
        sopId: definition.id,
        version: 1,
        validFrom: new Date('2024-01-02T00:00:00Z'),
      },
    });

    for (const state of sop.states) {
      await prisma.workflowState.upsert({
        where: { versionId_code: { versionId: version.id, code: state.code } },
        update: { label: state.label, external: state.external ?? false },
        create: {
          versionId: version.id,
          code: state.code,
          label: state.label,
          external: state.external ?? false,
        },
      });
    }
  }

  return SEED_SOPS.length;
}
