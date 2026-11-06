'use client';

import React, { useEffect, useState } from 'react';
import { fetchSimulationBootstrap, type SimulationBootstrapPayload } from '@/lib/workspace-api';
import { AnatomyMechanismSVG } from '@/components/shared/AnatomyMechanismSVG';

export function LandingInteractive(): React.ReactNode {
  const [data, setData] = useState<SimulationBootstrapPayload | null>(null);
  const [activeDeck, setActiveDeck] = useState<number>(0);
  const [activeCollapse, setActiveCollapse] = useState<number>(0);
  const [activeSheet, setActiveSheet] = useState<number>(0);

  useEffect(() => {
    void fetchSimulationBootstrap().then((payload) => {
      setData(payload);
    });
  }, []);

  const hadirPagi = data?.stats.hadirPagi ?? 142;
  const totalPegawai = data?.stats.totalPegawai ?? 148;
  const suratMenunggu = data?.stats.suratMenunggu ?? 5;
  const mendekatiBatas = data?.stats.mendekatiBatas ?? 4;
  const suratCount = data?.surat.length ?? 12;
  const usulanCount = data?.usulan.length ?? 5;
  const dossierCount = data?.dossier.length ?? 4;

  const getDeckStyle = (idx: number): React.CSSProperties => {
    const offset = (idx - activeDeck + 3) % 3;
    if (offset === 0) {
      return {
        transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
        opacity: 1,
        zIndex: 4,
      };
    }
    if (offset === 1) {
      return {
        transform: 'translate3d(18px, 14px, -40px) rotate(1.8deg) scale(0.96)',
        opacity: 0.86,
        zIndex: 3,
      };
    }
    return {
      transform: 'translate3d(34px, 28px, -80px) rotate(3.4deg) scale(0.92)',
      opacity: 0.68,
      zIndex: 2,
    };
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/css/landing.css" />

      {/* ============================================================
          NAVIGASI (IDENTIK 100% DENGAN prototype-stripe-theme.html)
          ============================================================ */}
      <nav className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <i className="ph ph-buildings" />
            <span>Tamalate Kepegawaian</span>
          </a>
          <ul className="nav-links">
            <li>
              <a href="/dashboard">Dasbor</a>
            </li>
            <li>
              <a href="/mobile">Mobile</a>
            </li>
            <li>
              <a href="#anatomi">Anatomi</a>
            </li>
            <li>
              <a href="#fitur">Fitur</a>
            </li>
            <li>
              <a href="#alur">Alur Kerja</a>
            </li>
            <li>
              <a href="#kemampuan">Kemampuan</a>
            </li>
            <li>
              <a href="#palet">Palet</a>
            </li>
            <li>
              <a href="#viewport">Viewport</a>
            </li>
          </ul>
          <a className="btn btn-primary" href="/dashboard">
            Masuk Sistem
          </a>
        </div>
      </nav>

      {/* ============================================================
          HERO + DECK KACA 3 KARTU
          ============================================================ */}
      <header className="hero" id="top">
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-inner">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Kecamatan Tamalate</span>
              <h1 className="display">Administrasi kepegawaian yang tersusun rapi.</h1>
              <p className="body-lg">
                Enam domain dalam satu sistem. Surat, disposisi, presensi, dan pembinaan pegawai mengikuti urutan yang jelas dari masuk sampai arsip.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="/dashboard">
                  Buka Dasbor Desktop
                  <i className="ph ph-arrow-right" />
                </a>
                <a className="btn btn-ghost" href="/mobile">
                  <i className="ph ph-device-mobile" />
                  Buka Aplikasi Mobile
                </a>
              </div>
            </div>

            {/* Deck kaca hero: tiga kartu contoh dengan kedalaman */}
            <div className="hero-deck" id="heroDeck">
              {/* Kartu 1: ringkasan presensi */}
              <article
                className={`hero-deck-card ${activeDeck === 0 ? 'is-active' : ''}`}
                data-deck="0"
                style={getDeckStyle(0)}
                onClick={() => setActiveDeck(0)}
              >
                <div className="hero-panel-head">
                  <i className="ph ph-gauge" />
                  <span className="hero-panel-title">Ringkasan hari ini</span>
                </div>
                <div className="metric-row">
                  <div className="metric">
                    <div className="metric-value tabular">{hadirPagi}</div>
                    <div className="metric-label">Hadir pagi</div>
                    <div className="metric-delta up tabular">+6 dari kemarin</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value tabular">{suratMenunggu}</div>
                    <div className="metric-label">Surat menunggu</div>
                    <div className="metric-delta down tabular">-3 dari kemarin</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value tabular">{mendekatiBatas}</div>
                    <div className="metric-label">Mendekati batas</div>
                    <div className="metric-delta down tabular">+2 minggu ini</div>
                  </div>
                </div>
                <div>
                  <div className="meter-head">
                    <span className="label">Batas tidak hadir sepekan</span>
                    <span className="caption tabular">3 dari 5</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: '60%' }} />
                  </div>
                  <div className="meter-scale">
                    <span>Aman</span>
                    <span>Mendekati</span>
                    <span>Terlampaui</span>
                  </div>
                </div>
              </article>

              {/* Kartu 2: alur disposisi */}
              <article
                className={`hero-deck-card ${activeDeck === 1 ? 'is-active' : ''}`}
                data-deck="1"
                style={getDeckStyle(1)}
                onClick={() => setActiveDeck(1)}
              >
                <div className="hero-panel-head">
                  <i className="ph ph-file-text" />
                  <span className="hero-panel-title">Alur disposisi</span>
                </div>
                <ul className="deck-steps">
                  <li>
                    <i className="ph ph-check-circle" />
                    Pengendalian surat masuk
                  </li>
                  <li>
                    <i className="ph ph-check-circle" />
                    Lembar disposisi pimpinan
                  </li>
                  <li>
                    <i className="ph ph-check-circle" />
                    Verifikasi Kasubag
                  </li>
                  <li>
                    <i className="ph ph-check-circle" />
                    Validasi Sekcam
                  </li>
                  <li>
                    <i className="ph ph-check-circle" />
                    Arsip dan jejak audit
                  </li>
                </ul>
                <div className="deck-foot">
                  <span className="vp-tag">5 tahap</span>
                  <span className="caption">Rata-rata 2 hari kerja</span>
                </div>
              </article>

              {/* Kartu 3: status presensi pegawai */}
              <article
                className={`hero-deck-card ${activeDeck === 2 ? 'is-active' : ''}`}
                data-deck="2"
                style={getDeckStyle(2)}
                onClick={() => setActiveDeck(2)}
              >
                <div className="hero-panel-head">
                  <i className="ph ph-camera" />
                  <span className="hero-panel-title">Presensi pegawai</span>
                </div>
                <div className="deck-person">
                  <div className="deck-avatar">
                    <i className="ph ph-user" />
                  </div>
                  <div>
                    <div className="deck-name">Andi Tenri Uleng, S.STP</div>
                    <div className="caption">Subbagian Umum dan Kepegawaian</div>
                  </div>
                  <span className="status-chip ok">
                    <i className="ph ph-check" />
                    Terverifikasi
                  </span>
                </div>
                <div className="deck-rows">
                  <div className="deck-row">
                    <span>Apel pagi</span>
                    <span className="tabular mono">07:42</span>
                  </div>
                  <div className="deck-row">
                    <span>Lokasi</span>
                    <span className="tabular mono">Radius terpenuhi</span>
                  </div>
                  <div className="deck-row">
                    <span>Apel sore</span>
                    <span className="tabular mono">16:05</span>
                  </div>
                </div>
              </article>

              {/* Kontrol navigasi deck */}
              <div className="hero-deck-nav">
                <button
                  className="hero-deck-btn"
                  id="deckPrev"
                  type="button"
                  aria-label="Kartu sebelumnya"
                  onClick={() => setActiveDeck((d) => (d + 2) % 3)}
                >
                  <i className="ph ph-caret-left" />
                </button>
                <button
                  className="hero-deck-btn"
                  id="deckNext"
                  type="button"
                  aria-label="Kartu berikutnya"
                  onClick={() => setActiveDeck((d) => (d + 1) % 3)}
                >
                  <i className="ph ph-caret-right" />
                </button>
                <div className="hero-deck-dots" id="deckDots">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`hero-deck-dot ${activeDeck === i ? 'on' : ''}`} />
                  ))}
                </div>
                <span className="hero-deck-hint">Geser kartu</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          DIAGRAM ANATOMI MEKANISME FISIK (wheresryan22/anatomy)
          ============================================================ */}
      <section className="section section-soft" id="anatomi">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Arsitektur Naskah &amp; Kepegawaian</span>
            <h2 className="heading">Satu meja kendali, empat mekanisme yang saling mengunci.</h2>
            <p className="body-lg">
              Dari Buku Agenda 8 Kolom, Lembar Disposisi dua tertanda pimpinan, radius apel harian, hingga Single Dossier Vault.
            </p>
          </div>
          <AnatomyMechanismSVG
            suratCount={suratCount}
            disposisiQueueCount={suratMenunggu}
            hadirPagi={hadirPagi}
            totalPegawai={totalPegawai}
            usulanActiveCount={usulanCount}
            dossierCount={dossierCount}
          />
        </div>
      </section>

      {/* ============================================================
          FITUR COLLAPSE, pola Avalanche
          ============================================================ */}
      <section className="section collapse-section" id="fitur">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Enam domain</span>
            <h2 className="heading">Pilih domain untuk melihat detailnya.</h2>
            <p className="body-lg">
              Setiap kartu melebar saat dipilih. Yang lain menyempit agar fokus tetap pada satu domain sekaligus.
            </p>
          </div>

          <div className="collapse-wrap">
            {[
              {
                kicker: 'Surat',
                title: 'Pengendalian dan disposisi',
                icon: 'ph-file-text',
                text: 'Surat dicatat pada buku agenda 8 kolom, diberi nomor agenda, lalu dialirkan lewat lembar disposisi dua tertanda (Sekcam dan Camat).',
                bullets: [
                  'Buku agenda resmi 8 kolom',
                  'Lembar disposisi fisik dua tertanda',
                  'Tanda tangan gores, Vault, dan QR TTE',
                ],
                cta: 'Buka modul surat',
                href: '/dashboard',
              },
              {
                kicker: 'Presensi',
                title: 'Apel pagi dan sore',
                icon: 'ph-camera',
                text: 'Pegawai memotret diri di lokasi kerja. Sistem memverifikasi koordinat dan menolak presensi di luar radius kantor.',
                bullets: [
                  'Verifikasi lokasi otomatis <= 150m',
                  'Kamera swafoto langsung di ponsel',
                  'Rekap harian per pegawai',
                ],
                cta: 'Buka modul presensi',
                href: '/mobile',
              },
              {
                kicker: 'Pembinaan',
                title: 'Threshold dan eskalasi',
                icon: 'ph-chart-bar',
                text: 'Batas tidak hadir disimpan sebagai data yang bisa diubah admin, disertai alur KGB, kenaikan pangkat, dan formulir Surat Cuti 2026.',
                bullets: [
                  'Meter visual kedekatan batas',
                  'Eskalasi ke Kasubag lalu Sekcam',
                  'Formulir resmi Cuti ASN 8 tabel',
                ],
                cta: 'Buka modul pembinaan',
                href: '/dashboard',
              },
              {
                kicker: 'Audit',
                title: 'Jejak perubahan status',
                icon: 'ph-shield-check',
                text: 'Setiap perubahan status menulis baris audit permanen berisi penanggung jawab, waktu, dan status sebelum sesudah.',
                bullets: [
                  'Tabel hanya tambah (append-only)',
                  'Tidak bisa diubah dari antarmuka',
                  'Terhubung ke Single Dossier Vault',
                ],
                cta: 'Buka modul audit',
                href: '/dashboard',
              },
            ].map((item, idx) => {
              const isAct = activeCollapse === idx;
              return (
                <button
                  key={item.kicker}
                  className={`collapse-card ${isAct ? 'active' : ''}`}
                  type="button"
                  aria-expanded={isAct}
                  onClick={() => setActiveCollapse(idx)}
                >
                  <div className="collapse-head">
                    <div className="collapse-icon">
                      <i className={`ph ${item.icon}`} />
                    </div>
                    <div>
                      <div className="collapse-kicker">{item.kicker}</div>
                      <div className="collapse-title">{item.title}</div>
                    </div>
                  </div>
                  <div className="collapse-body">
                    <p className="collapse-text">{item.text}</p>
                    <ul className="collapse-list">
                      {item.bullets.map((b) => (
                        <li key={b}>
                          <i className="ph ph-check" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <a className="collapse-cta" href={item.href}>
                      {item.cta}
                      <i className="ph ph-arrow-right" />
                    </a>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          ALUR DISPOSISI SURAT (4 LEMBAR BERTUMPUK)
          ============================================================ */}
      <section className="stack-section" id="alur" style={{ paddingBottom: '88px' }}>
        <div className="container stack-intro">
          <span className="eyebrow">Alur disposisi surat</span>
          <h2 className="heading">Empat lembar, satu urutan yang tidak bisa dilewati.</h2>
          <p className="body-lg" style={{ maxWidth: '38rem', marginTop: '14px' }}>
            Setiap tahap punya penanggung jawab, penanda waktu, dan status yang jelas. Pilih tahap untuk melihat lembar kerja.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              '01. Pengendalian surat masuk',
              '02. Lembar disposisi',
              '03. Verifikasi dan validasi',
              '04. Pengarsipan dan jejak audit',
            ].map((lbl, idx) => (
              <button
                key={lbl}
                type="button"
                className={`btn ${activeSheet === idx ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveSheet(idx)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="container">
          <div className="stack-stage" id="stackStage" style={{ height: '340px', margin: '0 auto' }}>
            {[
              {
                index: '01',
                title: 'Pengendalian surat masuk',
                text: 'Surat dicatat ke dalam Buku Agenda 8 Kolom, diberi nomor agenda, dan diunggah bersama lampirannya. Petugas pengendali memverifikasi kelengkapan sebelum lembar disposisi dibuat.',
                tag: 'Tahap awal',
                step: 'Petugas pengendali',
              },
              {
                index: '02',
                title: 'Lembar disposisi',
                text: 'Sekretaris Camat membubuhkan paraf mengetahui dan rekomendasi tujuan, lalu Camat Tamalate menetapkan instruksi penanganan dan tanda tangan pengesahan pada Lembar Disposisi.',
                tag: 'Menunggu',
                step: 'Camat dan Sekcam',
              },
              {
                index: '03',
                title: 'Verifikasi dan validasi',
                text: 'Pejabat pelaksana memproses surat sesuai instruksi disposisi, lalu Kasubag memverifikasi hasil kerja dan Sekcam memvalidasi kelengkapan naskah.',
                tag: 'Proses',
                step: 'Kasubag dan Sekcam',
              },
              {
                index: '04',
                title: 'Pengarsipan dan jejak audit',
                text: 'Surat selesai diberi kode klasifikasi arsip serta lokasi penyimpanan fisik. Seluruh riwayat perubahan status tersimpan permanen dan tidak dapat diubah.',
                tag: 'Selesai',
                step: 'Arsip dan audit',
              },
            ].map((sh, idx) => (
              <article
                key={sh.index}
                className="sheet"
                data-sheet={idx}
                style={{
                  opacity: activeSheet === idx ? 1 : 0,
                  pointerEvents: activeSheet === idx ? 'auto' : 'none',
                  transform: activeSheet === idx ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
                }}
              >
                <span className="sheet-index">{sh.index}</span>
                <h3 className="sheet-title">{sh.title}</h3>
                <p className="sheet-text">{sh.text}</p>
                <div className="sheet-foot">
                  <span className="vp-tag">{sh.tag}</span>
                  <span className="sheet-step">{sh.step}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          KARTU KEMAMPUAN
          ============================================================ */}
      <section className="section" id="kemampuan">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Kemampuan sistem</span>
            <h2 className="heading">Dibangun untuk pekerjaan administratif sehari-hari.</h2>
            <p className="body-lg">
              Setiap modul berbagi satu kontrak data dan satu bahasa visual, sehingga pegawai tidak perlu belajar ulang di setiap halaman.
            </p>
          </div>

          <div className="card-grid">
            <div className="card">
              <div className="icon-box">
                <i className="ph ph-device-mobile" />
              </div>
              <h3>Presensi dari ponsel</h3>
              <p>
                Berjalan sebagai aplikasi mobile. Pegawai memasang ke layar utama ponsel tanpa melalui toko aplikasi, lengkap dengan verifikasi radius kantor.
              </p>
            </div>

            <div className="card">
              <div className="icon-box">
                <i className="ph ph-tree-structure" />
              </div>
              <h3>Alur bertingkat</h3>
              <p>
                Pengajuan mengalir dari Kasubag ke Sekcam sampai Camat. Setiap tahap punya penanda waktu dan penanggung jawab yang tercatat.
              </p>
            </div>

            <div className="card">
              <div className="icon-box">
                <i className="ph ph-printer" />
              </div>
              <h3>Cetak surat presisi</h3>
              <p>
                Lembar Disposisi tegak A4 dan Buku Agenda 8 Kolom mendatar A4 mengikuti tata naskah dinas Pemerintah Kota Makassar.
              </p>
            </div>

            <div className="card">
              <div className="icon-box">
                <i className="ph ph-sliders-horizontal" />
              </div>
              <h3>Parameter sebagai data</h3>
              <p>
                Ambang batas tidak hadir dan radius kantor disimpan sebagai parameter yang dapat disesuaikan oleh admin dari antarmuka.
              </p>
            </div>

            <div className="card">
              <div className="icon-box">
                <i className="ph ph-lock-key" />
              </div>
              <h3>Hak akses per peran</h3>
              <p>
                Empat peran utama (Pelaksana, Admin, Operator, Pegawai) menampilkan ruang kerja dan wewenang sesuai jabatan masing-masing.
              </p>
            </div>

            <div className="card">
              <div className="icon-box">
                <i className="ph ph-folders" />
              </div>
              <h3>Single Dossier Vault</h3>
              <p>
                Enam partisi arsip kepegawaian dan spesimen tanda tangan pimpinan tersimpan terpusat untuk mendukung pengajuan KGB, pangkat, dan cuti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PENAMPIL PALET (STRIPE DESIGN TOKENS)
          ============================================================ */}
      <section className="section section-soft" id="palet">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Design token</span>
            <h2 className="heading">Palet dan tipografi.</h2>
            <p className="body-lg">
              Seluruh nilai di bawah ini adalah token sistem desain yang digunakan secara konsisten di halaman profil, dasbor desktop, dan aplikasi mobile.
            </p>
          </div>

          <h3 className="label" style={{ marginBottom: '14px' }}>
            Aksen
          </h3>
          <div className="swatch-grid" style={{ marginBottom: '36px' }}>
            {[
              { name: 'Accent', hex: '#635BFF' },
              { name: 'Accent focus', hex: '#5452FB' },
              { name: 'Accent pressed', hex: '#4032C8' },
              { name: 'Accent deep', hex: '#2E2B8C' },
              { name: 'Accent soft', hex: '#D6D9FC' },
            ].map((s) => (
              <div key={s.hex} className="swatch">
                <div className="swatch-chip" style={{ background: s.hex }} />
                <div className="swatch-meta">
                  <div className="swatch-name">{s.name}</div>
                  <div className="swatch-hex">{s.hex}</div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="label" style={{ marginBottom: '14px' }}>
            Hierarki ink
          </h3>
          <div className="swatch-grid" style={{ marginBottom: '36px' }}>
            {[
              { name: 'Ink', hex: '#061B31' },
              { name: 'Heading', hex: '#0A2540' },
              { name: 'Ink secondary', hex: '#1A2C44' },
              { name: 'Ink tertiary', hex: '#273951' },
              { name: 'Body', hex: '#3C4F69' },
              { name: 'Body secondary', hex: '#50617A' },
              { name: 'Muted', hex: '#64748D' },
            ].map((s) => (
              <div key={s.hex} className="swatch">
                <div className="swatch-chip" style={{ background: s.hex }} />
                <div className="swatch-meta">
                  <div className="swatch-name">{s.name}</div>
                  <div className="swatch-hex">{s.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TATA LETAK TIGA VIEWPORT
          ============================================================ */}
      <section className="section" id="viewport">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Responsif</span>
            <h2 className="heading">Tiga viewport, tiga prioritas berbeda.</h2>
            <p className="body-lg">
              Setiap breakpoint dirancang untuk pengguna dan tugas yang berbeda, bukan sekadar versi kecil dari tampilan desktop.
            </p>
          </div>

          <div className="viewport-grid">
            <div className="vp">
              <div className="vp-head">
                <div className="vp-name">Mobile</div>
                <div className="vp-range">&lt; 640 px</div>
              </div>
              <div className="vp-body">
                <span className="vp-tag">Presensi pegawai</span>
                <p className="vp-note">
                  Satu tugas per layar. Bottom bar lima item, target sentuh minimal 44 px, tabel berubah menjadi daftar kartu.
                </p>
              </div>
            </div>

            <div className="vp">
              <div className="vp-head">
                <div className="vp-name">Tablet</div>
                <div className="vp-range">640 - 1024 px</div>
              </div>
              <div className="vp-body">
                <span className="vp-tag">Kasubag dan Sekcam</span>
                <p className="vp-note">
                  Sidebar menyusut menjadi ikon. Panel detail menjadi overlay. Kolom sekunder tabel digulir horizontal.
                </p>
              </div>
            </div>

            <div className="vp">
              <div className="vp-head">
                <div className="vp-name">Desktop</div>
                <div className="vp-range">&gt; 1024 px</div>
              </div>
              <div className="vp-body">
                <span className="vp-tag">Admin dan Camat</span>
                <p className="vp-note">
                  Sidebar penuh 248 px, panel kanan 372 px untuk detail konteks, serta lembar kerja disposisi dan buku agenda 8 kolom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <a className="brand" href="#top">
              <i className="ph ph-buildings" />
              <span>Tamalate Kepegawaian</span>
            </a>
            <p className="footer-note">
              Sistem Informasi Administrasi Persuratan, Lembar Disposisi, Presensi Geofence, dan Kepegawaian Kecamatan Tamalate Pemerintah Kota Makassar.
            </p>
          </div>
          <div className="footer-bottom">
            <span className="caption">Pemerintah Kota Makassar · Kecamatan Tamalate</span>
            <span className="caption mono">TAMALATE-2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LandingInteractive;
