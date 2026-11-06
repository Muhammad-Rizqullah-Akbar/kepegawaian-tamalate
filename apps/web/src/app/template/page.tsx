import Link from 'next/link';
import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { TEMPLATE_CATALOG } from '@/lib/template-catalog';

export const metadata = { title: 'Template Studio - Kepegawaian Tamalate' };

export default function TemplateHubPage(): ReactNode {
  return (
    <DashboardShell active="template" crumb="Template Generator">
      <div className="page-head">
        <div>
          <div style={{ color: 'var(--muted)', fontSize: 12.5, fontWeight: 500 }}>Tata Naskah</div>
          <h1 className="page-title">Template Generator</h1>
          <p className="page-sub">
            Tiga dokumen resmi kecamatan, tersambung ke registri berversi di Postgres,
            pratinjau renderer produksi, dan ekspor PDF ber-SHA-256.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {TEMPLATE_CATALOG.map((t) => (
          <article key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{t.kode}</span>
              <span style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-pill)', padding: '1px 9px', fontSize: 10.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>{t.orientasi}</span>
            </div>
            <h2 style={{ marginTop: 10, fontSize: 16, fontWeight: 500, color: 'var(--heading)', letterSpacing: '-0.01em' }}>{t.nama}</h2>
            <p style={{ marginTop: 8, flex: 1, fontSize: 13, lineHeight: 1.55, color: 'var(--body-secondary)' }}>{t.ringkas}</p>
            <div style={{ marginTop: 12, display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--muted)' }}>
              <span>{t.format}</span>
              <span>{t.fieldKunci.length} field kunci</span>
            </div>
            <Link href={t.jalur} className="btn btn-primary btn-sm" style={{ marginTop: 16, alignSelf: 'flex-start' }}>
              Buka Studio <i className="ph ph-arrow-right" />
            </Link>
          </article>
        ))}
      </div>

      <section className="card">
        <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--heading)' }}>Cara kerja</h2>
        <ol style={{ marginTop: 10, paddingLeft: 18, display: 'grid', gap: 7, fontSize: 13, lineHeight: 1.6, color: 'var(--body-secondary)' }}>
          <li>Registri template dimuat dari localStorage, lalu disinkronkan ke backend lewat /api/v1/simulation/templates.</li>
          <li>Setiap perubahan masuk transaksi Postgres, cache Redis, arsip object store, indeks pencarian, dan entri audit berantai.</li>
          <li>Pratinjau memakai renderer React yang sama dengan dokumen produksi, bukan markup terpisah.</li>
          <li>Ekspor PDF mengirim outerHTML pratinjau ke /api/v1/simulation/render-pdf, lalu mengembalikan SHA-256 dan kunci arsip.</li>
        </ol>
      </section>
    </DashboardShell>
  );
}
