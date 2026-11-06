'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  advanceUsulan,
  createSurat,
  fetchSimulationBootstrap,
  recordPresensi,
  resetSimulation,
  revertUsulan,
  toggleUsulanBerkas,
  updateSurat,
  uploadDossier,
  type SimulationBootstrapPayload,
  type SuratRecord,
  type UsulanRecord,
} from '@/lib/workspace-api';
import {
  BukuAgendaExportSheet,
  BukuAgendaTable,
  generateBukuAgendaCSV,
  getSifatText,
  getTargetDisposisiLabel,
  LembarDisposisiPaper,
  SuratCutiSheet,
} from '@/components/shared/SuratPaperTemplates';
import { AnatomyMechanismSVG } from '@/components/shared/AnatomyMechanismSVG';
import {
  ThresholdConfigView,
  DEFAULT_THRESHOLD_CONFIG,
  type GlobalThresholdConfig,
} from './ThresholdConfigView';
import { KgbBoardView } from './KgbBoardView';
import { PangkatBoardView } from './PangkatBoardView';
import { PensiunBoardView } from './PensiunBoardView';
import { CutiBoardView } from './CutiBoardView';
import { DossierPackModal } from './DossierPackModal';
import { TambahPegawaiModal } from './TambahPegawaiModal';
import { DossierManagerView } from './DossierManagerView';
import { RealSuratPreviewModal } from './RealSuratPreviewModal';
import type { PegawaiRecord } from '@/lib/workspace-api';

type DesktopRoleKey = 'operator' | 'kasubag' | 'sekcam' | 'camat';
type SuratOpsTab = 'masuk' | 'disposisi' | 'tindak-lanjut' | 'arsip' | 'audit';
type KpgNavKey =
  | 'surat'
  | 'ringkas'
  | 'apel'
  | 'rekap'
  | 'bina'
  | 'kgb'
  | 'pangkat'
  | 'cuti'
  | 'pensiun'
  | 'pegawai'
  | 'dossier'
  | 'threshold'
  | 'profil';

interface DesktopRoleMeta {
  key: DesktopRoleKey;
  label: string;
  nama: string;
  jabatan: string;
  nip: string;
  avatar: string;
  canCreate: boolean;
}

const DESKTOP_ROLES: Record<DesktopRoleKey, DesktopRoleMeta> = {
  operator: {
    key: 'operator',
    label: 'Operator Surat & Umpeg',
    nama: 'Siti Rahmawati, A.Md',
    jabatan: 'Operator Pengendali Surat',
    nip: '19950621 202012 2 011',
    avatar: 'OP',
    canCreate: true,
  },
  kasubag: {
    key: 'kasubag',
    label: 'Kasubag Umpeg',
    nama: 'Budi Hartono, S.Sos',
    jabatan: 'Kasubag Umum dan Kepegawaian',
    nip: '19850101 201001 1 001',
    avatar: 'KB',
    canCreate: true,
  },
  sekcam: {
    key: 'sekcam',
    label: 'Sekretaris Camat',
    nama: 'Ir. H. Syamsul Bahri, M.Si',
    jabatan: 'Sekretaris Camat (Sekcam)',
    nip: '19750819 200112 1 002',
    avatar: 'SC',
    canCreate: false,
  },
  camat: {
    key: 'camat',
    label: 'Camat Tamalate',
    nama: 'Drs. H. Sutrisno Hadi, M.Si',
    jabatan: 'Camat Tamalate',
    nip: '19720412 199303 1 004',
    avatar: 'CT',
    canCreate: false,
  },
};

const FLOW_STAGES = [
  '1. Pengendalian surat masuk',
  '2. Lembar disposisi pimpinan',
  '3. Tindak lanjut & verifikasi',
  '4. Validasi Sekcam & arsip',
  '5. Jejak audit permanen',
];

const BADGE_MAP: Record<string, { cls: string; icon: string; text: string }> = {
  baru: { cls: 'badge-info', icon: 'ph-sparkle', text: 'Baru' },
  disposisi: { cls: 'badge-warn', icon: 'ph-paper-plane-tilt', text: 'Disposisi' },
  proses: { cls: 'badge-neutral', icon: 'ph-hourglass-medium', text: 'Diproses' },
  selesai: { cls: 'badge-ok', icon: 'ph-check', text: 'Selesai' },
  terlambat: { cls: 'badge-danger', icon: 'ph-warning', text: 'Terlambat' },
};

const FLOW_DONE_MAP: Record<string, number> = {
  baru: 1,
  disposisi: 1,
  proses: 2,
  selesai: 5,
  terlambat: 2,
};

