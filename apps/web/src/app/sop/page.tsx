import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { SOPS } from '@/lib/sops';

export const metadata = { title: 'SOP Kecamatan Tamalate' };

export default function SopIndexPage(): ReactNode {
  return (
    <AppShell active="/sop">
      <div className="space-y-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Sumber Resmi</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Enam SOP Kecamatan Tamalate</h1>
          <p className="mt-2 max-w-2xl text-sm muted leading-relaxed">
            Tujuh PDF SOP resmi Kecamatan Tamalate, revisi 1 Desember 2023, efektif 2 Januari 2024. Enam di antaranya menjadi inti proses bisnis sistem ini.
          </p>
        </header>

        <section aria-label="Daftar SOP" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOPS.map((sop) => (
            <Link
              key={sop.code}
              href={'/sop/' + sop.code}
              className="group surface rounded-xl p-5 transition-colors hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-accent">{sop.code}</span>
                    <span className="rounded-full border border-line px-2 py-0.5 text-[10px] muted">{sop.aktivitas} aktivitas</span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold leading-snug group-hover:text-accent transition-colors">
                    {sop.nama}
                  </h2>
                  <p className="mt-1.5 font-mono text-[11px] muted">{sop.nomor}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] muted">{sop.subjectType}</span>
                <span className="text-xs text-accent group-hover:underline">Buka workspace</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
