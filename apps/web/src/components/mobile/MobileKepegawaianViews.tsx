'use client';

import React from 'react';
import type {
  DossierRecord,
  PegawaiRecord,
  PresensiRecord,
  UsulanRecord,
} from '@/lib/workspace-api';
import { SuratCutiSheet } from '@/components/shared/SuratPaperTemplates';
import type { RoleConfig, ScreenKey } from './mobile-roles.data';

const ALUR_USULAN = [
  'Pengajuan Berkas',
  'Verifikasi Kasubbag Umum',
  'Paraf Sekretaris Camat',
  'Persetujuan Camat Tamalate',
];

export interface MobileKepegawaianViewsProps {
  screen: ScreenKey;
  roleMeta: RoleConfig;
  usulanList: UsulanRecord[];
  pegawaiList: PegawaiRecord[];
  presensiList: PresensiRecord[];
  dossierList: DossierRecord[];
  activeUsulan: UsulanRecord | undefined;
  setActiveUsulanId: (id: string) => void;
  onToggleBerkas: (usulanId: string, kodeBerkas: string, lengkap: boolean) => Promise<void>;
  onAdvanceUsulan: (usulanId: string) => Promise<void>;
  onOpenTemplateCustomizer: () => void;
  navigateTo: (screen: ScreenKey) => void;
}

