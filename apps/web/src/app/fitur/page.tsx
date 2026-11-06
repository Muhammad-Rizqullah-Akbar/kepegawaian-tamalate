import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { FeatureCard } from '@/components/FeatureCard';
import { tryFetchApi } from '@/lib/api';
import type { FeatureListPayload } from '@/lib/features';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Katalog Fitur' };

export default async function FeaturesPage(): Promise<ReactNode> {
  const payload = await tryFetchApi<FeatureListPayload>('/api/v1/features');
  const items = payload?.items ?? [];
  const groups = payload?.groups ?? [];

  return (
    <AppShell active="/fitur">
      <div className="space-y-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Katalog</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">76 Fitur, 12 Kelompok</h1>
          <p className="mt-2 max-w-2xl text-sm muted leading-relaxed">
            Setiap fitur dipetakan ke satu subject type, satu atau beberapa kernel, dan gerbang lulus sendiri.
            Data ditarik langsung dari API.
          </p>
        </header>

        {groups.length > 0 && (
          <section aria-label="Ringkasan kelompok" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {groups.map((g) => (
              <div key={g.group} className="surface rounded-lg px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-accent">{g.group}</span>
                  <span className="text-[11px] muted tabular">{g.total} fitur</span>
                </div>
                <p className="mt-1 text-xs font-medium leading-snug truncate">{g.label}</p>
              </div>
            ))}
          </section>
        )}

        {items.length === 0 ? (
          <div className="surface rounded-xl p-8 text-center">
            <p className="text-sm font-medium">Katalog tidak dapat dimuat</p>
            <p className="mt-1 text-xs muted">Pastikan API berjalan di port 4000.</p>
          </div>
        ) : (
          <section aria-label="Daftar fitur" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((f) => (
              <FeatureCard key={f.code} feature={f} />
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
