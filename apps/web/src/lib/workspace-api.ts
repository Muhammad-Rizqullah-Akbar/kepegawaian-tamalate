export interface PegawaiItem {
  id: string;
  nip: string;
  nama: string;
  gelar?: string | undefined;
  jabatan: string;
  unit: string;
  pangkat: string;
  golongan: string;
  eselon?: string | undefined;
  tmtPangkat: string;
  tmtKgbBerikutnya: string;
  tmtPensiun: string;
  gajiPokok: number;
  statusHadir: 'Hadir' | 'Dinas Luar' | 'Cuti' | 'Izin';
  waktuAbsen: string;
  radiusMeter: number;
  kelengkapanDossier: number;
  bsreStatus: 'Aktif' | 'Perlu Pembaruan';
  sisaCutiN: number;
  sisaCutiN1: number;
  sisaCutiN2: number;
  skorDisiplin: number;
  statusPembinaan: string;
}

export interface SuratTimelineItem {
  waktu: string;
  aktor: string;
  aksi: string;
  catatan: string;
}

export interface SuratItem {
  agenda: string;
  noSurat: string;
  asal: string;
  perihal: string;
  tglSurat: string;
  tglTerima: string;
  sifat: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
  klasifikasi: string;
  tahap: 1 | 2 | 3 | 4;
  statusLabel: string;
  parafSekcam: boolean;
  waktuParafSekcam?: string | undefined;
  catatanSekcam?: string | undefined;
  disposisiCamat: boolean;
  waktuDisposisiCamat?: string | undefined;
  instruksiCamat?: string | undefined;
  tujuanDisposisi: string[];
  tenggat?: string | undefined;
  tteBsreHash?: string | undefined;
  tindakLanjutOleh?: string | undefined;
  tindakLanjutRingkasan?: string | undefined;
  waktuTindakLanjut?: string | undefined;
  noArsip?: string | undefined;
  lokasiArsip?: string | undefined;
  tahunArsip?: number | undefined;
  riwayat: SuratTimelineItem[];
}

export interface BerkasChecklistItem {
  kode: string;
  nama: string;
  status: 'ada' | 'kurang' | 'perbaikan';
}

export interface UsulanItem {
  id: string;
  jenis: 'KGB' | 'PANGKAT' | 'CUTI' | 'PENSIUN';
  nip: string;
  nama: string;
  pangkatGol: string;
  jabatan: string;
  subJenis: string;
  tmtTarget: string;
  detailRingkas: string;
  tahap: 1 | 2 | 3 | 4 | 5;
  tahapLabel: string;
  progressPersen: number;
  nomorSk?: string | undefined;
  berkas: BerkasChecklistItem[];
}

export interface PresensiItem {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  tanggal: string;
  waktu: string;
  tipe: 'MASUK' | 'APEL' | 'PULANG';
  jarakMeter: number;
  koordinat: string;
  statusValidasi: 'VALID_GEOFENCE' | 'DILUAR_RADIUS';
  fotoUrl?: string | undefined;
}

export interface AuditItem {
  seq: number;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  prevHash: string;
  entryHash: string;
  createdAt: string;
}

export interface BootstrapResponse {
  status: string;
  timestamp: string;
  summary: {
    totalPegawai: number;
    hadirHariIni: number;
    dinasLuar: number;
    cutiIzin: number;
    totalSurat: number;
    suratMenungguParaf: number;
    suratMenungguDisposisi: number;
    suratTindakLanjut: number;
    suratTerarsip: number;
    totalUsulan: number;
    usulanKgb: number;
    usulanPangkat: number;
    usulanCuti: number;
    usulanPensiun: number;
    rataKelengkapanDossier: number;
    kepatuhanSlaPersen: number;
  };
  pegawai: PegawaiItem[];
  surat: SuratItem[];
  usulan: UsulanItem[];
  presensi: PresensiItem[];
  auditChain: AuditItem[];
}

const STAGE_LABELS: Record<number, string> = {
  1: '1. Inisiasi & Pengajuan',
  2: '2. Verifikasi Dossier Umpeg',
  3: '3. Paraf Validasi Sekcam',
  4: '4. Penetapan & TTE Camat',
  5: '5. SK Terbit & Terarsip',
};

const BERKAS_LABELS: Record<string, string> = {
  'sk-pangkat': 'SK Pangkat Terakhir',
  'sk-kgb-lama': 'SK KGB Terakhir',
  'skp-2thn': 'Penilaian SKP 2 Tahun',
  'skp-2-tahun': 'Penilaian SKP 2 Tahun',
  'spmk': 'Surat Pernyataan Melaksanakan Tugas',
  'spmt': 'Surat Pernyataan Melaksanakan Tugas',
  'skp-2thn-pangkat': 'Penilaian SKP 2 Tahun',
  'stlud': 'Sertifikat Ujian Dinas / Ijazah',
  'drh': 'Daftar Riwayat Hidup',
  'form-cuti': 'Formulir Permintaan & Pemberian Cuti',
  'bukti-dukung': 'Dokumen Bukti Pendukung',
  'dpcp': 'Data Perorangan Calon Penerima Pensiun',
  'sk-cpns-pns': 'SK CPNS & SK PNS',
  'kpi-keluarga': 'Kartu Pegawai & Susunan Keluarga',
  'dokumen-utama': 'Dokumen Pengantar Utama',
  'sk-terakhir': 'SK Kepegawaian Terakhir',
  'sk-kp-terakhir': 'SK Pangkat Terakhir',
  'ijazah-transkrip': 'Ijazah & Transkrip Nilai Terakhir',
  'uraian-tugas': 'Uraian Tugas & Rekomendasi',
  'pelimpahan-tugas': 'Surat Pelimpahan Tugas',
  'rekap-kehadiran': 'Rekap Kehadiran & Bebas Sanksi',
  'skp-tahunan': 'Evaluasi Kinerja Tahunan (SKP)',
};

