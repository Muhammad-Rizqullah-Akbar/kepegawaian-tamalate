import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { CreateSubmissionForm } from '@/components/CreateSubmissionForm';
import { StateBadge } from '@/components/StateBadge';
import { tryFetchApi } from '@/lib/api';
import { SOP_FIELDS } from '@/lib/sop-fields';
import { SOPS_INDEX } from '@/lib/sops';
import type { PersonView } from '@/lib/reference';
import type { SubmissionList } from '@/lib/submissions';

export const dynamic = 'force-dynamic';

export default async function SopWorkspacePage({ params }: { params: Promise<{ code: string }> }): Promise<ReactNode> {
  const { code } = await params;
  const sop = SOPS_INDEX.get(code.toUpperCase());
  if (!sop) notFound();

  const [personsPayload, submissions] = await Promise.all([
    tryFetchApi<{ items: readonly PersonView[] }>('/api/v1/reference/persons'),
    tryFetchApi<SubmissionList>('/api/v1/submissions?sopCode=' + encodeURIComponent(sop.code) + '&pageSize=20'),
  ]);

  const persons = personsPayload?.items ?? [];
  const items = submissions?.items ?? [];
  const countByState = new Map<string, number>();
  for (const s of items) countByState.set(s.currentState, (countByState.get(s.currentState) ?? 0) + 1);

  const fields = SOP_FIELDS[sop.code] ?? [];

  return (
    <AppShell active="/sop">
      <div className="space-y-6">
        <nav aria-label="Breadcrumb" className="text-xs muted">
          <Link href="/sop" className="hover:text-accent transition-colors">SOP</Link>
          <span aria-hidden="true" className="mx-1.5">/</span>
          <span className="font-mono">{sop.code}</span>
        </nav>

        <header className="surface rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-accent">{sop.code}</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] muted">{sop.aktivitas} aktivitas</span>
            <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] muted">{sop.subjectType}</span>
          </div>
          <h1 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">{sop.nama}</h1>
          <p className="mt-2 font-mono text-xs muted">{sop.nomor}</p>
        </header>

        <section aria-label="Alur state" className="surface rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Alur State Resmi</h2>
            <span className="text-[11px] muted">{sop.states.length} state</span>
          </div>
          <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sop.states.map((state, index) => {
              const count = countByState.get(state.code) ?? 0;
              return (
                <li
                  key={state.code}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] muted tabular w-6">{String(index + 1).padStart(2, '0')}</span>
                    <StateBadge code={state.code} />
                    <span className="text-[11px] muted truncate">{state.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] muted">{state.activityRef}</span>
                    {state.external ? <span className="rounded border border-warn/30 bg-warn/10 px-1.5 py-0.5 text-[9px] text-warn">EXT</span> : null}
                    {count > 0 ? <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent tabular">{count}</span> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Pengajuan pada SOP ini" className="surface rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pengajuan</h2>
            <span className="text-[11px] muted">{items.length} tercatat</span>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs muted">Belum ada pengajuan pada SOP ini.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-line/30 text-left text-xs muted">
                <tr>
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">State</th>
                  <th className="px-4 py-2 font-medium hidden sm:table-cell">Dibuat</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-line/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs">{s.id.slice(0, 8)}</td>
                    <td className="px-4 py-2.5"><StateBadge code={s.currentState} /></td>
                    <td className="px-4 py-2.5 text-[11px] muted hidden sm:table-cell">
                      {new Date(s.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={'/pengajuan/' + s.id} className="text-xs text-accent hover:underline">Detail</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <CreateSubmissionForm sopCode={sop.code} subjectType={sop.subjectType} persons={persons} fields={fields} />
      </div>
    </AppShell>
  );
}
