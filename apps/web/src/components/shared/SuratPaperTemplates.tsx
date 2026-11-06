'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SuratRecord } from '@/lib/workspace-api';
import {
  BukuAgendaTemplate,
  DEFAULT_DOCUMENT_TEMPLATES,
  DocumentTemplateRegistry,
  LembarDisposisiTemplate,
  SuratCutiTemplate,
  loadTemplateRegistry,
} from '@/lib/template-schema';

export function useTemplateRegistry(): DocumentTemplateRegistry {
  const [registry, setRegistry] = useState<DocumentTemplateRegistry>(() =>
    typeof window !== 'undefined' ? loadTemplateRegistry() : DEFAULT_DOCUMENT_TEMPLATES,
  );

  useEffect(() => {
    const refresh = () => setRegistry(loadTemplateRegistry());
    refresh();
    window.addEventListener('tamalate-templates-sync', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('tamalate-templates-sync', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return registry;
}

export const DAFTAR_TUJUAN_DISPOSISI = DEFAULT_DOCUMENT_TEMPLATES.lembarDisposisi.daftarTujuan.map(
  (r) => ({
    id: r.id,
    title: r.label,
    short: r.jabatan,
  }),
);

export const SPESIMEN_PARAF_DEFAULT: Record<string, string> = {
  Camat:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80">
        <path d="M18,58 C38,18 52,65 74,30 C92,10 105,54 128,36 C148,20 165,48 202,24" fill="none" stroke="#0044CC" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M42,64 L176,54" fill="none" stroke="#0044CC" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="4 3"/>
      </svg>`,
    ),
  Sekcam:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="70" viewBox="0 0 180 70">
        <path d="M22,50 C42,16 68,54 92,24 C112,8 128,46 158,28" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
    ),
};

export function getSifatText(sifat: string): string {
  const s = (sifat || 'B').toUpperCase();
  if (s === 'SR' || s === 'SANGAT RAHASIA') return 'Sangat Rahasia (SR)';
  if (s === 'R' || s === 'RAHASIA') return 'Rahasia / Penting (R)';
  return 'Biasa (B)';
}

export function getTargetDisposisiLabel(
  ids?: string[],
  customTemplate?: LembarDisposisiTemplate,
): string {
  const list = customTemplate?.daftarTujuan || DEFAULT_DOCUMENT_TEMPLATES.lembarDisposisi.daftarTujuan;
  if (!ids || !ids.length) return 'Kasubag. Umum dan Kepegawaian';
  const labels = ids
    .map((id) => list.find((r) => r.id === String(id))?.label)
    .filter(Boolean);
  return labels.length ? labels.join(', ') : 'Kasubag. Umum dan Kepegawaian';
}

export function generateTTEBarcodeSVG(agenda: string, pejabat: string): string {
  const cleanCode = String(agenda || '0042').replace(/\D/g, '') || '0042';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92" viewBox="0 0 92 92">
    <rect width="92" height="92" rx="6" fill="#FFFFFF" stroke="#061B31" stroke-width="2"/>
    <rect x="8" y="8" width="22" height="22" fill="none" stroke="#061B31" stroke-width="3"/>
    <rect x="13" y="13" width="12" height="12" fill="#061B31"/>
    <rect x="62" y="8" width="22" height="22" fill="none" stroke="#061B31" stroke-width="3"/>
    <rect x="67" y="13" width="12" height="12" fill="#061B31"/>
    <rect x="8" y="62" width="22" height="22" fill="none" stroke="#061B31" stroke-width="3"/>
    <rect x="13" y="67" width="12" height="12" fill="#061B31"/>
    <rect x="36" y="12" width="6" height="6" fill="#0066CC"/>
    <rect x="46" y="18" width="8" height="8" fill="#061B31"/>
    <rect x="36" y="28" width="18" height="6" fill="#061B31"/>
    <rect x="12" y="38" width="16" height="6" fill="#061B31"/>
    <rect x="36" y="38" width="20" height="18" rx="3" fill="#0066CC"/>
    <text x="46" y="50" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="8" font-weight="bold">BSrE</text>
    <rect x="62" y="38" width="18" height="6" fill="#061B31"/>
    <rect x="64" y="50" width="16" height="12" fill="#061B31"/>
    <rect x="36" y="62" width="10" height="18" fill="#061B31"/>
    <rect x="52" y="68" width="28" height="12" fill="#0066CC"/>
    <title>TTE BSrE ${cleanCode} - ${pejabat}</title>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateBukuAgendaCSV(
  suratList: SuratRecord[],
  template?: BukuAgendaTemplate,
): string {
  const tpl = template || loadTemplateRegistry().bukuAgenda;
  const activeCols = tpl.kolomTabel.filter((c) => c.enabled);
  const header = activeCols.map((c) => `"${c.label}"`).join(';');
  const rows = suratList.map((s, idx) => {
    const vals = activeCols.map((col) => {
      switch (col.key) {
        case 'no':
          return String(idx + 1);
        case 'instansiTujuan':
          return s.instansiTujuan || s.asal || '-';
        case 'nomorSurat':
          return s.nomorSurat || '-';
        case 'tanggalSurat':
          return s.tanggalSurat || '-';
        case 'perihal':
          return s.perihal || '-';
        case 'penanggungJawab':
          return s.penanggungJawab || 'Kasubag Umum dan Kepegawaian';
        case 'tanggalPenerimaan':
          return s.tanggalAgenda || s.tanggalPenerimaan || '-';
        case 'keterangan':
        default:
          return s.keterangan || s.disposisi?.instruksi || 'DiTL';
      }
    });
    return vals.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';');
  });
  return '\uFEFF' + [header, ...rows].join('\r\n');
}

export interface LembarDisposisiPaperProps {
  surat: SuratRecord;
  roleKey?: 'operator' | 'sekcam' | 'camat';
  isModal?: boolean;
  template?: LembarDisposisiTemplate;
  onCloseModal?: () => void;
  onOpenVaultVerify?: (surat: SuratRecord) => void;
  onPreviewRealDoc?: (surat: SuratRecord) => void;
  onSaveSekcam?: (payload: {
    catatanSekcam: string;
    rekomendasiTujuan: string[];
    parafSekcamImage: string;
  }) => void;
  onSaveCamat?: (payload: {
    instruksi: string;
    tanggalDisposisi: string;
    tanggalPenyelesaian: string;
    diteruskan: string[];
    kembalikanKepada: string;
    kembalikanTanggal: string;
    parafMode: 'canvas' | 'vault' | 'tte_barcode';
    parafImage: string;
  }) => void;
}

export function LembarDisposisiPaper({
  surat,
  roleKey = 'camat',
  isModal = false,
  template,
  onCloseModal,
  onOpenVaultVerify,
  onPreviewRealDoc,
  onSaveSekcam,
  onSaveCamat,
}: LembarDisposisiPaperProps) {
  const reg = useTemplateRegistry();
  const tpl = template || reg.lembarDisposisi;
  const d = surat.disposisi || {};

  const [catatanSekcam, setCatatanSekcam] = useState<string>(d.catatanSekcam || '');
  const [selectedTujuan, setSelectedTujuan] = useState<string[]>(
    d.diteruskan && d.diteruskan.length ? d.diteruskan : ['2'],
  );
  const [instruksi, setInstruksi] = useState<string>(d.instruksi || '');
  const [tglPenyelesaian, setTglPenyelesaian] = useState<string>(
    surat.tanggalPenyelesaian || '21-06-2026',
  );
  const [kembaliKepada, setKembaliKepada] = useState<string>(
    d.kembalikanKepada || 'Subbagian Umum dan Kepegawaian',
  );
  const [kembaliTanggal, setKembaliTanggal] = useState<string>(
    d.kembalikanTanggal || '21-06-2026',
  );
  const [parafMode, setParafMode] = useState<'canvas' | 'vault' | 'tte_barcode'>(
    d.parafMode || 'vault',
  );
  const [customParafImg, setCustomParafImg] = useState<string>(
    d.parafImage || SPESIMEN_PARAF_DEFAULT.Camat!,
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<boolean>(false);

  useEffect(() => {
    setCatatanSekcam(surat.disposisi?.catatanSekcam || '');
    setSelectedTujuan(
      surat.disposisi?.diteruskan && surat.disposisi.diteruskan.length
        ? surat.disposisi.diteruskan
        : ['2'],
    );
    setInstruksi(surat.disposisi?.instruksi || '');
    setTglPenyelesaian(surat.tanggalPenyelesaian || '21-06-2026');
    setKembaliKepada(surat.disposisi?.kembalikanKepada || 'Subbagian Umum dan Kepegawaian');
    setKembaliTanggal(surat.disposisi?.kembalikanTanggal || '21-06-2026');
    setParafMode(surat.disposisi?.parafMode || 'vault');
    setCustomParafImg(surat.disposisi?.parafImage || SPESIMEN_PARAF_DEFAULT.Camat!);
  }, [surat]);

  const toggleRecipient = (id: string) => {
    setSelectedTujuan((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawingRef.current = true;
    ctx.strokeStyle = '#0044CC';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setCustomParafImg(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const sifatUpper = (surat.sifat || 'B').toUpperCase();
  const isB = sifatUpper === 'B' || sifatUpper === 'BIASA';
  const isR = sifatUpper === 'R' || sifatUpper === 'RAHASIA' || sifatUpper === 'PENTING';
  const isSR = sifatUpper === 'SR' || sifatUpper === 'SANGAT RAHASIA' || sifatUpper === 'SEGERA';

  const activeRecipients = tpl.daftarTujuan.filter((r) => r.enabled);
  const interactive = Boolean(onSaveSekcam || onSaveCamat);

  return (
    <div>
      {/* Banner Notifikasi Dokumen Fisik Asli (Real PDF) */}
      {surat.berkasNama ? (
        <div
          className="no-print"
          style={{
            marginBottom: '12px',
            padding: '10px 14px',
            background: 'var(--surface-soft)',
            border: '1px solid var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ph ph-file-pdf" style={{ color: '#dc2626', fontSize: '20px' }} />
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                Naskah Dinas Asli Terlampir: <span className="mono">{surat.berkasNama}</span>
              </div>
              <div className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Ukuran Dokumen: {surat.berkasUkuran || '1.4 MB'} · Siap ditelaah oleh Pejabat Struktural
              </div>
            </div>
          </div>

          {onPreviewRealDoc ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onPreviewRealDoc(surat)}
              style={{ height: '30px', fontSize: '11.5px' }}
            >
              <i className="ph ph-eye" /> Buka Naskah Real (PDF)
            </button>
          ) : null}
        </div>
      ) : null}

      {isModal && (
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--hairline)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <span className="eyebrow">{tpl.kopInstansi} &middot; {tpl.kopUnit}</span>
            <h3 className="heading" style={{ fontSize: '18px' }}>
              {tpl.namaTemplate}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => window.print()}
            >
              <i className="ph ph-printer" /> Cetak / PDF
            </button>
            {onCloseModal && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onCloseModal}
              >
                <i className="ph ph-x" /> Tutup
              </button>
            )}
          </div>
        </div>
      )}

      <div className="lembar-disposisi-paper lembar-disposisi-card" id="lembarDisposisiPrintArea">
        <div className="ld-title disposisi-top-title">{tpl.judulDokumen}</div>

        <table className="ld-table">
          <tbody>
            <tr className="ld-row-top">
              <td style={{ width: '50%' }}>
                <div className="ld-field-label">{tpl.labelAgenda}</div>
                <div
                  className="ld-field-val mono"
                  style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}
                >
                  {surat.agenda}
                </div>
              </td>
              <td style={{ width: '50%' }}>
                <div className="ld-field-label">{tpl.labelSifat}</div>
                <div className="ld-sifat-group">
                  <span className="ld-sifat-item">
                    <span className={`ld-checkbox ${isB ? 'checked' : ''}`}>{isB ? '✓' : ''}</span>{' '}
                    Biasa
                  </span>
                  <span className="ld-sifat-item">
                    <span className={`ld-checkbox ${isR ? 'checked' : ''}`}>{isR ? '✓' : ''}</span>{' '}
                    Rahasia
                  </span>
                  <span className="ld-sifat-item">
                    <span className={`ld-checkbox ${isSR ? 'checked' : ''}`}>{isSR ? '✓' : ''}</span>{' '}
                    Sangat Rahasia
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan={2} style={{ padding: 0 }}>
                <table className="ld-meta-subtable">
                  <tbody>
                    <tr>
                      <td className="ld-meta-key">Tanggal Penerimaan</td>
                      <td className="ld-meta-sep">:</td>
                      <td className="ld-meta-val">{surat.tanggalPenerimaan || surat.tanggalAgenda}</td>
                      <td className="ld-meta-key">Tanggal Penyelesaian</td>
                      <td className="ld-meta-sep">:</td>
                      <td className="ld-meta-val">
                        {interactive ? (
                          <input
                            type="text"
                            className="disp-inline-input mono"
                            value={tglPenyelesaian}
                            onChange={(e) => setTglPenyelesaian(e.target.value)}
                          />
                        ) : (
                          surat.tanggalPenyelesaian || '....................'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="ld-meta-key">Tanggal dan Nomor Surat</td>
                      <td className="ld-meta-sep">:</td>
                      <td className="ld-meta-val" colSpan={4}>
                        {surat.tanggalSurat} &nbsp;/&nbsp;{' '}
                        <span className="mono">{surat.nomorSurat}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="ld-meta-key">Dari (Asal Surat)</td>
                      <td className="ld-meta-sep">:</td>
                      <td className="ld-meta-val" colSpan={4}>
                        <strong>{surat.asal}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="ld-meta-key">Ringkasan Isi (Perihal)</td>
                      <td className="ld-meta-sep">:</td>
                      <td className="ld-meta-val" colSpan={4}>
                        {surat.perihal}
                      </td>
                    </tr>
                    <tr>
                      <td className="ld-meta-key">Lampiran</td>
                      <td className="ld-meta-sep">:</td>
                      <td className="ld-meta-val">{surat.lampiran || '-'}</td>
                      <td className="ld-meta-key">Derajat</td>
                      <td className="ld-meta-sep">:</td>
                      <td className="ld-meta-val">{isB ? 'Biasa' : 'Segera / Rahasia'}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <th className="ld-col-head" style={{ width: '52%' }}>
                {tpl.judulKolomTujuan}
              </th>
              <th className="ld-col-head" style={{ width: '48%' }}>
                {tpl.judulKolomInstruksi}
              </th>
            </tr>

            <tr>
              <td style={{ verticalAlign: 'top', padding: '10px 12px' }}>
                <ul className="ld-recipient-list">
                  {activeRecipients.map((r, idx) => {
                    const checked = selectedTujuan.includes(r.id);
                    const recom = (d.rekomendasiSekcam || []).includes(r.id);
                    return (
                      <li
                        key={r.id}
                        className={`ld-recipient-item ${checked ? 'is-checked' : ''}`}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (interactive) toggleRecipient(r.id);
                        }}
                      >
                        <span className="ld-recipient-num">{idx + 1}.</span>
                        <span className={`ld-checkbox ${checked ? 'checked' : ''}`}>
                          {checked ? '✓' : ''}
                        </span>
                        <span>
                          {r.label}
                          {recom && (
                            <span
                              style={{
                                marginLeft: '6px',
                                fontSize: '10px',
                                color: '#0D9488',
                                fontWeight: 600,
                              }}
                            >
                              [Usul Sekcam]
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td className="ld-instruksi-box" style={{ verticalAlign: 'top', padding: '10px 12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0F766E', marginBottom: '4px' }}>
                    {tpl.labelCatatanSekcam}
                  </div>
                  {interactive && roleKey === 'sekcam' ? (
                    <textarea
                      className="disp-textarea"
                      rows={2}
                      value={catatanSekcam}
                      onChange={(e) => setCatatanSekcam(e.target.value)}
                      placeholder="Catatan telaah Sekretaris Camat..."
                    />
                  ) : (
                    <div
                      style={{
                        padding: '6px 8px',
                        background: '#F8FAFC',
                        borderLeft: '3px solid #0D9488',
                        fontSize: '11.5px',
                      }}
                    >
                      {catatanSekcam || 'Belum ada catatan telaah Sekcam.'}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Instruksi / Arahan {tpl.jabatanTertanda2}:
                </div>
                {interactive ? (
                  <>
                    <div
                      className="no-print"
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}
                    >
                      {tpl.pilihanInstruksiCepat.map((chipText) => (
                        <button
                          key={chipText}
                          type="button"
                          className="chip"
                          style={{ height: '24px', fontSize: '10.5px', padding: '0 8px' }}
                          onClick={() =>
                            setInstruksi((prev) => (prev ? `${prev}. ${chipText}` : chipText))
                          }
                        >
                          + {chipText}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="disp-textarea"
                      rows={3}
                      value={instruksi}
                      onChange={(e) => setInstruksi(e.target.value)}
                      placeholder="Tuliskan instruksi disposisi pimpinan..."
                    />
                  </>
                ) : instruksi ? (
                  <div className="ld-instruksi-text">{instruksi}</div>
                ) : (
                  <div className="ld-instruksi-empty">Belum ada instruksi disposisi pimpinan.</div>
                )}

                {interactive && (
                  <div
                    className="no-print"
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px dashed var(--hairline)',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                      Metode Pengesahan Tanda Tangan:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {(
                        [
                          { k: 'vault', l: 'Spesimen Vault', i: 'ph-shield-check' },
                          { k: 'canvas', l: 'Coret Langsung', i: 'ph-pen' },
                          { k: 'tte_barcode', l: 'TTE Barcode BSrE', i: 'ph-qr-code' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.k}
                          type="button"
                          className={`chip ${parafMode === m.k ? 'is-on' : ''}`}
                          style={{ height: '26px', fontSize: '11px' }}
                          onClick={() => setParafMode(m.k)}
                        >
                          <i className={`ph ${m.i}`} /> {m.l}
                        </button>
                      ))}
                    </div>

                    {parafMode === 'canvas' && (
                      <div style={{ marginBottom: '8px' }}>
                        <canvas
                          ref={canvasRef}
                          width={260}
                          height={90}
                          onPointerDown={startDraw}
                          onPointerMove={moveDraw}
                          onPointerUp={endDraw}
                          style={{
                            width: '100%',
                            height: '90px',
                            background: '#F8FAFC',
                            border: '1px dashed #64748B',
                            borderRadius: '6px',
                            touchAction: 'none',
                            cursor: 'crosshair',
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ marginTop: '4px', height: '24px', fontSize: '11px' }}
                          onClick={clearCanvas}
                        >
                          Bersihkan Coretan
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {onSaveSekcam && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            onSaveSekcam({
                              catatanSekcam,
                              rekomendasiTujuan: selectedTujuan,
                              parafSekcamImage: SPESIMEN_PARAF_DEFAULT.Sekcam!,
                            })
                          }
                        >
                          <i className="ph ph-check" /> Paraf Sekcam (Tertanda 1)
                        </button>
                      )}
                      {onSaveCamat && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            onSaveCamat({
                              instruksi: instruksi || 'DiTL sesuai ketentuan',
                              tanggalDisposisi: '19-06-2026',
                              tanggalPenyelesaian: tglPenyelesaian,
                              diteruskan: selectedTujuan,
                              kembalikanKepada: kembaliKepada,
                              kembalikanTanggal: kembaliTanggal,
                              parafMode,
                              parafImage:
                                parafMode === 'tte_barcode'
                                  ? generateTTEBarcodeSVG(surat.agenda, tpl.namaTertanda2)
                                  : customParafImg,
                            })
                          }
                        >
                          <i className="ph ph-seal-check" /> Sahkan Disposisi Camat (Tertanda 2)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </td>
            </tr>

            {/* DUA KOTAK TANDA TANGAN (TERTANDA 1 SEKCAM DI KIRI & TERTANDA 2 CAMAT DI KANAN) */}
            <tr>
              <td style={{ width: '50%', padding: '10px 12px', verticalAlign: 'top' }}>
                <div className="ld-field-label" style={{ marginBottom: '6px' }}>
                  {tpl.labelTertanda1}
                </div>
                {d.diketahuiSekcam ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '6px 8px',
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '6px',
                    }}
                  >
                    <img
                      src={d.parafSekcamImage || SPESIMEN_PARAF_DEFAULT.Sekcam}
                      alt="Paraf Sekcam"
                      style={{
                        maxHeight: '36px',
                        maxWidth: '88px',
                        objectFit: 'contain',
                      }}
                    />
                    <div style={{ fontSize: '11px', lineHeight: 1.35 }}>
                      <strong style={{ color: '#14532D', display: 'block' }}>
                        DIKETAHUI SEKRETARIS CAMAT
                      </strong>
                      <span style={{ color: '#166534' }}>
                        {d.parafSekcamOleh || tpl.namaTertanda1}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
                    Belum ada paraf mengetahui dari {tpl.jabatanTertanda1}.
                  </div>
                )}
              </td>
              <td style={{ width: '50%', padding: '10px 12px', verticalAlign: 'top' }}>
                <div className="ld-field-label" style={{ marginBottom: '6px' }}>
                  {tpl.labelTertanda2}
                </div>
                {d.hasParaf ? (
                  d.parafMode === 'tte_barcode' ? (
                    <div className="tte-bsre-stamp">
                      <img
                        src={generateTTEBarcodeSVG(surat.agenda, tpl.namaTertanda2)}
                        alt="QR TTE BSrE"
                        style={{ width: '44px', height: '44px' }}
                      />
                      <div className="tte-bsre-meta">
                        <strong>TERTANDA ELEKTRONIK BSrE - BSSN</strong>
                        <div>{d.parafOleh || tpl.namaTertanda2}</div>
                        <div className="tte-hash">
                          Agenda {surat.agenda} &middot; {d.tanggalDisposisi || '19-06-2026'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="ld-paraf-signed">
                      <img
                        src={d.parafImage || SPESIMEN_PARAF_DEFAULT.Camat}
                        alt="Tanda Tangan Camat"
                        className="ld-paraf-img-preview"
                      />
                      <div style={{ fontSize: '11px', lineHeight: 1.35 }}>
                        <strong style={{ color: '#061B31', display: 'block' }}>
                          DISAHKAN {tpl.jabatanTertanda2.toUpperCase()}
                        </strong>
                        <span style={{ color: '#334155' }}>
                          {d.parafOleh || tpl.namaTertanda2} &middot;{' '}
                          {d.tanggalDisposisi || '19-06-2026'}
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                    Menunggu pengesahan &amp; tanda tangan {tpl.jabatanTertanda2}...
                  </div>
                )}
                {onOpenVaultVerify && d.hasParaf && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm no-print"
                    style={{ marginTop: '6px', fontSize: '11px', height: '26px' }}
                    onClick={() => onOpenVaultVerify(surat)}
                  >
                    <i className="ph ph-shield-check" /> Periksa Keaslian Vault
                  </button>
                )}
              </td>
            </tr>

            <tr className="ld-footer-row">
              <td colSpan={2}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    {tpl.labelKembaliKepada}{' '}
                    {interactive ? (
                      <input
                        type="text"
                        className="disp-inline-input"
                        value={kembaliKepada}
                        onChange={(e) => setKembaliKepada(e.target.value)}
                      />
                    ) : (
                      <strong>{kembaliKepada}</strong>
                    )}
                  </span>
                  <span>
                    {tpl.labelTanggalKembali}{' '}
                    {interactive ? (
                      <input
                        type="text"
                        className="disp-inline-input mono"
                        style={{ width: '110px' }}
                        value={kembaliTanggal}
                        onChange={(e) => setKembaliTanggal(e.target.value)}
                      />
                    ) : (
                      <strong>{kembaliTanggal}</strong>
                    )}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="ld-footnote">{tpl.catatanKaki}</div>
      </div>
    </div>
  );
}

export function BukuAgendaTable({
  suratList,
  activeAgendaId,
  template,
  onSelectSurat,
  onOpenDisposisiModal,
}: {
  suratList: SuratRecord[];
  activeAgendaId?: string | undefined;
  template?: BukuAgendaTemplate;
  onSelectSurat?: (agenda: string) => void;
  onOpenDisposisiModal?: (surat: SuratRecord) => void;
}) {
  const reg = useTemplateRegistry();
  const tpl = template || reg.bukuAgenda;
  const activeCols = tpl.kolomTabel.filter((c) => c.enabled);

  return (
    <div className="ops-panel">
      <div className="data-table-scroll">
        <table className="buku-agenda-table">
          <thead>
            <tr>
              {activeCols.map((col) => (
                <th key={col.key} style={{ width: `${col.widthPercent}%` }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suratList.map((s, idx) => {
              const isSel = s.agenda === activeAgendaId;
              return (
                <tr
                  key={s.agenda}
                  style={{
                    background: isSel ? 'var(--accent-soft)' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (onSelectSurat) onSelectSurat(s.agenda);
                    if (onOpenDisposisiModal) onOpenDisposisiModal(s);
                  }}
                >
                  {activeCols.map((col) => {
                    switch (col.key) {
                      case 'no':
                        return (
                          <td key={col.key} className="col-no mono">
                            {idx + 1}
                          </td>
                        );
                      case 'instansiTujuan':
                        return <td key={col.key}>{s.instansiTujuan || s.asal}</td>;
                      case 'nomorSurat':
                        return (
                          <td key={col.key} className="col-nosurat mono">
                            {s.nomorSurat}
                          </td>
                        );
                      case 'tanggalSurat':
                        return (
                          <td key={col.key} className="col-tgl tabular">
                            {s.tanggalSurat}
                          </td>
                        );
                      case 'perihal':
                        return <td key={col.key}>{s.perihal}</td>;
                      case 'penanggungJawab':
                        return (
                          <td key={col.key} className="col-pj">
                            {s.penanggungJawab ||
                              getTargetDisposisiLabel(s.disposisi?.diteruskan, reg.lembarDisposisi)}
                          </td>
                        );
                      case 'tanggalPenerimaan':
                        return (
                          <td key={col.key} className="col-tgl tabular">
                            {s.tanggalAgenda || s.tanggalPenerimaan}
                          </td>
                        );
                      case 'keterangan':
                      default:
                        return (
                          <td key={col.key} className="col-ket">
                            {s.keterangan || s.disposisi?.instruksi || 'DiTL'}
                          </td>
                        );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BukuAgendaExportSheet({
  suratList,
  template,
}: {
  suratList: SuratRecord[];
  template?: BukuAgendaTemplate;
}) {
  const reg = useTemplateRegistry();
  const tpl = template || reg.bukuAgenda;
  const activeCols = tpl.kolomTabel.filter((c) => c.enabled);

  return (
    <div className="buku-export-sheet" id="bukuAgendaPrintArea">
      <div className="buku-export-kop">
        <div className="kop-pemkot">{tpl.kopPemerintah}</div>
        <div className="kop-kecamatan">{tpl.kopKecamatan}</div>
        <div className="kop-judul">{tpl.judulDokumen}</div>
        <div className="kop-alamat">{tpl.alamatKantor}</div>
      </div>

      <table className="buku-export-table">
        <thead>
          <tr>
            {activeCols.map((col) => (
              <th key={col.key} style={{ width: `${col.widthPercent}%` }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {suratList.map((s, idx) => (
            <tr key={s.agenda}>
              {activeCols.map((col) => {
                switch (col.key) {
                  case 'no':
                    return (
                      <td key={col.key} className="col-center mono">
                        {idx + 1}
                      </td>
                    );
                  case 'instansiTujuan':
                    return <td key={col.key}>{s.instansiTujuan || s.asal}</td>;
                  case 'nomorSurat':
                    return (
                      <td key={col.key} className="mono">
                        {s.nomorSurat}
                      </td>
                    );
                  case 'tanggalSurat':
                    return (
                      <td key={col.key} className="col-center tabular">
                        {s.tanggalSurat}
                      </td>
                    );
                  case 'perihal':
                    return <td key={col.key}>{s.perihal}</td>;
                  case 'penanggungJawab':
                    return (
                      <td key={col.key}>
                        {s.penanggungJawab ||
                          getTargetDisposisiLabel(s.disposisi?.diteruskan, reg.lembarDisposisi)}
                      </td>
                    );
                  case 'tanggalPenerimaan':
                    return (
                      <td key={col.key} className="col-center tabular">
                        {s.tanggalAgenda || s.tanggalPenerimaan}
                      </td>
                    );
                  case 'keterangan':
                  default:
                    return (
                      <td key={col.key}>{s.keterangan || s.disposisi?.instruksi || 'DiTL'}</td>
                    );
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="buku-export-sign">
        <div>
          <div>Mengetahui,</div>
          <div style={{ fontWeight: 700 }}>{tpl.jabatanKiri}</div>
          <div className="sign-space" />
          <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{tpl.namaPejabatKiri}</div>
          <div>{tpl.pangkatPejabatKiri}</div>
          <div className="mono">{tpl.nipPejabatKiri}</div>
        </div>
        <div>
          <div>{tpl.kotaTanggal}, 19 Juni 2026</div>
          <div style={{ fontWeight: 700 }}>{tpl.jabatanKanan}</div>
          <div className="sign-space" />
          <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{tpl.namaPejabatKanan}</div>
          <div>{tpl.pangkatPejabatKanan}</div>
          <div className="mono">{tpl.nipPejabatKanan}</div>
        </div>
      </div>
    </div>
  );
}

export interface SuratCutiFormProps {
  nama?: string;
  nip?: string;
  jabatan?: string;
  masaKerja?: string;
  unitKerja?: string;
  jenisNomor?: number;
  alasan?: string;
  selama?: string;
  mulai?: string;
  sampai?: string;
  sisaN?: number;
  sisaN1?: number;
  alamat?: string;
  telepon?: string;
  tanggalSurat?: string;
  nomorNaskah?: string;
  putusanAtasan?: 'DISETUJUI' | 'PERUBAHAN' | 'DITANGGUHKAN' | 'TIDAK DISETUJUI';
  putusanPejabat?: 'DISETUJUI' | 'PERUBAHAN' | 'DITANGGUHKAN' | 'TIDAK DISETUJUI';
  template?: SuratCutiTemplate;
}

/**
 * Formulir Permohonan dan Pemberian Cuti (SURAT CUTI 2026 - 8 Tabel Proporsional)
 * Persis mengikuti BerkasUI.formulirCuti pada berkas-ui.js dan berkas.css
 */
export function SuratCutiSheet(props: SuratCutiFormProps) {
  const reg = useTemplateRegistry();
  const tpl = props.template || reg.suratCuti;
  const jenisList = tpl.daftarJenisCuti;
  const jenisAktif = props.jenisNomor || 1;

  const renderCheck = (aktif: boolean) => (
    <>
      <span className="ct-kotak ct-layar">
        {aktif ? <i className="ph ph-check" /> : null}
      </span>
      <span className="ct-kotak ct-cetak">{aktif ? '☑' : '☐'}</span>
    </>
  );

  const renderColGroup = (widths: number[]) => {
    const total = widths.reduce((a, b) => a + b, 0);
    return (
      <colgroup>
        {widths.map((w, idx) => (
          <col key={idx} style={{ width: `${((w / total) * 100).toFixed(2)}%` }} />
        ))}
      </colgroup>
    );
  };

  const renderJenisCell = (no: number) => {
    const j = jenisList.find((x) => x.nomorFormulir === no);
    if (!j) return null;
    const isChecked = jenisAktif === no;
    return (
      <>
        <td className="ct-sel-opt">{`${no}. ${j.namaFormulir}`}</td>
        <td className="ct-sel-kotak">{renderCheck(isChecked)}</td>
      </>
    );
  };

  const namaFormulirUpper = (no: number) => {
    const j = jenisList.find((x) => x.nomorFormulir === no);
    return j ? j.namaFormulir.toUpperCase() : '';
  };

  const putusanOpsi = ['DISETUJUI', 'PERUBAHAN', 'DITANGGUHKAN', 'TIDAK DISETUJUI'] as const;
  const atasanPutusan = props.putusanAtasan || 'DISETUJUI';
  const pejabatPutusan = props.putusanPejabat || 'DISETUJUI';

  return (
    <div
      className="ct-formulir"
      id="suratCutiPrintArea"
      style={{
        maxWidth: '210mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        gap: '6px',
        padding: '12px 14px',
      }}
    >
      <div className="ct-kop">
        <div className="ct-kop-tanggal">
          {tpl.kotaSurat}, {props.tanggalSurat || '19 Juni 2026'}
        </div>
        <div>Kepada</div>
        <div className="ct-kop-yth">{tpl.tujuanYth}</div>
        <div className="ct-kop-cq">{tpl.tujuanCqBaris1}</div>
        <div className="ct-kop-cq">{tpl.tujuanCqBaris2}</div>
        <div className="ct-kop-di">Di -</div>
        <div className="ct-kop-di">{tpl.tujuanDi}</div>
      </div>

      {/* TABEL 1: DATA PEGAWAI */}
      <table className="ct-tabel ct-tabel-data">
        {renderColGroup([1926, 3206, 1596, 2760])}
        <tbody>
          <tr>
            <th className="ct-judul" colSpan={4}>
              {tpl.judulBagianDataPegawai}
            </th>
          </tr>
          <tr>
            <td className="ct-lbl">Nama</td>
            <td className="ct-nilai">{props.nama || 'Budi Hartono, S.Sos'}</td>
            <td className="ct-lbl">NIP</td>
            <td className="ct-nilai tabular">{props.nip || '19850101 201001 1 001'}</td>
          </tr>
          <tr>
            <td className="ct-lbl">Jabatan</td>
            <td className="ct-nilai">{props.jabatan || 'Kasubag Umum dan Kepegawaian'}</td>
            <td className="ct-lbl">Masa Kerja</td>
            <td className="ct-nilai">{props.masaKerja || '16 Tahun 05 Bulan'}</td>
          </tr>
          <tr>
            <td className="ct-lbl">Unit Kerja</td>
            <td className="ct-nilai" colSpan={3}>
              {props.unitKerja || 'Kecamatan Tamalate Pemerintah Kota Makassar'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABEL 2: JENIS CUTI YANG DIAMBIL */}
      <table className="ct-tabel ct-tabel-jenis">
        {renderColGroup([2723, 2182, 2355, 2228])}
        <tbody>
          <tr>
            <th className="ct-judul" colSpan={4}>
              {tpl.judulBagianJenisCuti}
            </th>
          </tr>
          <tr>
            {renderJenisCell(1)}
            {renderJenisCell(2)}
          </tr>
          <tr>
            {renderJenisCell(3)}
            {renderJenisCell(4)}
          </tr>
          <tr>
            {renderJenisCell(5)}
            {renderJenisCell(6)}
          </tr>
        </tbody>
      </table>

      {/* TABEL 3: ALASAN CUTI */}
      <table className="ct-tabel ct-tabel-alasan">
        {renderColGroup([9488])}
        <tbody>
          <tr>
            <th className="ct-judul">{tpl.judulBagianAlasanCuti}</th>
          </tr>
          <tr>
            <td className="ct-nilai">
              {props.alasan || 'Keperluan keluarga dan istirahat tahunan sesuai hak kepegawaian.'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABEL 4: LAMA CUTI */}
      <table className="ct-tabel ct-tabel-lama">
        {renderColGroup([1334, 1656, 1560, 1970, 618, 2350])}
        <tbody>
          <tr>
            <th className="ct-judul" colSpan={6}>
              {tpl.judulBagianLamaCuti}
            </th>
          </tr>
          <tr>
            <td className="ct-lbl">Selama</td>
            <td className="ct-nilai">{props.selama || '3 hari'}</td>
            <td className="ct-lbl">Mulai Tanggal</td>
            <td className="ct-nilai tabular">{props.mulai || '24-06-2026'}</td>
            <td className="ct-lbl">s/d</td>
            <td className="ct-nilai tabular">{props.sampai || '26-06-2026'}</td>
          </tr>
        </tbody>
      </table>

      {/* TABEL 5: CATATAN CUTI */}
      <table className="ct-tabel ct-tabel-catatan">
        {renderColGroup([938, 802, 2376, 4408, 964])}
        <tbody>
          <tr>
            <th className="ct-judul" colSpan={5}>
              {tpl.judulBagianCatatanCuti}
            </th>
          </tr>
          <tr>
            <td className="ct-catatan-item" colSpan={2}>
              1. {namaFormulirUpper(1)}
            </td>
            <td className="ct-catatan-sisa">{props.sisaN ?? 12} hari</td>
            <td className="ct-catatan-item">2. {namaFormulirUpper(2)}</td>
            <td className="ct-catatan-pinggir" />
          </tr>
          <tr>
            <td className="ct-catatan-kepala">Tahun</td>
            <td className="ct-catatan-kepala">Sisa</td>
            <td className="ct-catatan-kepala">Keterangan</td>
            <td className="ct-catatan-item">3. {namaFormulirUpper(3)}</td>
            <td className="ct-catatan-pinggir" />
          </tr>
          <tr>
            <td className="ct-nilai tabular">2026</td>
            <td className="ct-nilai tabular">{props.sisaN ?? 12} hari</td>
            <td className="ct-nilai">Sisa tahun lalu {props.sisaN1 ?? 6} hari</td>
            <td className="ct-catatan-item">4. {namaFormulirUpper(4)}</td>
            <td className="ct-catatan-pinggir" />
          </tr>
          <tr>
            <td className="ct-kosong" />
            <td className="ct-kosong" />
            <td className="ct-kosong" />
            <td className="ct-catatan-item">5. {namaFormulirUpper(5)}</td>
            <td className="ct-catatan-pinggir" />
          </tr>
          <tr>
            <td className="ct-kosong" />
            <td className="ct-kosong" />
            <td className="ct-kosong" />
            <td className="ct-catatan-item">6. {namaFormulirUpper(6)}</td>
            <td className="ct-catatan-pinggir" />
          </tr>
        </tbody>
      </table>

      {/* TABEL 6: ALAMAT SELAMA MENJALANKAN CUTI */}
      <table className="ct-tabel ct-tabel-alamat">
        {renderColGroup([4898, 1682, 2908])}
        <tbody>
          <tr>
            <th className="ct-judul" colSpan={3}>
              {tpl.judulBagianAlamatCuti}
            </th>
          </tr>
          <tr>
            <td className="ct-nilai">
              {props.alamat || 'Jl. Danau Tanjung Bunga Utara No. 181, Kec. Tamalate, Makassar'}
            </td>
            <td className="ct-lbl">Telp</td>
            <td className="ct-nilai tabular">{props.telepon || '0812-4100-2910'}</td>
          </tr>
          <tr>
            <td className="ct-kosong" />
            <td className="ct-tanda-sel" colSpan={2}>
              <div>Hormat Saya,</div>
              <div className="ct-tanda-ruang" />
              <div className="ct-tanda-nama">{props.nama || 'Budi Hartono, S.Sos'}</div>
              <div className="ct-tanda-nip">Nip. {props.nip || '19850101 201001 1 001'}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABEL 7: PERTIMBANGAN ATASAN LANGSUNG */}
      <table className="ct-tabel ct-tabel-putusan">
        {renderColGroup([1783, 1941, 2101, 3663])}
        <tbody>
          <tr>
            <th className="ct-judul" colSpan={4}>
              {tpl.judulBagianPertimbanganAtasan}
            </th>
          </tr>
          <tr>
            {putusanOpsi.map((x) => (
              <td key={x} className="ct-sel-putusan">
                {renderCheck(x === atasanPutusan)}
                <span>{x}</span>
              </td>
            ))}
          </tr>
          <tr className="ct-ruang">
            <td colSpan={4} />
          </tr>
          <tr>
            <td className="ct-kosong" colSpan={3} />
            <td className="ct-tanda-sel">
              <div className="ct-tanda-jabatan">{tpl.atasanDefaultJabatan}</div>
              <div className="ct-tanda-ruang" />
              <div className="ct-tanda-nama">{tpl.atasanDefaultNama}</div>
              <div className="ct-tanda-nip">Nip. {tpl.atasanDefaultNip}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABEL 8: KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI */}
      <table className="ct-tabel ct-tabel-putusan ct-tabel-keputusan">
        {renderColGroup([1782, 1747, 1737, 4222])}
        <tbody>
          <tr>
            <th className="ct-judul" colSpan={4}>
              {tpl.judulBagianKeputusanPejabat}
            </th>
          </tr>
          <tr>
            {putusanOpsi.map((x) => (
              <td key={x} className="ct-sel-putusan">
                {renderCheck(x === pejabatPutusan)}
                <span>{x}</span>
              </td>
            ))}
          </tr>
          <tr className="ct-ruang">
            <td colSpan={4} />
          </tr>
          <tr>
            <td className="ct-kosong" colSpan={3} />
            <td className="ct-tanda-sel">
              <div className="ct-tanda-jabatan">{tpl.pejabatDefaultJabatan}</div>
              <div className="ct-tanda-ruang" />
              <div className="ct-tanda-nama">{tpl.pejabatDefaultNama}</div>
              <div className="ct-tanda-pangkat">Pangkat : {tpl.pejabatDefaultPangkat}</div>
              <div className="ct-tanda-nip">Nip. {tpl.pejabatDefaultNip}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="ct-nomor-naskah">
        Nomor naskah:{' '}
        <span className="tabular">{props.nomorNaskah || '800.1.11.4 / 042 / KT / VI / 2026'}</span>
      </div>
    </div>
  );
}