export async function fetchBootstrap(): Promise<BootstrapResponse> {
  const res = await fetch('/api/v1/simulation/bootstrap', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Bootstrap gagal: ${res.status}`);
  }
  const envelope = (await res.json()) as Record<string, unknown>;
  const raw =
    envelope.data && typeof envelope.data === 'object'
      ? (envelope.data as Record<string, unknown>)
      : envelope;

  const rawPegawai = Array.isArray(raw.pegawai)
    ? (raw.pegawai as Record<string, unknown>[])
    : [];
  const pegawai: PegawaiItem[] = rawPegawai.map((p, idx) => {
    const gajiStr = String(p.gajiBaru ?? p.gajiLama ?? '4500000').replace(/[^0-9]/g, '');
    const gajiNum = Number(gajiStr) || 4500000;
    const skor = Number(p.skorDisiplin ?? 94);
    return {
      id: `PEG-${idx + 1}`,
      nip: String(p.nip ?? ''),
      nama: String(p.nama ?? ''),
      jabatan: String(p.jabatan ?? ''),
      unit: String(p.unit ?? 'Kecamatan Tamalate'),
      pangkat: String(p.pangkat ?? 'Penata'),
      golongan: String(p.gol ?? 'III/c'),
      tmtPangkat: '01-04-2023',
      tmtKgbBerikutnya: '01-05-2026',
      tmtPensiun: '01-09-2035',
      gajiPokok: gajiNum,
      statusHadir: idx === 8 ? 'Dinas Luar' : idx === 9 ? 'Cuti' : 'Hadir',
      waktuAbsen: `07:${String(25 + (idx % 20)).padStart(2, '0')} WITA`,
      radiusMeter: 12 + (idx * 3) % 30,
      kelengkapanDossier: 88 + (idx % 12),
      bsreStatus: 'Aktif',
      sisaCutiN: Number(p.sisaCutiN ?? 12),
      sisaCutiN1: Number(p.sisaCutiN1 ?? 4),
      sisaCutiN2: Number(p.sisaCutiN2 ?? 2),
      skorDisiplin: skor,
      statusPembinaan: skor >= 90 ? 'Sangat Baik (Disiplin Penuh)' : 'Baik (Sesuai PP 94/2021)',
    };
  });

  const rawSurat = Array.isArray(raw.suratList)
    ? (raw.suratList as Record<string, unknown>[])
    : [];
  const surat: SuratItem[] = rawSurat.map((s) => {
    const disp = (s.disposisi as Record<string, unknown>) ?? {};
    const tl = (s.tindakLanjut as Record<string, unknown>) ?? {};
    const ars = (s.arsip as Record<string, unknown>) ?? {};
    const rawTahap = Number(s.tahap ?? 1);
    const tahap: 1 | 2 | 3 | 4 =
      rawTahap >= 4 ? 4 : rawTahap === 3 ? 3 : rawTahap === 2 ? 2 : 1;

    const sifatCode = String(s.sifat ?? 'B');
    const sifat: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia' =
      sifatCode === 'SR' ? 'Segera' : sifatCode === 'R' ? 'Rahasia' : 'Penting';

    const diketahuiSekcam = Boolean(disp.diketahuiSekcam);
    const hasParafCamat = Boolean(disp.hasParafCamat);

    const statusLabel =
      tahap === 4
        ? 'Terarsip Selesai'
        : tahap === 3
          ? 'Dalam Tindak Lanjut'
          : hasParafCamat
            ? 'Disposisi Camat Turun'
            : diketahuiSekcam
              ? 'Menunggu Disposisi Camat'
              : 'Menunggu Paraf Sekcam';

    const riwayat: SuratTimelineItem[] = [
      {
        waktu: String(s.tanggalAgenda ?? '2026-04-18'),
        aktor: 'Operator Pengendali Surat',
        aksi: 'Registrasi Agenda Surat Masuk',
        catatan: `Naskah dari ${String(s.asal ?? '')} dicatat ke Buku Agenda.`,
      },
    ];
    if (diketahuiSekcam) {
      riwayat.push({
        waktu: String(disp.tanggalSekcam || s.tanggalAgenda || '2026-04-18'),
        aktor: String(disp.parafSekcamOleh || 'Sekretaris Camat'),
        aksi: 'Paraf Validasi Sekcam (Tertanda 1)',
        catatan: String(disp.catatanSekcam || 'Telah diperiksa Sekcam.'),
      });
    }
    if (hasParafCamat) {
      riwayat.push({
        waktu: String(disp.tanggalDisposisi || s.tanggalAgenda || '2026-04-18'),
        aktor: String(disp.parafOleh || 'Camat Tamalate'),
        aksi: 'Disposisi Camat & Segel TTE BSrE (Tertanda 2)',
        catatan: String(disp.instruksi || 'Tindak lanjuti sesuai ketentuan.'),
      });
    }
    if (tl.catatan) {
      riwayat.push({
        waktu: String(tl.tanggal || '2026-04-19'),
        aktor: String(tl.petugas || 'Kasubag Umpeg'),
        aksi: 'Pelaksanaan Tindak Lanjut Unit',
        catatan: String(tl.catatan),
      });
    }

    return {
      agenda: String(s.agenda ?? ''),
      noSurat: String(s.nomorSurat ?? ''),
      asal: String(s.asal ?? ''),
      perihal: String(s.perihal ?? ''),
      tglSurat: String(s.tanggalSurat ?? ''),
      tglTerima: String(s.tanggalAgenda ?? ''),
      sifat,
      klasifikasi: String(ars.kodeKlasifikasi ?? '800.1'),
      tahap,
      statusLabel,
      parafSekcam: diketahuiSekcam,
      waktuParafSekcam: disp.tanggalSekcam ? String(disp.tanggalSekcam) : undefined,
      catatanSekcam: disp.catatanSekcam ? String(disp.catatanSekcam) : undefined,
      disposisiCamat: hasParafCamat,
      waktuDisposisiCamat: disp.tanggalDisposisi ? String(disp.tanggalDisposisi) : undefined,
      instruksiCamat: disp.instruksi ? String(disp.instruksi) : undefined,
      tujuanDisposisi: Array.isArray(disp.diteruskan)
        ? (disp.diteruskan as string[])
        : [],
      tenggat: '2026-04-25',
      tteBsreHash: disp.tteCert ? String(disp.tteCert) : 'BSRE-TML-2026-VERIFIED',
      tindakLanjutOleh: tl.petugas ? String(tl.petugas) : undefined,
      tindakLanjutRingkasan: tl.catatan ? String(tl.catatan) : undefined,
      waktuTindakLanjut: tl.tanggal ? String(tl.tanggal) : undefined,
      noArsip: tahap === 4 ? `ARS/${String(s.agenda ?? '')}` : undefined,
      lokasiArsip: ars.lokasiFisik ? String(ars.lokasiFisik) : undefined,
      tahunArsip: Number(ars.tahun ?? 2026),
      riwayat,
    };
  });

  const rawUsulan = Array.isArray(raw.usulanList)
    ? (raw.usulanList as Record<string, unknown>[])
    : [];
  const usulan: UsulanItem[] = rawUsulan.map((u) => {
    const jenisRaw = String(u.jenis ?? 'kgb').toUpperCase();
    const jenis: 'KGB' | 'PANGKAT' | 'CUTI' | 'PENSIUN' =
      jenisRaw === 'PANGKAT'
        ? 'PANGKAT'
        : jenisRaw === 'CUTI'
          ? 'CUTI'
          : jenisRaw === 'PENSIUN'
            ? 'PENSIUN'
            : 'KGB';
    const rawTahap = Number(u.tahap ?? 1);
    const tahap: 1 | 2 | 3 | 4 | 5 =
      rawTahap >= 5 ? 5 : rawTahap === 4 ? 4 : rawTahap === 3 ? 3 : rawTahap === 2 ? 2 : 1;

    const berkasObj = (u.berkas as Record<string, 'ada' | 'kurang' | 'perbaikan'>) ?? {};
    const berkas: BerkasChecklistItem[] = Object.entries(berkasObj).map(([k, st]) => ({
      kode: k,
      nama: BERKAS_LABELS[k] ?? k.toUpperCase(),
      status: st,
    }));

    const penetapan = (u.penetapanCamat as Record<string, unknown>) ?? null;

    return {
      id: String(u.id ?? ''),
      jenis,
      nip: String(u.pegawaiNip ?? ''),
      nama: String(u.nama ?? ''),
      pangkatGol: `${String(u.pangkat ?? '')} (${String(u.gol ?? '')})`,
      jabatan: String(u.jabatan ?? ''),
      subJenis:
        jenis === 'CUTI'
          ? String(u.jenisCuti ?? 'Cuti Tahunan')
          : jenis === 'PANGKAT'
            ? `Kenaikan Pangkat ke ${String(u.golBaru ?? 'IV/a')}`
            : jenis === 'PENSIUN'
              ? 'Pensiun BUP'
              : `KGB Berkala (${String(u.mkgBaru ?? '14 Tahun')})`,
      tmtTarget: String(u.tmtRencana ?? '01-05-2026'),
      detailRingkas: String(u.catatanKasubag ?? ''),
      tahap,
      tahapLabel: STAGE_LABELS[tahap] ?? 'Proses Verifikasi',
      progressPersen: tahap * 20,
      nomorSk: penetapan?.nomorSk ? String(penetapan.nomorSk) : undefined,
      berkas,
    };
  });

  const rawPresensi = Array.isArray(raw.presensiList)
    ? (raw.presensiList as Record<string, unknown>[])
    : [];
  const presensi: PresensiItem[] = rawPresensi.map((pr, idx) => ({
    id: String(pr.id ?? `PRES-${idx + 1}`),
    nip: String(pr.nip ?? '198501012010011001'),
    nama: String(pr.nama ?? ''),
    jabatan: String(pr.jabatan ?? ''),
    tanggal: '2026-04-18',
    waktu: String(pr.jamMasuk ?? '07:35 WITA'),
    tipe: 'APEL',
    jarakMeter: Number(pr.jarakMeter ?? 18),
    koordinat: '-5.1824, 119.4182',
    statusValidasi: Number(pr.jarakMeter ?? 18) <= 50 ? 'VALID_GEOFENCE' : 'DILUAR_RADIUS',
  }));

  const rawAudits = Array.isArray(raw.audits)
    ? (raw.audits as Record<string, unknown>[])
    : [];
  const auditChain: AuditItem[] = rawAudits.map((a, idx) => ({
    seq: Number(a.id ?? idx + 1),
    action: String(a.action ?? ''),
    actorId: 'Camat / Sekcam / Umpeg',
    targetType: String(a.subjectType ?? ''),
    targetId: String(a.subjectId ?? '').slice(0, 12),
    prevHash: String(a.prevHash ?? 'GENESIS'),
    entryHash: String(a.ownHash ?? ''),
    createdAt: String(a.createdAt ?? new Date().toISOString()),
  }));

  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    summary: {
      totalPegawai: pegawai.length,
      hadirHariIni: pegawai.filter((p) => p.statusHadir === 'Hadir').length,
      dinasLuar: pegawai.filter((p) => p.statusHadir === 'Dinas Luar').length,
      cutiIzin: pegawai.filter((p) => p.statusHadir === 'Cuti' || p.statusHadir === 'Izin').length,
      totalSurat: surat.length,
      suratMenungguParaf: surat.filter((s) => !s.parafSekcam).length,
      suratMenungguDisposisi: surat.filter((s) => s.parafSekcam && !s.disposisiCamat).length,
      suratTindakLanjut: surat.filter((s) => s.tahap === 3 || (s.disposisiCamat && s.tahap < 4)).length,
      suratTerarsip: surat.filter((s) => s.tahap === 4).length,
      totalUsulan: usulan.length,
      usulanKgb: usulan.filter((u) => u.jenis === 'KGB').length,
      usulanPangkat: usulan.filter((u) => u.jenis === 'PANGKAT').length,
      usulanCuti: usulan.filter((u) => u.jenis === 'CUTI').length,
      usulanPensiun: usulan.filter((u) => u.jenis === 'PENSIUN').length,
      rataKelengkapanDossier: 93,
      kepatuhanSlaPersen: 96,
    },
    pegawai,
    surat,
    usulan,
    presensi,
    auditChain,
  };
}

export async function createSuratApi(payload: {
  noSurat: string;
  asal: string;
  perihal: string;
  sifat?: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia' | undefined;
  klasifikasi?: string | undefined;
  actor?: string | undefined;
}) {
  const sifatCode: 'B' | 'R' | 'SR' =
    payload.sifat === 'Segera' ? 'SR' : payload.sifat === 'Rahasia' ? 'R' : 'B';
  const res = await fetch('/api/v1/simulation/surat-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agenda: '',
      nomorSurat: payload.noSurat,
      tanggalSurat: new Date().toISOString().slice(0, 10),
      asal: payload.asal,
      perihal: payload.perihal,
      sifat: sifatCode,
      lampiran: '1 Berkas',
      actorRole: payload.actor ?? 'operator',
    }),
  });
  if (!res.ok) throw new Error(`Gagal membuat surat: ${res.status}`);
  return res.json();
}

export async function updateSuratApi(
  agenda: string,
  payload: {
    aksi: 'PARAF_SEKCAM' | 'DISPOSISI_CAMAT' | 'TINDAK_LANJUT' | 'ARSIPKAN';
    actor?: string | undefined;
    catatanSekcam?: string | undefined;
    instruksiCamat?: string | undefined;
    tujuanDisposisi?: string[] | undefined;
    tenggat?: string | undefined;
    tindakLanjutRingkasan?: string | undefined;
    lokasiArsip?: string | undefined;
  },
) {
  const res = await fetch(
    `/api/v1/simulation/surat-update/${encodeURIComponent(agenda)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: payload.aksi,
        actorRole: payload.actor ?? 'camat',
        catatanSekcam: payload.catatanSekcam,
        instruksiCamat: payload.instruksiCamat,
        diteruskan: payload.tujuanDisposisi,
        catatanTindakLanjut: payload.tindakLanjutRingkasan,
        lokasiFisik: payload.lokasiArsip,
      }),
    },
  );
  if (!res.ok) throw new Error(`Gagal memperbarui surat: ${res.status}`);
  return res.json();
}

