'use client';

import React, { useRef, useState } from 'react';
import type { SuratRecord } from '@/lib/workspace-api';
import {
  BukuAgendaExportSheet,
  generateBukuAgendaCSV,
  generateTTEBarcodeSVG,
  getSifatText,
  getTargetDisposisiLabel,
  LembarDisposisiPaper,
  SPESIMEN_PARAF_DEFAULT,
  SuratCutiSheet,
  useTemplateRegistry,
} from '@/components/shared/SuratPaperTemplates';
import type { RoleConfig, ScreenKey } from './mobile-roles.data';

export const BADGE_SURAT: Record<string, { cls: string; icon: string; text: string }> = {
  baru: { cls: 'badge-info', icon: 'ph-sparkle', text: 'Baru' },
  disposisi: { cls: 'badge-warn', icon: 'ph-paper-plane-tilt', text: 'Disposisi' },
  proses: { cls: 'badge-neutral', icon: 'ph-hourglass-medium', text: 'Diproses' },
  selesai: { cls: 'badge-ok', icon: 'ph-check', text: 'Selesai' },
  terlambat: { cls: 'badge-danger', icon: 'ph-warning', text: 'Terlambat' },
};

const ALUR_TAHAP_RINGKAS = [
  'Pencatatan',
  'Disposisi',
  'Distribusi',
  'Tindak lanjut',
  'Arsip',
];

function indeksTahapSurat(s: SuratRecord): number {
  if (s.status === 'baru') return 0;
  if (s.status === 'disposisi') return 1;
  if (s.status === 'proses' || s.status === 'terlambat') {
    return s.tindakLanjut?.catatan ? 3 : 2;
  }
  if (s.status === 'selesai') return 4;
  return 0;
}

export interface MobileSuratListProps {
  suratList: SuratRecord[];
  filteredSurat: SuratRecord[];
  stats: {
    total: number;
    menunggu: number;
    diproses: number;
    selesai: number;
    terlambat: number;
  };
  suratQuery: string;
  setSuratQuery: (q: string) => void;
  suratStatusFilter: string;
  setSuratStatusFilter: (f: string) => void;
  onSelectSurat: (agenda: string) => void;
  navigateTo: (screen: ScreenKey) => void;
}