export function DesktopDashboard(): React.ReactNode {
  const [data, setData] = useState<SimulationBootstrapPayload | null>(null);
  const [roleKey, setRoleKey] = useState<DesktopRoleKey>('operator');
  const [activeNav, setActiveNav] = useState<KpgNavKey>('surat');
  const [activeOpsTab, setActiveOpsTab] = useState<SuratOpsTab>('masuk');
  const [tahap1ViewMode, setTahap1ViewMode] = useState<'meja-kerja' | 'buku-agenda'>('meja-kerja');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [arsipYearFilter, setArsipYearFilter] = useState<string>('all');
  const [activeAgendaId, setActiveAgendaId] = useState<string>('0042/VI/2026');

  // Modals
  const [disposisiModalOpen, setDisposisiModalOpen] = useState<boolean>(false);
  const [eksporModalOpen, setEksporModalOpen] = useState<boolean>(false);
  const [vaultModalSurat, setVaultModalSurat] = useState<SuratRecord | null>(null);
  const [catatModalOpen, setCatatModalOpen] = useState<boolean>(false);
  const [adminPackModalOpen, setAdminPackModalOpen] = useState<boolean>(false);
  const [selectedAdminPackUsulan, setSelectedAdminPackUsulan] = useState<UsulanRecord | null>(null);

  // Tindak Lanjut Form
  const [tlCatatan, setTlCatatan] = useState<string>('');
  const [tlPetugas, setTlPetugas] = useState<string>('');
  const [tlTanggal, setTlTanggal] = useState<string>('19-06-2026');

  // Arsip Form Inline
  const [arsipKodeInput, setArsipKodeInput] = useState<string>('005/UM/2026');
  const [arsipLokasiInput, setArsipLokasiInput] = useState<string>('Bantex Lemari Arsip Tamalate B-2');

  // Catat Surat Baru Form
  const [inputAgenda, setInputAgenda] = useState<string>('0045/VI/2026');
  const [inputNoSurat, setInputNoSurat] = useState<string>('005/318/Pemkot/VI/2026');
  const [inputAsal, setInputAsal] = useState<string>('Sekretariat Daerah Kota Makassar');
  const [inputTglSurat, setInputTglSurat] = useState<string>('19-06-2026');
  const [inputSifat, setInputSifat] = useState<string>('B');
  const [inputLampiran, setInputLampiran] = useState<string>('1 berkas');
  const [inputPerihal, setInputPerihal] = useState<string>(
    'Undangan Rapat Koordinasi Evaluasi Pelayanan Publik Kecamatan Tamalate',
  );
  const [inputBerkasNama, setInputBerkasNama] = useState<string>('Surat_Edaran_005_318_Pemkot_Makassar.pdf');
  const [inputBerkasUkuran, setInputBerkasUkuran] = useState<string>('1.8 MB');
  const [inputBerkasPdf, setInputBerkasPdf] = useState<string>('');

  // Modals state
  const [tambahPegawaiModalOpen, setTambahPegawaiModalOpen] = useState(false);
  const [realSuratModalSurat, setRealSuratModalSurat] = useState<SuratRecord | null>(null);
  const [dossierPreviewModalOpen, setDossierPreviewModalOpen] = useState(false);
  const [dossierPreviewData, setDossierPreviewData] = useState<{ title: string; subtitle: string } | null>(null);

  // Dossier Upload Form
  const [dossierTitle, setDossierTitle] = useState<string>('SK Kenaikan Gaji Berkala 2026.pdf');
  const [dossierPartisi, setDossierPartisi] = useState<string>('KGB');

  // Threshold state
  const [radiusMeter, setRadiusMeter] = useState<number>(150);
  const [batasAbsenHari, setBatasAbsenHari] = useState<number>(5);
  const [thresholdConfig, setThresholdConfig] = useState<GlobalThresholdConfig>(DEFAULT_THRESHOLD_CONFIG);

  useEffect(() => {
    void fetchSimulationBootstrap().then((payload) => {
      setData(payload);
      if (payload.surat[0]) {
        setActiveAgendaId(payload.surat[0].agenda);
        setTlCatatan(payload.surat[0].tindakLanjut?.catatan || '');
      }
    });
  }, []);

  const currentRole = DESKTOP_ROLES[roleKey];
  const suratList = data?.surat ?? [];
  const usulanList = data?.usulan ?? [];
  const pegawaiList = data?.pegawai ?? [];
  const presensiList = data?.presensi ?? [];
  const dossierList = data?.dossier ?? [];

  const filteredUsulan = useMemo(() => {
    if (activeNav === 'kgb') {
      return usulanList.filter((u) => u.jenis?.toLowerCase() === 'kgb' || u.id.startsWith('KGB'));
    }
    if (activeNav === 'pangkat') {
      return usulanList.filter(
        (u) => u.jenis?.toLowerCase() === 'pangkat' || u.id.startsWith('PANGKAT') || u.id.startsWith('KP'),
      );
    }
    if (activeNav === 'cuti') {
      return usulanList.filter((u) => u.jenis?.toLowerCase() === 'cuti' || u.id.startsWith('CUTI'));
    }
    if (activeNav === 'pensiun') {
      return usulanList.filter(
        (u) => u.jenis?.toLowerCase() === 'pensiun' || u.id.startsWith('PENSIUN') || u.id.startsWith('BUP'),
      );
    }
    return usulanList;
  }, [usulanList, activeNav]);

  const filteredSurat = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return suratList.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;
      return `${s.agenda} ${s.perihal} ${s.instansiTujuan || s.asal} ${s.nomorSurat}`
        .toLowerCase()
        .includes(q);
    });
  }, [suratList, searchQuery, statusFilter]);

  const activeSurat: SuratRecord | undefined = useMemo(
    () => suratList.find((s) => s.agenda === activeAgendaId) ?? suratList[0],
    [suratList, activeAgendaId],
  );

  useEffect(() => {
    if (activeSurat) {
      setTlCatatan(activeSurat.tindakLanjut?.catatan || '');
      setTlPetugas(activeSurat.tindakLanjut?.petugas || `${currentRole.nama} (${currentRole.label})`);
      setTlTanggal(activeSurat.tindakLanjut?.tanggal || new Date().toLocaleDateString('id-ID'));
    }
  }, [activeSurat, currentRole]);

  const disposisiQueue = useMemo(
    () => suratList.filter((s) => s.tahap === 2 || s.status === 'disposisi' || s.status === 'terlambat'),
    [suratList],
  );

  const tindakLanjutQueue = useMemo(
    () => suratList.filter((s) => s.tahap === 3 || s.status === 'proses'),
    [suratList],
  );

  const siapArsipList = useMemo(
    () => suratList.filter((s) => (s.tahap === 4 || s.status === 'selesai') && !s.arsip?.kodeKlasifikasi),
    [suratList],
  );

  const arsipPermanentList = useMemo(
    () =>
      suratList.filter((s) => {
        if (!s.arsip?.kodeKlasifikasi) return false;
        if (arsipYearFilter !== 'all' && s.arsip.tahun !== arsipYearFilter) return false;
        return true;
      }),
    [suratList, arsipYearFilter],
  );

  const selectOpsStage = (ops: SuratOpsTab) => {
    setActiveNav('surat');
    setActiveOpsTab(ops);
    setSidebarOpen(false);
  };

  const selectKpgNav = (nav: KpgNavKey) => {
    setActiveNav(nav);
    setSidebarOpen(false);
  };

  const handleCatatSuratSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAgenda.trim() || !inputAsal.trim() || !inputPerihal.trim()) return;
    const updated = await createSurat({
      agenda: inputAgenda.trim(),
      nomorSurat: inputNoSurat.trim() || '-',
      asal: inputAsal.trim(),
      instansiTujuan: inputAsal.trim(),
      perihal: inputPerihal.trim(),
      tanggalSurat: inputTglSurat.trim() || '19-06-2026',
      sifat: inputSifat,
      lampiran: inputLampiran.trim() || '-',
      actor: `${currentRole.nama} (${currentRole.label})`,
      berkasNama: inputBerkasNama.trim() || 'Surat_Naskah_Dinas_Masuk.pdf',
      berkasUkuran: inputBerkasUkuran.trim() || '1.8 MB',
      berkasPdf: inputBerkasPdf || '',
    });
    if (updated) {
      setData(updated);
      setActiveAgendaId(inputAgenda.trim());
      setCatatModalOpen(false);
    }
  };

  const NAV_LABELS: Record<KpgNavKey, string> = {
    surat: 'Pengendalian Surat & Lembar Disposisi',
    ringkas: 'Dasbor Utama Kepegawaian',
    apel: 'Apel Harian & Presensi Geofence',
    rekap: 'Rekapitulasi Presensi Bulanan',
    bina: 'Pembinaan & Pemantauan Disiplin',
    kgb: 'Kenaikan Gaji Berkala (KGB)',
    pangkat: 'Usulan Kenaikan Pangkat ASN',
    cuti: 'Cuti dan Izin Pegawai (Formulir Surat Cuti 2026)',
    pensiun: 'Persiapan Pensiun & BUP',
    pegawai: 'Direktori & Tenggat Data Pegawai',
    dossier: 'Single Dossier Vault Pegawai',
    threshold: 'Parameter Threshold & Hak Akses',
    profil: 'Profil Pengguna',
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/css/tokens.css" />
      <link rel="stylesheet" href="/assets/css/components.css" />
      <link rel="stylesheet" href="/assets/css/dashboard.css" />
      <link rel="stylesheet" href="/assets/css/berkas.css" />
      <link rel="stylesheet" href="/assets/css/kepegawaian.css" />
      <link rel="stylesheet" href="/assets/css/kepegawaian-desktop.css" />

      <div className="app-shell">
        {/* ============================================================
            SIDEBAR (IDENTIK 100% DENGAN dashboard-surat.html)
            ============================================================ */}
        <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} id="sidebar" aria-label="Navigasi utama">
          <div className="brand-bar">
            <div className="brand-mark">
              <i className="ph ph-buildings" />
            </div>
            <div className="brand-text">
              <div className="brand-name">Tamalate</div>
              <div className="brand-sub">Kepegawaian Kecamatan</div>
            </div>
          </div>

          <div className="nav-group">
            <a
              className={`nav-item ${activeNav === 'ringkas' ? 'is-on' : ''}`}
              href="#ringkas"
              data-nav="ringkas"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('ringkas');
              }}
            >
              <i className="ph ph-chart-pie-slice" />
              <span>Dashboard</span>
            </a>
            <a
              className={`nav-item ${activeNav === 'surat' ? 'is-on' : ''}`}
              href="#surat"
              data-nav="surat"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('surat');
              }}
            >
              <i className="ph ph-envelope-simple" />
              <span>Surat</span>
              <span className="nav-badge tabular">{suratList.length}</span>
            </a>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Pembinaan Pegawai</div>
            <a
              className={`nav-item ${activeNav === 'apel' ? 'is-on' : ''}`}
              href="#apel"
              data-nav="apel"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('apel');
              }}
            >
              <i className="ph ph-fingerprint" />
              <span>Apel Harian</span>
            </a>
            <a
              className={`nav-item ${activeNav === 'rekap' ? 'is-on' : ''}`}
              href="#rekap"
              data-nav="rekap"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('rekap');
              }}
            >
              <i className="ph ph-calendar-check" />
              <span>Rekap Presensi</span>
            </a>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Administratif Pegawai</div>
            <a
              className={`nav-item ${activeNav === 'kgb' ? 'is-on' : ''}`}
              href="#kgb"
              data-nav="kgb"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('kgb');
              }}
            >
              <i className="ph ph-trend-up" />
              <span>Kenaikan Gaji Berkala</span>
            </a>
            <a
              className={`nav-item ${activeNav === 'pangkat' ? 'is-on' : ''}`}
              href="#pangkat"
              data-nav="pangkat"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('pangkat');
              }}
            >
              <i className="ph ph-arrow-fat-up" />
              <span>Kenaikan Pangkat</span>
            </a>
            <a
              className={`nav-item ${activeNav === 'pensiun' ? 'is-on' : ''}`}
              href="#pensiun"
              data-nav="pensiun"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('pensiun');
              }}
            >
              <i className="ph ph-user-minus" />
              <span>Usulan Pensiun</span>
            </a>
            <a
              className={`nav-item ${activeNav === 'cuti' ? 'is-on' : ''}`}
              href="#cuti"
              data-nav="cuti"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('cuti');
              }}
            >
              <i className="ph ph-airplane-tilt" />
              <span>Cuti dan Izin</span>
            </a>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Data</div>
            <a
              className={`nav-item ${activeNav === 'pegawai' ? 'is-on' : ''}`}
              href="#pegawai"
              data-nav="pegawai"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('pegawai');
              }}
            >
              <i className="ph ph-users-three" />
              <span>Data Pegawai</span>
            </a>
            <a
              className={`nav-item ${activeNav === 'dossier' ? 'is-on' : ''}`}
              href="#dossier"
              data-nav="dossier"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('dossier');
              }}
            >
              <i className="ph ph-folders" />
              <span>Dossier Pegawai</span>
            </a>
            <a
              className={`nav-item ${activeNav === 'threshold' ? 'is-on' : ''}`}
              href="#threshold"
              data-nav="threshold"
              onClick={(e) => {
                e.preventDefault();
                selectKpgNav('threshold');
              }}
            >
              <i className="ph ph-sliders-horizontal" />
              <span>Parameter Treshold</span>
            </a>
            <a
              className="nav-item"
              href="/template"
              data-nav="template"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="ph ph-file-doc" />
              <span>Template Generator</span>
            </a>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Mode Tampilan Web</div>
            <a className="nav-item is-on" href="/dashboard">
              <i className="ph ph-monitor" />
              <span>Desktop</span>
            </a>
            <a className="nav-item" href="/mobile">
              <i className="ph ph-device-mobile" />
              <span>Mobile</span>
            </a>
          </div>

          <div className="side-foot">
            <button
              type="button"
              className={`side-user ${activeNav === 'profil' ? 'is-on' : ''}`}
              data-nav="profil"
              aria-label="Buka halaman profil"
              onClick={() => selectKpgNav('profil')}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}
            >
              <div className="side-avatar">{currentRole.avatar}</div>
              <div>
                <div className="side-name">{currentRole.nama}</div>
                <div className="side-role">{currentRole.jabatan}</div>
              </div>
            </button>
          </div>
        </aside>

        <div
          className={`scrim ${sidebarOpen ? 'is-on' : ''}`}
          id="scrim"
          onClick={() => setSidebarOpen(false)}
        />

        {/* ============================================================
            KOLOM KANAN (TOPBAR + CONTENT)
            ============================================================ */}
        <div className="shall">
          <header className="topbar">
            <button
              className="icon-btn hamburger"
              id="menuBtn"
              type="button"
              aria-label="Buka menu"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <i className="ph ph-list" />
            </button>
            <div className="crumb">
              <span>Kepegawaian</span>
              <i className="ph ph-caret-right" />
              <b>{NAV_LABELS[activeNav]}</b>
            </div>
            <div className="topbar-spacer" />

            {/* Sakelar Simulasi Peran Pengendalian Surat */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
              <label
                htmlFor="roleSelector"
                className="caption"
                style={{ fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Peran:
              </label>
              <select
                id="roleSelector"
                value={roleKey}
                onChange={(e) => setRoleKey(e.target.value as DesktopRoleKey)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface-soft)',
                  fontFamily: 'inherit',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: 'var(--heading)',
                  cursor: 'pointer',
                  maxWidth: '180px',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                <option value="operator">Operator Surat</option>
                <option value="kasubag">Kasubag Umpeg</option>
                <option value="sekcam">Sekcam (Paraf)</option>
                <option value="camat">Camat (Disposisi)</option>
              </select>
            </div>

            <label className="ops-search topbar-search">
              <i className="ph ph-magnifying-glass" />
              <input
                type="search"
                placeholder="Cari surat atau pegawai"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>

            <div className="user-chip">
              <div className="user-avatar">{currentRole.avatar}</div>
              <span className="user-name">{currentRole.label}</span>
            </div>

          </header>

          <main className="content">
            {/* ============================================================
                MODUL UTAMA PERSURATAN 5 TAHAP (#suratHost)
                ============================================================ */}
            {activeNav === 'surat' ? (
              <div id="suratHost">
                <div className="page-head">
                  <div>
                    <span className="eyebrow">Kecamatan Tamalate · Alur Persuratan</span>
                    <h1 className="page-title">Pengendalian Surat &amp; Lembar Disposisi</h1>
                    <p className="page-sub">
                      Lima tahap pengendalian naskah dinas dari registrasi masuk, disposisi pimpinan, tindak lanjut seksi, pengarsipan retensi, hingga jejak audit permanen.
                    </p>
                  </div>
                  <div className="page-actions">
                    <button
                      className="btn btn-ghost"
                      id="btnResetData"
                      type="button"
                      onClick={async () => {
                        const fresh = await resetSimulation();
                        if (fresh) setData(fresh);
                      }}
                    >
                      <i className="ph ph-arrows-clockwise" />
                      Reset 12 Data Simulasi
                    </button>
                    <button
                      className="btn btn-ghost"
                      id="btnEksporAgenda"
                      type="button"
                      onClick={() => setEksporModalOpen(true)}
                    >
                      <i className="ph ph-printer" />
                      Cetak / Ekspor Buku Agenda
                    </button>
                    <button
                      className="btn btn-primary"
                      id="btnCatatSurat"
                      type="button"
                      disabled={!currentRole.canCreate}
                      style={{ opacity: currentRole.canCreate ? 1 : 0.55 }}
                      onClick={() => setCatatModalOpen(true)}
                    >
                      <i className="ph ph-plus" />
                      Catat Surat Masuk
                    </button>
                  </div>
                </div>

                {/* Metrik Ringkas */}
                <div className="ops-metrics">
                  <div
                    className="metric-row"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}
                  >
                    <div
                      className="metric"
                      style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <div className="metric-value tabular" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--heading)' }}>
                        {suratList.length}
                      </div>
                      <div className="metric-label" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Surat masuk terdaftar
                      </div>
                      <div className="metric-delta up tabular" style={{ fontSize: '11px', color: 'var(--success)', marginTop: '6px' }}>
                        Register aktif 2026
                      </div>
                    </div>
                    <div
                      className="metric"
                      style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <div className="metric-value tabular" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--heading)' }}>
                        {disposisiQueue.length}
                      </div>
                      <div className="metric-label" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Menunggu disposisi
                      </div>
                      <div className="metric-delta down tabular" style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '6px' }}>
                        Meja Sekcam &amp; Camat
                      </div>
                    </div>
                    <div
                      className="metric"
                      style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <div className="metric-value tabular" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--heading)' }}>
                        1,8 hari
                      </div>
                      <div className="metric-label" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Rata-rata penyelesaian
                      </div>
                      <div className="metric-delta up tabular" style={{ fontSize: '11px', color: 'var(--success)', marginTop: '6px' }}>
                        Sesuai target SOP
                      </div>
                    </div>
                    <div
                      className="metric"
                      style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <div className="metric-value tabular" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--heading)' }}>
                        {suratList.filter((s) => s.status === 'terlambat').length}
                      </div>
                      <div className="metric-label" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Melewati batas waktu
                      </div>
                      <div className="metric-delta down tabular" style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '6px' }}>
                        Perlu tindak lanjut segera
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sakelar 5 Tahapan Alur Surat */}
                <div className="ops-tabs" role="tablist" aria-label="Tahapan Pengendalian Surat">
                  {(
                    [
                      { k: 'masuk', icon: 'ph-tray', label: '1. Pengendalian Masuk' },
                      { k: 'disposisi', icon: 'ph-paper-plane-tilt', label: '2. Lembar Disposisi' },
                      { k: 'tindak-lanjut', icon: 'ph-hourglass-medium', label: '3. Tindak Lanjut' },
                      { k: 'arsip', icon: 'ph-archive-box', label: '4. Pengarsipan' },
                      { k: 'audit', icon: 'ph-shield-check', label: '5. Jejak Audit' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      role="tab"
                      aria-selected={activeOpsTab === t.k}
                      className={`ops-tab ${activeOpsTab === t.k ? 'is-on' : ''}`}
                      data-ops={t.k}
                      onClick={() => setActiveOpsTab(t.k)}
                    >
                      <i className={`ph ${t.icon}`} />
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ==========================================================
                    TAHAP 1: PENGENDALIAN SURAT MASUK & BUKU AGENDA 8 KOLOM
                    ========================================================== */}
                {activeOpsTab === 'masuk' ? (
                  <div className="ops-view is-on" data-view="masuk">
                    <div
                      className="ops-toolbar"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--r-md)',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          background: 'var(--surface-soft)',
                          padding: '3px',
                          borderRadius: 'var(--r-sm)',
                          border: '1px solid var(--hairline)',
                        }}
                      >
                        <button
                          className={`chip ${tahap1ViewMode === 'meja-kerja' ? 'is-on' : ''}`}
                          id="tabModeMejaKerja"
                          type="button"
                          style={{ border: 0 }}
                          onClick={() => setTahap1ViewMode('meja-kerja')}
                        >
                          <i className="ph ph-columns" /> Meja Kerja &amp; Detail
                        </button>
                        <button
                          className={`chip ${tahap1ViewMode === 'buku-agenda' ? 'is-on' : ''}`}
                          id="tabModeBukuAgenda"
                          type="button"
                          style={{ border: 0 }}
                          onClick={() => setTahap1ViewMode('buku-agenda')}
                        >
                          <i className="ph ph-notebook" /> Format Buku Agenda Resmi (8 Kolom)
                        </button>
                      </div>

                      <label className="ops-search">
                        <i className="ph ph-magnifying-glass" />
                        <input
                          type="search"
                          id="opsSearch"
                          placeholder="Cari nomor agenda, instansi, atau perihal..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </label>

                      {[
                        { k: 'all', l: 'Semua' },
                        { k: 'baru', l: 'Baru' },
                        { k: 'disposisi', l: 'Disposisi' },
                        { k: 'proses', l: 'Diproses' },
                        { k: 'selesai', l: 'Selesai' },
                        { k: 'terlambat', l: 'Terlambat' },
                      ].map((st) => (
                        <button
                          key={st.k}
                          type="button"
                          className={`chip ${statusFilter === st.k ? 'is-on' : ''}`}
                          data-status={st.k}
                          onClick={() => setStatusFilter(st.k)}
                        >
                          {st.l}
                        </button>
                      ))}
                    </div>

                    {tahap1ViewMode === 'meja-kerja' ? (
                      <div className="ops-split" id="viewMejaKerja">
                        <div className="ops-panel">
                          <div className="data-table-scroll">
                            <table className="data-table" id="opsTable">
                              <thead>
                                <tr>
                                  <th>No. Agenda</th>
                                  <th>Instansi / Asal</th>
                                  <th>Perihal</th>
                                  <th>Tgl. Agenda</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredSurat.map((s) => {
                                  const b = BADGE_MAP[s.status] ?? BADGE_MAP.baru!;
                                  const isSel = s.agenda === activeSurat?.agenda ? 'is-sel' : '';
                                  return (
                                    <tr
                                      key={s.agenda}
                                      className={isSel}
                                      data-agenda={s.agenda}
                                      tabIndex={0}
                                      onClick={() => setActiveAgendaId(s.agenda)}
                                    >
                                      <td className="agenda" data-th="No. Agenda">
                                        {s.agenda}
                                      </td>
                                      <td data-th="Asal">{s.instansiTujuan || s.asal}</td>
                                      <td className="perihal" data-th="Perihal">
                                        {s.perihal}
                                      </td>
                                      <td data-th="Tanggal">{s.tanggalAgenda || s.tanggalPenerimaan}</td>
                                      <td data-th="Status">
                                        <span className={`badge ${b.cls}`}>
                                          <i className={`ph ${b.icon}`} />
                                          {b.text}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {activeSurat ? (
                          <aside className="ops-detail" id="opsDetail" aria-live="polite">
                            <div className="ops-detail-head">
                              <div>
                                <div className="ops-detail-code" id="opsCode">
                                  {activeSurat.agenda}
                                </div>
                                <div className="ops-detail-title" id="opsTitle">
                                  {activeSurat.perihal}
                                </div>
                              </div>
                              <span
                                className={`badge ${(BADGE_MAP[activeSurat.status] ?? BADGE_MAP.baru!).cls}`}
                                id="opsBadge"
                              >
                                <i className={`ph ${(BADGE_MAP[activeSurat.status] ?? BADGE_MAP.baru!).icon}`} />
                                {(BADGE_MAP[activeSurat.status] ?? BADGE_MAP.baru!).text}
                              </span>
                            </div>

                            <dl className="ops-meta">
                              <div className="ops-meta-row">
                                <dt>Asal / Instansi</dt>
                                <dd id="opsAsal">{activeSurat.instansiTujuan || activeSurat.asal}</dd>
                              </div>
                              <div className="ops-meta-row">
                                <dt>Tanggal diterima</dt>
                                <dd className="tabular" id="opsTanggal">
                                  {activeSurat.tanggalAgenda || activeSurat.tanggalPenerimaan}
                                </dd>
                              </div>
                              <div className="ops-meta-row">
                                <dt>Sifat surat</dt>
                                <dd id="opsSifat">{getSifatText(activeSurat.sifat)}</dd>
                              </div>
                              <div className="ops-meta-row">
                                <dt>Diteruskan ke</dt>
                                <dd id="opsTujuan">
                                  {getTargetDisposisiLabel(activeSurat.disposisi?.diteruskan)}
                                </dd>
                              </div>
                            </dl>

                            <div>
                              <div className="label" style={{ marginBottom: '10px', fontSize: '13px' }}>
                                Tahapan Pengendalian
                              </div>
                              <div className="flow" id="opsFlow">
                                {FLOW_STAGES.map((stageName, idx) => {
                                  const doneIdx = FLOW_DONE_MAP[activeSurat.status] ?? 1;
                                  const cls = idx < doneIdx ? 'done' : idx === doneIdx ? 'now' : '';
                                  const icon =
                                    idx < doneIdx
                                      ? 'ph-check'
                                      : idx === doneIdx
                                        ? 'ph-hourglass-medium'
                                        : 'ph-circle';
                                  const note =
                                    idx < doneIdx
                                      ? 'Selesai'
                                      : idx === doneIdx
                                        ? activeSurat.status === 'terlambat'
                                          ? 'Lewat tenggat SLA'
                                          : 'Sedang berjalan'
                                        : '';
                                  return (
                                    <div key={stageName} className={`flow-step ${cls}`}>
                                      <div className="flow-node">
                                        <i className={`ph ${icon}`} />
                                      </div>
                                      <div>
                                        <div className="flow-name">{stageName}</div>
                                        {note ? <div className="flow-note">{note}</div> : null}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                paddingTop: '12px',
                                borderTop: '1px solid var(--hairline)',
                              }}
                            >
                              <button
                                className="btn btn-primary"
                                id="btnOpenDisposisiDetail"
                                type="button"
                                style={{ width: '100%' }}
                                onClick={() => setDisposisiModalOpen(true)}
                              >
                                <i className="ph ph-file-text" />
                                Buka Lembar Disposisi Fisik
                              </button>
                              <button
                                className="btn btn-ghost"
                                id="btnForwardToDisposisi"
                                type="button"
                                style={{ width: '100%' }}
                                onClick={() => setActiveOpsTab('disposisi')}
                              >
                                <i className="ph ph-arrow-right" />
                                Teruskan ke Meja Pimpinan
                              </button>
                            </div>
                          </aside>
                        ) : null}
                      </div>
                    ) : (
                      <div id="viewBukuAgenda">
                        <div
                          style={{
                            marginBottom: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                          }}
                        >
                          <div>
                            <h3 className="heading" style={{ fontSize: '16px' }}>
                              Buku Agenda Surat Kecamatan Tamalate (Format Fisik 8 Kolom)
                            </h3>
                            <p className="caption">
                              Format buku register standar: NO | INSTANSI YG DI TUJUKAN | NO. SURAT | TANGGAL SURAT | PERIHAL | PENANGGUNG JAWAB | TANGGAL SURAT | KET.
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              onClick={() => setEksporModalOpen(true)}
                            >
                              <i className="ph ph-printer" /> Pratinjau Cetak &amp; Unduh CSV
                            </button>
                          </div>
                        </div>
                        <div id="bukuAgendaTableContainer">
                          <BukuAgendaTable
                            suratList={filteredSurat}
                            activeAgendaId={activeSurat?.agenda}
                            onSelectSurat={(ag) => setActiveAgendaId(ag)}
                            onOpenDisposisiModal={(s) => {
                              setActiveAgendaId(s.agenda);
                              setDisposisiModalOpen(true);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* ==========================================================
                    TAHAP 2: MEJA KERJA LEMBAR DISPOSISI PIMPINAN
                    ========================================================== */}
                {activeOpsTab === 'disposisi' ? (
                  <div className="ops-view is-on" data-view="disposisi">
                    <div className="ops-split-disposisi">
                      <div className="ops-queue-list">
                        <div className="ops-queue-head">
                          <span>Antrean Disposisi Pimpinan</span>
                          <span className="badge badge-warn">{disposisiQueue.length} Surat</span>
                        </div>
                        <div className="ops-queue-items" id="queueDisposisiList">
                          {disposisiQueue.map((s) => {
                            const b = BADGE_MAP[s.status] ?? BADGE_MAP.disposisi!;
                            const isActive = s.agenda === activeSurat?.agenda ? 'is-active' : '';
                            return (
                              <div
                                key={s.agenda}
                                className={`queue-card ${isActive}`}
                                data-agenda={s.agenda}
                                tabIndex={0}
                                onClick={() => setActiveAgendaId(s.agenda)}
                              >
                                <div className="queue-card-top">
                                  <span className="mono tag font-bold" style={{ color: 'var(--accent)' }}>
                                    {s.agenda}
                                  </span>
                                  <span className={`badge ${b.cls}`}>
                                    <i className={`ph ${b.icon}`} />
                                    {b.text}
                                  </span>
                                </div>
                                <div className="queue-card-title">{s.perihal}</div>
                                <div className="queue-card-sub">
                                  <i className="ph ph-buildings" /> {s.instansiTujuan || s.asal}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '4px',
                                  }}
                                >
                                  <span className="caption mono muted">
                                    {s.tanggalAgenda || s.tanggalPenerimaan}
                                  </span>
                                  {s.disposisi?.diketahuiSekcam ? (
                                    <span className="caption" style={{ color: '#1D4ED8' }}>
                                      <i className="ph ph-check-circle" /> Diketahui Sekcam
                                    </span>
                                  ) : (
                                    <span className="caption muted">Menunggu paraf/instruksi</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="ops-work-panel">
                        <div className="ops-work-head">
                          <div>
                            <span className="eyebrow" style={{ fontSize: '11px' }}>
                              Formulir Resmi Kecamatan Tamalate
                            </span>
                            <h3 className="heading" style={{ fontSize: '18px' }} id="dispWorkTitle">
                              Formulir Lembar Disposisi (Agenda {activeSurat?.agenda})
                            </h3>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              id="btnExpandModalDisposisi"
                              type="button"
                              onClick={() => setDisposisiModalOpen(true)}
                            >
                              <i className="ph ph-arrows-out-simple" /> Layar Penuh
                            </button>
                          </div>
                        </div>
                        <div id="inlineDisposisiContainer" style={{ padding: '20px' }}>
                          {activeSurat ? (
                            <LembarDisposisiPaper
                              surat={activeSurat}
                              roleKey={roleKey === 'kasubag' ? 'operator' : roleKey}
                              onOpenVaultVerify={(s) => setVaultModalSurat(s)}
                              onPreviewRealDoc={(s) => setRealSuratModalSurat(s)}
                              onSaveSekcam={async (p) => {
                                const updated = await updateSurat(activeSurat.agenda, {
                                  action: 'paraf_sekcam',
                                  actor: `${currentRole.nama} (${currentRole.label})`,
                                  catatanSekcam: p.catatanSekcam,
                                  rekomendasiTujuan: p.rekomendasiTujuan,
                                  parafSekcamImage: p.parafSekcamImage,
                                });
                                if (updated) setData(updated);
                              }}
                              onSaveCamat={async (p) => {
                                const updated = await updateSurat(activeSurat.agenda, {
                                  action: 'disposisi_camat',
                                  actor: `${currentRole.nama} (${currentRole.label})`,
                                  instruksi: p.instruksi,
                                  tanggalDisposisi: p.tanggalDisposisi,
                                  tanggalPenyelesaian: p.tanggalPenyelesaian,
                                  diteruskan: p.diteruskan,
                                  kembalikanKepada: p.kembalikanKepada,
                                  kembalikanTanggal: p.kembalikanTanggal,
                                  parafMode: p.parafMode,
                                  parafImage: p.parafImage,
                                });
                                if (updated) {
                                  setData(updated);
                                  setActiveOpsTab('tindak-lanjut');
                                }
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* ==========================================================
                    TAHAP 3: MEJA KERJA TINDAK LANJUT & VERIFIKASI
                    ========================================================== */}
                {activeOpsTab === 'tindak-lanjut' ? (
                  <div className="ops-view is-on" data-view="tindak-lanjut">
                    <div className="ops-split-disposisi">
                      <div className="ops-queue-list">
                        <div className="ops-queue-head">
                          <span>Daftar Tugas Pelaksana</span>
                          <span className="badge badge-info">{tindakLanjutQueue.length} Tugas</span>
                        </div>
                        <div className="ops-queue-items" id="queueTindakLanjutList">
                          {tindakLanjutQueue.map((s) => (
                            <div
                              key={s.agenda}
                              className={`queue-card ${s.agenda === activeSurat?.agenda ? 'is-active' : ''}`}
                              onClick={() => setActiveAgendaId(s.agenda)}
                            >
                              <div className="queue-card-top">
                                <span className="mono tag font-bold" style={{ color: 'var(--accent)' }}>
                                  {s.agenda}
                                </span>
                                <span className="badge badge-neutral">
                                  <i className="ph ph-hourglass-medium" />
                                  Diproses
                                </span>
                              </div>
                              <div className="queue-card-title">{s.perihal}</div>
                              <div className="queue-card-sub">
                                <i className="ph ph-user-check" /> Petugas:{' '}
                                {getTargetDisposisiLabel(s.disposisi?.diteruskan)}
                              </div>
                              <div className="caption muted">
                                Disposisi: &ldquo;{s.disposisi?.instruksi || 'DiTL'}&rdquo;
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ops-work-panel">
                        <div className="ops-work-head">
                          <div>
                            <span className="eyebrow" style={{ fontSize: '11px' }}>
                              Pelaksanaan &amp; Verifikasi Berjenjang
                            </span>
                            <h3 className="heading" style={{ fontSize: '18px' }} id="tindakWorkTitle">
                              Laporan Penanganan Naskah (Agenda {activeSurat?.agenda})
                            </h3>
                          </div>
                        </div>
                        <div id="inlineTindakLanjutContainer" style={{ padding: '24px' }}>
                          {activeSurat ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div
                                style={{
                                  background: '#F8FAFD',
                                  border: '1px solid var(--hairline)',
                                  borderRadius: 'var(--r-sm)',
                                  padding: '14px 16px',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: '6px',
                                  }}
                                >
                                  <span className="eyebrow" style={{ fontSize: '11px' }}>
                                    Rujukan Lembar Disposisi Camat
                                  </span>
                                  <span className="caption mono">
                                    {activeSurat.disposisi?.tanggalDisposisi || '19-06-2026'}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'var(--heading)',
                                    marginBottom: '4px',
                                  }}
                                >
                                  &ldquo;{activeSurat.disposisi?.instruksi || 'DiTL sesuai ketentuan'}&rdquo;
                                </div>
                                <div className="caption">
                                  Disahkan oleh: <b>{activeSurat.disposisi?.parafOleh || 'Camat Tamalate'}</b> ·
                                  Diteruskan ke:{' '}
                                  <b style={{ color: 'var(--accent)' }}>
                                    {getTargetDisposisiLabel(activeSurat.disposisi?.diteruskan)}
                                  </b>
                                </div>
                              </div>

                              <div className="tindak-lanjut-form">
                                <label className="label" htmlFor="tlCatatan">
                                  Catatan / Laporan Hasil Tindak Lanjut *
                                </label>
                                <textarea
                                  id="tlCatatan"
                                  className="disp-textarea"
                                  rows={4}
                                  placeholder="Tuliskan hasil koordinasi teknis, tindak lanjut pelayanan, atau klarifikasi lapangan yang telah diselesaikan..."
                                  value={tlCatatan}
                                  onChange={(e) => setTlCatatan(e.target.value)}
                                />

                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                    marginTop: '6px',
                                  }}
                                >
                                  <div>
                                    <label className="label" htmlFor="tlPetugas">
                                      Petugas Pelaksana
                                    </label>
                                    <input
                                      type="text"
                                      id="tlPetugas"
                                      className="disp-textarea"
                                      style={{ height: '38px' }}
                                      value={tlPetugas}
                                      onChange={(e) => setTlPetugas(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="label" htmlFor="tlTanggal">
                                      Tanggal Penyelesaian
                                    </label>
                                    <input
                                      type="text"
                                      id="tlTanggal"
                                      className="disp-textarea mono"
                                      style={{ height: '38px' }}
                                      value={tlTanggal}
                                      onChange={(e) => setTlTanggal(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="verifikasi-steps-box" style={{ marginTop: '8px' }}>
                                  <span
                                    className="caption font-medium"
                                    style={{ color: 'var(--muted)', textTransform: 'uppercase' }}
                                  >
                                    Tahapan Verifikasi Berkas:
                                  </span>
                                  <label className="verifikasi-step-item">
                                    <input type="checkbox" defaultChecked />
                                    <span>1. Verifikasi Teknis Seksi / Subbagian (Kelengkapan naskah tuntas)</span>
                                  </label>
                                  <label className="verifikasi-step-item">
                                    <input type="checkbox" defaultChecked />
                                    <span>2. Validasi Sekcam &amp; Pengarsipan (Siap dicatat ke lemari arsip)</span>
                                  </label>
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '10px',
                                    marginTop: '12px',
                                  }}
                                >
                                  <button
                                    className="btn btn-primary"
                                    id="btnSelesaiDanArsip"
                                    type="button"
                                    onClick={async () => {
                                      const updated = await updateSurat(activeSurat.agenda, {
                                        action: 'tindak_lanjut',
                                        actor: `${currentRole.nama} (${currentRole.label})`,
                                        catatanTindakLanjut:
                                          tlCatatan || 'Tindak lanjut selesai dilaksanakan dan divalidasi.',
                                        petugasTindakLanjut: tlPetugas,
                                      });
                                      if (updated) {
                                        setData(updated);
                                        setActiveOpsTab('arsip');
                                      }
                                    }}
                                  >
                                    <i className="ph ph-check-circle" /> Nyatakan Selesai &amp; Kirim ke Pengarsipan
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* ==========================================================
                    TAHAP 4: PENGARSIPAN DAN RETENSI DOKUMEN
                    ========================================================== */}
                {activeOpsTab === 'arsip' ? (
                  <div className="ops-view is-on" data-view="arsip">
                    <div
                      className="ops-panel"
                      style={{ marginBottom: '20px', padding: '18px 20px', background: '#FAFBFD' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '12px',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <span className="eyebrow" style={{ fontSize: '11px' }}>
                            Antrean Berkas Selesai
                          </span>
                          <h3 className="heading" style={{ fontSize: '16px' }}>
                            Naskah Siap Masuk Lemari Arsip
                          </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="disp-inline-input mono"
                            value={arsipKodeInput}
                            onChange={(e) => setArsipKodeInput(e.target.value)}
                            placeholder="Kode Klasifikasi"
                          />
                          <input
                            type="text"
                            className="disp-inline-input"
                            value={arsipLokasiInput}
                            onChange={(e) => setArsipLokasiInput(e.target.value)}
                            placeholder="Lokasi Fisik"
                          />
                        </div>
                      </div>
                      <div id="siapArsipList" className="siap-arsip-grid">
                        {siapArsipList.length === 0 ? (
                          <div className="caption muted" style={{ padding: '10px 0' }}>
                            Tidak ada berkas yang tertunda untuk diarsipkan. Seluruh naskah tersimpan rapi.
                          </div>
                        ) : (
                          siapArsipList.map((s) => (
                            <div key={s.agenda} className="siap-arsip-item">
                              <div>
                                <span
                                  className="mono font-bold"
                                  style={{ color: 'var(--accent)', fontSize: '12.5px' }}
                                >
                                  {s.agenda}
                                </span>{' '}
                                · <span className="font-medium">{s.perihal}</span>
                                <div className="caption muted">
                                  Asal/Tujuan: {s.instansiTujuan || s.asal}
                                </div>
                              </div>
                              <button
                                className="btn btn-primary btn-sm"
                                type="button"
                                onClick={async () => {
                                  const updated = await updateSurat(s.agenda, {
                                    action: 'arsip',
                                    actor: `${currentRole.nama} (${currentRole.label})`,
                                    kodeKlasifikasi: arsipKodeInput,
                                    lokasiFisik: arsipLokasiInput,
                                  });
                                  if (updated) setData(updated);
                                }}
                              >
                                <i className="ph ph-archive-box" /> Beri Kode &amp; Arsipkan
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="ops-filterbar">
                      <span className="caption" style={{ fontWeight: 500 }}>
                        Tahun Arsip
                      </span>
                      {['all', '2026', '2025'].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          className={`chip ${arsipYearFilter === yr ? 'is-on' : ''}`}
                          onClick={() => setArsipYearFilter(yr)}
                        >
                          {yr === 'all' ? 'Semua' : yr}
                        </button>
                      ))}
                    </div>

                    <div className="arsip-grid" id="arsipGrid">
                      {arsipPermanentList.map((s) => (
                        <article key={s.agenda} className="arsip-card" tabIndex={0}>
                          <div className="arsip-top">
                            <span className="arsip-code mono font-bold">{s.arsip?.kodeKlasifikasi}</span>
                            <span className="badge badge-ok">
                              <i className="ph ph-check" />
                              {(s.arsip?.statusArsip || 'AKTIF').toUpperCase()}
                            </span>
                          </div>
                          <div className="arsip-name font-medium">{s.perihal}</div>
                          <div className="caption muted" style={{ marginTop: '4px' }}>
                            Lokasi: {s.arsip?.lokasiFisik || 'Lemari Arsip Tamalate'}
                          </div>
                          <div className="arsip-stats">
                            <div className="arsip-stat">
                              <b className="tabular">{s.arsip?.tahun || '2026'}</b>
                              <span>Tahun</span>
                            </div>
                            <div className="arsip-stat">
                              <b className="tabular">{s.arsip?.retensiTahun || 5} Thn</b>
                              <span>Retensi</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* ==========================================================
                    TAHAP 5: JEJAK AUDIT PERMANEN
                    ========================================================== */}
                {activeOpsTab === 'audit' ? (
                  <div className="ops-view is-on" data-view="audit">
                    <div className="ops-panel" style={{ padding: '24px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '20px',
                          paddingBottom: '14px',
                          borderBottom: '1px solid var(--hairline)',
                        }}
                      >
                        <div>
                          <span className="eyebrow">Log Integritas Naskah</span>
                          <h3 className="heading" style={{ fontSize: '20px', marginTop: '4px' }}>
                            Jejak Audit Perubahan Status &amp; Paraf Disposisi
                          </h3>
                        </div>
                        <span className="badge badge-ok">
                          <i className="ph ph-lock-key" /> Append-Only Audit Log
                        </span>
                      </div>
                      <div id="auditTimelineContainer">
                        <div className="audit-timeline">
                          {suratList.flatMap((s) =>
                            s.auditTrail.map((l, idx) => (
                              <div key={`${s.agenda}-${idx}`} className="audit-entry">
                                <div className="audit-meta">
                                  <span className="mono">{l.timestamp}</span>
                                  <span className="badge badge-neutral" style={{ width: 'fit-content' }}>
                                    Agenda {s.agenda}
                                  </span>
                                </div>
                                <div className="audit-content">
                                  <div className="audit-action-title">
                                    <i className="ph ph-shield-check" style={{ color: 'var(--accent)' }} />
                                    <b>{l.action}</b> oleh <span>{l.user}</span>
                                  </div>
                                  <div className="audit-note">{l.note || '-'}</div>
                                </div>
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* ============================================================
                 MODUL KEPEGAWAIAN DESKTOP (#kpgHost)
                 ============================================================ */
              <div id="kpgHost">
                <div className="page-head">
                  <div>
                    <span className="eyebrow">Kecamatan Tamalate · Modul Kepegawaian</span>
                    <h1 className="page-title">{NAV_LABELS[activeNav]}</h1>
                    <p className="page-sub">
                      Pengelolaan presensi geofencing, kenaikan gaji berkala, kepangkatan, cuti resmi, pembinaan disiplin, dan Single Dossier Vault ASN.
                    </p>
                  </div>
                </div>

                {/* Diagram Isometrik Kriya Fisik (Anatomy) pada Dasbor Utama */}
                {activeNav === 'ringkas' ? (
                  <div style={{ marginBottom: '22px' }}>
                    <AnatomyMechanismSVG
                      suratCount={suratList.length}
                      disposisiQueueCount={disposisiQueue.length}
                      hadirPagi={data?.stats.hadirPagi ?? 142}
                      totalPegawai={data?.stats.totalPegawai ?? 148}
                      usulanActiveCount={usulanList.length}
                      dossierCount={dossierList.length}
                      onSelectStage={(idx) => {
                        if (idx === 0) selectOpsStage('masuk');
                        if (idx === 1) selectOpsStage('disposisi');
                        if (idx === 2) selectKpgNav('apel');
                        if (idx === 3) selectKpgNav('dossier');
                      }}
                    />
                  </div>
                ) : null}


                {/* Halaman Profil Pengguna (dibuka dari footer sidebar) */}
                {activeNav === 'profil' ? (
                  <div className="ops-panel" style={{ padding: '24px', display: 'grid', gap: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div className="side-avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
                        {currentRole.avatar}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="heading" style={{ fontSize: '18px' }}>{currentRole.nama}</div>
                        <div className="caption">{currentRole.jabatan}</div>
                        <div className="caption tabular">NIP {currentRole.nip}</div>
                      </div>
                    </div>
                    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', margin: 0 }}>
                      <div>
                        <dt className="caption">Peran aktif</dt>
                        <dd style={{ margin: 0, fontWeight: 500 }}>{currentRole.label}</dd>
                      </div>
                      <div>
                        <dt className="caption">Unit kerja</dt>
                        <dd style={{ margin: 0, fontWeight: 500 }}>Kecamatan Tamalate, Pemerintah Kota Makassar</dd>
                      </div>
                      <div>
                        <dt className="caption">Hak membuat surat</dt>
                        <dd style={{ margin: 0, fontWeight: 500 }}>{currentRole.canCreate ? 'Diizinkan' : 'Tidak diizinkan'}</dd>
                      </div>
                    </dl>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(Object.values(DESKTOP_ROLES) as DesktopRoleMeta[]).map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          className={`btn btn-sm ${roleKey === r.key ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setRoleKey(r.key)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Apel Harian & Rekap Presensi */}
                {activeNav === 'apel' || activeNav === 'rekap' ? (
                  <div className="ops-panel">
                    <div className="ops-toolbar">
                      <span className="heading" style={{ fontSize: '15px' }}>
                        Log Kehadiran Apel Pagi &amp; Sore (Radius Geofence &lt;= {radiusMeter}m)
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        style={{ marginLeft: 'auto' }}
                        onClick={async () => {
                          const updated = await recordPresensi({
                            nip: currentRole.nip,
                            nama: currentRole.nama,
                            jabatan: currentRole.jabatan,
                            unit: 'Sekretariat Kecamatan',
                            sesi: 'pagi',
                            jarakMeter: 34,
                          });
                          if (updated) setData(updated);
                        }}
                      >
                        <i className="ph ph-camera" /> Rekam Presensi Apel Sekarang
                      </button>
                    </div>
                    <div className="data-table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>NIP</th>
                            <th>Nama Pegawai</th>
                            <th>Jabatan &amp; Unit</th>
                            <th>Apel Pagi</th>
                            <th>Apel Sore</th>
                            <th>Jarak Radius</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presensiList.map((p) => (
                            <tr key={p.id}>
                              <td className="mono">{p.nip}</td>
                              <td className="perihal">{p.nama}</td>
                              <td>
                                {p.jabatan} · {p.unit}
                              </td>
                              <td className="mono">{p.apelPagi}</td>
                              <td className="mono">{p.apelSore}</td>
                              <td className="mono">{p.jarakMeter} m</td>
                              <td>
                                <span className={`badge ${p.status === 'Hadir' ? 'badge-ok' : 'badge-warn'}`}>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {/* Data Pegawai */}
                {activeNav === 'pegawai' || activeNav === 'bina' ? (
                  <div className="ops-panel">
                    {activeNav === 'pegawai' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          borderBottom: '1px solid var(--hairline)',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>
                            Data Induk Pegawai ASN Kecamatan Tamalate
                          </div>
                          <div className="caption muted">
                            Total {pegawaiList.length} aparatur sipil negara terdaftar aktif pada Sistem Kepegawaian
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setTambahPegawaiModalOpen(true)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <i className="ph ph-user-plus" />
                          <span>Tambah Pegawai ASN</span>
                        </button>
                      </div>
                    ) : null}
                    <div className="data-table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>NIP</th>
                            <th>Nama Lengkap</th>
                            <th>Pangkat / Golongan</th>
                            <th>Jabatan</th>
                            <th>TMT KGB Berikutnya</th>
                            <th>TMT Pangkat</th>
                            <th>Absen Sepekan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pegawaiList.map((p) => (
                            <tr key={p.nip}>
                              <td className="mono">{p.nip}</td>
                              <td className="perihal">{p.nama}</td>
                              <td>
                                {p.pangkat} ({p.golongan})
                              </td>
                              <td>{p.jabatan}</td>
                              <td className="mono">{p.tmtKgbBerikutnya}</td>
                              <td className="mono">{p.tmtPangkatBerikutnya}</td>
                              <td>
                                <span
                                  className={`badge ${p.tidakHadirMingguIni >= 3 ? 'badge-warn' : 'badge-ok'}`}
                                >
                                  {p.tidakHadirMingguIni} dari {batasAbsenHari} hari
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {/* Dossier Pegawai & Global Klasifikasi Vault */}
                {activeNav === 'dossier' ? (
                  <DossierManagerView
                    dossierList={dossierList}
                    pegawaiList={pegawaiList}
                    currentRole={{
                      nip: currentRole.nip,
                      nama: currentRole.nama,
                      label: currentRole.label,
                    }}
                    onUploadDossier={async (payload) => {
                      const updated = await uploadDossier(payload);
                      if (updated) setData(updated);
                    }}
                    onUpdateDossierList={(newList) => {
                      setData((prev) => (prev ? { ...prev, dossier: newList } : prev));
                    }}
                    onPreviewPdf={(title, subtitle) => {
                      setRealSuratModalSurat({
                        agenda: 'DOS-AUDIT',
                        nomorSurat: '800.1/DOS/2026',
                        asal: 'Kecamatan Tamalate',
                        instansiTujuan: 'Kecamatan Tamalate',
                        perihal: subtitle,
                        tanggalAgenda: '19-06-2026',
                        tanggalPenerimaan: '19-06-2026',
                        tanggalSurat: '19-06-2026',
                        sifat: 'B',
                        lampiran: '1 berkas',
                        tahap: 4,
                        status: 'selesai',
                        berkasNama: title,
                        berkasUkuran: '1.2 MB',
                        disposisi: {},
                        auditTrail: [],
                      });
                    }}
                  />
                ) : null}

                {/* Parameter Threshold Global Setup */}
                {activeNav === 'threshold' ? (
                  <ThresholdConfigView
                    config={thresholdConfig}
                    onSaveConfig={setThresholdConfig}
                    currentRoleLabel={currentRole.label}
                  />
                ) : null}

                {/* Papan Pengendalian Kenaikan Gaji Berkala (KGB) */}
                {activeNav === 'kgb' ? (
                  <KgbBoardView
                    pegawaiList={pegawaiList}
                    usulanList={usulanList}
                    config={thresholdConfig}
                    currentRoleKey={roleKey}
                    currentRoleLabel={currentRole.label}
                    currentRoleName={currentRole.nama}
                    onAdvanceUsulan={async (uId, signatureMethod) => {
                      const updated = await advanceUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan: 'Divalidasi melalui Papan Pengendalian KGB Tamalate',
                        signatureMethod,
                      });
                      if (updated) setData(updated);
                    }}
                    onRevertUsulan={async (uId, catatan) => {
                      const updated = await revertUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan,
                      });
                      if (updated) setData(updated);
                    }}
                    onToggleBerkas={async (uId, kode, lengkap) => {
                      const updated = await toggleUsulanBerkas(uId, {
                        kodeBerkas: kode,
                        lengkap,
                      });
                      if (updated) setData(updated);
                    }}
                  />
                ) : null}

                {/* Papan Pengendalian Usulan Kenaikan Pangkat (KP) */}
                {activeNav === 'pangkat' ? (
                  <PangkatBoardView
                    pegawaiList={pegawaiList}
                    usulanList={usulanList}
                    config={thresholdConfig}
                    currentRoleKey={roleKey}
                    currentRoleLabel={currentRole.label}
                    currentRoleName={currentRole.nama}
                    onAdvanceUsulan={async (uId, signatureMethod) => {
                      const updated = await advanceUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan: 'Divalidasi melalui Papan Pengendalian KP Tamalate',
                        signatureMethod,
                      });
                      if (updated) setData(updated);
                    }}
                    onRevertUsulan={async (uId, catatan) => {
                      const updated = await revertUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan,
                      });
                      if (updated) setData(updated);
                    }}
                    onToggleBerkas={async (uId, kode, lengkap) => {
                      const updated = await toggleUsulanBerkas(uId, {
                        kodeBerkas: kode,
                        lengkap,
                      });
                      if (updated) setData(updated);
                    }}
                  />
                ) : null}

                {/* Papan Pengendalian Batas Usia Pensiun (BUP) & DPCP */}
                {activeNav === 'pensiun' ? (
                  <PensiunBoardView
                    pegawaiList={pegawaiList}
                    usulanList={usulanList}
                    config={thresholdConfig}
                    currentRoleKey={roleKey}
                    currentRoleLabel={currentRole.label}
                    currentRoleName={currentRole.nama}
                    onAdvanceUsulan={async (uId, signatureMethod) => {
                      const updated = await advanceUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan: 'Divalidasi melalui Papan Pengendalian Pensiun Tamalate',
                        signatureMethod,
                      });
                      if (updated) setData(updated);
                    }}
                    onRevertUsulan={async (uId, catatan) => {
                      const updated = await revertUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan,
                      });
                      if (updated) setData(updated);
                    }}
                    onToggleBerkas={async (uId, kode, lengkap) => {
                      const updated = await toggleUsulanBerkas(uId, {
                        kodeBerkas: kode,
                        lengkap,
                      });
                      if (updated) setData(updated);
                    }}
                  />
                ) : null}

                {/* Papan Pengendalian Cuti dan Izin Pegawai ASN */}
                {activeNav === 'cuti' ? (
                  <CutiBoardView
                    pegawaiList={pegawaiList}
                    usulanList={usulanList}
                    config={thresholdConfig}
                    currentRoleKey={roleKey}
                    currentRoleLabel={currentRole.label}
                    currentRoleName={currentRole.nama}
                    onAdvanceUsulan={async (uId, signatureMethod) => {
                      const updated = await advanceUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan: 'Divalidasi melalui Papan Pengendalian Cuti Tamalate',
                        signatureMethod,
                      });
                      if (updated) setData(updated);
                    }}
                    onRevertUsulan={async (uId, catatan) => {
                      const updated = await revertUsulan(uId, {
                        actor: `${currentRole.nama} (${currentRole.label})`,
                        catatan,
                      });
                      if (updated) setData(updated);
                    }}
                    onToggleBerkas={async (uId, kode, lengkap) => {
                      const updated = await toggleUsulanBerkas(uId, {
                        kodeBerkas: kode,
                        lengkap,
                      });
                      if (updated) setData(updated);
                    }}
                  />
                ) : null}

                {/* Modul Ringkasan Seluruh Usulan Kepegawaian (Hanya saat ringkas) */}
                {activeNav === 'ringkas' ? (
                  <div style={{ display: 'grid', gap: '16px', width: '100%', minWidth: 0 }}>
                    {/* Header Modul Administratif */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        padding: '16px 20px',
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--r-md)',
                        width: '100%',
                        boxSizing: 'border-box',
                        minWidth: 0,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span className="eyebrow" style={{ fontSize: '11px' }}>
                          Layanan Administratif Kepegawaian · Kecamatan Tamalate
                        </span>
                        <h2 className="heading" style={{ fontSize: '18px', margin: '4px 0 0' }}>
                          Daftar Seluruh Usulan Kepegawaian Aktif
                        </h2>
                        <p className="caption" style={{ margin: '4px 0 0' }}>
                          Ringkasan seluruh berkas usulan administratif aparatur sipil negara di lingkungan Kecamatan Tamalate.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="badge badge-info tabular">
                          {filteredUsulan.length} Berkas Aktif
                        </span>
                      </div>
                    </div>

                    {/* Grid Kartu Usulan Administratif (Zero Overflow Guaranteed) */}
                    <div className="arsip-grid">
                      {filteredUsulan.map((u) => {
                        const lengkapCount = u.berkas.filter((b) => b.lengkap).length;
                        return (
                          <article key={u.id} className="arsip-card" style={{ cursor: 'default' }}>
                            <div className="arsip-top">
                              <span className="arsip-code mono">{u.id}</span>
                              <span className={`badge ${u.tahap >= 4 ? 'badge-ok' : 'badge-warn'}`}>
                                Tahap {u.tahap}/4 · {u.status}
                              </span>
                            </div>
                            <div className="arsip-name">{u.nama}</div>
                            <div className="caption" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {u.jabatan} · Gol. {u.golongan} · TMT {u.tmtTarget}
                            </div>
                            <div style={{ display: 'grid', gap: '6px', marginTop: '6px', minWidth: 0 }}>
                              {u.berkas.map((b) => (
                                <div
                                  key={b.kode}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                    gap: '8px',
                                    minWidth: 0,
                                    maxWidth: '100%',
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <span
                                    style={{
                                      minWidth: 0,
                                      flex: 1,
                                      overflowWrap: 'anywhere',
                                      wordBreak: 'break-word',
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {b.nama}
                                  </span>
                                  <button
                                    type="button"
                                    className={`chip ${b.lengkap ? 'is-on' : ''}`}
                                    style={{ height: '24px', fontSize: '11px', flexShrink: 0 }}
                                    onClick={async () => {
                                      const updated = await toggleUsulanBerkas(u.id, {
                                        kodeBerkas: b.kode,
                                        lengkap: !b.lengkap,
                                      });
                                      if (updated) setData(updated);
                                    }}
                                  >
                                    {b.lengkap ? 'Lengkap' : 'Kurang'}
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div
                              className="arsip-stats"
                              style={{
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: 0,
                                flexWrap: 'wrap',
                              }}
                            >
                              <span className="caption tabular" style={{ minWidth: 0, flexShrink: 1 }}>
                                Berkas: {lengkapCount}/{u.berkas.length}
                              </span>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  type="button"
                                  style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                                  onClick={() => {
                                    setSelectedAdminPackUsulan(u);
                                    setAdminPackModalOpen(true);
                                  }}
                                  title="Satukan seluruh berkas usulan ini menjadi 1 dokumen pack PDF"
                                >
                                  <i className="ph ph-file-pdf" />
                                  <span>Pack 1 PDF</span>
                                </button>
                                {u.tahap < 4 ? (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    type="button"
                                    style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                                    onClick={async () => {
                                      const updated = await advanceUsulan(u.id, {
                                        actor: `${currentRole.nama} (${currentRole.label})`,
                                        catatan: 'Diverifikasi melalui Dasbor Desktop Tamalate',
                                      });
                                      if (updated) setData(updated);
                                    }}
                                  >
                                    Majukan Tahap {u.tahap + 1}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================
          MODAL 1: LEMBAR DISPOSISI FULL-SCREEN (#disposisiModal)
          ============================================================ */}
      <div
        className={`modal-backdrop ${disposisiModalOpen ? 'is-open' : ''}`}
        id="disposisiModal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setDisposisiModalOpen(false);
        }}
      >
        <div className="modal-dialog" id="disposisiModalContent">
          {activeSurat ? (
            <LembarDisposisiPaper
              surat={activeSurat}
              roleKey={roleKey === 'kasubag' ? 'operator' : roleKey}
              isModal
              onCloseModal={() => setDisposisiModalOpen(false)}
              onOpenVaultVerify={(s) => setVaultModalSurat(s)}
              onPreviewRealDoc={(s) => setRealSuratModalSurat(s)}
              onSaveSekcam={async (p) => {
                const updated = await updateSurat(activeSurat.agenda, {
                  action: 'paraf_sekcam',
                  actor: `${currentRole.nama} (${currentRole.label})`,
                  catatanSekcam: p.catatanSekcam,
                  rekomendasiTujuan: p.rekomendasiTujuan,
                  parafSekcamImage: p.parafSekcamImage,
                });
                if (updated) setData(updated);
                setDisposisiModalOpen(false);
              }}
              onSaveCamat={async (p) => {
                const updated = await updateSurat(activeSurat.agenda, {
                  action: 'disposisi_camat',
                  actor: `${currentRole.nama} (${currentRole.label})`,
                  instruksi: p.instruksi,
                  tanggalDisposisi: p.tanggalDisposisi,
                  tanggalPenyelesaian: p.tanggalPenyelesaian,
                  diteruskan: p.diteruskan,
                  kembalikanKepada: p.kembalikanKepada,
                  kembalikanTanggal: p.kembalikanTanggal,
                  parafMode: p.parafMode,
                  parafImage: p.parafImage,
                });
                if (updated) setData(updated);
                setDisposisiModalOpen(false);
              }}
            />
          ) : null}
        </div>
      </div>

      {/* ============================================================
          MODAL 2: PRATINJAU CETAK & EKSPOR BUKU AGENDA 8 KOLOM (#modalEksporAgenda)
          ============================================================ */}
      <div
        className={`modal-backdrop ${eksporModalOpen ? 'is-open' : ''}`}
        id="modalEksporAgenda"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setEksporModalOpen(false);
        }}
      >
        <div className="modal-dialog" style={{ width: 'min(1140px, 96vw)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--hairline)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <span className="eyebrow">Dokumen Register Resmi</span>
              <h2 className="heading" style={{ fontSize: '20px' }}>
                Pratinjau Cetak &amp; Ekspor Buku Agenda Surat (8 Kolom)
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-ghost btn-sm"
                id="btnDownloadCSV"
                type="button"
                onClick={() => {
                  const csv = generateBukuAgendaCSV(suratList);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'buku-agenda-kecamatan-tamalate-2026.csv';
                  a.click();
                }}
              >
                <i className="ph ph-file-csv" /> Unduh CSV (Excel)
              </button>
              <button
                className="btn btn-primary btn-sm"
                id="btnPrintBukuAgendaModal"
                type="button"
                onClick={() => window.print()}
              >
                <i className="ph ph-printer" /> Cetak / Simpan PDF (Landscape)
              </button>
              <button
                className="btn btn-ghost btn-sm"
                id="btnCloseEksporModal"
                type="button"
                onClick={() => setEksporModalOpen(false)}
              >
                <i className="ph ph-x" /> Tutup
              </button>
            </div>
          </div>
          <div id="eksporAgendaPreviewContainer">
            <BukuAgendaExportSheet suratList={suratList} />
          </div>
        </div>
      </div>

      {/* ============================================================
          MODAL 3: VERIFIKASI SINGLE DOSSIER VAULT (#vaultVerifyModal)
          ============================================================ */}
      <div
        className={`modal-backdrop ${vaultModalSurat ? 'is-open' : ''}`}
        id="vaultVerifyModal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setVaultModalSurat(null);
        }}
      >
        <div className="modal-dialog" style={{ maxWidth: '520px' }} id="vaultVerifyContent">
          {vaultModalSurat ? (
            <div className="vault-verify-card">
              <div className="vault-cert-header">
                <div className="vault-cert-icon">
                  <i className="ph ph-shield-check" />
                </div>
                <div>
                  <h3 className="heading" style={{ fontSize: '17px', marginBottom: '2px' }}>
                    Sertifikat Keaslian Dokumen
                  </h3>
                  <span className="caption" style={{ color: 'var(--success)', fontWeight: 500 }}>
                    <i className="ph ph-check-circle" /> TERVERIFIKASI SAH oleh Single Dossier Vault Kecamatan Tamalate
                  </span>
                </div>
              </div>
              <dl className="vault-cert-rows">
                <div className="vault-cert-row">
                  <dt>Nomor Sertifikat TTE</dt>
                  <dd className="mono">
                    BSRE-TML-2026-{String(vaultModalSurat.agenda).replace(/\D/g, '')}
                  </dd>
                </div>
                <div className="vault-cert-row">
                  <dt>Penandatangan Resmi</dt>
                  <dd>Drs. H. Sutrisno Hadi, M.Si (Camat Tamalate)</dd>
                </div>
                <div className="vault-cert-row">
                  <dt>Kaitan Dossier Vault</dt>
                  <dd style={{ color: '#0044CC' }}>Partisi 2: SK Jabatan &amp; Spesimen TTE Camat</dd>
                </div>
                <div className="vault-cert-row">
                  <dt>Nomor Agenda</dt>
                  <dd className="mono">{vaultModalSurat.agenda}</dd>
                </div>
              </dl>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  type="button"
                  onClick={() => setVaultModalSurat(null)}
                >
                  Tutup Pemeriksaan
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ============================================================
          MODAL 4: REGISTRASI SURAT MASUK BARU (#catatSuratModal)
          ============================================================ */}
      <div
        className={`modal-backdrop ${catatModalOpen ? 'is-open' : ''}`}
        id="catatSuratModal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setCatatModalOpen(false);
        }}
      >
        <div className="modal-dialog" style={{ maxWidth: '580px' }}>
          <div style={{ marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--hairline)' }}>
            <span className="eyebrow">Tahap 1 · Loket Pengendali</span>
            <h2 className="heading" style={{ fontSize: '20px', marginTop: '4px' }}>
              Registrasi Surat Masuk &amp; Buku Agenda
            </h2>
          </div>
          <form
            id="formCatatSurat"
            style={{ display: 'grid', gap: '14px' }}
            onSubmit={handleCatatSuratSubmit}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label" htmlFor="inputAgenda">
                  Nomor Agenda *
                </label>
                <input
                  type="text"
                  id="inputAgenda"
                  required
                  className="disp-textarea mono"
                  style={{ height: '38px' }}
                  value={inputAgenda}
                  onChange={(e) => setInputAgenda(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="inputNoSurat">
                  Nomor Surat Asal *
                </label>
                <input
                  type="text"
                  id="inputNoSurat"
                  required
                  className="disp-textarea mono"
                  style={{ height: '38px' }}
                  value={inputNoSurat}
                  onChange={(e) => setInputNoSurat(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="inputAsal">
                Instansi yang Ditujukan / Asal Surat *
              </label>
              <input
                type="text"
                id="inputAsal"
                required
                className="disp-textarea"
                style={{ height: '38px' }}
                value={inputAsal}
                onChange={(e) => setInputAsal(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label" htmlFor="inputTglSurat">
                  Tanggal Surat *
                </label>
                <input
                  type="text"
                  id="inputTglSurat"
                  required
                  className="disp-textarea mono"
                  style={{ height: '38px' }}
                  value={inputTglSurat}
                  onChange={(e) => setInputTglSurat(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="inputSifat">
                  Sifat Surat *
                </label>
                <select
                  id="inputSifat"
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={inputSifat}
                  onChange={(e) => setInputSifat(e.target.value)}
                >
                  <option value="B">Biasa (B)</option>
                  <option value="R">Rahasia / Penting (R)</option>
                  <option value="SR">Sangat Rahasia (SR)</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="inputLampiran">
                  Lampiran
                </label>
                <input
                  type="text"
                  id="inputLampiran"
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={inputLampiran}
                  onChange={(e) => setInputLampiran(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="inputPerihal">
                Perihal / Ringkasan Isi *
              </label>
              <textarea
                id="inputPerihal"
                required
                className="disp-textarea"
                rows={3}
                value={inputPerihal}
                onChange={(e) => setInputPerihal(e.target.value)}
              />
            </div>

            {/* Unggah Dokumen Riil Surat Masuk (PDF Digital) */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--surface-sunken)',
                border: '1px dashed var(--hairline-strong)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>
                  <i className="ph ph-file-pdf" style={{ color: 'var(--accent)', marginRight: '6px' }} />
                  Unggah Naskah Asli Surat Masuk (PDF Digital)
                </span>
                <span className="caption muted">Wajib untuk Telaah Struktural &amp; TTE</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="file"
                  id="fileUploadSuratMasuk"
                  accept=".pdf,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setInputBerkasNama(file.name);
                      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                      setInputBerkasUkuran(`${sizeMb} MB`);
                      const reader = new FileReader();
                      reader.onload = () => {
                        setInputBerkasPdf(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => document.getElementById('fileUploadSuratMasuk')?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="ph ph-upload-simple" />
                  <span>Pilih Berkas PDF</span>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {inputBerkasNama || 'Belum ada berkas PDF dipilih'}
                  </div>
                  <div className="caption muted">{inputBerkasUkuran || 'Format: PDF terbitan resmi'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                className="btn btn-ghost"
                id="btnBatalCatat"
                type="button"
                onClick={() => setCatatModalOpen(false)}
              >
                Batal
              </button>
              <button className="btn btn-primary" type="submit">
                <i className="ph ph-check" /> Simpan &amp; Buat Lembar Disposisi
              </button>
            </div>
          </form>
        </div>
      </div>

      <DossierPackModal
        isOpen={adminPackModalOpen}
        onClose={() => setAdminPackModalOpen(false)}
        usulan={selectedAdminPackUsulan}
        actorRole={currentRole.label}
      />

      <TambahPegawaiModal
        isOpen={tambahPegawaiModalOpen}
        onClose={() => setTambahPegawaiModalOpen(false)}
        onSavePegawai={(newP) => {
          setData((prev) => (prev ? { ...prev, pegawai: [newP, ...prev.pegawai] } : prev));
        }}
      />

      <RealSuratPreviewModal
        isOpen={Boolean(realSuratModalSurat)}
        onClose={() => setRealSuratModalSurat(null)}
        surat={realSuratModalSurat}
      />
    </>
  );
}

export default DesktopDashboard;