export async function advanceUsulanApi(id: string, actor?: string | undefined) {
  const res = await fetch(
    `/api/v1/simulation/usulan-advance/${encodeURIComponent(id)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorRole: actor ?? 'camat' }),
    },
  );
  if (!res.ok) throw new Error(`Gagal memajukan usulan: ${res.status}`);
  return res.json();
}

export async function toggleBerkasApi(
  id: string,
  kodeBerkas: string,
  status: 'ada' | 'kurang' | 'perbaikan',
) {
  const res = await fetch(
    `/api/v1/simulation/usulan-berkas/${encodeURIComponent(id)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ berkasKey: kodeBerkas, status }),
    },
  );
  if (!res.ok) throw new Error(`Gagal memperbarui berkas: ${res.status}`);
  return res.json();
}

export async function createUsulanApi(payload: {
  jenis: 'KGB' | 'PANGKAT' | 'CUTI' | 'PENSIUN';
  nip: string;
  subJenis: string;
  tmtTarget: string;
  detailRingkas: string;
  actor?: string | undefined;
}) {
  const res = await fetch('/api/v1/simulation/usulan-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jenis: payload.jenis.toLowerCase() as 'kgb' | 'pangkat' | 'cuti' | 'pensiun',
      pegawaiNip: payload.nip,
      jenisCuti: payload.subJenis,
      tmtRencana: payload.tmtTarget,
      catatan: payload.detailRingkas,
    }),
  });
  if (!res.ok) throw new Error(`Gagal membuat usulan: ${res.status}`);
  return res.json();
}

