'use client';

import React, { useMemo, useState } from 'react';
import type { PegawaiRecord, UsulanRecord } from '@/lib/workspace-api';
import type { GlobalThresholdConfig } from './ThresholdConfigView';
import { DossierPackModal } from './DossierPackModal';
import { CekBerkasModal } from './CekBerkasModal';
import { NotifikasiMassalModal } from './NotifikasiMassalModal';
import { BulkPackModal, type BulkPackItem } from './BulkPackModal';
import { TolakRevisiModal } from './TolakRevisiModal';

interface PangkatBoardViewProps {
  pegawaiList: PegawaiRecord[];
  usulanList: UsulanRecord[];
  config: GlobalThresholdConfig;
  currentRoleKey: string;
  currentRoleLabel: string;
  currentRoleName: string;
  onAdvanceUsulan?: (usulanId: string, signatureMethod?: 'bsre' | 'qr' | 'basah') => Promise<void>;
  onRevertUsulan?: (usulanId: string, catatan: string) => Promise<void>;
  onToggleBerkas?: (usulanId: string, kodeBerkas: string, lengkap: boolean) => Promise<void>;
}

interface PeriodeBknItem {
  bulan: number;
  label: string;
  short: string;
}

// 6 Periode Kenaikan Pangkat per tahun sesuai Peraturan BKN No. 4 Tahun 2023
const PERIODE_BKN: PeriodeBknItem[] = [
  { bulan: 2, label: '1 Februari 2026', short: 'Feb' },
  { bulan: 4, label: '1 April 2026', short: 'Apr' },
  { bulan: 6, label: '1 Juni 2026', short: 'Jun' },
  { bulan: 8, label: '1 Agustus 2026', short: 'Ags' },
  { bulan: 10, label: '1 Oktober 2026', short: 'Okt' },
  { bulan: 12, label: '1 Desember 2026', short: 'Des' },
];

