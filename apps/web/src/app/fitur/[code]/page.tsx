import Link from 'next/link';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { fetchApi, ApiFailure } from '@/lib/api';
import { STATUS_LABEL, type FeatureDef } from '@/lib/features';
import { routeFor } from '@/lib/feature-routes';

export const dynamic = 'force-dynamic';

export default async function FeatureDetailPage({ params }: { params: Promise<{ code: string }> }): Promise<ReactNode> {
  const { code } = await params;
  const upper = code.toUpperCase();

  let feature: FeatureDef;
  try {
    feature = await fetchApi<FeatureDef>('/api/v1/features/' + encodeURIComponent(upper));
  } catch (error) {
    if (error instanceof ApiFailure && error.status === 404) notFound();
    throw error;
  }

  const route = routeFor(upper);

  return (
    <AppShell active="/fitur">
      <div className="space-y-6">
        <nav aria-label="Breadcrumb" className="text-xs muted">
          <Link href="/fitur" className="hover:text-accent transition-colors">Katalog Fitur</Link>
          <span aria-hidden="true" className="mx-1.5">/</span>
          <span className="font-mono">{feature.code}</span>
        </nav>

        <header className="surface rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-accent">{feature.code}</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] muted">Kelompok {feature.group}</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] muted">{STATUS_LABEL[feature.status]}</span>
          </div>
          <h1 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">{feature.title}</h1>
        </header>

        {route ? (
          <section aria-label="Eksekusi" className="surface rounded-xl p-5 border-l-4 border-l-accent">
            <p className="text-xs uppercase tracking-wide text-accent font-semibold">Layar Eksekusi</p>
            <p className="mt-2 text-sm">{route.note}</p>
            <Link
              href={route.href}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accentfg hover:opacity-90 transition-opacity"
            >
              {route.label}
              <span aria-hidden="true">&#8594;</span>
            </Link>
            <p className="mt-3 font-mono text-[11px] muted">{route.href}</p>
          </section>
        ) : (
          <section aria-label="Status eksekusi" className="surface rounded-xl p-5 border-l-4 border-l-amber-500">
            <p className="text-xs uppercase tracking-wide text-amber-500 font-semibold">Belum Ada Layar</p>
            <p className="mt-2 text-sm muted">
              Fitur ini terdaftar di katalog dan subject type-nya sudah dikunci di K5, tetapi layar eksekusi belum dibangun.
            </p>
          </section>
        )}

        <section aria-label="Detail teknis" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="surface rounded-xl p-4">
            <p className="text-xs muted">Subject Type</p>
            <p className="mt-1 font-mono text-sm font-medium">{feature.subjectType}</p>
            <p className="mt-2 text-[11px] muted">Terdaftar di K5 sebelum fitur boleh dibangun.</p>
          </div>
          <div className="surface rounded-xl p-4">
            <p className="text-xs muted">Kernel Terkait</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {feature.kernels.map((k) => (
                <span key={k} className="rounded border border-line px-2 py-0.5 font-mono text-xs">{k}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