export async function recordPresensiApi(payload: {
  nip: string;
  nama: string;
  jabatan: string;
  tipe?: 'MASUK' | 'APEL' | 'PULANG' | undefined;
  jarakMeter?: number | undefined;
  koordinat?: string | undefined;
  fotoBase64?: string | undefined;
}) {
  const res = await fetch('/api/v1/simulation/presensi-record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nip: payload.nip,
      nama: payload.nama,
      jabatan: payload.jabatan,
      jarakMeter: payload.jarakMeter ?? 16,
      photoDataUrl: payload.fotoBase64,
    }),
  });
  if (!res.ok) throw new Error(`Gagal mencatat presensi: ${res.status}`);
  return res.json();
}

export async function uploadDossierApi(payload: {
  nip: string;
  kategori: string;
  fileName: string;
  contentBase64: string;
  mimeType?: string | undefined;
}) {
  const res = await fetch('/api/v1/simulation/dossier-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: payload.nip,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      dataUrl: payload.contentBase64,
    }),
  });
  if (!res.ok) throw new Error(`Gagal mengunggah dossier: ${res.status}`);
  return res.json();
}

export async function downloadPdfApi(payload: {
  title: string;
  nomor: string;
  htmlBody: string;
}) {
  const res = await fetch('/api/v1/simulation/render-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title,
      html: `<h2>${payload.title}</h2><p><strong>Nomor Dokumen:</strong> ${payload.nomor}</p>${payload.htmlBody}`,
    }),
  });
  if (!res.ok) throw new Error(`Gagal merender PDF: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${payload.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function resetSimulationApi() {
  const res = await fetch('/api/v1/simulation/reset', { method: 'POST' });
  if (!res.ok) throw new Error(`Gagal mereset simulasi: ${res.status}`);
  return res.json();
}

/* ============================================================
   TYPED ADAPTERS FOR SURAT PAPER TEMPLATES, DESKTOP, & MOBILE
   ============================================================ */

export interface SuratAuditTrailItem {
  timestamp: string;
  user: string;
  action: string;
  note?: string | undefined;
}

export interface SuratDisposisiData {
  diketahuiSekcam?: boolean | undefined;
  catatanSekcam?: string | undefined;
  rekomendasiSekcam?: string[] | undefined;
  parafSekcamImage?: string | undefined;
  parafSekcamOleh?: string | undefined;
  instruksi?: string | undefined;
  tanggalDisposisi?: string | undefined;
  parafOleh?: string | undefined;
  hasParaf?: boolean | undefined;
  parafMode?: 'canvas' | 'vault' | 'tte_barcode' | undefined;
  parafImage?: string | undefined;
  diteruskan?: string[] | undefined;
  kembalikanKepada?: string | undefined;
  kembalikanTanggal?: string | undefined;
}

export interface SuratRecord {
  agenda: string;
  nomorSurat: string;
  asal: string;
  instansiTujuan: string;
  perihal: string;
  tanggalAgenda: string;
  tanggalPenerimaan: string;
  tanggalPenyelesaian?: string | undefined;
  tanggalSurat: string;
  sifat: string;
  lampiran: string;
  tahap: number;
  status: 'baru' | 'disposisi' | 'proses' | 'selesai' | 'terlambat';
  penanggungJawab?: string | undefined;
  keterangan?: string | undefined;
  berkasPdf?: string | undefined;
  berkasNama?: string | undefined;
  berkasUkuran?: string | undefined;
  disposisi: SuratDisposisiData;
  tindakLanjut?:
    | {
        catatan: string;
        petugas: string;
        tanggal: string;
      }
    | undefined;
  arsip?:
    | {
        kodeKlasifikasi: string;
        lokasiFisik: string;
        tahun: string;
        retensiTahun: number;
        statusArsip: string;
      }
    | undefined;
  auditTrail: SuratAuditTrailItem[];
}

export interface UsulanBerkasRecord {
  kode: string;
  nama: string;
  lengkap: boolean;
}

export interface UsulanRecord {
  id: string;
  jenis: string;
  nip: string;
  nama: string;
  pangkat: string;
  golongan: string;
  jabatan: string;
  tmtTarget: string;
  sisaHari: number;
  tahap: number;
  status: string;
  catatanRevisi?: string | undefined;
  signatureMethod?: 'bsre' | 'qr' | 'basah' | undefined;
  pemeriksaKasubbag?: string | undefined;
  penelaahSekcam?: string | undefined;
  penetapanCamat?: string | undefined;
  berkas: UsulanBerkasRecord[];
}

export interface PegawaiRecord {
  nip: string;
  nama: string;
  pangkat: string;
  golongan: string;
  jabatan: string;
  unit: string;
  tmtKgbBerikutnya: string;
  tmtPangkatBerikutnya: string;
  tidakHadirMingguIni: number;
  gajiPokok?: number | undefined;
  sisaCutiN?: number | undefined;
  sisaCutiN1?: number | undefined;
  sisaCutiN2?: number | undefined;
}

export interface PresensiRecord {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  unit: string;
  apelPagi: string;
  apelSore: string;
  jarakMeter: number;
  status: string;
}

export interface DossierAccessRequest {
  requestorNip: string;
  requestorNama: string;
  requestorRole: string;
  status: 'pending' | 'granted' | 'denied';
  tanggal: string;
  alasan?: string;
}

export interface DossierRecord {
  id: string;
  pegawaiNip: string;
  pegawaiNama: string;
  partisi: string;
  judul: string;
  ukuranKb: number;
  tanggalUnggah: string;
  terverifikasi: boolean;
  isGlobal?: boolean;
  folder?: string;
  accessLevel?: 'publik' | 'struktural' | 'rahasia';
  accessRequests?: { [requestorNip: string]: DossierAccessRequest };
}

export interface SimulationBootstrapPayload {
  stats: {
    totalPegawai: number;
    hadirPagi: number;
    suratMenunggu: number;
    mendekatiBatas: number;
  };
  surat: SuratRecord[];
  usulan: UsulanRecord[];
  pegawai: PegawaiRecord[];
  presensi: PresensiRecord[];
  dossier: DossierRecord[];
}

const DEFAULT_FALLBACK_SURAT: SuratRecord[] = [
  {
    agenda: '0042/VI/2026',
    nomorSurat: '005/214/BKP-SDMD/VI/2026',
    asal: 'BKP-SDMD Kota Makassar',
    instansiTujuan: 'BKP-SDMD Kota Makassar',
    perihal: 'Verifikasi Berkas Usulan Kenaikan Pangkat Periode Oktober 2026 ASN Kecamatan Tamalate',
    tanggalAgenda: '18-06-2026',
    tanggalPenerimaan: '18-06-2026',
    tanggalPenyelesaian: '21-06-2026',
    tanggalSurat: '17-06-2026',
    sifat: 'R',
    lampiran: '1 berkas',
    tahap: 2,
    status: 'disposisi',
    penanggungJawab: 'Kasubag Umum',
    keterangan: 'DiTL',
    berkasNama: '005_214_BKP_SDMD_VI_2026_VerifikasiBerkas.pdf',
    berkasUkuran: '1.4 MB',
    disposisi: {
      diketahuiSekcam: true,
      catatanSekcam: 'Cukup mengetahui surat naskah masuk, mohon arahan tindak lanjut Bapak Camat.',
      rekomendasiSekcam: ['2'],
      instruksi: 'Segera verifikasi kelengkapan berkas KGB dan KP sebelum tenggat kota.',
      tanggalDisposisi: '18-06-2026',
      parafOleh: 'Drs. H. Sutrisno Hadi, M.Si (Camat)',
      hasParaf: false,
      parafMode: 'vault',
      diteruskan: ['2'],
      kembalikanKepada: 'Subbagian Umum dan Kepegawaian',
      kembalikanTanggal: '21-06-2026',
    },
    auditTrail: [
      {
        timestamp: '18-06-2026 08:15',
        user: 'Siti Rahmawati, A.Md (Operator)',
        action: 'Registrasi Buku Agenda 8 Kolom',
        note: 'Nomor agenda 0042/VI/2026 diterbitkan.',
      },
      {
        timestamp: '18-06-2026 09:05',
        user: 'Ir. H. Syamsul Bahri, M.Si (Sekcam)',
        action: 'Paraf Mengetahui Sekcam (Tertanda 1)',
        note: 'Rekomendasi diteruskan ke Kasubag Umum dan Kepegawaian.',
      },
    ],
  },
];

export async function fetchSimulationBootstrap(): Promise<SimulationBootstrapPayload> {
  try {
    const res = await fetch('/api/v1/simulation/bootstrap', { cache: 'no-store' });
    if (!res.ok) throw new Error('Bootstrap HTTP error');
    const envelope = (await res.json()) as Record<string, unknown>;
    const raw =
      envelope.data && typeof envelope.data === 'object'
        ? (envelope.data as Record<string, unknown>)
        : envelope;

    const rawSurat = Array.isArray(raw.suratList) ? (raw.suratList as Record<string, unknown>[]) : [];
    const surat: SuratRecord[] = rawSurat.length
      ? rawSurat.map((s) => {
          const disp = (s.disposisi as Record<string, unknown>) ?? {};
          const tl = (s.tindakLanjut as Record<string, unknown>) ?? {};
          const ars = (s.arsip as Record<string, unknown>) ?? {};
          const rawStatus = String(s.status ?? 'disposisi');
          const status: SuratRecord['status'] =
            rawStatus === 'baru' ||
            rawStatus === 'disposisi' ||
            rawStatus === 'proses' ||
            rawStatus === 'selesai' ||
            rawStatus === 'terlambat'
              ? rawStatus
              : 'disposisi';

          return {
            agenda: String(s.agenda ?? '0042/VI/2026'),
            nomorSurat: String(s.nomorSurat ?? '-'),
            asal: String(s.asal ?? 'Pemerintah Kota Makassar'),
            instansiTujuan: String(s.instansiTujuan ?? s.asal ?? 'Pemerintah Kota Makassar'),
            perihal: String(s.perihal ?? ''),
            tanggalAgenda: String(s.tanggalAgenda ?? '18-06-2026'),
            tanggalPenerimaan: String(s.tanggalPenerimaan ?? s.tanggalAgenda ?? '18-06-2026'),
            tanggalPenyelesaian: String(s.tanggalPenyelesaian ?? '21-06-2026'),
            tanggalSurat: String(s.tanggalSurat ?? '17-06-2026'),
            sifat: String(s.sifat ?? 'B'),
            lampiran: String(s.lampiran ?? '1 berkas'),
            tahap: Number(s.tahap ?? 2),
            status,
            penanggungJawab: String(s.penanggungJawab ?? 'Kasubag Umum'),
            keterangan: String(s.keterangan ?? disp.instruksi ?? 'DiTL'),
            disposisi: {
              diketahuiSekcam: Boolean(disp.diketahuiSekcam),
              catatanSekcam: String(
                disp.catatanSekcam ??
                  'Cukup mengetahui surat naskah masuk, mohon arahan tindak lanjut Bapak Camat.',
              ),
              rekomendasiSekcam: Array.isArray(disp.rekomendasiSekcam)
                ? (disp.rekomendasiSekcam as string[])
                : ['2'],
              instruksi: String(disp.instruksi ?? ''),
              tanggalDisposisi: String(disp.tanggalDisposisi ?? '19-06-2026'),
              parafOleh: String(disp.parafOleh ?? 'Drs. H. Sutrisno Hadi, M.Si (Camat)'),
              hasParaf: Boolean(disp.hasParafCamat || disp.hasParaf),
              parafMode:
                disp.parafMode === 'tte_barcode'
                  ? 'tte_barcode'
                  : disp.parafMode === 'canvas'
                    ? 'canvas'
                    : 'vault',
              parafImage: disp.parafImage ? String(disp.parafImage) : undefined,
              diteruskan: Array.isArray(disp.diteruskan) && disp.diteruskan.length
                ? (disp.diteruskan as string[]).map(String)
                : ['2'],
              kembalikanKepada: String(disp.kembalikanKepada ?? 'Subbagian Umum dan Kepegawaian'),
              kembalikanTanggal: String(disp.kembalikanTanggal ?? '21-06-2026'),
            },
            tindakLanjut: tl.catatan
              ? {
                  catatan: String(tl.catatan),
                  petugas: String(tl.petugas ?? 'Kasubag Umum'),
                  tanggal: String(tl.tanggal ?? '19-06-2026'),
                }
              : undefined,
            arsip: ars.kodeKlasifikasi
              ? {
                  kodeKlasifikasi: String(ars.kodeKlasifikasi),
                  lokasiFisik: String(ars.lokasiFisik ?? 'Lemari Arsip Tamalate B-2'),
                  tahun: String(ars.tahun ?? '2026'),
                  retensiTahun: Number(ars.retensiTahun ?? 5),
                  statusArsip: String(ars.statusArsip ?? 'aktif'),
                }
              : undefined,
            auditTrail: [
              {
                timestamp: String(s.tanggalAgenda ?? '18-06-2026') + ' 08:20',
                user: 'Siti Rahmawati, A.Md (Operator)',
                action: 'Registrasi Buku Agenda 8 Kolom',
                note: `Surat dari ${String(s.asal ?? '')} dicatat.`,
              },
              ...(disp.diketahuiSekcam
                ? [
                    {
                      timestamp: String(disp.tanggalSekcam ?? s.tanggalAgenda ?? '18-06-2026') + ' 09:15',
                      user: 'Ir. H. Syamsul Bahri, M.Si (Sekcam)',
                      action: 'Paraf Mengetahui Sekcam (Tertanda 1)',
                      note: String(disp.catatanSekcam ?? 'Telah ditelaah Sekcam.'),
                    },
                  ]
                : []),
              ...(disp.hasParafCamat || disp.hasParaf
                ? [
                    {
                      timestamp: String(disp.tanggalDisposisi ?? '19-06-2026') + ' 10:05',
                      user: 'Drs. H. Sutrisno Hadi, M.Si (Camat)',
                      action: 'Pengesahan Disposisi Camat (Tertanda 2)',
                      note: String(disp.instruksi ?? 'DiTL sesuai ketentuan.'),
                    },
                  ]
                : []),
            ],
          };
        })
      : DEFAULT_FALLBACK_SURAT;

    const rawUsulan = Array.isArray(raw.usulanList) ? (raw.usulanList as Record<string, unknown>[]) : [];
    const usulan: UsulanRecord[] = rawUsulan.map((u) => {
      const berkasMap = (u.berkas as Record<string, string>) ?? {};
      const berkas: UsulanBerkasRecord[] = Object.entries(berkasMap).map(([kode, st]) => ({
        kode,
        nama: BERKAS_LABELS[kode] ?? kode.toUpperCase(),
        lengkap: st === 'ada',
      }));
      const tahapNum = Number(u.tahap ?? 2);
      return {
        id: String(u.id ?? 'KGB-2026-001'),
        jenis: String(u.jenis ?? 'kgb'),
        nip: String(u.pegawaiNip ?? '19860314 201001 2 009'),
        nama: String(u.nama ?? 'Andi Tenri Uleng, S.STP'),
        pangkat: String(u.pangkat ?? 'Penata'),
        golongan: String(u.gol ?? 'III/c'),
        jabatan: String(u.jabatan ?? 'Kasubag Umum dan Kepegawaian'),
        tmtTarget: String(u.tmtRencana ?? '01-08-2026'),
        sisaHari: Number(u.sisaHari ?? 42),
        tahap: tahapNum,
        status: STAGE_LABELS[tahapNum] ?? 'Verifikasi Berkas',
        berkas,
      };
    });

    const rawPegawai = Array.isArray(raw.pegawai) ? (raw.pegawai as Record<string, unknown>[]) : [];
    const pegawai: PegawaiRecord[] = rawPegawai.map((p, idx) => ({
      nip: String(p.nip ?? `19860314 201001 2 00${idx + 1}`),
      nama: String(p.nama ?? ''),
      pangkat: String(p.pangkat ?? 'Penata'),
      golongan: String(p.gol ?? 'III/c'),
      jabatan: String(p.jabatan ?? 'Pelaksana'),
      unit: String(p.unit ?? 'Kecamatan Tamalate'),
      tmtKgbBerikutnya: '01-08-2026',
      tmtPangkatBerikutnya: '01-10-2026',
      tidakHadirMingguIni: idx % 4 === 0 ? 3 : idx % 3 === 0 ? 1 : 0,
    }));

    const rawPresensi = Array.isArray(raw.presensiList) ? (raw.presensiList as Record<string, unknown>[]) : [];
    const presensi: PresensiRecord[] = rawPresensi.map((pr, idx) => ({
      id: String(pr.id ?? `PR-${idx + 1}`),
      nip: String(pr.nip ?? '19860314 201001 2 009'),
      nama: String(pr.nama ?? 'ASN Kecamatan Tamalate'),
      jabatan: String(pr.jabatan ?? 'Pelaksana'),
      unit: String(pr.unit ?? 'Sekretariat Kecamatan'),
      apelPagi: String(pr.jamMasuk ?? '07:42'),
      apelSore: String(pr.jamPulang ?? '16:05'),
      jarakMeter: Number(pr.jarakMeter ?? 32),
      status: String(pr.status ?? 'Hadir'),
    }));

    const rawDossier = Array.isArray(raw.dossierList) ? (raw.dossierList as Record<string, unknown>[]) : [];
    const dossier: DossierRecord[] = rawDossier.length
      ? rawDossier.map((d, idx) => ({
          id: String(d.id ?? `DOS-${idx + 1}`),
          pegawaiNip: String(d.owner ?? '19860314 201001 2 009'),
          pegawaiNama: String(d.ownerName ?? 'Andi Tenri Uleng, S.STP'),
          partisi: String(d.partition ?? 'SK Pangkat'),
          judul: String(d.fileName ?? d.title ?? 'SK Kepegawaian Resmi.pdf'),
          ukuranKb: Number(d.sizeKb ?? 420),
          tanggalUnggah: String(d.uploadedAt ?? '18-06-2026'),
          terverifikasi: true,
        }))
      : [
          {
            id: 'DOS-1',
            pegawaiNip: '19860314 201001 2 009',
            pegawaiNama: 'Andi Tenri Uleng, S.STP',
            partisi: 'SK Pangkat',
            judul: 'SK_Pangkat_Penata_IIIc_Andi_Tenri.pdf',
            ukuranKb: 640,
            tanggalUnggah: '12-05-2026',
            terverifikasi: true,
            isGlobal: false,
            accessRequests: {
              '19850101 201001 1 001': {
                requestorNip: '19850101 201001 1 001',
                requestorNama: 'Budi Hartono, S.Sos',
                requestorRole: 'Kasubag Umum & Kepegawaian',
                status: 'granted',
                tanggal: '18-06-2026',
                alasan: 'Audit pemutakhiran data SIMPEG BKN',
              },
            },
          },
          {
            id: 'DOS-2',
            pegawaiNip: '19750819 200112 1 002',
            pegawaiNama: 'Ir. H. Syamsul Bahri, M.Si',
            partisi: 'KGB',
            judul: 'SK_KGB_2026_Sekcam_Tamalate.pdf',
            ukuranKb: 512,
            tanggalUnggah: '15-05-2026',
            terverifikasi: true,
            isGlobal: false,
          },
          {
            id: 'DOS-3',
            pegawaiNip: '19720412 199303 1 004',
            pegawaiNama: 'Drs. H. Sutrisno Hadi, M.Si',
            partisi: 'SKP',
            judul: 'Evaluasi_Kinerja_Tahunan_Camat_2025.pdf',
            ukuranKb: 780,
            tanggalUnggah: '18-05-2026',
            terverifikasi: true,
            isGlobal: false,
          },
          {
            id: 'DOS-GLB-1',
            pegawaiNip: '19720412 199303 1 004',
            pegawaiNama: 'Drs. H. Sutrisno Hadi, M.Si (Camat)',
            partisi: 'SK Camat',
            folder: 'SK Camat 2026',
            judul: 'SK_Camat_No_18_Tahun_2026_Pembentukan_Tim_Pelayanan_Paten.pdf',
            ukuranKb: 1240,
            tanggalUnggah: '02-01-2026',
            terverifikasi: true,
            isGlobal: true,
            accessLevel: 'publik',
          },
          {
            id: 'DOS-GLB-2',
            pegawaiNip: '19750819 200112 1 002',
            pegawaiNama: 'Ir. H. Syamsul Bahri, M.Si (Sekcam)',
            partisi: 'SOP Pelayanan',
            folder: 'SOP Pelayanan Terpadu',
            judul: 'SOP_04_Pelayanan_Administrasi_Kependudukan_Kecamatan_Tamalate.pdf',
            ukuranKb: 890,
            tanggalUnggah: '15-01-2026',
            terverifikasi: true,
            isGlobal: true,
            accessLevel: 'publik',
          },
          {
            id: 'DOS-GLB-3',
            pegawaiNip: '19720412 199303 1 004',
            pegawaiNama: 'Drs. H. Sutrisno Hadi, M.Si (Camat)',
            partisi: 'Regulasi',
            folder: 'Perwali & Edaran Walikota',
            judul: 'Perwali_Makassar_No_22_2026_Tata_Naskah_Dinas_Elektronik.pdf',
            ukuranKb: 2150,
            tanggalUnggah: '10-02-2026',
            terverifikasi: true,
            isGlobal: true,
            accessLevel: 'struktural',
          },
          {
            id: 'DOS-GLB-4',
            pegawaiNip: '19720412 199303 1 004',
            pegawaiNama: 'Drs. H. Sutrisno Hadi, M.Si (Camat)',
            partisi: 'Rahasia Pimpinan',
            folder: 'Kebijakan Strategis Pimpinan',
            judul: 'Matriks_Evaluasi_Kinerja_Kelurahan_Triwulan_I_2026.pdf',
            ukuranKb: 1420,
            tanggalUnggah: '05-04-2026',
            terverifikasi: true,
            isGlobal: true,
            accessLevel: 'rahasia',
          },
        ];

    return {
      stats: {
        totalPegawai: pegawai.length || 148,
        hadirPagi: 142,
        suratMenunggu: surat.filter((s) => s.status === 'baru' || s.status === 'disposisi').length,
        mendekatiBatas: 4,
      },
      surat,
      usulan,
      pegawai,
      presensi,
      dossier,
    };
  } catch {
    return {
      stats: {
        totalPegawai: 148,
        hadirPagi: 142,
        suratMenunggu: 5,
        mendekatiBatas: 4,
      },
      surat: DEFAULT_FALLBACK_SURAT,
      usulan: [],
      pegawai: [],
      presensi: [],
      dossier: [],
    };
  }
}

export async function createSurat(payload: {
  agenda: string;
  nomorSurat: string;
  asal: string;
  instansiTujuan?: string;
  perihal: string;
  tanggalSurat?: string;
  sifat?: string;
  lampiran?: string;
  actor?: string;
  berkasNama?: string;
  berkasUkuran?: string;
  berkasPdf?: string;
}): Promise<SimulationBootstrapPayload | null> {
  await fetch('/api/v1/simulation/surat-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agenda: payload.agenda,
      nomorSurat: payload.nomorSurat,
      tanggalSurat: payload.tanggalSurat ?? '19-06-2026',
      asal: payload.asal,
      instansiTujuan: payload.instansiTujuan ?? payload.asal,
      perihal: payload.perihal,
      sifat: (payload.sifat === 'SR' || payload.sifat === 'R' ? payload.sifat : 'B') as 'B' | 'R' | 'SR',
      lampiran: payload.lampiran ?? '1 berkas',
      actorRole: payload.actor ?? 'operator',
    }),
  });
  return fetchSimulationBootstrap();
}

export async function updateSurat(
  agenda: string,
  payload: {
    action: 'paraf_sekcam' | 'disposisi_camat' | 'tindak_lanjut' | 'arsip';
    actor?: string;
    catatanSekcam?: string;
    rekomendasiTujuan?: string[];
    parafSekcamImage?: string;
    instruksi?: string;
    tanggalDisposisi?: string;
    tanggalPenyelesaian?: string;
    diteruskan?: string[];
    kembalikanKepada?: string;
    kembalikanTanggal?: string;
    parafMode?: string;
    parafImage?: string;
    catatanTindakLanjut?: string;
    petugasTindakLanjut?: string;
    kodeKlasifikasi?: string;
    lokasiFisik?: string;
  },
): Promise<SimulationBootstrapPayload | null> {
  await fetch(`/api/v1/simulation/surat-update/${encodeURIComponent(agenda)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: payload.action,
      actorRole: payload.actor ?? 'camat',
      catatanSekcam: payload.catatanSekcam,
      rekomendasiSekcam: payload.rekomendasiTujuan,
      instruksiCamat: payload.instruksi,
      diteruskan: payload.diteruskan,
      parafMode: payload.parafMode,
      parafImage: payload.parafImage,
      catatanTindakLanjut: payload.catatanTindakLanjut,
      petugasTindakLanjut: payload.petugasTindakLanjut,
      kodeKlasifikasi: payload.kodeKlasifikasi,
      lokasiFisik: payload.lokasiFisik,
    }),
  });
  return fetchSimulationBootstrap();
}

