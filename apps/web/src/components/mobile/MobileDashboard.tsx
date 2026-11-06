'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceUsulan,
  createSurat,
  fetchSimulationBootstrap,
  recordPresensi,
  resetSimulation,
  toggleUsulanBerkas,
  updateSurat,
  uploadDossier,
  type SimulationBootstrapPayload,
  type SuratRecord,
  type UsulanRecord,
} from '@/lib/workspace-api';
import { TemplateCustomizerModal } from '@/components/shared/TemplateCustomizerModal';
import {
  buildRoleHomeView,
  ROLE_CONFIGS,
  type PelaksanaChip,
  type RoleConfig,
  type RoleKey,
  type ScreenKey,
} from './mobile-roles.data';
import {
  MobileAgendaView,
  MobileAuditView,
  MobileEksporView,
  MobileSuratDetailView,
  MobileSuratListView,
} from './MobileSuratViews';
import { MobileKepegawaianViews } from './MobileKepegawaianViews';

const FLOW_STAGES = [
  '1. Pengendalian surat masuk',
  '2. Lembar disposisi pimpinan',
  '3. Tindak lanjut & verifikasi',
  '4. Validasi Sekcam & arsip',
  '5. Jejak audit permanen',
];

export function MobileDashboard(): React.ReactNode {
  const [data, setData] = useState<SimulationBootstrapPayload | null>(null);
  const [roleKey, setRoleKey] = useState<RoleKey>('pelaksana');
  const [pelaksanaChip, setPelaksanaChip] = useState<PelaksanaChip>('Kasubbag Umum');
  const [screen, setScreen] = useState<ScreenKey>('home');
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);

  // Surat filters & active items
  const [suratQuery, setSuratQuery] = useState<string>('');
  const [suratStatusFilter, setSuratStatusFilter] = useState<string>('all');
  const [activeSuratAgenda, setActiveSuratAgenda] = useState<string>('0042/VI/2026');

  // Ekspor state
  const [eksporJenis, setEksporJenis] = useState<'agenda' | 'disposisi' | 'cuti'>('agenda');

  // Kepegawaian active item
  const [activeUsulanId, setActiveUsulanId] = useState<string>('KGB-2026-001');

  // Camera state for Presensi
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [presensiBanner, setPresensiBanner] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form states for Surat Baru
  const [newAgenda, setNewAgenda] = useState<string>('0045/VI/2026');
  const [newNomorSurat, setNewNomorSurat] = useState<string>('005/318/Pemkot/VI/2026');
  const [newAsal, setNewAsal] = useState<string>('Sekretariat Daerah Kota Makassar');
  const [newPerihal, setNewPerihal] = useState<string>(
    'Undangan Rapat Koordinasi Evaluasi Pelayanan Publik Kecamatan Tamalate',
  );
  const [newSifat, setNewSifat] = useState<string>('B');
  const [newLampiran, setNewLampiran] = useState<string>('1 berkas');

  // Form state for Dossier Upload
  const [uploadTitle, setUploadTitle] = useState<string>('SK Kenaikan Gaji Berkala 2026.pdf');
  const [uploadPartisi, setUploadPartisi] = useState<string>('KGB');

  useEffect(() => {
    void fetchSimulationBootstrap().then((payload) => {
      setData(payload);
      if (payload.surat[0]) {
        setActiveSuratAgenda(payload.surat[0].agenda);
      }
      if (payload.usulan[0]) {
        setActiveUsulanId(payload.usulan[0].id);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const roleMeta = useMemo(() => {
    const base = ROLE_CONFIGS[roleKey];
    if (roleKey === 'pelaksana') {
      if (pelaksanaChip === 'Camat') {
        return {
          ...base,
          avatar: 'CT',
          nama: 'Camat Tamalate',
          unit: 'Drs. H. Sutrisno Hadi, M.Si · Pimpinan Kecamatan',
        };
      }
      if (pelaksanaChip === 'Sekcam') {
        return {
          ...base,
          avatar: 'SC',
          nama: 'Sekretaris Camat',
          unit: 'Ir. H. Syamsul Bahri, M.Si · Koordinator Administrasi',
        };
      }
    }
    return base;
  }, [roleKey, pelaksanaChip]);

  const disposisiRoleKey: 'operator' | 'sekcam' | 'camat' = useMemo(() => {
    if (roleKey === 'operator' || roleKey === 'admin') return 'operator';
    if (roleKey === 'pelaksana' && pelaksanaChip === 'Sekcam') return 'sekcam';
    return 'camat';
  }, [roleKey, pelaksanaChip]);

  const suratList = data?.surat ?? [];
  const usulanList = data?.usulan ?? [];
  const pegawaiList = data?.pegawai ?? [];
  const presensiList = data?.presensi ?? [];
  const dossierList = data?.dossier ?? [];

  const activeSurat: SuratRecord | undefined = useMemo(
    () => suratList.find((s) => s.agenda === activeSuratAgenda) ?? suratList[0],
    [suratList, activeSuratAgenda],
  );

  const activeUsulan: UsulanRecord | undefined = useMemo(
    () => usulanList.find((u) => u.id === activeUsulanId) ?? usulanList[0],
    [usulanList, activeUsulanId],
  );

  const filteredSurat = useMemo(() => {
    const q = suratQuery.trim().toLowerCase();
    return suratList.filter((s) => {
      if (suratStatusFilter !== 'all' && s.status !== suratStatusFilter) return false;
      if (!q) return true;
      return `${s.agenda} ${s.perihal} ${s.instansiTujuan || s.asal} ${s.nomorSurat}`
        .toLowerCase()
        .includes(q);
    });
  }, [suratList, suratQuery, suratStatusFilter]);

  const activeNavTab = useMemo(() => {
    if (screen === 'home' || screen === 'notifikasi') return 'home';
    if (screen === 'presensi') return 'presensi';
    if (screen === 'vault' || screen === 'dokumen') return 'vault';
    if (screen === 'profil') return 'profil';
    return 'kerja';
  }, [screen]);

  const navigateTo = (target: ScreenKey) => {
    if (screen === 'presensi' && target !== 'presensi' && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
    setScreen(target);
  };

  const handleToggleCamera = async () => {
    if (cameraActive && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraActive(false);
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = media;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
      }
    } catch {
      setPresensiBanner('Kamera perangkat disimulasikan dalam mode pratinjau aman.');
      setCameraActive(true);
    }
  };

  const handleCapturePresensi = async () => {
    const updated = await recordPresensi({
      nip: roleMeta.nip,
      nama: roleMeta.nama,
      jabatan: roleMeta.label,
      unit: 'Kecamatan Tamalate',
      sesi: 'pagi',
      jarakMeter: 38,
    });
    if (updated) setData(updated);
    const jam = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setPresensiBanner(
      `Presensi terekam pukul ${jam} WITA · Radius 38m Kantor Camat Tamalate terverifikasi.`,
    );
  };

  const handleCreateSuratSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgenda.trim() || !newAsal.trim() || !newPerihal.trim()) return;
    const updated = await createSurat({
      agenda: newAgenda.trim(),
      nomorSurat: newNomorSurat.trim() || '-',
      asal: newAsal.trim(),
      instansiTujuan: newAsal.trim(),
      perihal: newPerihal.trim(),
      sifat: newSifat,
      lampiran: newLampiran.trim() || '-',
      actor: `${roleMeta.nama} (${roleMeta.label})`,
    });
    if (updated) {
      setData(updated);
      setActiveSuratAgenda(newAgenda.trim());
      navigateTo('suratDetail');
    }
  };

  const stats = useMemo(() => {
    const menunggu = suratList.filter(
      (s) => s.status === 'baru' || s.status === 'disposisi',
    ).length;
    const diproses = suratList.filter((s) => s.status === 'proses').length;
    const selesai = suratList.filter((s) => s.status === 'selesai').length;
    const terlambat = suratList.filter((s) => s.status === 'terlambat').length;
    return { total: suratList.length, menunggu, diproses, selesai, terlambat };
  }, [suratList]);

  const roleHomeView = useMemo(
    () => buildRoleHomeView(roleKey, data),
    [roleKey, data],
  );

  return (
    <>
      <link rel="stylesheet" href="/assets/css/tokens.css" />
      <link rel="stylesheet" href="/assets/css/components.css" />
      <link rel="stylesheet" href="/assets/css/mobile.css" />
      <link rel="stylesheet" href="/assets/css/dokumen.css" />
      <link rel="stylesheet" href="/assets/css/surat-mobile.css" />
      <link rel="stylesheet" href="/assets/css/kerja.css" />
      <link rel="stylesheet" href="/assets/css/ekspor.css" />
      <link rel="stylesheet" href="/assets/css/berkas.css" />
      <link rel="stylesheet" href="/assets/css/kepegawaian.css" />
      <link rel="stylesheet" href="/assets/css/kepegawaian-mobile.css" />

      <div className="mobile-viewport-shell">
        <div className="app-frame" id="frame">
          {/* ============================================================
              TOP BAR (IDENTIK 100% DENGAN mobile-kepegawaian.html)
              ============================================================ */}
          <header className="app-top">
            <div className="avatar" id="topAvatar">
              {roleMeta.avatar}
            </div>
            <div className="greet">
              <span className="greet-hi" id="topHi">
                {roleMeta.salam}
              </span>
              <span className="greet-name" id="topName">
                {roleMeta.nama}
              </span>
              <span className="role-tag" id="topRole">
                <i className={`ph ${roleMeta.ikon}`} />
                {roleMeta.label}
              </span>
            </div>
            <div className="top-actions">
              <button
                className="icon-btn"
                id="roleBtn"
                type="button"
                aria-label="Ganti peran simulasi"
                onClick={() => setSheetOpen(true)}
              >
                <i className="ph ph-user-switch" />
              </button>
              <button
                className="icon-btn"
                type="button"
                aria-label="Notifikasi"
                onClick={() => navigateTo('notifikasi')}
              >
                <i className="ph ph-bell" />
              </button>
            </div>
          </header>

          {/* ============================================================
              ISI LAYAR DINAMIS (#appBody)
              ============================================================ */}
          <main className="app-body" id="appBody" aria-live="polite">
            {/* ----------------------------------------------------------
                LAYAR 1: HOME (ViewRenderer.home: renderHero + renderMetrics + renderSections)
                ---------------------------------------------------------- */}
            {screen === 'home' ? (
              <>
                <div className="hero-card">
                  <div className="hero-label">{roleHomeView.hero.label}</div>
                  <div className="hero-value tabular">{roleHomeView.hero.value}</div>
                  <div className="hero-note">{roleHomeView.hero.note}</div>
                  <div className="hero-chips">
                    {roleHomeView.hero.chips.map((c) => (
                      <div key={c.lbl} className="hero-chip">
                        <b className="tabular">{c.val}</b>
                        <span>{c.lbl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {roleKey === 'pelaksana' ? (
                  <div className="chips" aria-label="Pilih jabatan pelaksana">
                    {(['Camat', 'Kasubbag Umum', 'Sekcam'] as const).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className={`chip ${pelaksanaChip === chip ? 'is-on' : ''}`}
                        onClick={() => setPelaksanaChip(chip)}
                      >
                        <i className="ph ph-identification-badge" />
                        {chip}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="metrics">
                  {roleHomeView.metrics.map((m) => (
                    <div
                      key={m.lbl}
                      className="metric"
                      style={{ cursor: m.go ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (m.go) navigateTo(m.go);
                      }}
                    >
                      <div className="metric-num tabular">{m.num}</div>
                      <div className="metric-lbl">{m.lbl}</div>
                      <div className={`metric-delta ${m.tone ?? ''}`}>{m.delta}</div>
                    </div>
                  ))}
                </div>

                {roleHomeView.sections.map((sec) => (
                  <div key={sec.title} className="sec">
                    <div className="sec-head">
                      <h2>{sec.title}</h2>
                      {sec.link ? (
                        <button
                          type="button"
                          className="sec-link"
                          style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
                          onClick={() => {
                            if (sec.linkGo) navigateTo(sec.linkGo);
                          }}
                        >
                          {sec.link}
                        </button>
                      ) : null}
                    </div>
                    <div className="list">
                      {sec.rows.map((r, idx) => (
                        <button
                          key={`${r.title}-${idx}`}
                          type="button"
                          className="row"
                          style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                          onClick={() => {
                            if (r.suratAgenda) setActiveSuratAgenda(r.suratAgenda);
                            if (r.usulanId) setActiveUsulanId(r.usulanId);
                            if (r.go) navigateTo(r.go);
                          }}
                        >
                          <div className={`row-ico ${r.tone ?? ''}`}>
                            <i className={`ph ${r.ico}`} />
                          </div>
                          <div className="row-main">
                            <div className="row-title">{r.title}</div>
                            <div className="row-sub">{r.sub}</div>
                          </div>
                          <span className={`badge ${r.badge.cls}`}>
                            {r.badge.icon ? <i className={`ph ${r.badge.icon}`} /> : null}
                            {r.badge.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 2: RUANG KERJA (ViewRenderer.kerja + KerjaUI.kisi)
                ---------------------------------------------------------- */}
            {screen === 'kerja' ? (
              <>
                <div className="page-hero">
                  <span className="eyebrow">Ruang kerja</span>
                  <h1>Tugas {roleMeta.label}</h1>
                  <p>
                    Pilih modul di bawah untuk membuka daftar surat, kepegawaian, atau pratinjau cetak.
                  </p>
                </div>

                {/* Grup 1: Persuratan */}
                <div className="kisi-grup">
                  <div className="kisi-grup-kepala">
                    <span>Persuratan</span>
                  </div>
                  <div className="kisi-2">
                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('surat')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon warn">
                          <i className="ph ph-envelope-simple" />
                        </span>
                        <span className="kisi-lencana tabular">{stats.menunggu} menunggu</span>
                      </span>
                      <span className="kisi-judul">Surat dan disposisi</span>
                      <span className="kisi-sub">
                        Pencatatan, lembar disposisi, tindak lanjut, dan arsip
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('suratBaru')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon">
                          <i className="ph ph-plus-circle" />
                        </span>
                        <span className="kisi-lencana">Loket</span>
                      </span>
                      <span className="kisi-judul">Catat surat masuk</span>
                      <span className="kisi-sub">
                        Beri nomor agenda baru dan unggah naskah surat
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('agenda')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon ok">
                          <i className="ph ph-notebook" />
                        </span>
                        <span className="kisi-lencana tabular">{stats.total} entri</span>
                      </span>
                      <span className="kisi-judul">Buku agenda</span>
                      <span className="kisi-sub">
                        Register resmi surat masuk Kecamatan Tamalate
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('ekspor')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon ok">
                          <i className="ph ph-printer" />
                        </span>
                        <span className="kisi-lencana">PDF · CSV</span>
                      </span>
                      <span className="kisi-judul">Ekspor laporan</span>
                      <span className="kisi-sub">
                        Cetak buku agenda, lembar disposisi, atau formulir cuti
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Grup 2: Kepegawaian */}
                <div className="kisi-grup">
                  <div className="kisi-grup-kepala">
                    <span>Kepegawaian</span>
                  </div>
                  <div className="kisi-2">
                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgRingkas')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon ok">
                          <i className="ph ph-chart-pie-slice" />
                        </span>
                        <span className="kisi-lencana tabular">148 ASN</span>
                      </span>
                      <span className="kisi-judul">Ringkasan SDM</span>
                      <span className="kisi-sub">
                        Komposisi pegawai, kehadiran, dan antrean layanan
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgApel')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon ok">
                          <i className="ph ph-sun-horizon" />
                        </span>
                        <span className="kisi-lencana tabular">93% hadir</span>
                      </span>
                      <span className="kisi-judul">Apel harian</span>
                      <span className="kisi-sub">
                        Daftar hadir pagi dan sore berdasar kamera dan GPS
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgKgb')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon warn">
                          <i className="ph ph-trend-up" />
                        </span>
                        <span className="kisi-lencana tabular">{usulanList.length} usulan</span>
                      </span>
                      <span className="kisi-judul">Kenaikan gaji berkala</span>
                      <span className="kisi-sub">
                        Jadwal 2 tahunan, cek berkas vault, dan SK pengantar
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgPangkat')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon">
                          <i className="ph ph-medal" />
                        </span>
                        <span className="kisi-lencana">Periode Okt</span>
                      </span>
                      <span className="kisi-judul">Usulan pangkat</span>
                      <span className="kisi-sub">
                        Pengusulan kenaikan pangkat reguler dan pilihan
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgPensiun')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon">
                          <i className="ph ph-hourglass-low" />
                        </span>
                        <span className="kisi-lencana">BUP</span>
                      </span>
                      <span className="kisi-judul">Pensiun</span>
                      <span className="kisi-sub">
                        Persiapan berkas pegawai menjelang batas usia pensiun
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgCuti')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon">
                          <i className="ph ph-calendar-plus" />
                        </span>
                        <span className="kisi-lencana">8 tabel resmi</span>
                      </span>
                      <span className="kisi-judul">Cuti dan izin</span>
                      <span className="kisi-sub">
                        Formulir Permintaan dan Pemberian Cuti 2026
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgBina')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon danger">
                          <i className="ph ph-warning-octagon" />
                        </span>
                        <span className="kisi-lencana tabular">2 melewati</span>
                      </span>
                      <span className="kisi-judul">Pembinaan disiplin</span>
                      <span className="kisi-sub">
                        Tindak lanjut pegawai yang melampaui batas absen
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgRekap')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon">
                          <i className="ph ph-calendar-check" />
                        </span>
                        <span className="kisi-lencana">11 unit</span>
                      </span>
                      <span className="kisi-judul">Rekap presensi</span>
                      <span className="kisi-sub">
                        Rekapitulasi bulanan sekretariat dan 10 kelurahan
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Grup 3: Administrasi dan SOP */}
                <div className="kisi-grup">
                  <div className="kisi-grup-kepala">
                    <span>Administrasi dan SOP</span>
                  </div>
                  <div className="kisi-2">
                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgPegawai')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon">
                          <i className="ph ph-identification-card" />
                        </span>
                        <span className="kisi-lencana tabular">148 ASN</span>
                      </span>
                      <span className="kisi-judul">Data pegawai</span>
                      <span className="kisi-sub">
                        Daftar pegawai beserta tenggat KGB, pangkat, dan pensiun
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('kpgDossier')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon ok">
                          <i className="ph ph-folders" />
                        </span>
                        <span className="kisi-lencana">6 partisi</span>
                      </span>
                      <span className="kisi-judul">Dossier pegawai</span>
                      <span className="kisi-sub">
                        Kelengkapan 6 partisi berkas tiap ASN di dalam vault
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => navigateTo('audit')}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon">
                          <i className="ph ph-list-magnifying-glass" />
                        </span>
                        <span className="kisi-lencana">Utuh</span>
                      </span>
                      <span className="kisi-judul">Jejak audit</span>
                      <span className="kisi-sub">
                        Riwayat waktu, pelaku, dan perubahan status surat
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="kisi-kartu"
                      onClick={() => setTemplateModalOpen(true)}
                    >
                      <span className="kisi-kartu-atas">
                        <span className="kisi-ikon ok">
                          <i className="ph ph-sliders" />
                        </span>
                        <span className="kisi-lencana">OnlyOffice</span>
                      </span>
                      <span className="kisi-judul">Template dokumen</span>
                      <span className="kisi-sub">
                        Kostumisasi Lembar Disposisi, Buku Agenda, &amp; Surat Cuti
                      </span>
                      <span className="kisi-kaki">
                        Buka <i className="ph ph-arrow-right" />
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 3: DAFTAR SURAT DAN DISPOSISI
                ---------------------------------------------------------- */}
            {screen === 'surat' ? (
              <MobileSuratListView
                suratList={suratList}
                filteredSurat={filteredSurat}
                stats={stats}
                suratQuery={suratQuery}
                setSuratQuery={setSuratQuery}
                suratStatusFilter={suratStatusFilter}
                setSuratStatusFilter={setSuratStatusFilter}
                onSelectSurat={(agenda) => {
                  setActiveSuratAgenda(agenda);
                  navigateTo('suratDetail');
                }}
                navigateTo={navigateTo}
              />
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 4: DETAIL SURAT & LEMBAR DISPOSISI
                ---------------------------------------------------------- */}
            {screen === 'suratDetail' && activeSurat ? (
              <MobileSuratDetailView
                surat={activeSurat}
                roleMeta={roleMeta}
                disposisiRoleKey={disposisiRoleKey}
                onUpdateDisposisiSekcam={async (p) => {
                  const updated = await updateSurat(activeSurat.agenda, {
                    action: 'paraf_sekcam',
                    actor: 'Ir. H. Syamsul Bahri, M.Si (Sekcam)',
                    catatanSekcam: p.catatanSekcam,
                    rekomendasiTujuan: p.rekomendasiTujuan,
                    parafSekcamImage: p.parafSekcamImage,
                  });
                  if (updated) setData(updated);
                }}
                onUpdateDisposisiCamat={async (p) => {
                  const updated = await updateSurat(activeSurat.agenda, {
                    action: 'disposisi_camat',
                    actor: 'Drs. H. Sutrisno Hadi, M.Si (Camat)',
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
                }}
                onUpdateTindakLanjut={async (catatan) => {
                  const updated = await updateSurat(activeSurat.agenda, {
                    action: 'tindak_lanjut',
                    actor: `${roleMeta.nama} (${roleMeta.label})`,
                    catatanTindakLanjut: catatan,
                  });
                  if (updated) setData(updated);
                }}
                onUpdateArsip={async (kode, lokasi) => {
                  const updated = await updateSurat(activeSurat.agenda, {
                    action: 'arsip',
                    actor: `${roleMeta.nama} (${roleMeta.label})`,
                    kodeKlasifikasi: kode,
                    lokasiFisik: lokasi,
                  });
                  if (updated) setData(updated);
                }}
                onOpenPrintPreview={() => {
                  setEksporJenis('disposisi');
                  navigateTo('ekspor');
                }}
                onOpenTemplateCustomizer={() => setTemplateModalOpen(true)}
                navigateTo={navigateTo}
              />
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 5: CATAT SURAT MASUK BARU
                ---------------------------------------------------------- */}
            {screen === 'suratBaru' ? (
              <>
                <button className="sr-balik" type="button" onClick={() => navigateTo('surat')}>
                  <i className="ph ph-arrow-left" /> Daftar surat
                </button>
                <div className="page-hero">
                  <span className="eyebrow">Registrasi</span>
                  <h1>Catat surat masuk</h1>
                  <p>
                    Surat yang dicatat langsung masuk ke buku agenda 8 kolom dan antrean disposisi.
                  </p>
                </div>
                <form className="sr-panel" onSubmit={handleCreateSuratSubmit}>
                  <label className="sr-field">
                    <span>Nomor agenda</span>
                    <input
                      type="text"
                      required
                      value={newAgenda}
                      onChange={(e) => setNewAgenda(e.target.value)}
                    />
                  </label>
                  <label className="sr-field">
                    <span>Nomor surat asal</span>
                    <input
                      type="text"
                      value={newNomorSurat}
                      onChange={(e) => setNewNomorSurat(e.target.value)}
                    />
                  </label>
                  <label className="sr-field">
                    <span>Instansi asal atau tujuan</span>
                    <input
                      type="text"
                      required
                      value={newAsal}
                      onChange={(e) => setNewAsal(e.target.value)}
                    />
                  </label>
                  <label className="sr-field">
                    <span>Perihal atau ringkasan isi</span>
                    <textarea
                      rows={3}
                      required
                      value={newPerihal}
                      onChange={(e) => setNewPerihal(e.target.value)}
                    />
                  </label>
                  <div className="sr-dua">
                    <label className="sr-field">
                      <span>Sifat surat</span>
                      <select value={newSifat} onChange={(e) => setNewSifat(e.target.value)}>
                        <option value="B">Biasa (B)</option>
                        <option value="R">Penting / Rahasia (R)</option>
                        <option value="SR">Sangat Rahasia (SR)</option>
                      </select>
                    </label>
                    <label className="sr-field">
                      <span>Lampiran</span>
                      <input
                        type="text"
                        value={newLampiran}
                        onChange={(e) => setNewLampiran(e.target.value)}
                      />
                    </label>
                  </div>
                  <button className="btn btn-primary btn-block" type="submit">
                    <i className="ph ph-check" /> Simpan ke buku agenda
                  </button>
                </form>
              </>
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 6: BUKU AGENDA SURAT 8 KOLOM
                ---------------------------------------------------------- */}
            {screen === 'agenda' ? (
              <MobileAgendaView
                suratList={suratList}
                onSelectSurat={(agenda) => {
                  setActiveSuratAgenda(agenda);
                  navigateTo('suratDetail');
                }}
                onOpenPrintAgenda={() => {
                  setEksporJenis('agenda');
                  navigateTo('ekspor');
                }}
                navigateTo={navigateTo}
              />
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 7: EKSPOR LAPORAN & PRATINJAU CETAK
                ---------------------------------------------------------- */}
            {screen === 'ekspor' ? (
              <MobileEksporView
                suratList={suratList}
                activeSurat={activeSurat}
                activeSuratAgenda={activeSuratAgenda}
                setActiveSuratAgenda={setActiveSuratAgenda}
                eksporJenis={eksporJenis}
                setEksporJenis={setEksporJenis}
                disposisiRoleKey={disposisiRoleKey}
                onOpenTemplateCustomizer={() => setTemplateModalOpen(true)}
                navigateTo={navigateTo}
              />
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 8: JEJAK AUDIT PERMANEN
                ---------------------------------------------------------- */}
            {screen === 'audit' ? (
              <MobileAuditView
                suratList={suratList}
                onSelectSurat={(agenda) => {
                  setActiveSuratAgenda(agenda);
                  navigateTo('suratDetail');
                }}
                navigateTo={navigateTo}
              />
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 9: PRESENSI KAMERA
                ---------------------------------------------------------- */}
            {screen === 'presensi' ? (
              <>
                <div className="page-hero">
                  <span className="eyebrow">Verifikasi lokasi dan wajah</span>
                  <h1>Presensi kamera</h1>
                  <p>Pastikan wajah terlihat jelas dan Anda berada di dalam radius kantor.</p>
                </div>

                <div className="viewfinder">
                  <div className="vf-holder" id="vfHolder">
                    {cameraActive ? (
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <svg className="vf-sil" viewBox="0 0 200 200" fill="none" aria-hidden="true">
                        <circle cx="100" cy="78" r="32" stroke="white" strokeWidth="2" />
                        <path
                          d="M44 176c8-34 30-52 56-52s48 18 56 52"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="vf-corner vf-tl" />
                  <span className="vf-corner vf-tr" />
                  <span className="vf-corner vf-bl" />
                  <span className="vf-corner vf-br" />
                  <span className="vf-status" id="vfStatus">
                    <i className="ph ph-map-pin" /> Radius kantor terpenuhi
                  </span>
                </div>

                <div className="cam-controls">
                  <button
                    className="btn btn-ghost"
                    id="camToggle"
                    type="button"
                    onClick={handleToggleCamera}
                  >
                    <i className="ph ph-video-camera" />
                    <span>{cameraActive ? 'Matikan kamera' : 'Aktifkan kamera'}</span>
                  </button>
                  <button
                    className="btn btn-primary"
                    id="camSnap"
                    type="button"
                    onClick={handleCapturePresensi}
                  >
                    <i className="ph ph-camera" /> Ambil foto presensi
                  </button>
                </div>

                {presensiBanner ? (
                  <div className="cam-banner is-on" id="camBanner" role="status">
                    {presensiBanner}
                  </div>
                ) : null}

                <div className="map-strip">
                  <div className="map-pin">
                    <i className="ph ph-navigation-arrow" />
                  </div>
                  <div className="row-main">
                    <div className="row-title">Kantor Kecamatan Tamalate</div>
                    <div className="row-sub mono">-5.1843, 119.4128 · 38 m</div>
                  </div>
                  <span className="badge badge-ok">Dalam radius</span>
                </div>

                <section className="sec">
                  <div className="sec-head">
                    <h2>Catatan hari ini</h2>
                  </div>
                  <div className="list">
                    <div className="row">
                      <div className="row-ico ok">
                        <i className="ph ph-sun-horizon" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Apel pagi</div>
                        <div className="row-sub tabular">07.42 · Terverifikasi</div>
                      </div>
                      <span className="badge badge-ok">Tercatat</span>
                    </div>
                    <div className="row">
                      <div className="row-ico neutral">
                        <i className="ph ph-moon-stars" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Apel sore</div>
                        <div className="row-sub">Dibuka pukul 16.00</div>
                      </div>
                      <span className="badge badge-neutral">Menunggu</span>
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 10: VAULT & DOKUMEN SAYA
                ---------------------------------------------------------- */}
            {screen === 'vault' ? (
              <>
                <div className="page-hero">
                  <span className="eyebrow">Single dossier</span>
                  <h1>Vault kepegawaian</h1>
                  <p>Enam partisi arsip digital ASN dan penyimpanan spesimen tanda tangan resmi.</p>
                </div>

                <div className="vault-seal">
                  <div className="vault-seal-ico">
                    <i className="ph ph-shield-check" />
                  </div>
                  <div>
                    <b>Akses terverifikasi · {roleMeta.nama}</b>
                    <span>Enam partisi dapat dibaca sesuai peran {roleMeta.label}.</span>
                  </div>
                </div>

                <section className="sec">
                  <div className="sec-head">
                    <h2>Unggahan dari ponsel</h2>
                  </div>
                  <div className="list">
                    <button
                      className="row row-tap"
                      type="button"
                      onClick={() => navigateTo('dokumen')}
                      style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div className="row-ico">
                        <i className="ph ph-cloud-arrow-up" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Dokumen saya</div>
                        <div className="row-sub">Unggah berkas baru, foto, dan pratinjau langsung</div>
                      </div>
                      <span className="badge badge-info tabular">{dossierList.length} berkas</span>
                    </button>
                  </div>
                </section>

                <section className="sec">
                  <div className="sec-head">
                    <h2>Enam partisi resmi</h2>
                    <span className="sec-link">6 partisi</span>
                  </div>
                  <div className="list">
                    {[
                      { code: 'P-01', ico: 'ph-seal-check', name: 'SK CPNS dan PNS', files: 4, size: '6,2 MB', access: 'Baca' },
                      { code: 'P-02', ico: 'ph-medal', name: 'SK Pangkat terakhir', files: 5, size: '8,1 MB', access: 'Baca & unduh' },
                      { code: 'P-03', ico: 'ph-trend-up', name: 'Kenaikan gaji berkala', files: 6, size: '4,4 MB', access: 'Baca & unduh' },
                      { code: 'P-04', ico: 'ph-chart-line-up', name: 'Penilaian kinerja (SKP)', files: 3, size: '3,8 MB', access: 'Baca' },
                      { code: 'P-05', ico: 'ph-calendar-check', name: 'Riwayat disiplin & cuti', files: 2, size: '1,9 MB', access: 'Terbatas' },
                      { code: 'P-06', ico: 'ph-hourglass-low', name: 'Persiapan pensiun', files: 1, size: '1,2 MB', access: 'Baca' },
                    ].map((p) => (
                      <div
                        key={p.code}
                        className="partition"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigateTo('dokumen')}
                      >
                        <div className="row-ico">
                          <i className={`ph ${p.ico}`} />
                        </div>
                        <div className="row-main">
                          <div className="row-title">
                            {p.code} · {p.name}
                          </div>
                          <div className="row-sub tabular">
                            {p.files} berkas · {p.size}
                          </div>
                        </div>
                        <span className="badge badge-info">{p.access}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            {screen === 'dokumen' ? (
              <>
                <button className="sr-balik" type="button" onClick={() => navigateTo('vault')}>
                  <i className="ph ph-arrow-left" /> Vault kepegawaian
                </button>
                <div className="page-hero">
                  <span className="eyebrow">Dossier pribadi</span>
                  <h1>Dokumen saya</h1>
                  <p>Unggah dan pratinjau dokumen kepegawaian resmi pada Single Dossier Vault.</p>
                </div>

                <div className="meter-card">
                  <div className="meter-head">
                    <span>Kapasitas Dossier ASN</span>
                    <span className="tabular">{dossierList.length} berkas tersimpan</span>
                  </div>
                  <div className="meter-track">
                    <span style={{ width: '38%' }} />
                  </div>
                  <div className="meter-hint">
                    Setiap dokumen yang diunggah diverifikasi keutuhannya dan dapat dirujuk langsung saat pengajuan KGB, pangkat, maupun cuti.
                  </div>
                </div>

                <div className="drop">
                  <span className="drop-ico">
                    <i className="ph ph-cloud-arrow-up" />
                  </span>
                  <b>Unggah berkas ke dossier</b>
                  <span>Pilih partisi dan masukkan nama dokumen resmi ASN.</span>
                  <div style={{ width: '100%', display: 'grid', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="text"
                      className="disp-inline-input"
                      style={{ width: '100%', height: '36px' }}
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Nama dokumen (mis. SK KGB 2026.pdf)"
                    />
                    <select
                      className="disp-inline-input"
                      style={{ width: '100%', height: '36px' }}
                      value={uploadPartisi}
                      onChange={(e) => setUploadPartisi(e.target.value)}
                    >
                      <option value="SK CPNS">Partisi 1: SK CPNS &amp; PNS</option>
                      <option value="SK Pangkat">Partisi 2: SK Pangkat</option>
                      <option value="KGB">Partisi 3: Kenaikan Gaji Berkala</option>
                      <option value="SKP">Partisi 4: Penilaian Kinerja (SKP)</option>
                      <option value="Disiplin">Partisi 5: Disiplin &amp; Cuti</option>
                      <option value="Pensiun">Partisi 6: Persiapan Pensiun</option>
                    </select>
                  </div>
                  <div className="drop-aksi">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={async () => {
                        if (!uploadTitle.trim()) return;
                        const updated = await uploadDossier({
                          pegawaiNip: roleMeta.nip,
                          pegawaiNama: roleMeta.nama,
                          partisi: uploadPartisi,
                          judul: uploadTitle.trim(),
                          ukuranKb: 420,
                        });
                        if (updated) setData(updated);
                      }}
                    >
                      <i className="ph ph-folder-open" /> Unggah ke Vault
                    </button>
                  </div>
                </div>

                <div className="doc-list">
                  {dossierList.map((d) => (
                    <div key={d.id} className="doc-row">
                      <div className="doc-open">
                        <span className="row-ico">
                          <i className="ph ph-file-pdf" />
                        </span>
                        <span className="row-main">
                          <span className="row-title">{d.judul}</span>
                          <span className="row-sub">
                            {d.partisi} · {d.pegawaiNama} · {d.tanggalUnggah}
                          </span>
                        </span>
                        <span className="badge badge-ok">{d.terverifikasi ? 'Sah' : 'Tersimpan'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 11: MODUL KEPEGAWAIAN MOBILE
                ---------------------------------------------------------- */}
            {(screen === 'kpgRingkas' ||
              screen === 'kpgApel' ||
              screen === 'kpgRekap' ||
              screen === 'kpgKgb' ||
              screen === 'kpgPangkat' ||
              screen === 'kpgPensiun' ||
              screen === 'kpgCuti' ||
              screen === 'kpgBina' ||
              screen === 'kpgPegawai' ||
              screen === 'kpgDossier' ||
              screen === 'kpgDetail') ? (
              <MobileKepegawaianViews
                screen={screen}
                roleMeta={roleMeta}
                usulanList={usulanList}
                pegawaiList={pegawaiList}
                presensiList={presensiList}
                dossierList={dossierList}
                activeUsulan={activeUsulan}
                setActiveUsulanId={setActiveUsulanId}
                onToggleBerkas={async (usulanId, kodeBerkas, lengkap) => {
                  const updated = await toggleUsulanBerkas(usulanId, { kodeBerkas, lengkap });
                  if (updated) setData(updated);
                }}
                onAdvanceUsulan={async (usulanId) => {
                  const updated = await advanceUsulan(usulanId, {
                    actor: `${roleMeta.nama} (${roleMeta.label})`,
                    catatan: 'Diverifikasi melalui perangkat mobile Tamalate',
                  });
                  if (updated) setData(updated);
                }}
                onOpenTemplateCustomizer={() => setTemplateModalOpen(true)}
                navigateTo={navigateTo}
              />
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 12: SOP, THRESHOLD, & NOTIFIKASI
                ---------------------------------------------------------- */}
            {screen === 'sop' ? (
              <>
                <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
                  <i className="ph ph-arrow-left" /> Ruang kerja
                </button>
                <div className="page-hero">
                  <span className="eyebrow">Pedoman kerja</span>
                  <h1>Alur dan SOP Kecamatan Tamalate</h1>
                  <p>Lima tahap pengendalian surat masuk dan verifikasi usulan kepegawaian.</p>
                </div>
                <div className="list">
                  {FLOW_STAGES.map((st, i) => (
                    <div key={st} className="row">
                      <div className="row-ico">
                        <b className="tabular">0{i + 1}</b>
                      </div>
                      <div className="row-main">
                        <div className="row-title">{st}</div>
                        <div className="row-sub">
                          Wajib tercatat pada Buku Agenda &amp; Jejak Audit
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {screen === 'threshold' ? (
              <>
                <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
                  <i className="ph ph-arrow-left" /> Ruang kerja
                </button>
                <div className="page-hero">
                  <span className="eyebrow">Parameter sebagai data</span>
                  <h1>Threshold presensi &amp; disiplin</h1>
                  <p>
                    Batas tidak hadir dan radius presensi disimpan sebagai parameter yang dapat disesuaikan admin.
                  </p>
                </div>
                <div className="list">
                  <div className="row">
                    <div className="row-ico">
                      <i className="ph ph-map-pin" />
                    </div>
                    <div className="row-main">
                      <div className="row-title">Radius Geofence Kantor Camat</div>
                      <div className="row-sub">Koordinat -5.1843, 119.4128</div>
                    </div>
                    <span className="badge badge-info tabular">150 m</span>
                  </div>
                  <div className="row">
                    <div className="row-ico warn">
                      <i className="ph ph-warning" />
                    </div>
                    <div className="row-main">
                      <div className="row-title">Batas Tidak Hadir Sepekan</div>
                      <div className="row-sub">Eskalasi otomatis ke Kasubag lalu Sekcam</div>
                    </div>
                    <span className="badge badge-warn tabular">5 Hari</span>
                  </div>
                </div>
              </>
            ) : null}

            {screen === 'notifikasi' ? (
              <>
                <button className="sr-balik" type="button" onClick={() => navigateTo('home')}>
                  <i className="ph ph-arrow-left" /> Beranda
                </button>
                <div className="page-hero">
                  <span className="eyebrow">Pemberitahuan</span>
                  <h1>Notifikasi tugas</h1>
                  <p>Pengingat tenggat disposisi surat dan usulan kepegawaian.</p>
                </div>
                <div className="list">
                  {suratList.slice(0, 4).map((s) => (
                    <button
                      key={s.agenda}
                      type="button"
                      className="row"
                      style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => {
                        setActiveSuratAgenda(s.agenda);
                        navigateTo('suratDetail');
                      }}
                    >
                      <div className="row-ico warn">
                        <i className="ph ph-bell-ringing" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">{s.perihal}</div>
                        <div className="row-sub">
                          Agenda {s.agenda} · {s.instansiTujuan || s.asal}
                        </div>
                      </div>
                      <span className="badge badge-warn">Buka</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {/* ----------------------------------------------------------
                LAYAR 13: PROFIL & PERPINDAHAN TAMPILAN
                ---------------------------------------------------------- */}
            {screen === 'profil' ? (
              <>
                <div className="page-hero">
                  <span className="eyebrow">{roleMeta.label}</span>
                  <h1>{roleMeta.nama}</h1>
                  <p>
                    {roleMeta.unit} · NIP <span className="mono">{roleMeta.nip}</span>
                  </p>
                </div>

                <section className="sec">
                  <div className="sec-head">
                    <h2>Sesi dan perangkat</h2>
                  </div>
                  <div className="list">
                    <button
                      className="row"
                      type="button"
                      onClick={() => setSheetOpen(true)}
                      style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div className="row-ico">
                        <i className="ph ph-user-switch" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Peran aktif</div>
                        <div className="row-sub">Ketuk untuk berpindah peran simulasi</div>
                      </div>
                      <span className="badge badge-info">{roleMeta.label}</span>
                    </button>
                    <button
                      className="row"
                      type="button"
                      onClick={() => setTemplateModalOpen(true)}
                      style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div className="row-ico ok">
                        <i className="ph ph-sliders" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Kostumisasi template dokumen</div>
                        <div className="row-sub">
                          Lembar Disposisi, Buku Agenda, Surat Cuti &amp; OnlyOffice
                        </div>
                      </div>
                      <span className="badge badge-ok">Modular</span>
                    </button>
                    <div className="row">
                      <div className="row-ico ok">
                        <i className="ph ph-fingerprint" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Masuk biometrik</div>
                        <div className="row-sub">Sidik jari dan pengenalan wajah perangkat</div>
                      </div>
                      <span className="badge badge-ok">Aktif</span>
                    </div>
                    <a
                      className="row"
                      href="/dashboard"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="row-ico">
                        <i className="ph ph-monitor" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Versi desktop</div>
                        <div className="row-sub">Buka tampilan tabel lebar untuk layar besar</div>
                      </div>
                      <i className="ph ph-arrow-up-right" style={{ color: 'var(--muted)' }} />
                    </a>
                    <a className="row" href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="row-ico">
                        <i className="ph ph-globe" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Halaman profil publik</div>
                        <div className="row-sub">Kembali ke beranda profil Kecamatan Tamalate</div>
                      </div>
                      <i className="ph ph-arrow-up-right" style={{ color: 'var(--muted)' }} />
                    </a>
                    <button
                      className="row"
                      type="button"
                      onClick={async () => {
                        const fresh = await resetSimulation();
                        if (fresh) setData(fresh);
                      }}
                      style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div className="row-ico warn">
                        <i className="ph ph-arrows-clockwise" />
                      </div>
                      <div className="row-main">
                        <div className="row-title">Reset data simulasi</div>
                        <div className="row-sub">Kembalikan 12 naskah dinas ke keadaan awal</div>
                      </div>
                    </button>
                  </div>
                </section>

                <section className="sec">
                  <div className="sec-head">
                    <h2>Jabatan pada peran ini</h2>
                  </div>
                  <div className="chips">
                    {roleMeta.jabatanChips.map((j) => (
                      <button
                        key={j}
                        type="button"
                        className={`chip ${pelaksanaChip === j ? 'is-on' : ''}`}
                        onClick={() => {
                          if (
                            roleKey === 'pelaksana' &&
                            (j === 'Camat' || j === 'Kasubbag Umum' || j === 'Sekcam')
                          ) {
                            setPelaksanaChip(j);
                          }
                        }}
                      >
                        <i className="ph ph-identification-badge" />
                        {j}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
          </main>

          {/* ============================================================
              BOTTOM NAVIGATION 5 SLOT + FLOATING CAMERA BUTTON (#appNav)
              ============================================================ */}
          <nav className="app-nav" id="appNav" aria-label="Navigasi utama">
            <button
              className={`nav-btn ${activeNavTab === 'home' ? 'is-on' : ''}`}
              data-go="home"
              type="button"
              onClick={() => navigateTo('home')}
            >
              <i className="ph ph-house" />
              <span>Home</span>
            </button>
            <button
              className={`nav-btn ${activeNavTab === 'kerja' ? 'is-on' : ''}`}
              data-go="kerja"
              type="button"
              onClick={() => navigateTo('kerja')}
            >
              <i className="ph ph-squares-four" />
              <span>Kerja</span>
            </button>
            <span className="nav-gap" aria-hidden="true" />
            <button
              className="nav-cam"
              data-go="presensi"
              type="button"
              aria-label="Presensi dengan kamera"
              onClick={() => navigateTo('presensi')}
            >
              <i className="ph ph-camera" />
            </button>
            <button
              className={`nav-btn ${activeNavTab === 'vault' ? 'is-on' : ''}`}
              data-go="vault"
              type="button"
              onClick={() => navigateTo('vault')}
            >
              <i className="ph ph-shield-check" />
              <span>Vault</span>
            </button>
            <button
              className={`nav-btn ${activeNavTab === 'profil' ? 'is-on' : ''}`}
              data-go="profil"
              type="button"
              onClick={() => navigateTo('profil')}
            >
              <i className="ph ph-user-circle" />
              <span>Profil</span>
            </button>
          </nav>

          {/* ============================================================
              LEMBAR BAWAH PEMILIH PERAN (#backdrop + #sheet)
              ============================================================ */}
          <div
            className={`backdrop ${sheetOpen ? 'is-on' : ''}`}
            id="backdrop"
            onClick={() => setSheetOpen(false)}
          />
          <section
            className={`sheet ${sheetOpen ? 'is-on' : ''}`}
            id="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheetTitle"
          >
            <div className="sheet-grip" aria-hidden="true" />
            <div className="sheet-title" id="sheetTitle">
              Simulasi peran
            </div>
            <div className="sheet-note">
              Pilih salah satu dari empat peran. Beranda, ruang kerja, dan hak di dalam vault menyesuaikan peran yang aktif.
            </div>
            <div className="role-grid" id="roleGrid">
              {(Object.values(ROLE_CONFIGS) as RoleConfig[]).map((r) => (
                <button
                  key={r.kunci}
                  type="button"
                  className={`role-opt ${roleKey === r.kunci ? 'is-on' : ''}`}
                  data-role={r.kunci}
                  onClick={() => {
                    setRoleKey(r.kunci);
                    setSheetOpen(false);
                  }}
                >
                  <span className="role-opt-ico">
                    <i className={`ph ${r.ikon}`} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <b>{r.label}</b>
                    <span>{r.ringkas}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <TemplateCustomizerModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />
    </>
  );
}

export default MobileDashboard;