export function MobileKepegawaianViews({
  screen,
  usulanList,
  pegawaiList,
  presensiList,
  dossierList,
  activeUsulan,
  setActiveUsulanId,
  onToggleBerkas,
  onAdvanceUsulan,
  onOpenTemplateCustomizer,
  navigateTo,
}: MobileKepegawaianViewsProps): React.ReactNode {
  // 1. Layar Detail Usulan (kpgDetail)
  if (screen === 'kpgDetail' && activeUsulan) {
    const terpenuhi = activeUsulan.berkas.filter((b) => b.lengkap).length;
    const totalBerkas = activeUsulan.berkas.length;
    const semuaLengkap = terpenuhi === totalBerkas;
    const persen = totalBerkas ? Math.round((terpenuhi / totalBerkas) * 100) : 100;

    return (
      <>
        <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
          <i className="ph ph-arrow-left" /> Ruang kerja
        </button>

        <div className="kpg-detail-kartu">
          <div className="kpg-baris-atas">
            <span className="kpg-kode">{activeUsulan.id}</span>
            <span className={`badge ${activeUsulan.tahap >= 4 ? 'badge-ok' : 'badge-warn'}`}>
              Tahap {activeUsulan.tahap}/4 · {activeUsulan.status}
            </span>
          </div>
          <h2>{activeUsulan.nama}</h2>
          <p>
            NIP <span className="tabular">{activeUsulan.nip}</span> · Gol. {activeUsulan.golongan}
          </p>
          <div className="kpg-detail-grid">
            <div>
              <span>Jenis Usulan</span>
              <b>{activeUsulan.jenis.toUpperCase()}</b>
            </div>
            <div>
              <span>Target TMT</span>
              <b className="tabular">{activeUsulan.tmtTarget}</b>
            </div>
            <div>
              <span>Sisa Hari</span>
              <b className="tabular">{activeUsulan.sisaHari} hari</b>
            </div>
            <div>
              <span>Kelengkapan</span>
              <b className="tabular">
                {terpenuhi}/{totalBerkas} berkas
              </b>
            </div>
          </div>
        </div>

        {/* Alur Verifikasi 4 Tahap (.kpg-alur > .kpg-langkah) */}
        <div className="sec">
          <div className="sec-head">
            <h2>Alur persetujuan berjenjang</h2>
            <span className="sec-link tabular">Tahap {activeUsulan.tahap}/4</span>
          </div>
          <div className="kpg-alur">
            {ALUR_USULAN.map((nama, idx) => {
              const stepNum = idx + 1;
              const cls =
                stepNum < activeUsulan.tahap
                  ? 'is-selesai'
                  : stepNum === activeUsulan.tahap
                    ? 'is-kini'
                    : '';
              const ico =
                stepNum < activeUsulan.tahap
                  ? 'ph-check'
                  : stepNum === activeUsulan.tahap
                    ? 'ph-hourglass-medium'
                    : 'ph-circle';
              return (
                <div key={nama} className={`kpg-langkah ${cls}`}>
                  <span className="kpg-titik">
                    <i className={`ph ${ico}`} />
                  </span>
                  <div className="kpg-langkah-isi">
                    <b>{nama}</b>
                    <span>
                      {stepNum < activeUsulan.tahap
                        ? 'Telah diverifikasi dan disetujui'
                        : stepNum === activeUsulan.tahap
                          ? 'Menunggu tindakan pejabat berwenang'
                          : 'Menunggu tahap sebelumnya'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Pemeriksaan Kelengkapan Berkas (.bk-panel) */}
        <div className="bk-panel">
          <div className="bk-panel-kepala">
            <div className="bk-panel-judul">
              <i className="ph ph-files" />
              <div>
                <h3>Kelengkapan berkas wajib</h3>
                <p>Tandai berkas yang sudah ada di dalam Single Dossier pegawai.</p>
              </div>
            </div>
            <span className={`badge ${semuaLengkap ? 'badge-ok' : 'badge-warn'}`}>
              <i className={`ph ${semuaLengkap ? 'ph-seal-check' : 'ph-warning-circle'}`} />
              {semuaLengkap ? 'Siap diajukan' : 'Berkas belum lengkap'}
            </span>
          </div>

          <div className="bk-ringkas">
            <div className="bk-ringkas-angka">
              <b className="tabular">
                {terpenuhi} / {totalBerkas}
              </b>
              <span>berkas wajib tersedia di Dossier</span>
            </div>
            <div className="bk-batang" aria-hidden="true">
              <i className={semuaLengkap ? 'is-penuh' : ''} style={{ width: `${persen}%` }} />
            </div>
          </div>

          <div className="bk-deret">
            {activeUsulan.berkas.map((b) => (
              <div key={b.kode} className={`bk-butir ${!b.lengkap ? 'is-kurang' : ''}`}>
                <div className="bk-butir-atas">
                  <span className={`bk-ikon ${b.lengkap ? 'ada' : 'kurang'}`}>
                    <i className={`ph ${b.lengkap ? 'ph-check-circle' : 'ph-warning-circle'}`} />
                  </span>
                  <div className="bk-butir-isi">
                    <div className="bk-butir-baris-judul">
                      <b>{b.nama}</b>
                      <span className="bk-pita wajib">Wajib</span>
                    </div>
                    <div className="bk-meta">
                      <span>
                        <i className="ph ph-folder-simple" /> Dossier ASN
                      </span>
                      <span className="tabular">{b.kode}</span>
                    </div>
                  </div>
                </div>
                <div className="bk-butir-kaki">
                  <span className={`bk-status ${b.lengkap ? 'ada' : 'kurang'}`}>
                    <i className={`ph ${b.lengkap ? 'ph-seal-check' : 'ph-x-circle'}`} />
                    {b.lengkap ? 'Tersedia di Vault' : 'Belum diunggah'}
                  </span>
                  <div className="bk-aksi">
                    <button
                      type="button"
                      className="bk-taut"
                      onClick={() => onToggleBerkas(activeUsulan.id, b.kode, !b.lengkap)}
                    >
                      <i className={`ph ${b.lengkap ? 'ph-arrow-counter-clockwise' : 'ph-upload-simple'}`} />
                      {b.lengkap ? 'Tandai belum' : 'Unggah / tandai ada'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pratinjau Formulir Surat Cuti jika jenis usulan adalah cuti */}
        {activeUsulan.jenis === 'cuti' ? (
          <div className="pure-doc-print">
            <SuratCutiSheet
              nama={activeUsulan.nama}
              nip={activeUsulan.nip}
              jabatan={activeUsulan.jabatan}
            />
          </div>
        ) : null}

        {activeUsulan.tahap < 4 ? (
          <div className="kpg-aksi-bar">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => onAdvanceUsulan(activeUsulan.id)}
            >
              <i className="ph ph-check-circle" /> Setujui &amp; Lanjutkan Tahap {activeUsulan.tahap + 1}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => navigateTo('ekspor')}
            >
              <i className="ph ph-printer" /> Pratinjau Cetak
            </button>
          </div>
        ) : null}
      </>
    );
  }

  // 2. Layar Cuti dan Izin (kpgCuti) dengan Formulir Surat Cuti Resmi 8 Tabel
  if (screen === 'kpgCuti') {
    const cutiUsulan = usulanList.filter((u) => u.jenis === 'cuti');
    return (
      <>
        <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
          <i className="ph ph-arrow-left" /> Ruang kerja
        </button>
        <div className="page-hero">
          <span className="eyebrow">Layanan Cuti ASN</span>
          <h1>Cuti dan izin pegawai</h1>
          <p>
            Pengajuan cuti tahunan, sakit, alasan penting, dan pratinjau Formulir Permintaan dan Pemberian Cuti 2026 (8 tabel resmi).
          </p>
        </div>

        <div className="kpg-kartu-angka">
          <div className="kpg-angka-butir">
            <i className="ph ph-calendar-check" />
            <b className="tabular">12</b>
            <span>Kuota tahunan</span>
            <small className="ok">Hari kerja</small>
          </div>
          <div className="kpg-angka-butir">
            <i className="ph ph-airplane-tilt" />
            <b className="tabular">{String(cutiUsulan.length || 1).padStart(2, '0')}</b>
            <span>Permohonan aktif</span>
            <small className="warn">Menunggu paraf</small>
          </div>
        </div>

        <div className="ekspor-tombol">
          <button className="btn btn-primary" type="button" onClick={() => window.print()}>
            <i className="ph ph-printer" /> Cetak Formulir Cuti
          </button>
          <button className="btn btn-ghost" type="button" onClick={onOpenTemplateCustomizer}>
            <i className="ph ph-sliders" /> Kostumisasi Template
          </button>
        </div>

        {/* Formulir Resmi 8 Tabel (.pure-doc-print > .ct-formulir) */}
        <div className="pure-doc-print">
          <SuratCutiSheet />
        </div>
      </>
    );
  }

  // 3. Layar Ringkasan SDM (kpgRingkas)
  if (screen === 'kpgRingkas') {
    return (
      <>
        <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
          <i className="ph ph-arrow-left" /> Ruang kerja
        </button>
        <div className="page-hero">
          <span className="eyebrow">Ikhtisar Kecamatan</span>
          <h1>Ringkasan kepegawaian</h1>
          <p>Komposisi ASN, kehadiran apel harian, dan beban layanan kepegawaian se-Kecamatan Tamalate.</p>
        </div>

        <div className="kpg-kartu-angka">
          <div className="kpg-angka-butir">
            <i className="ph ph-users-three" />
            <b className="tabular">148</b>
            <span>Pegawai aktif</span>
            <small className="ok">11 unit kerja</small>
          </div>
          <div className="kpg-angka-butir">
            <i className="ph ph-sun-horizon" />
            <b className="tabular">93%</b>
            <span>Hadir apel pagi</span>
            <small className="ok">138 tercatat</small>
          </div>
          <div className="kpg-angka-butir">
            <i className="ph ph-trend-up" />
            <b className="tabular">{String(usulanList.length).padStart(2, '0')}</b>
            <span>Usulan berjalan</span>
            <small className="warn">KGB, pangkat, cuti</small>
          </div>
          <div className="kpg-angka-butir">
            <i className="ph ph-shield-check" />
            <b className="tabular">98%</b>
            <span>Dossier lengkap</span>
            <small className="ok">145 dari 148 ASN</small>
          </div>
        </div>

        <div className="sec">
          <div className="sec-head">
            <h2>Komposisi unit kerja</h2>
            <span className="sec-link tabular">11 unit</span>
          </div>
          <div className="kpg-daftar">
            {[
              { unit: 'Sekretariat Kecamatan Tamalate', jml: 42, hadir: 40, ket: 'Subbagian Umum, Keuangan, Program' },
              { unit: 'Kelurahan Tanjung Merdeka', jml: 11, hadir: 11, ket: '100% hadir apel pagi' },
              { unit: 'Kelurahan Barombong', jml: 12, hadir: 11, ket: '1 izin sakit tercatat' },
              { unit: 'Kelurahan Jongaya', jml: 11, hadir: 10, ket: '1 dinas luar kota' },
              { unit: 'Kelurahan Mannuruki', jml: 10, hadir: 10, ket: '100% hadir apel pagi' },
            ].map((u) => (
              <div key={u.unit} className="kpg-baris">
                <div className="kpg-baris-atas">
                  <span className="kpg-kode">UNIT KERJA</span>
                  <span className="badge badge-ok tabular">
                    {u.hadir}/{u.jml} hadir
                  </span>
                </div>
                <div className="kpg-baris-judul">{u.unit}</div>
                <div className="kpg-baris-sub">{u.ket}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // 4. Layar Apel Harian & Rekap Presensi (kpgApel / kpgRekap)
  if (screen === 'kpgApel' || screen === 'kpgRekap') {
    return (
      <>
        <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
          <i className="ph ph-arrow-left" /> Ruang kerja
        </button>
        <div className="page-hero">
          <span className="eyebrow">Disiplin kehadiran</span>
          <h1>{screen === 'kpgApel' ? 'Apel harian geofence' : 'Rekap presensi bulanan'}</h1>
          <p>Catatan kehadiran swafoto dan verifikasi koordinat GPS di dalam radius 150 meter kantor.</p>
        </div>

        <div className="kpg-kartu-angka">
          <div className="kpg-angka-butir">
            <i className="ph ph-check-circle" />
            <b className="tabular">138</b>
            <span>Hadir tepat waktu</span>
            <small className="ok">Radius &lt;= 150m</small>
          </div>
          <div className="kpg-angka-butir">
            <i className="ph ph-warning-circle" />
            <b className="tabular">02</b>
            <span>Melewati batas</span>
            <small className="danger">&gt;= 5 hari alpa</small>
          </div>
        </div>

        <div className="kpg-daftar">
          {presensiList.map((p) => (
            <div key={p.id} className="kpg-baris">
              <div className="kpg-baris-atas">
                <span className="kpg-kode tabular">NIP {p.nip}</span>
                <span className={`badge ${p.status === 'hadir' ? 'badge-ok' : 'badge-warn'}`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
              <div className="kpg-baris-judul">{p.nama}</div>
              <div className="kpg-baris-sub">
                {p.jabatan} · {p.unit}
              </div>
              <div className="kpg-baris-meta">
                <span className="tabular">
                  <i className="ph ph-clock" /> Pagi {p.apelPagi} · Sore {p.apelSore}
                </span>
                <span className="tabular">
                  <i className="ph ph-map-pin" /> {p.jarakMeter} meter
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 5. Layar Direktori Pegawai (kpgPegawai) & Dossier (kpgDossier)
  if (screen === 'kpgPegawai' || screen === 'kpgDossier') {
    return (
      <>
        <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
          <i className="ph ph-arrow-left" /> Ruang kerja
        </button>
        <div className="page-hero">
          <span className="eyebrow">Database ASN</span>
          <h1>{screen === 'kpgPegawai' ? 'Data dan tenggat pegawai' : 'Single Dossier pegawai'}</h1>
          <p>Daftar pegawai beserta jadwal KGB, kenaikan pangkat, dan kelengkapan 6 partisi berkas.</p>
        </div>

        <div className="kpg-daftar">
          {pegawaiList.map((pg) => (
            <div
              key={pg.nip}
              className="kpg-baris"
              onClick={() => navigateTo('dokumen')}
            >
              <div className="kpg-baris-atas">
                <span className="kpg-kode tabular">{pg.nip}</span>
                <span className="badge badge-info">Gol. {pg.golongan}</span>
              </div>
              <div className="kpg-baris-judul">{pg.nama}</div>
              <div className="kpg-baris-sub">
                {pg.jabatan} · {pg.unit}
              </div>
              <div className="kpg-baris-meta">
                <span className="tabular">
                  <i className="ph ph-trend-up" /> KGB: {pg.tmtKgbBerikutnya}
                </span>
                <span className="tabular">
                  <i className="ph ph-folders" /> {dossierList.length} berkas sah
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 6. Default: Daftar Usulan KGB, Pangkat, Pensiun, atau Pembinaan (kpgKgb, kpgPangkat, kpgPensiun, kpgBina)
  const judulMap: Record<string, { eyebrow: string; title: string; desc: string }> = {
    kpgKgb: {
      eyebrow: 'Siklus 2 Tahunan ASN',
      title: 'Kenaikan gaji berkala',
      desc: 'Pemantauan jatuh tempo KGB H-60 dan pemeriksaan kelengkapan berkas otomatis dari Dossier.',
    },
    kpgPangkat: {
      eyebrow: 'Karier dan Kepangkatan',
      title: 'Usulan kenaikan pangkat',
      desc: 'Pengajuan pangkat reguler maupun pilihan beserta kelengkapan SKP 2 tahun terakhir.',
    },
    kpgPensiun: {
      eyebrow: 'Batas Usia Pensiun',
      title: 'Persiapan pensiun ASN',
      desc: 'Daftar pegawai menjelang BUP dan pemeriksaan berkas bebas tanggungan.',
    },
    kpgBina: {
      eyebrow: 'Penegakan Disiplin',
      title: 'Pembinaan disiplin ASN',
      desc: 'Tindak lanjut pegawai yang melewati parameter threshold ketidakhadiran 5 hari.',
    },
  };
  const info = judulMap[screen] ?? judulMap.kpgKgb!;

  return (
    <>
      <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
        <i className="ph ph-arrow-left" /> Ruang kerja
      </button>
      <div className="page-hero">
        <span className="eyebrow">{info.eyebrow}</span>
        <h1>{info.title}</h1>
        <p>{info.desc}</p>
      </div>

      <div className="kpg-daftar">
        {usulanList.map((u) => {
          const terpenuhi = u.berkas.filter((b) => b.lengkap).length;
          const total = u.berkas.length;
          return (
            <button
              key={u.id}
              type="button"
              className="kpg-baris"
              onClick={() => {
                setActiveUsulanId(u.id);
                navigateTo('kpgDetail');
              }}
            >
              <div className="kpg-baris-atas">
                <span className="kpg-kode">{u.id}</span>
                <span className={`badge ${u.tahap >= 4 ? 'badge-ok' : 'badge-warn'}`}>
                  Tahap {u.tahap}/4 · {u.status}
                </span>
              </div>
              <div className="kpg-baris-judul">{u.nama}</div>
              <div className="kpg-baris-sub">
                NIP <span className="tabular">{u.nip}</span> · Gol. {u.golongan}
              </div>
              <div className="kpg-baris-meta">
                <span className="tabular">
                  <i className="ph ph-calendar" /> TMT {u.tmtTarget} ({u.sisaHari} hari)
                </span>
                <span className={`bk-lencana ${terpenuhi === total ? 'lengkap' : 'kurang'}`}>
                  <i className={`ph ${terpenuhi === total ? 'ph-seal-check' : 'ph-warning-circle'}`} />
                  {terpenuhi}/{total} berkas
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