export async function advanceUsulan(
  id: string,
  payload: {
    actor?: string | undefined;
    catatan?: string | undefined;
    signatureMethod?: 'bsre' | 'qr' | 'basah' | undefined;
  },
): Promise<SimulationBootstrapPayload | null> {
  await fetch(`/api/v1/simulation/usulan-advance/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actorRole: payload.actor ?? 'camat',
      catatan: payload.catatan,
      signatureMethod: payload.signatureMethod,
    }),
  });
  const res = await fetchSimulationBootstrap();
  if (res && payload.signatureMethod) {
    res.usulan = res.usulan.map((u) =>
      u.id === id ? { ...u, signatureMethod: payload.signatureMethod } : u,
    );
  }
  return res;
}

export async function revertUsulan(
  id: string,
  payload: { actor?: string; catatan?: string },
): Promise<SimulationBootstrapPayload | null> {
  await fetch(`/api/v1/simulation/usulan-revert/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actorRole: payload.actor ?? 'kasubag',
      catatan: payload.catatan,
    }),
  });
  return fetchSimulationBootstrap();
}

export async function toggleUsulanBerkas(
  id: string,
  payload: { kodeBerkas: string; lengkap: boolean },
): Promise<SimulationBootstrapPayload | null> {
  await fetch(`/api/v1/simulation/usulan-berkas/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      berkasKey: payload.kodeBerkas,
      status: payload.lengkap ? 'ada' : 'kurang',
    }),
  });
  return fetchSimulationBootstrap();
}

export async function recordPresensi(payload: {
  nip: string;
  nama: string;
  jabatan: string;
  unit?: string;
  sesi?: string;
  jarakMeter?: number;
}): Promise<SimulationBootstrapPayload | null> {
  await fetch('/api/v1/simulation/presensi-record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nip: payload.nip,
      nama: payload.nama,
      jabatan: payload.jabatan,
      unit: payload.unit ?? 'Kecamatan Tamalate',
      jarakMeter: payload.jarakMeter ?? 35,
    }),
  });
  return fetchSimulationBootstrap();
}

export async function uploadDossier(payload: {
  pegawaiNip: string;
  pegawaiNama: string;
  partisi: string;
  judul: string;
  ukuranKb?: number;
}): Promise<SimulationBootstrapPayload | null> {
  await fetch('/api/v1/simulation/dossier-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: payload.pegawaiNip,
      ownerName: payload.pegawaiNama,
      partition: payload.partisi,
      fileName: payload.judul,
      sizeKb: payload.ukuranKb ?? 420,
    }),
  });
  return fetchSimulationBootstrap();
}

export async function resetSimulation(): Promise<SimulationBootstrapPayload | null> {
  await fetch('/api/v1/simulation/reset', { method: 'POST' });
  return fetchSimulationBootstrap();
}