export function MobileSuratListView({
  filteredSurat,
  stats,
  suratQuery,
  setSuratQuery,
  suratStatusFilter,
  setSuratStatusFilter,
  onSelectSurat,
  navigateTo,
}: MobileSuratListProps): React.ReactNode {
  return (
    <>
      <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
        <i className="ph ph-arrow-left" /> Ruang kerja
      </button>
      <div className="page-hero">
        <span className="eyebrow">Pengendalian surat</span>
        <h1>Surat dan disposisi</h1>
        <p>Lima tahap dari surat diterima di loket hingga tersimpan di dalam arsip kecamatan.</p>
      </div>

      {/* .sr-metrics wajib 3 direct children per .sr-metric: i + b + span */}
      <div className="sr-metrics">
        <div className="sr-metric">
          <i className="ph ph-tray" />
          <b className="tabular">{String(stats.total).padStart(2, '0')}</b>
          <span>Total surat</span>
        </div>
        <div className="sr-metric warn">
          <i className="ph ph-paper-plane-tilt" />
          <b className="tabular">{String(stats.menunggu).padStart(2, '0')}</b>
          <span>Perlu disposisi</span>
        </div>
        <div className="sr-metric danger">
          <i className="ph ph-warning" />
          <b className="tabular">{String(stats.terlambat).padStart(2, '0')}</b>
          <span>Lewat tenggat</span>
        </div>
        <div className="sr-metric ok">
          <i className="ph ph-archive" />
          <b className="tabular">{String(stats.selesai).padStart(2, '0')}</b>
          <span>Terarsip</span>
        </div>
      </div>

      <div className="sr-saring">
        <div className="sr-cari">
          <i className="ph ph-magnifying-glass" />
          <input
            type="search"
            placeholder="Cari nomor agenda, perihal, atau pengirim"
            value={suratQuery}
            onChange={(e) => setSuratQuery(e.target.value)}
          />
        </div>
        <div className="chips">
          {[
            { k: 'all', l: 'Semua' },
            { k: 'baru', l: 'Baru' },
            { k: 'disposisi', l: 'Disposisi' },
            { k: 'proses', l: 'Diproses' },
            { k: 'terlambat', l: 'Terlambat' },
            { k: 'selesai', l: 'Selesai' },
          ].map((it) => (
            <button
              key={it.k}
              type="button"
              className={`chip ${suratStatusFilter === it.k ? 'is-on' : ''}`}
              onClick={() => setSuratStatusFilter(it.k)}
            >
              {it.l}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary btn-block"
        type="button"
        onClick={() => navigateTo('suratBaru')}
      >
        <i className="ph ph-plus" /> Catat surat masuk baru
      </button>

      {filteredSurat.length === 0 ? (
        <div className="sr-kosong">
          <i className="ph ph-Selection-slash" />
          <b>Tidak ada surat yang cocok</b>
          <span>Coba kata kunci lain atau pilih saringan Semua.</span>
        </div>
      ) : (
        <div className="doc-list">
          {filteredSurat.map((s) => {
            const b = BADGE_SURAT[s.status] ?? BADGE_SURAT.baru!;
            const tujuanLabel = getTargetDisposisiLabel(s.disposisi?.diteruskan);
            return (
              <button
                key={s.agenda}
                type="button"
                className="sr-row"
                onClick={() => onSelectSurat(s.agenda)}
              >
                <span className="sr-row-top">
                  <span className="sr-agenda tabular">{s.agenda}</span>
                  <span className={`badge ${b.cls}`}>
                    <i className={`ph ${b.icon}`} />
                    {b.text}
                  </span>
                </span>
                <span className="sr-row-title">{s.perihal}</span>
                <span className="sr-row-sub">
                  <i className="ph ph-buildings" /> {s.instansiTujuan || s.asal}
                </span>
                <span className="sr-row-meta">
                  <span>
                    <i className="ph ph-calendar-blank" />{' '}
                    <span className="tabular">{s.tanggalSurat}</span>
                  </span>
                  <span>
                    <i className="ph ph-paper-plane-tilt" /> {tujuanLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export interface MobileSuratDetailProps {
  surat: SuratRecord;
  roleMeta: RoleConfig;
  disposisiRoleKey: 'operator' | 'sekcam' | 'camat';
  onUpdateDisposisiSekcam: (payload: {
    catatanSekcam: string;
    rekomendasiTujuan: string[];
    parafSekcamImage: string;
  }) => Promise<void>;
  onUpdateDisposisiCamat: (payload: {
    instruksi: string;
    tanggalDisposisi: string;
    tanggalPenyelesaian: string;
    diteruskan: string[];
    kembalikanKepada: string;
    kembalikanTanggal: string;
    parafMode: 'spesimen' | 'canvas' | 'tte_barcode';
    parafImage: string;
  }) => Promise<void>;
  onUpdateTindakLanjut: (catatan: string) => Promise<void>;
  onUpdateArsip: (kode: string, lokasi: string) => Promise<void>;
  onOpenPrintPreview: () => void;
  onOpenTemplateCustomizer: () => void;
  navigateTo: (screen: ScreenKey) => void;
}

export function MobileSuratDetailView({
  surat,
  roleMeta,
  disposisiRoleKey,
  onUpdateDisposisiCamat,
  onUpdateDisposisiSekcam,
  onUpdateTindakLanjut,
  onUpdateArsip,
  onOpenPrintPreview,
  onOpenTemplateCustomizer,
  navigateTo,
}: MobileSuratDetailProps): React.ReactNode {
  const registry = useTemplateRegistry();
  const daftarTujuan = registry.lembarDisposisi.daftarTujuan;

  const [selectedTujuan, setSelectedTujuan] = useState<string[]>(
    surat.disposisi?.diteruskan ?? ['Kasubag_Umum'],
  );
  const [instruksiText, setInstruksiText] = useState<string>(
    surat.disposisi?.instruksi ?? 'Tindak lanjuti sesuai ketentuan dan laporkan hasilnya.',
  );
  const [catatanSekcamText, setCatatanSekcamText] = useState<string>(
    surat.disposisi?.catatanSekcam ??
      'Telah ditelaah Sekretariat, mohon arahan dan disposisi Bapak Camat.',
  );
  const [tglPenyelesaian, setTglPenyelesaian] = useState<string>(
    surat.tanggalPenyelesaian || '25-06-2026',
  );
  const [parafMode, setParafMode] = useState<'spesimen' | 'canvas' | 'tte_barcode'>(
    (surat.disposisi?.parafMode as 'spesimen' | 'canvas' | 'tte_barcode') || 'spesimen',
  );
  const [tlNote, setTlNote] = useState<string>(surat.tindakLanjut?.catatan ?? '');
  const [arsipKode, setArsipKode] = useState<string>(
    surat.arsip?.kodeKlasifikasi || '005/UM/2026',
  );
  const [arsipLokasi, setArsipLokasi] = useState<string>(
    surat.arsip?.lokasiFisik || 'Lemari Arsip Seksi Pemerintahan B-2',
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<boolean>(false);

  const b = BADGE_SURAT[surat.status] ?? BADGE_SURAT.baru!;
  const idx = indeksTahapSurat(surat);

  const toggleTujuan = (kode: string) => {
    setSelectedTujuan((prev) =>
      prev.includes(kode) ? prev.filter((item) => item !== kode) : [...prev, kode],
    );
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
  };

  return (
    <>
      <button className="sr-balik" type="button" onClick={() => navigateTo('surat')}>
        <i className="ph ph-arrow-left" /> Daftar surat
      </button>

      <div className="page-hero">
        <span className="eyebrow">
          Nomor agenda <span className="tabular">{surat.agenda}</span>
        </span>
        <h1>{surat.perihal}</h1>
        <p>{surat.instansiTujuan || surat.asal}</p>
      </div>

      {/* Stepper 5 Tahap (.sr-alur > .sr-step) */}
      <div className="sr-alur" aria-label="Tahap surat">
        {ALUR_TAHAP_RINGKAS.map((nama, i) => {
          const state =
            i < idx
              ? 'is-done'
              : i === idx
                ? surat.status === 'terlambat'
                  ? 'is-late'
                  : 'is-now'
                : '';
          const ico =
            i < idx ? 'ph-check' : i === idx ? 'ph-radio-button' : 'ph-circle';
          return (
            <div key={nama} className={`sr-step ${state}`}>
              <span className="sr-step-dot">
                <i className={`ph ${ico}`} />
              </span>
              <span className="sr-step-txt">{nama}</span>
            </div>
          );
        })}
      </div>

      {/* Metadata Surat (.lihat-meta > .meta-baris) */}
      <div className="lihat-meta">
        <div className="meta-baris">
          <span>Status saat ini</span>
          <span>
            <span className={`badge ${b.cls}`}>
              <i className={`ph ${b.icon}`} />
              {b.text}
            </span>
          </span>
        </div>
        <div className="meta-baris">
          <span>Nomor surat</span>
          <span className="mono">{surat.nomorSurat}</span>
        </div>
        <div className="meta-baris">
          <span>Tanggal surat</span>
          <span className="tabular">{surat.tanggalSurat}</span>
        </div>
        <div className="meta-baris">
          <span>Tanggal diterima</span>
          <span className="tabular">{surat.tanggalPenerimaan || surat.tanggalAgenda}</span>
        </div>
        <div className="meta-baris">
          <span>Sifat &amp; lampiran</span>
          <span>
            {getSifatText(surat.sifat)} · {surat.lampiran || 'Tidak ada'}
          </span>
        </div>
        <div className="meta-baris">
          <span>Tenggat penyelesaian</span>
          <span className="tabular">{surat.tanggalPenyelesaian || 'Belum ditetapkan'}</span>
        </div>
        {surat.arsip?.kodeKlasifikasi ? (
          <div className="meta-baris">
            <span>Lokasi arsip</span>
            <span className="mono">
              {surat.arsip.kodeKlasifikasi} · {surat.arsip.lokasiFisik}
            </span>
          </div>
        ) : null}
      </div>

      {/* Lampiran Naskah (.sr-naskah) */}
      <div className="sr-naskah">
        <div className="sr-naskah-ikon">
          <i className="ph ph-file-pdf" />
        </div>
        <div className="sr-naskah-isi">
          <b>Naskah_{surat.agenda.replace(/\//g, '_')}.pdf</b>
          <span className="tabular">420 KB · Tersimpan di Single Dossier</span>
        </div>
        <span className="badge badge-ok">
          <i className="ph ph-seal-check" /> Sah
        </span>
      </div>

      {/* Tombol Pratinjau Lembar Disposisi Fisik Kertas & Kostumisasi Template */}
      <div className="ekspor-tombol">
        <button className="btn btn-primary" type="button" onClick={onOpenPrintPreview}>
          <i className="ph ph-printer" /> Pratinjau Kertas Disposisi
        </button>
        <button className="btn btn-ghost" type="button" onClick={onOpenTemplateCustomizer}>
          <i className="ph ph-sliders" /> Kostumisasi Template
        </button>
      </div>

      {/* Kartu Ringkasan Lembar Disposisi Tercatat (.sr-kartu) */}
      <div className="sr-kartu">
        <div className="sr-kartu-head">
          <i className="ph ph-paper-plane-tilt" />
          <b>Lembar disposisi pimpinan</b>
        </div>
        <div className="lihat-meta">
          <div className="meta-baris">
            <span>1. Paraf Sekcam</span>
            <span>
              <span
                className={`badge ${surat.disposisi?.diketahuiSekcam ? 'badge-ok' : 'badge-neutral'}`}
              >
                {surat.disposisi?.diketahuiSekcam ? 'Diparaf Sekcam' : 'Menunggu telaah'}
              </span>
            </span>
          </div>
          <div className="meta-baris">
            <span>Telaah Sekcam</span>
            <span>{surat.disposisi?.catatanSekcam || 'Belum ada catatan telaah.'}</span>
          </div>
          <div className="meta-baris">
            <span>Diteruskan kepada</span>
            <span>{getTargetDisposisiLabel(surat.disposisi?.diteruskan)}</span>
          </div>
          <div className="meta-baris">
            <span>Instruksi Camat</span>
            <span>{surat.disposisi?.instruksi || 'Menunggu arahan Camat.'}</span>
          </div>
        </div>

        {surat.disposisi?.hasParaf ? (
          <div className="ttd-terpasang ada" style={{ marginTop: '10px' }}>
            {surat.disposisi?.parafMode === 'tte_barcode' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={generateTTEBarcodeSVG(
                    surat.agenda,
                    registry.lembarDisposisi.namaTertanda2,
                  )}
                  alt="QR TTE BSrE"
                  style={{ width: '56px', height: '56px', flexShrink: 0 }}
                />
                <div className="ttd-meta">
                  <b>TTE BSrE BSSN Terverifikasi</b>
                  <span className="tabular">
                    {registry.lembarDisposisi.namaTertanda2} ({registry.lembarDisposisi.jabatanTertanda2})
                  </span>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={surat.disposisi?.parafImage || SPESIMEN_PARAF_DEFAULT.Camat}
                  alt="Tanda tangan Camat"
                />
                <div className="ttd-meta">
                  <b>Disahkan oleh {registry.lembarDisposisi.namaTertanda2}</b>
                  <span className="tabular">
                    {registry.lembarDisposisi.jabatanTertanda2} · {surat.disposisi?.tanggalDisposisi || surat.tanggalAgenda}
                  </span>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Panel Interaktif Lembar Disposisi & Tanda Tangan (.sr-panel) */}
      <div className="sr-panel">
        <div className="sr-panel-head">
          <i className="ph ph-paper-plane-tilt" />
          <div>
            <b>
              {disposisiRoleKey === 'sekcam'
                ? 'Telaah & Paraf Sekretaris Camat'
                : 'Lembar Disposisi Camat Tamalate'}
            </b>
            <span>
              Pilih tujuan disposisi ({daftarTujuan.length} jabatan dari skema template) dan bubuhkan paraf
            </span>
          </div>
        </div>

        <div className="sr-field">
          <span>Diteruskan kepada</span>
          <div className="sr-tujuan">
            {daftarTujuan.map((t, idxTujuan) => {
              const checked = selectedTujuan.includes(t.id);
              return (
                <label
                  key={t.id}
                  className={`sr-tujuan-item ${checked ? 'is-on' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTujuan(t.id)}
                  />
                  <span>
                    {idxTujuan + 1}. {t.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {disposisiRoleKey === 'sekcam' ? (
          <label className="sr-field">
            <span>Catatan telaah Sekretaris Camat</span>
            <textarea
              rows={2}
              value={catatanSekcamText}
              onChange={(e) => setCatatanSekcamText(e.target.value)}
            />
          </label>
        ) : (
          <>
            <label className="sr-field">
              <span>Isi disposisi / instruksi pimpinan</span>
              <textarea
                rows={3}
                value={instruksiText}
                onChange={(e) => setInstruksiText(e.target.value)}
              />
            </label>
            <label className="sr-field">
              <span>Tenggat penyelesaian</span>
              <input
                type="text"
                value={tglPenyelesaian}
                onChange={(e) => setTglPenyelesaian(e.target.value)}
              />
            </label>
          </>
        )}

        {/* Blok Spesimen / Goresan Tanda Tangan / TTE (.ttd-blok) */}
        <div className="ttd-blok">
          <div className="ttd-kepala">
            <div>
              <b>Metode pengesahan tanda tangan</b>
              <span>
                {roleMeta.nama} · NIP {roleMeta.nip}
              </span>
            </div>
            <span className="badge badge-info">
              <i className="ph ph-signature" /> Siap sahkan
            </span>
          </div>

          <div className="chips">
            <button
              type="button"
              className={`chip ${parafMode === 'spesimen' ? 'is-on' : ''}`}
              onClick={() => setParafMode('spesimen')}
            >
              Spesimen Vault
            </button>
            <button
              type="button"
              className={`chip ${parafMode === 'canvas' ? 'is-on' : ''}`}
              onClick={() => setParafMode('canvas')}
            >
              Goresan Langsung
            </button>
            <button
              type="button"
              className={`chip ${parafMode === 'tte_barcode' ? 'is-on' : ''}`}
              onClick={() => setParafMode('tte_barcode')}
            >
              TTE QR BSrE
            </button>
          </div>

          {parafMode === 'canvas' ? (
            <>
              <div className="ttd-kanvas-bungkus">
                <canvas
                  ref={canvasRef}
                  className="ttd-kanvas"
                  width={320}
                  height={120}
                  onPointerDown={(e) => {
                    drawingRef.current = true;
                    const c = canvasRef.current;
                    if (!c) return;
                    const rect = c.getBoundingClientRect();
                    const ctx = c.getContext('2d');
                    if (!ctx) return;
                    ctx.strokeStyle = '#0F172A';
                    ctx.lineWidth = 2.2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                  }}
                  onPointerMove={(e) => {
                    if (!drawingRef.current) return;
                    const c = canvasRef.current;
                    if (!c) return;
                    const rect = c.getBoundingClientRect();
                    const ctx = c.getContext('2d');
                    if (!ctx) return;
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                  }}
                  onPointerUp={() => {
                    drawingRef.current = false;
                  }}
                />
                <span className="ttd-petunjuk">Goreskan tanda tangan di kotak ini</span>
              </div>
              <div className="ttd-aksi">
                <button className="btn btn-ghost" type="button" onClick={clearCanvas}>
                  <i className="ph ph-eraser" /> Bersihkan
                </button>
              </div>
            </>
          ) : null}
        </div>

        {disposisiRoleKey === 'sekcam' ? (
          <button
            className="btn btn-primary btn-block"
            type="button"
            onClick={async () => {
              await onUpdateDisposisiSekcam({
                catatanSekcam: catatanSekcamText,
                rekomendasiTujuan: selectedTujuan,
                parafSekcamImage: SPESIMEN_PARAF_DEFAULT.Sekcam ?? '',
              });
            }}
          >
            <i className="ph ph-seal-check" /> Bubuhkan Paraf Sekcam
          </button>
        ) : (
          <button
            className="btn btn-primary btn-block"
            type="button"
            onClick={async () => {
              let img = SPESIMEN_PARAF_DEFAULT.Camat ?? '';
              if (parafMode === 'canvas' && canvasRef.current) {
                img = canvasRef.current.toDataURL('image/png');
              }
              await onUpdateDisposisiCamat({
                instruksi: instruksiText,
                tanggalDisposisi: surat.tanggalAgenda || '19-06-2026',
                tanggalPenyelesaian: tglPenyelesaian,
                diteruskan: selectedTujuan,
                kembalikanKepada: 'Subbagian Umum dan Kepegawaian',
                kembalikanTanggal: tglPenyelesaian,
                parafMode,
                parafImage: img,
              });
            }}
          >
            <i className="ph ph-paper-plane-tilt" /> Sahkan &amp; Kirim Disposisi
          </button>
        )}
      </div>

      {/* Panel Tindak Lanjut & Arsip */}
      {surat.status === 'proses' || surat.status === 'disposisi' ? (
        <div className="sr-panel">
          <div className="sr-panel-head">
            <i className="ph ph-note-pencil" />
            <div>
              <b>Laporan tindak lanjut</b>
              <span>Catat hasil koordinasi atau penyelesaian surat</span>
            </div>
          </div>
          <label className="sr-field">
            <span>Ringkasan hasil tindak lanjut</span>
            <textarea
              rows={2}
              placeholder="Contoh: Telah dikoordinasikan dan diselesaikan sesuai disposisi."
              value={tlNote}
              onChange={(e) => setTlNote(e.target.value)}
            />
          </label>
          <button
            className="btn btn-primary btn-block"
            type="button"
            onClick={() =>
              onUpdateTindakLanjut(
                tlNote || 'Tindak lanjut selesai dilaksanakan sesuai disposisi pimpinan.',
              )
            }
          >
            <i className="ph ph-check-circle" /> Simpan Tindak Lanjut
          </button>
        </div>
      ) : null}

      {surat.status === 'selesai' && !surat.arsip?.kodeKlasifikasi ? (
        <div className="sr-panel">
          <div className="sr-panel-head">
            <i className="ph ph-archive" />
            <div>
              <b>Simpan ke dalam arsip</b>
              <span>Tetapkan kode klasifikasi dan lokasi fisik map arsip</span>
            </div>
          </div>
          <label className="sr-field">
            <span>Kode klasifikasi</span>
            <input
              type="text"
              value={arsipKode}
              onChange={(e) => setArsipKode(e.target.value)}
            />
          </label>
          <label className="sr-field">
            <span>Lokasi fisik penyimpanan</span>
            <input
              type="text"
              value={arsipLokasi}
              onChange={(e) => setArsipLokasi(e.target.value)}
            />
          </label>
          <button
            className="btn btn-primary btn-block"
            type="button"
            onClick={() => onUpdateArsip(arsipKode, arsipLokasi)}
          >
            <i className="ph ph-seal-check" /> Tetapkan Sebagai Terarsip
          </button>
        </div>
      ) : null}

      {/* Riwayat Penanganan (.sec > .log > .log-baris) */}
      <div className="sec">
        <div className="sec-head">
          <h2>Riwayat penanganan</h2>
          <span className="sec-link tabular">{surat.auditTrail.length} catatan</span>
        </div>
        <div className="log">
          {surat.auditTrail.map((a, i) => (
            <div key={`${a.timestamp}-${i}`} className="log-baris">
              <span className="log-titik" />
              <div className="log-isi">
                <b>{a.action}</b>
                <span>
                  {a.user}
                  {a.note ? ` · ${a.note}` : ''}
                </span>
              </div>
              <span className="log-waktu tabular">{a.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export interface MobileAgendaViewProps {
  suratList: SuratRecord[];
  onSelectSurat: (agenda: string) => void;
  onOpenPrintAgenda: () => void;
  navigateTo: (screen: ScreenKey) => void;
}

export function MobileAgendaView({
  suratList,
  onSelectSurat,
  onOpenPrintAgenda,
  navigateTo,
}: MobileAgendaViewProps): React.ReactNode {
  const registry = useTemplateRegistry();
  const tpl = registry.bukuAgenda;

  return (
    <>
      <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
        <i className="ph ph-arrow-left" /> Ruang kerja
      </button>
      <div className="page-hero">
        <span className="eyebrow">Register resmi</span>
        <h1>{tpl.judulDokumen}</h1>
        <p>
          Urutan nomor agenda, tanggal agenda, nomor surat, instansi tujuan, penanggung jawab, dan keterangan.
        </p>
      </div>

      <div className="ekspor-tombol">
        <button className="btn btn-primary" type="button" onClick={onOpenPrintAgenda}>
          <i className="ph ph-printer" /> Pratinjau Tabel 8 Kolom A4
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            const csv = generateBukuAgendaCSV(suratList, tpl);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'buku-agenda-kecamatan-tamalate-2026.csv';
            a.click();
          }}
        >
          <i className="ph ph-download-simple" /> Unduh CSV
        </button>
      </div>

      <div className="agenda-daftar">
        {suratList.map((s) => {
          const b = BADGE_SURAT[s.status] ?? BADGE_SURAT.baru!;
          const pj = s.penanggungJawab || getTargetDisposisiLabel(s.disposisi?.diteruskan);
          return (
            <button
              key={s.agenda}
              type="button"
              className="agenda-kartu"
              onClick={() => onSelectSurat(s.agenda)}
            >
              <div className="agenda-atas">
                <span className="sr-agenda tabular">{s.agenda}</span>
                <span className={`badge ${b.cls}`}>
                  <i className={`ph ${b.icon}`} />
                  {b.text}
                </span>
              </div>
              <div className="agenda-perihal">{s.perihal}</div>
              <div className="agenda-meta">
                <div>
                  <span>{tpl.kolomTabel[6]?.label ?? 'Tgl Penerimaan'}</span>
                  <b className="tabular">{s.tanggalAgenda || s.tanggalPenerimaan}</b>
                </div>
                <div>
                  <span>{tpl.kolomTabel[2]?.label ?? 'Nomor Surat'}</span>
                  <b className="mono">{s.nomorSurat}</b>
                </div>
                <div>
                  <span>{tpl.kolomTabel[3]?.label ?? 'Tanggal Surat'}</span>
                  <b className="tabular">{s.tanggalSurat}</b>
                </div>
                <div>
                  <span>{tpl.kolomTabel[1]?.label ?? 'Instansi Tujuan'}</span>
                  <b>{s.instansiTujuan || s.asal}</b>
                </div>
                <div>
                  <span>{tpl.kolomTabel[5]?.label ?? 'Penanggung Jawab'}</span>
                  <b>{pj}</b>
                </div>
                <div>
                  <span>{tpl.kolomTabel[7]?.label ?? 'Keterangan'}</span>
                  <b>{s.keterangan || s.disposisi?.instruksi || 'DiTL'}</b>
                </div>
              </div>
              <div className="agenda-kaki">
                <span>
                  <i className="ph ph-paper-plane-tilt" /> {pj}
                </span>
                <span className="agenda-taut">
                  Buka lembar disposisi <i className="ph ph-caret-right" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export interface MobileAuditViewProps {
  suratList: SuratRecord[];
  onSelectSurat: (agenda: string) => void;
  navigateTo: (screen: ScreenKey) => void;
}

export function MobileAuditView({
  suratList,
  onSelectSurat,
  navigateTo,
}: MobileAuditViewProps): React.ReactNode {
  const flatLogs = suratList.flatMap((s) =>
    s.auditTrail.map((a) => ({
      agenda: s.agenda,
      perihal: s.perihal,
      timestamp: a.timestamp,
      action: a.action,
      user: a.user,
      note: a.note,
    })),
  );

  return (
    <>
      <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
        <i className="ph ph-arrow-left" /> Ruang kerja
      </button>
      <div className="page-hero">
        <span className="eyebrow">Transparansi proses</span>
        <h1>Jejak audit persuratan</h1>
        <p>Setiap perubahan status surat terekam bersama waktu, pelaku, dan catatan tindakan.</p>
      </div>

      <div className="audit-global">
        {flatLogs.map((a, idx) => (
          <button
            key={`${a.agenda}-${idx}`}
            type="button"
            className="audit-global-butir"
            onClick={() => onSelectSurat(a.agenda)}
          >
            <span className="log-titik" />
            <span className="audit-global-isi">
              <b>{a.action}</b>
              <span>
                {a.user}
                {a.note ? ` · ${a.note}` : ''}
              </span>
              <span className="audit-global-surat">
                <span className="tabular">{a.agenda}</span> · {a.perihal}
              </span>
            </span>
            <span className="log-waktu tabular">{a.timestamp}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export interface MobileEksporViewProps {
  suratList: SuratRecord[];
  activeSurat: SuratRecord | undefined;
  activeSuratAgenda: string;
  setActiveSuratAgenda: (agenda: string) => void;
  eksporJenis: 'agenda' | 'disposisi' | 'cuti';
  setEksporJenis: (jenis: 'agenda' | 'disposisi' | 'cuti') => void;
  disposisiRoleKey: 'operator' | 'sekcam' | 'camat';
  onOpenTemplateCustomizer: () => void;
  navigateTo: (screen: ScreenKey) => void;
}

export function MobileEksporView({
  suratList,
  activeSurat,
  activeSuratAgenda,
  setActiveSuratAgenda,
  eksporJenis,
  setEksporJenis,
  disposisiRoleKey,
  onOpenTemplateCustomizer,
  navigateTo,
}: MobileEksporViewProps): React.ReactNode {
  const registry = useTemplateRegistry();

  return (
    <>
      <button className="sr-balik" type="button" onClick={() => navigateTo('kerja')}>
        <i className="ph ph-arrow-left" /> Ruang kerja
      </button>
      <div className="page-hero">
        <span className="eyebrow">Cetak dan arsip fisik</span>
        <h1>Ekspor laporan</h1>
        <p>
          Pratinjau memakai tata letak dokumen resmi yang dapat dikostumisasi dan dicetak ke A4/F4.
        </p>
      </div>

      {/* Pilihan Jenis Dokumen (.ekspor-pilih > button.ekspor-opsi) */}
      <div className="ekspor-pilih" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <button
          className={`ekspor-opsi ${eksporJenis === 'agenda' ? 'is-on' : ''}`}
          type="button"
          onClick={() => setEksporJenis('agenda')}
        >
          <i className="ph ph-notebook" />
          <b>Buku agenda</b>
          <span>8 kolom A4</span>
        </button>
        <button
          className={`ekspor-opsi ${eksporJenis === 'disposisi' ? 'is-on' : ''}`}
          type="button"
          onClick={() => setEksporJenis('disposisi')}
        >
          <i className="ph ph-file-text" />
          <b>Disposisi</b>
          <span>Formulir F4/A4</span>
        </button>
        <button
          className={`ekspor-opsi ${eksporJenis === 'cuti' ? 'is-on' : ''}`}
          type="button"
          onClick={() => setEksporJenis('cuti')}
        >
          <i className="ph ph-calendar-plus" />
          <b>Surat Cuti</b>
          <span>8 tabel resmi</span>
        </button>
      </div>

      {eksporJenis === 'disposisi' ? (
        <div className="ekspor-daftar" style={{ minWidth: 0, maxWidth: '100%' }}>
          <label className="sr-field" style={{ minWidth: 0, maxWidth: '100%' }}>
            <span>Pilih surat untuk lembar disposisi</span>
            <select
              style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
              value={activeSuratAgenda}
              onChange={(e) => setActiveSuratAgenda(e.target.value)}
            >
              {suratList.map((s) => (
                <option key={s.agenda} value={s.agenda}>
                  {s.agenda} - {s.perihal.slice(0, 32)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="ekspor-gulir">
        <i className="ph ph-arrows-horizontal" />
        <span>
          {eksporJenis === 'agenda'
            ? 'Geser ke samping untuk melihat seluruh 8 kolom buku agenda.'
            : eksporJenis === 'disposisi'
              ? 'Pratinjau lembar disposisi resmi dua kolom (geser bila perlu).'
              : 'Formulir permintaan dan pemberian cuti resmi 8 tabel.'}
        </span>
      </div>

      {/* Bingkai Pratinjau Anti-Overflow (.ekspor-bingkai) */}
      <div
        className={`ekspor-bingkai ${eksporJenis === 'agenda' ? 'is-agenda' : 'is-disposisi'}`}
        style={{ overflowX: 'auto', maxWidth: '100%' }}
      >
        {eksporJenis === 'agenda' ? (
          <BukuAgendaExportSheet suratList={suratList} />
        ) : eksporJenis === 'disposisi' && activeSurat ? (
          <LembarDisposisiPaper surat={activeSurat} roleKey={disposisiRoleKey} />
        ) : (
          <SuratCutiSheet />
        )}
      </div>

      <div className="ekspor-tombol">
        <button className="btn btn-primary" type="button" onClick={() => window.print()}>
          <i className="ph ph-printer" /> Cetak / Simpan PDF
        </button>
        {eksporJenis === 'agenda' ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              const csv = generateBukuAgendaCSV(suratList, registry.bukuAgenda);
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'buku-agenda-kecamatan-tamalate-2026.csv';
              a.click();
            }}
          >
            <i className="ph ph-file-csv" /> Unduh CSV
          </button>
        ) : (
          <button className="btn btn-ghost" type="button" onClick={onOpenTemplateCustomizer}>
            <i className="ph ph-sliders" /> Kostumisasi Template
          </button>
        )}
      </div>
    </>
  );
}