export function PangkatBoardView({
  pegawaiList,
  usulanList,
  config,
  currentRoleKey,
  currentRoleLabel,
  currentRoleName,
  onAdvanceUsulan,
  onRevertUsulan,
  onToggleBerkas,
}: PangkatBoardViewProps): React.ReactNode {
  const [filterMode, setFilterMode] = useState<'semua' | 'urgent' | 'siap_pack'>('semua');
  const [toastNotif, setToastNotif] = useState<string | null>(null);
  const [selectedPackUsulan, setSelectedPackUsulan] = useState<UsulanRecord | null>(null);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [selectedCekUsulan, setSelectedCekUsulan] = useState<UsulanRecord | null>(null);
  const [cekModalOpen, setCekModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [bulkPackModalOpen, setBulkPackModalOpen] = useState(false);
  const [tolakModalOpen, setTolakModalOpen] = useState(false);
  const [selectedTolakUsulan, setSelectedTolakUsulan] = useState<UsulanRecord | null>(null);

  // Filter usulan khusus jenis Kenaikan Pangkat
  const kpUsulanList = useMemo(() => {
    return usulanList.filter(
      (u) =>
        u.jenis?.toLowerCase().includes('pangkat') ||
        u.id.startsWith('KP-') ||
        u.id.startsWith('USUL-KP'),
    );
  }, [usulanList]);

  // Transformasi baris data pegawai untuk papan Kenaikan Pangkat
  const kpRows = useMemo(() => {
    return pegawaiList.map((p, idx) => {
      const cleanNip = p.nip.replace(/\s+/g, '');
      const related = kpUsulanList.find((u) => u.nip.replace(/\s+/g, '') === cleanNip);

      // Simulasi periode terdekat dan sisa hari hitung mundur KP
      const periodeIdx = idx % PERIODE_BKN.length;
      const targetPeriode: PeriodeBknItem = PERIODE_BKN[periodeIdx] ?? PERIODE_BKN[0]!;
      const sisaHari =
        idx === 0 ? 38 : idx === 1 ? 84 : idx === 2 ? 18 : idx === 3 ? 120 : 65 + (idx % 4) * 25;

      const isHit = sisaHari <= config.kpAlertDays;
      const isUrgent = sisaHari <= config.kpUnggahSiasnDays;

      // Kenaikan pangkat target (satu tingkat di atas golongan sekarang)
      const targetGolongan =
        p.golongan === 'IV/b'
          ? 'IV/c (Pembina Utama Muda)'
          : p.golongan === 'IV/a'
            ? 'IV/b (Pembina Tingkat I)'
            : p.golongan === 'III/d'
              ? 'IV/a (Pembina)'
              : p.golongan === 'III/c'
                ? 'III/d (Penata Tingkat I)'
                : p.golongan === 'III/b'
                  ? 'III/c (Penata)'
                  : p.golongan === 'III/a'
                    ? 'III/b (Penata Muda Tingkat I)'
                    : 'III/a (Penata Muda)';

      const usulanId = related?.id || `KP-2026-00${idx + 1}`;
      const defaultLengkap = idx % 2 === 0;
      const lengkapCount = related ? related.berkas.filter((b) => b.lengkap).length : defaultLengkap ? 6 : 5;
      const totalBerkas = 6;
      const isComplete = lengkapCount === totalBerkas;

      const tahap = related?.tahap || (idx === 1 ? 5 : isUrgent ? 3 : isHit ? 2 : 1);

      return {
        ...p,
        cleanNip,
        usulanId,
        targetPeriode,
        sisaHari,
        isHit,
        isUrgent,
        targetGolongan,
        related,
        lengkapCount,
        totalBerkas,
        isComplete,
        tahap,
      };
    });
  }, [pegawaiList, kpUsulanList, config]);

  const urgentCount = kpRows.filter((r) => r.isUrgent).length;
  const hitCount = kpRows.filter((r) => r.isHit).length;
  const siapPackCount = kpRows.filter((r) => r.isComplete).length;

  const filteredRows = useMemo(() => {
    if (filterMode === 'urgent') return kpRows.filter((r) => r.isUrgent);
    if (filterMode === 'siap_pack') return kpRows.filter((r) => r.isComplete);
    return kpRows;
  }, [kpRows, filterMode]);

  const bulkPackItems: BulkPackItem[] = useMemo(() => {
    return kpRows.map((r) => ({
      id: r.usulanId,
      nip: r.nip,
      nama: r.nama,
      pangkat: r.pangkat,
      golongan: r.golongan,
      jabatan: r.jabatan,
      tmtTarget: r.targetPeriode.label,
      lengkapCount: r.lengkapCount,
      totalBerkas: r.totalBerkas,
      isComplete: r.isComplete,
      tahap: r.tahap,
    }));
  }, [kpRows]);

  const notifTargetList = useMemo(() => {
    return kpRows.map((r) => ({
      nip: r.nip,
      nama: r.nama,
      jabatan: r.jabatan,
      golongan: r.golongan,
      isUrgent: r.isUrgent,
      isHit: r.isHit,
      isComplete: r.isComplete,
    }));
  }, [kpRows]);

  const handleOpenPack = (row: (typeof kpRows)[0]) => {
    if (row.related) {
      setSelectedPackUsulan(row.related);
    } else {
      setSelectedPackUsulan({
        id: row.usulanId,
        jenis: 'pangkat',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.targetPeriode.label,
        sisaHari: row.sisaHari,
        tahap: row.tahap,
        status: row.isComplete ? 'Siap Unggah SIASN BKN' : 'Verifikasi Berkas',
        berkas: [
          { kode: 'sk-pangkat-terakhir', nama: 'Salinan Sah SK Kenaikan Pangkat Terakhir', lengkap: true },
          { kode: 'sk-jabatan', nama: 'Salinan Sah SK Jabatan / Pelantikan Terakhir', lengkap: true },
          { kode: 'skp-2-tahun', nama: 'Penilaian Kinerja (SKP) 2 Tahun Terakhir Predikat Baik', lengkap: true },
          { kode: 'ijazah-stlud', nama: 'Ijazah & Transkrip Terlegalisir / STLUD / UKPPI', lengkap: row.isComplete },
          { kode: 'bebas-hukdis', nama: 'Surat Keterangan Tidak Sedang Menjalani Hukuman Disiplin', lengkap: true },
          { kode: 'spmj-uraian', nama: 'Surat Pernyataan Melaksanakan Tugas (SPMT) & Uraian Tugas', lengkap: true },
        ],
      });
    }
    setPackModalOpen(true);
  };

  const handleOpenCekBerkas = (row: (typeof kpRows)[0]) => {
    if (row.related) {
      setSelectedCekUsulan(row.related);
    } else {
      setSelectedCekUsulan({
        id: row.usulanId,
        jenis: 'pangkat',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.targetPeriode.label,
        sisaHari: row.sisaHari,
        tahap: row.tahap,
        status: row.isComplete ? 'Siap Unggah SIASN BKN' : 'Verifikasi Berkas',
        berkas: [
          { kode: 'sk-pangkat-terakhir', nama: 'Salinan Sah SK Kenaikan Pangkat Terakhir', lengkap: true },
          { kode: 'sk-jabatan', nama: 'Salinan Sah SK Jabatan / Pelantikan Terakhir', lengkap: true },
          { kode: 'skp-2-tahun', nama: 'Penilaian Kinerja (SKP) 2 Tahun Terakhir Predikat Baik', lengkap: true },
          { kode: 'ijazah-stlud', nama: 'Ijazah & Transkrip Terlegalisir / STLUD / UKPPI', lengkap: row.isComplete },
          { kode: 'bebas-hukdis', nama: 'Surat Keterangan Tidak Sedang Menjalani Hukuman Disiplin', lengkap: true },
          { kode: 'spmj-uraian', nama: 'Surat Pernyataan Melaksanakan Tugas (SPMT) & Uraian Tugas', lengkap: true },
        ],
      });
    }
    setCekModalOpen(true);
  };

  const handleOpenTolakModal = (row: (typeof kpRows)[0]) => {
    if (row.related) {
      setSelectedTolakUsulan(row.related);
    } else {
      setSelectedTolakUsulan({
        id: row.usulanId,
        jenis: 'pangkat',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.targetPeriode.label,
        sisaHari: row.sisaHari,
        tahap: row.tahap,
        status: 'Perlu Perbaikan',
        berkas: [],
      });
    }
    setTolakModalOpen(true);
  };

  const handleBroadcastNotifikasi = (targetNips: string[], saluran: string, pesan: string) => {
    setToastNotif(
      `Pemberitahuan Kenaikan Pangkat via ${saluran.toUpperCase()} berhasil dikirimkan kepada ${targetNips.length} pegawai ASN!`,
    );
    setTimeout(() => setToastNotif(null), 5000);
  };

  const getStageBadge = (tahap: number) => {
    switch (tahap) {
      case 1:
        return { label: 'T1 · Operator', cls: 'badge-neutral', full: 'Tahap 1: Pemeriksaan (Operator)' };
      case 2:
        return { label: 'T2 · Kasubag', cls: 'badge-info', full: 'Tahap 2: Validasi (Kasubag)' };
      case 3:
        return { label: 'T3 · Sekcam', cls: 'badge-info', full: 'Tahap 3: Telaah (Sekcam)' };
      case 4:
        return { label: 'T4 · Camat', cls: 'badge-warning', full: 'Tahap 4: Persetujuan (Camat)' };
      case 5:
        return { label: 'T5 · Siap Pack', cls: 'badge-success', full: 'Tahap 5: Disetujui (Pack PDF)' };
      default:
        return { label: `Tahap ${tahap}`, cls: 'badge-neutral', full: `Tahap ${tahap}` };
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* Header Papan Kenaikan Pangkat */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="eyebrow" style={{ fontSize: '11px' }}>
              Subbagian Umum &amp; Kepegawaian · Kecamatan Tamalate
            </span>
            <span className="badge badge-info tabular" style={{ fontSize: '10.5px' }}>
              Peran: {currentRoleLabel} ({currentRoleName})
            </span>
          </div>
          <h2 className="heading" style={{ fontSize: '20px', margin: 0 }}>
            Papan Pengendalian Usulan Kenaikan Pangkat (KP)
          </h2>
          <p className="caption" style={{ margin: '4px 0 0', maxWidth: '82ch' }}>
            Pemantauan berkala 6 periode tahunan berdasarkan Peraturan BKN No. 4/2023 jo. No. 4/2025 (Feb, Apr, Jun, Ags, Okt, Des).
            Sistem memantau masa kerja golongan 4 tahun, memicu peringatan H-{config.kpAlertDays} hari,
            memvalidasi 6 dokumen persyaratan, dan memaketkan berkas digital untuk pengusulan via SIASN BKN.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setBulkPackModalOpen(true)}
            title="Pilih ASN dan kemas seluruh dokumen usulan KP menjadi 1 berkas pack PDF massal resmi"
          >
            <i className="ph ph-file-pdf" />
            <span>Pack 1 PDF (Massal)</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setNotifModalOpen(true)}
            title="Buka panel pengiriman peringatan massal dengan opsi audiens dan saluran komunikasi"
          >
            <i className="ph ph-broadcast" />
            <span>Siarkan Pengingat Massal</span>
          </button>
        </div>
      </div>

      {/* Banner Regulasi Resmi KP 2026 */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: 'var(--r-sm)',
          padding: '14px 18px',
          fontSize: '12px',
          color: '#334155',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}
      >
        <div>
          <strong style={{ color: '#0f172a' }}>Dasar Regulasi:</strong>
          <div>Peraturan BKN No. 4/2023 jo. No. 4/2025 (Siklus 6 Periode Kenaikan Pangkat Tahunan).</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>Syarat Substantif:</strong>
          <div>Masa kerja pangkat min 4 tahun, SKP 2 tahun predikat min "Baik", lulus ujian dinas/STLUD.</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>Timeframe Terprogram:</strong>
          <div>Alert H-{config.kpAlertDays} hari, Batas Unggah SIASN H-{config.kpUnggahSiasnDays} hari, Verifikasi berkas BKPSDMD.</div>
        </div>
      </div>

      {/* Toast Peringatan */}
      {toastNotif ? (
        <div
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: '12px 16px',
            borderRadius: 'var(--r-sm)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="ph ph-check-circle" style={{ fontSize: '18px' }} />
          <span>{toastNotif}</span>
        </div>
      ) : null}

      {/* Metriks Pengendalian KP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Periode BKN Terdekat
          </span>
          <div className="heading tabular" style={{ fontSize: '22px', margin: '4px 0 2px' }}>
            1 Oktober 2026
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Batas unggah SIASN: H-{config.kpUnggahSiasnDays} hari
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Mendekati Ambang Batas (≤{config.kpAlertDays} Hari)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--accent)' }}
          >
            {hitCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Perlu konfirmasi berkas portofolio
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Batas Kritis Verifikasi (≤{config.kpUnggahSiasnDays} Hari)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--danger, #dc2626)' }}
          >
            {urgentCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Wajib verifikasi Kasubag Umpeg &amp; Sekcam
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Berkas Siap Dipack
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--success, #16a34a)' }}
          >
            {siapPackCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            6 Dokumen lengkap berstempel digital BSrE
          </span>
        </div>
      </div>

      {/* Filter Tab & Tabel Board KP */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'var(--surface-soft)',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`chip ${filterMode === 'semua' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('semua')}
            >
              Semua Pegawai ({kpRows.length})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'urgent' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('urgent')}
            >
              Urgent &lt;= {config.kpUnggahSiasnDays} Hari ({urgentCount})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'siap_pack' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('siap_pack')}
            >
              Siap Pack 1 PDF ({siapPackCount})
            </button>
          </div>

          <span className="caption" style={{ fontWeight: 500 }}>
            Total Menampilkan: {filteredRows.length} Pegawai
          </span>
        </div>

        <div className="data-table-scroll">
          <style>{`
            .board-table thead th { padding: 8px 10px !important; font-size: 10.5px !important; }
            .board-table tbody td { padding: 9px 10px !important; font-size: 12px !important; }
          `}</style>
          <table className="data-table board-table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ width: '36px', textAlign: 'center' }}>No</th>
                <th>Identitas Pegawai ASN</th>
                <th>Target Pangkat &amp; Periode</th>
                <th>Kelengkapan Berkas</th>
                <th>Tahap SOP Vertikal</th>
                <th style={{ textAlign: 'right' }}>Aksi Pelaksana</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const stage = getStageBadge(row.tahap);
                const hasRevisi = row.related?.catatanRevisi;

                return (
                  <tr key={row.cleanNip}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{row.nama}</div>
                      <div className="caption mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>
                        NIP {row.nip} · {row.golongan}
                      </div>
                      <div className="caption" style={{ fontSize: '11px', color: 'var(--body)' }}>
                        {row.jabatan}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '12px' }}>
                          {row.targetGolongan}
                        </span>
                        <span
                          className={`badge ${row.isUrgent ? 'badge-danger' : row.isHit ? 'badge-warn' : 'badge-neutral'}`}
                          style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}
                        >
                          {row.sisaHari} hr ({row.isUrgent ? 'Batas Unggah' : row.isHit ? 'Pemberkasan' : 'Aman'})
                        </span>
                      </div>
                      <div className="caption mono" style={{ fontSize: '10.5px', marginBottom: '3px' }}>
                        {row.targetPeriode.label}
                      </div>
                      <div
                        style={{
                          height: '4px',
                          background: 'var(--hairline)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginBottom: '3px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.max(8, Math.min(100, 100 - (row.sisaHari / 150) * 100))}%`,
                            background: row.isUrgent ? 'var(--danger)' : row.isHit ? 'var(--warn)' : 'var(--success)',
                          }}
                        />
                      </div>
                      <span
                        className={`badge ${row.isHit ? 'badge-ok' : 'badge-neutral'}`}
                        style={{ fontSize: '9.5px', height: '18px', padding: '0 5px' }}
                      >
                        <i className="ph ph-bell" style={{ marginRight: '2px' }} />
                        {row.isHit ? 'Aktif' : 'Terjadwal'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className="tabular mono" style={{ fontWeight: 600, fontSize: '11.5px' }}>
                          {row.lengkapCount}/{row.totalBerkas}
                        </span>
                        <span className={`badge ${row.isComplete ? 'badge-ok' : 'badge-warn'}`} style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}>
                          {row.isComplete ? 'Lengkap' : 'Kurang'}
                        </span>
                      </div>
                      <div className="caption" style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                        6 Dokumen Sah
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={`badge ${stage.cls}`} style={{ fontSize: '10.5px', height: '20px', padding: '0 7px', width: 'fit-content' }} title={stage.full}>
                          {stage.label}
                        </span>
                        {hasRevisi ? (
                          <span className="badge badge-danger" style={{ fontSize: '9.5px', height: '18px', padding: '0 5px', width: 'fit-content' }}>
                            <i className="ph ph-warning" style={{ marginRight: '2px' }} />
                            Revisi
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {/* Tombol Lonceng Pengingat */}
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '0 6px', height: '26px' }}
                          title="Kirim pengingat ke ASN"
                          onClick={() => {
                            setNotifModalOpen(true);
                          }}
                        >
                          <i className="ph ph-bell" />
                        </button>

                        {/* Tombol Cek Berkas (Buka Modal Preview & Checklist) */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          onClick={() => handleOpenCekBerkas(row)}
                          title="Periksa dokumen fisik satu per satu dan lakukan validasi SOP"
                        >
                          <i className="ph ph-files" />
                          <span>Cek Berkas</span>
                        </button>

                        {/* Tombol Kembalikan Berkas Berjenjang */}
                        {row.tahap > 1 && currentRoleKey !== 'operator' && onRevertUsulan ? (
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ height: '26px', padding: '0 6px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                            title="Kembalikan berkas ke tahapan sebelumnya untuk revisi"
                            onClick={() => handleOpenTolakModal(row)}
                          >
                            <i className="ph ph-arrow-u-up-left" />
                          </button>
                        ) : null}

                        {/* Tombol Validasi / Majukan Tahap SOP */}
                        {row.tahap < 5 ? (
                          <button
                            type="button"
                            className="btn btn-accent btn-xs"
                            style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                            title="Validasi dan majukan ke tahap SOP berikutnya"
                            onClick={async () => {
                              if (onAdvanceUsulan) {
                                await onAdvanceUsulan(row.usulanId);
                                setToastNotif(`Berkas Kenaikan Pangkat ${row.nama} berhasil divalidasi ke tahap berikutnya!`);
                                setTimeout(() => setToastNotif(null), 4000);
                              }
                            }}
                          >
                            <i className="ph ph-check" />
                            <span>Validasi</span>
                          </button>
                        ) : (
                          /* Jika tahap 5 (disetujui Camat): Tombol Pack 1 PDF oleh Operator */
                          <button
                            type="button"
                            className="btn btn-primary btn-xs"
                            style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                            title="Berkas telah disetujui Camat. Kemas 1 pack PDF resmi untuk SIASN BKN"
                            onClick={() => handleOpenPack(row)}
                          >
                            <i className="ph ph-file-pdf" />
                            <span>Pack 1 PDF</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pemeriksaan Dokumen KP (Dilengkapi Preview Dokumen PDF Satu per Satu) */}
      <CekBerkasModal
        isOpen={cekModalOpen}
        onClose={() => setCekModalOpen(false)}
        usulan={selectedCekUsulan}
        onToggleBerkas={onToggleBerkas}
        onAdvanceUsulan={onAdvanceUsulan}
        onRevertUsulan={onRevertUsulan}
        currentRoleKey={currentRoleKey}
        currentRoleLabel={currentRoleLabel}
        onOpenPackPdf={(u) => {
          setSelectedPackUsulan(u);
          setPackModalOpen(true);
        }}
      />

      {/* Modal Single Dossier Pack 1 PDF */}
      <DossierPackModal
        isOpen={packModalOpen}
        onClose={() => setPackModalOpen(false)}
        usulan={selectedPackUsulan}
        actorRole={currentRoleLabel}
      />

      {/* Modal Bulk Pack PDF Massal (Memilih Pemilik Dokumen Tertentu) */}
      <BulkPackModal
        isOpen={bulkPackModalOpen}
        onClose={() => setBulkPackModalOpen(false)}
        items={bulkPackItems}
        jenisLayanan="Kenaikan Pangkat"
        actorRole={currentRoleLabel}
      />

      {/* Modal Notifikasi Peringatan Massal dengan Opsi Sasaran */}
      <NotifikasiMassalModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        pegawaiList={notifTargetList}
        jenisUsulan="Kenaikan Pangkat"
        onSendNotifikasi={handleBroadcastNotifikasi}
      />

      {/* Modal Tolak / Kembalikan Berkas Berjenjang */}
      <TolakRevisiModal
        isOpen={tolakModalOpen}
        onClose={() => setTolakModalOpen(false)}
        usulan={selectedTolakUsulan}
        currentRoleLabel={currentRoleLabel}
        onConfirmRevert={async (uId, catatan) => {
          if (onRevertUsulan) {
            await onRevertUsulan(uId, catatan);
            setToastNotif(`Berkas Kenaikan Pangkat berhasil dikembalikan ke tahapan sebelumnya.`);
            setTimeout(() => setToastNotif(null), 4000);
          }
        }}
      />
    </div>
  );
}
