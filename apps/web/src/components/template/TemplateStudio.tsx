'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  LembarDisposisiPaper,
  BukuAgendaTable,
  SuratCutiSheet,
  useTemplateRegistry,
  generateBukuAgendaCSV,
} from '@/components/shared/SuratPaperTemplates';
import { TemplateCustomizerModal } from '@/components/shared/TemplateCustomizerModal';
import {
  SAMPLE_SURAT,
  SAMPLE_SURAT_LIST,
  SAMPLE_CUTI,
  exportHtmlToPdf,
  nodeToHtml,
  summarize,
  pickTemplate,
} from '@/lib/template-studio';
import type { TemplateId } from '@/lib/template-catalog';
import type { DocumentTemplateRegistry } from '@/lib/template-schema';

interface TemplateStudioProps {
  readonly id: TemplateId;
  readonly nama: string;
  readonly kode: string;
  readonly orientasi: string;
  readonly format: string;
  readonly fieldKunci: readonly string[];
}

type StatusKind = 'idle' | 'loading' | 'ok' | 'error';

const CHIP: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--r-pill)',
  padding: '2px 10px',
  fontSize: 11.5,
  fontWeight: 500,
  color: 'var(--muted)',
  background: 'var(--surface-soft)',
};

export function TemplateStudio(props: TemplateStudioProps) {
  const registry = useTemplateRegistry();
  const [isModalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<{ kind: StatusKind; pesan: string }>({
    kind: 'idle',
    pesan: '',
  });
  const [sha, setSha] = useState<string | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const template = useMemo(() => pickTemplate(registry, props.id), [registry, props.id]);
  const summary = useMemo(() => summarize(registry), [registry]);
  const row = summary.find((r) => r.id === props.id);

  const handleExportPdf = useCallback(async () => {
    setStatus({ kind: 'loading', pesan: 'Menyiapkan PDF...' });
    setSha(null);
    setS3Key(null);
    try {
      const html = nodeToHtml(previewRef.current);
      if (!html) {
        throw new Error('Preview belum dirender');
      }
      const result = await exportHtmlToPdf(template.namaTemplate, html);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Tamalate-' + props.id + '-' + Date.now() + '.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setSha(result.sha256);
      setS3Key(result.s3Key);
      setStatus({ kind: 'ok', pesan: 'PDF berhasil dibuat dan disimpan ke arsip.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kesalahan tidak dikenal';
      setStatus({ kind: 'error', pesan: msg });
    }
  }, [props.id, template.namaTemplate]);

  const handleExportCsv = useCallback(() => {
    if (props.id !== 'buku-agenda') return;
    const csv = generateBukuAgendaCSV(SAMPLE_SURAT_LIST);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buku-agenda-' + Date.now() + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setStatus({ kind: 'ok', pesan: 'CSV buku agenda berhasil diekspor.' });
  }, [props.id]);

  const handleRegistrySaved = useCallback((next: DocumentTemplateRegistry) => {
    setStatus({ kind: 'ok', pesan: 'Registri tersimpan. Versi surat cuti ' + next.suratCuti.versi });
  }, []);

  const statusColor =
    status.kind === 'error'
      ? { bg: 'var(--danger-soft)', border: 'var(--danger)', fg: 'var(--danger)' }
      : status.kind === 'ok'
        ? { bg: 'var(--success-soft)', border: 'var(--success)', fg: 'var(--success)' }
        : { bg: 'var(--surface-soft)', border: 'var(--hairline)', fg: 'var(--muted)' };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
        <Link href="/template" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Template Studio
        </Link>
        <span style={{ margin: '0 7px' }}>/</span>
        <span className="mono">{props.kode}</span>
      </nav>

      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
            <span className="mono" style={{ ...CHIP, color: 'var(--accent)', borderColor: 'var(--accent-soft)', background: 'var(--accent-soft)' }}>
              {props.kode}
            </span>
            <span style={CHIP}>{props.orientasi}</span>
            <span style={CHIP}>{props.format}</span>
            {row ? <span style={CHIP}>versi {row.versi}</span> : null}
          </div>
          <h1 className="page-title" style={{ marginTop: 0 }}>{template.namaTemplate}</h1>
          <p className="page-sub">{props.nama}</p>
        </div>
      </div>

      <section className="card" style={{ padding: 18, display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" onClick={() => setModalOpen(true)} className="btn btn-ghost">
            <i className="ph ph-sliders" /> Kustomisasi Template
          </button>
          <button type="button" onClick={handleExportPdf} disabled={status.kind === 'loading'} className="btn btn-primary">
            <i className="ph ph-file-pdf" /> {status.kind === 'loading' ? 'Merender...' : 'Ekspor PDF'}
          </button>
          {props.id === 'buku-agenda' ? (
            <button type="button" onClick={handleExportCsv} className="btn btn-ghost">
              <i className="ph ph-table" /> Ekspor CSV
            </button>
          ) : null}
        </div>

        {status.pesan ? (
          <div
            role="status"
            style={{
              borderRadius: 'var(--r-sm)',
              border: '1px solid ' + statusColor.border,
              background: statusColor.bg,
              color: statusColor.fg,
              padding: '8px 12px',
              fontSize: 13,
            }}
          >
            {status.pesan}
          </div>
        ) : null}

        {sha ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, fontSize: 12 }}>
            <div>
              <div style={{ color: 'var(--muted)', marginBottom: 3 }}>SHA-256 arsip</div>
              <div className="mono" style={{ wordBreak: 'break-all', color: 'var(--heading)' }}>{sha}</div>
            </div>
            {s3Key ? (
              <div>
                <div style={{ color: 'var(--muted)', marginBottom: 3 }}>Kunci object store</div>
                <div className="mono" style={{ wordBreak: 'break-all', color: 'var(--heading)' }}>{s3Key}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="card" style={{ padding: 18 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 }}>
          Field Kunci
        </p>
        <ul style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0 }}>
          {props.fieldKunci.map((f) => (
            <li key={f} className="mono" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-sm)', padding: '2px 8px', fontSize: 11.5, color: 'var(--body)' }}>
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section className="card" style={{ padding: 16 }} aria-label="Preview dokumen">
        <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 12 }}>
          Pratinjau Render
        </p>
        <div style={{ overflowX: 'auto' }}>
          <div ref={previewRef} data-template-preview={props.id} style={{ background: '#fff', color: '#000', padding: 12 }}>
            {props.id === 'lembar-disposisi' ? (
              <LembarDisposisiPaper surat={SAMPLE_SURAT} template={registry.lembarDisposisi} />
            ) : null}
            {props.id === 'buku-agenda' ? (
              <BukuAgendaTable suratList={SAMPLE_SURAT_LIST} template={registry.bukuAgenda} />
            ) : null}
            {props.id === 'surat-cuti' ? (
              <SuratCutiSheet {...SAMPLE_CUTI} template={registry.suratCuti} />
            ) : null}
          </div>
        </div>
      </section>

      <TemplateCustomizerModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        actorRole="Admin Tata Naskah"
        onSaved={handleRegistrySaved}
      />
    </div>
  );
}
