'use client';

import React, { useMemo, useState } from 'react';
import type { PegawaiRecord, UsulanRecord } from '@/lib/workspace-api';
import type { GlobalThresholdConfig } from './ThresholdConfigView';
import { DossierPackModal } from './DossierPackModal';
import { CekBerkasModal } from './CekBerkasModal';
import { NotifikasiMassalModal } from './NotifikasiMassalModal';
import { BulkPackModal, type BulkPackItem } from './BulkPackModal';
import { TolakRevisiModal } from './TolakRevisiModal';

interface PensiunBoardViewProps {
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

// Bantuan kalkulasi tanggal lahir dan BUP dari NIP 18 digit
function parseNipBirth(nip: string): { birthDate: string; birthYear: number; birthMonth: number; birthDay: number } {
  const digits = nip.replace(/\D/g, '');
  if (digits.length >= 8) {
    const y = parseInt(digits.substring(0, 4), 10);
    const m = parseInt(digits.substring(4, 6), 10);
    const d = parseInt(digits.substring(6, 8), 10);
    const namaBulan = [
      '',
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return {
      birthDate: `${d} ${namaBulan[m] || ''} ${y}`,
      birthYear: y,
      birthMonth: m,
      birthDay: d,
    };
  }
  return { birthDate: '01 Januari 1970', birthYear: 1970, birthMonth: 1, birthDay: 1 };
}

export function PensiunBoardView({
  pegawaiList,
  usulanList,
  config,
  currentRoleKey,
  currentRoleLabel,
  currentRoleName,
  onAdvanceUsulan,
  onRevertUsulan,
  onToggleBerkas,
}: PensiunBoardViewProps): React.ReactNode {
  const [filterMode, setFilterMode] = useState<'semua' | 'dpcp_urgent' | 'siap_pack'>('semua');
  const [toastNotif, setToastNotif] = useState<string | null>(null);
  const [selectedPackUsulan, setSelectedPackUsulan] = useState<UsulanRecord | null>(null);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [selectedCekUsulan, setSelectedCekUsulan] = useState<UsulanRecord | null>(null);
  const [cekModalOpen, setCekModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [bulkPackModalOpen, setBulkPackModalOpen] = useState(false);
  const [tolakModalOpen, setTolakModalOpen] = useState(false);
  const [selectedTolakUsulan, setSelectedTolakUsulan] = useState<UsulanRecord | null>(null);

  // Filter usulan pensiun
  const pensiunUsulanList = useMemo(() => {
    return usulanList.filter(
      (u) =>
        u.jenis?.toLowerCase().includes('pensiun') ||
        u.id.startsWith('PENSIUN-') ||
        u.id.startsWith('USUL-BUP'),
    );
  }, [usulanList]);

  // Transformasi baris data pegawai khusus siklus pensiun
  const pensiunRows = useMemo(() => {
    return pegawaiList.map((p, idx) => {
      const cleanNip = p.nip.replace(/\s+/g, '');
      const related = pensiunUsulanList.find((u) => u.nip.replace(/\s+/g, '') === cleanNip);
      const { birthDate, birthYear, birthMonth } = parseNipBirth(p.nip);

      // Tentukan BUP berdasarkan jabatan (JPT/Eselon II = 60 tahun, Administrator/Pelaksana = 58 tahun)
      const isJpt =
        p.jabatan.toLowerCase().includes('camat') ||
        p.jabatan.toLowerCase().includes('kepala dinas') ||
        p.golongan.startsWith('IV/');
      const bupUmur = isJpt ? config.pensiunBupJptYears : config.pensiunBupPelaksanaYears;
      const bupTahun = birthYear + bupUmur;

      // TMT Pensiun jatuh pada tanggal 1 bulan berikutnya setelah mencapai BUP
      const tmtBulan = birthMonth === 12 ? 1 : birthMonth + 1;
      const tmtTahun = birthMonth === 12 ? bupTahun + 1 : bupTahun;
      const namaBulan = [
        '',
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      const tmtPensiun = `1 ${namaBulan[tmtBulan]} ${tmtTahun}`;

      // Simulasi sisa bulan menuju BUP untuk tahun referensi 2026
      const sisaBulan =
        idx === 0 ? 5 : idx === 1 ? 11 : idx === 2 ? 14 : idx === 3 ? 8 : 24 + idx * 12;

      const isHit = sisaBulan <= config.pensiunAlertMonths;
      const isUrgent = sisaBulan <= config.pensiunBatasBknMonths;

      const usulanId = related?.id || `PENSIUN-2026-00${idx + 1}`;
      const defaultLengkap = idx % 2 === 0;
      const lengkapCount = related ? related.berkas.filter((b) => b.lengkap).length : defaultLengkap ? 8 : 6;
      const totalBerkas = 8;
      const isComplete = lengkapCount === totalBerkas;

      const tahap = related?.tahap || (idx === 0 ? 5 : isUrgent ? 3 : isHit ? 2 : 1);

      return {
        ...p,
        cleanNip,
        usulanId,
        birthDate,
        bupUmur,
        tmtPensiun,
        sisaBulan,
        isHit,
        isUrgent,
        related,
        lengkapCount,
        totalBerkas,
        isComplete,
        tahap,
      };
    });
  }, [pegawaiList, pensiunUsulanList, config]);

  const urgentCount = pensiunRows.filter((r) => r.isUrgent).length;
  const hitCount = pensiunRows.filter((r) => r.isHit).length;
  const siapPackCount = pensiunRows.filter((r) => r.isComplete).length;

  const filteredRows = useMemo(() => {
    if (filterMode === 'dpcp_urgent') return pensiunRows.filter((r) => r.isUrgent);
    if (filterMode === 'siap_pack') return pensiunRows.filter((r) => r.isComplete);
    return pensiunRows;
  }, [pensiunRows, filterMode]);

  const bulkPackItems: BulkPackItem[] = useMemo(() => {
    return pensiunRows.map((r) => ({
      id: r.usulanId,
      nip: r.nip,
      nama: r.nama,
      pangkat: r.pangkat,
      golongan: r.golongan,
      jabatan: r.jabatan,
      tmtTarget: r.tmtPensiun,
      lengkapCount: r.lengkapCount,
      totalBerkas: r.totalBerkas,
      isComplete: r.isComplete,
      tahap: r.tahap,
    }));
  }, [pensiunRows]);

  const notifTargetList = useMemo(() => {
    return pensiunRows.map((r) => ({
      nip: r.nip,
      nama: r.nama,
      jabatan: r.jabatan,
      golongan: r.golongan,
      isUrgent: r.isUrgent,
      isHit: r.isHit,
      isComplete: r.isComplete,
    }));
  }, [pensiunRows]);

  const handleOpenPack = (row: (typeof pensiunRows)[0]) => {
    if (row.related) {
      setSelectedPackUsulan(row.related);
    } else {
      setSelectedPackUsulan({
        id: row.usulanId,
        jenis: 'pensiun',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.tmtPensiun,
        sisaHari: row.sisaBulan * 30,
        tahap: row.tahap,
        status: row.isComplete ? 'Siap Usul Pertek BKN & SK Pensiun' : 'Pemberkasan DPCP',
        berkas: [
          { kode: 'dpcp-terisi', nama: 'Formulir DPCP (Data Perorangan Calon Pensiun) Terisi & Bertandatangan', lengkap: true },
          { kode: 'sk-cpns-pns', nama: 'Salinan Sah SK CPNS & SK PNS', lengkap: true },
          { kode: 'sk-pangkat-terakhir', nama: 'Salinan Sah SK Kenaikan Pangkat Terakhir', lengkap: true },
          { kode: 'surat-nikah', nama: 'Salinan Sah Akta Nikah / Surat Nikah', lengkap: true },
          { kode: 'akta-anak', nama: 'Salinan Sah Akta Kelahiran Anak Tertanggung', lengkap: row.isComplete },
          { kode: 'kk-ktp', nama: 'Salinan Kartu Keluarga & KTP Pemohon serta Pasangan', lengkap: true },
          { kode: 'bebas-hukdis', nama: 'Surat Keterangan Tidak Pernah Dijatuhi Hukuman Disiplin', lengkap: true },
          { kode: 'foto-karpeg', nama: 'Pas Foto Terbaru 3x4 (Latar Merah) & Salinan Karpeg', lengkap: row.isComplete },
        ],
      });
    }
    setPackModalOpen(true);
  };

  const handleOpenCekBerkas = (row: (typeof pensiunRows)[0]) => {
    if (row.related) {
      setSelectedCekUsulan(row.related);
    } else {
      setSelectedCekUsulan({
        id: row.usulanId,
        jenis: 'pensiun',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.tmtPensiun,
        sisaHari: row.sisaBulan * 30,
        tahap: row.tahap,
        status: row.isComplete ? 'Siap Usul Pertek BKN & SK Pensiun' : 'Pemberkasan DPCP',
        berkas: [
          { kode: 'dpcp-terisi', nama: 'Formulir DPCP (Data Perorangan Calon Pensiun) Terisi & Bertandatangan', lengkap: true },
          { kode: 'sk-cpns-pns', nama: 'Salinan Sah SK CPNS & SK PNS', lengkap: true },
          { kode: 'sk-pangkat-terakhir', nama: 'Salinan Sah SK Kenaikan Pangkat Terakhir', lengkap: true },
          { kode: 'surat-nikah', nama: 'Salinan Sah Akta Nikah / Surat Nikah', lengkap: true },
          { kode: 'akta-anak', nama: 'Salinan Sah Akta Kelahiran Anak Tertanggung', lengkap: row.isComplete },
          { kode: 'kk-ktp', nama: 'Salinan Kartu Keluarga & KTP Pemohon serta Pasangan', lengkap: true },
          { kode: 'bebas-hukdis', nama: 'Surat Keterangan Tidak Pernah Dijatuhi Hukuman Disiplin', lengkap: true },
          { kode: 'foto-karpeg', nama: 'Pas Foto Terbaru 3x4 (Latar Merah) & Salinan Karpeg', lengkap: row.isComplete },
        ],
      });
    }
    setCekModalOpen(true);
  };

  const handleOpenTolakModal = (row: (typeof pensiunRows)[0]) => {
    if (row.related) {
      setSelectedTolakUsulan(row.related);
    } else {
      setSelectedTolakUsulan({
        id: row.usulanId,
        jenis: 'pensiun',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.tmtPensiun,
        sisaHari: row.sisaBulan * 30,
        tahap: row.tahap,
        status: 'Perlu Perbaikan',
        berkas: [],
      });
    }
    setTolakModalOpen(true);
  };

  const handleBroadcastNotifikasi = (targetNips: string[], saluran: string, pesan: string) => {
    setToastNotif(
      `Pemberitahuan Pensiun & DPCP via ${saluran.toUpperCase()} berhasil dikirimkan kepada ${targetNips.length} pegawai ASN!`,
    );
    setTimeout(() => setToastNotif(null), 5000);
  };

  const getStageBadge = (tahap: number) => {
    switch (tahap) {
      case 1:
        return { label: 'T1 · Operator', cls: 'badge-neutral', full: 'Tahap 1: Pemberkasan DPCP (Operator)' };
      case 2:
        return { label: 'T2 · Kasubag', cls: 'badge-info', full: 'Tahap 2: Verifikasi Data (Kasubag)' };
      case 3:
        return { label: 'T3 · Sekcam', cls: 'badge-info', full: 'Tahap 3: Validasi Sekcam' };
      case 4:
        return { label: 'T4 · Camat', cls: 'badge-warning', full: 'Tahap 4: TTD Camat (TTE BSrE)' };
      case 5:
        return { label: 'T5 · Siap Pack', cls: 'badge-success', full: 'Tahap 5: Disetujui (Pack PDF Usul BKN/Taspen)' };
      default:
        return { label: `Tahap ${tahap}`, cls: 'badge-neutral', full: `Tahap ${tahap}` };
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* Header Papan Pensiun */}
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
            Papan Pengendalian Batas Usia Pensiun (BUP) &amp; DPCP
          </h2>
          <p className="caption" style={{ margin: '4px 0 0', maxWidth: '82ch' }}>
            Berdasarkan UU No. 20/2023 (UU ASN) &amp; PP No. 17/2020. Deteksi dini pemicu DPCP di H-{config.pensiunAlertMonths} bulan
            dan batas akhir penyusunan usulan ke BKPSDMD Kota Makassar serta PT Taspen di H-{config.pensiunBatasBknMonths} bulan.
            Sistem memaketkan 8 dokumen persyaratan menjadi 1 file PDF resmi terverifikasi BSrE.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setBulkPackModalOpen(true)}
            title="Pilih ASN dan kemas seluruh dokumen usulan pensiun menjadi 1 berkas pack PDF massal resmi"
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
            <span>Kirim Pengingat DPCP Massal</span>
          </button>
        </div>
      </div>

      {/* Banner Regulasi Resmi Pensiun 2026 */}
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
          <div>UU No. 20/2023 (UU ASN) &amp; PP No. 17/2020 (Manajemen Pegawai Negeri Sipil).</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>Syarat Substantif:</strong>
          <div>BUP 58 Th (Pelaksana/Administrator) / 60 Th (JPT/Madya), DPCP terisi, bebas temuan.</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>Timeframe Terprogram:</strong>
          <div>Pemicu DPCP H-{config.pensiunAlertMonths} bulan, Batas Usul BKN/Taspen H-{config.pensiunBatasBknMonths} bulan.</div>
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

      {/* Metriks Pengendalian Pensiun */}
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
            Mendekati BUP (≤{config.pensiunAlertMonths} Bulan)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--accent)' }}
          >
            {hitCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Masa pengisian formulir DPCP
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
            Batas Akhir Usul BKN (≤{config.pensiunBatasBknMonths} Bulan)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--danger, #dc2626)' }}
          >
            {urgentCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Wajib verifikasi berkas ke BKPSDMD
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
            TMT Pensiun Tahun 2026
          </span>
          <div className="heading tabular" style={{ fontSize: '22px', margin: '4px 0 2px' }}>
            3 Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Kecamatan Tamalate, Kota Makassar
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
            Berkas Siap Dipack PDF
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--success, #16a34a)' }}
          >
            {siapPackCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            8 Dokumen lengkap berstempel digital BSrE
          </span>
        </div>
      </div>

      {/* Filter Tab & Tabel Board Pensiun */}
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
              Semua Pegawai ({pensiunRows.length})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'dpcp_urgent' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('dpcp_urgent')}
            >
              Batas Usul &lt;= {config.pensiunBatasBknMonths} Bulan ({urgentCount})
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
                <th>Jadwal Pensiun &amp; BUP</th>
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
                          {row.tmtPensiun}
                        </span>
                        <span
                          className={`badge ${row.isUrgent ? 'badge-danger' : row.isHit ? 'badge-warn' : 'badge-neutral'}`}
                          style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}
                        >
                          {row.sisaBulan} Bln ({row.isUrgent ? 'Batas Usul BKN' : row.isHit ? 'Isi DPCP' : 'Aman'})
                        </span>
                      </div>
                      <div className="caption" style={{ fontSize: '10.5px', marginBottom: '3px' }}>
                        Lahir: {row.birthDate} · BUP {row.bupUmur} Thn
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
                            width: `${Math.max(8, Math.min(100, 100 - (row.sisaBulan / 24) * 100))}%`,
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
                        8 Dokumen Sah
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
                          title="Kirim pengingat penyusunan formulir DPCP ke pemohon"
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
                            title="Validasi dan teruskan ke tahap SOP selanjutnya"
                            onClick={async () => {
                              if (onAdvanceUsulan) {
                                await onAdvanceUsulan(row.usulanId);
                                setToastNotif(`Berkas Usulan Pensiun ${row.nama} berhasil divalidasi ke tahap berikutnya!`);
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
                            title="Berkas telah disahkan Camat. Kemas 1 pack PDF resmi usulan BKN / Taspen"
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

      {/* Modal Pemeriksaan Dokumen Pensiun (Dilengkapi Preview Dokumen PDF Satu per Satu) */}
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
        jenisLayanan="Pensiun"
        actorRole={currentRoleLabel}
      />

      {/* Modal Notifikasi Peringatan Massal dengan Opsi Sasaran */}
      <NotifikasiMassalModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        pegawaiList={notifTargetList}
        jenisUsulan="Pensiun"
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
            setToastNotif(`Berkas Usulan Pensiun berhasil dikembalikan ke tahapan sebelumnya.`);
            setTimeout(() => setToastNotif(null), 4000);
          }
        }}
      />
    </div>
  );
}
