import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { StateBadge } from '@/components/StateBadge';
import { TransitionForm } from '@/components/TransitionForm';
import { ApiFailure, fetchApi, tryFetchApi } from '@/lib/api';
import { SOP_LABEL, type ChainReport, type SubmissionView } from '@/lib/submissions';

export const dynamic = 'force-dynamic';

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }): Promise<ReactNode> {
  const { id } = await params;
  let submission: SubmissionView;
  try {
    submission = await fetchApi<SubmissionView>('/api/v1/submissions/' + encodeURIComponent(id));
  } catch (e) {
    if (e instanceof ApiFailure && e.status === 404) notFound();
    throw e;
  }
  const chain = await tryFetchApi<ChainReport>('/api/v1/submissions/' + encodeURIComponent(id) + '/audit');

  return (
    <AppShell active="/pengajuan">
      <div className="space-y-6">
        <nav aria-label="Breadcrumb" className="text-xs muted">
          <Link href="/pengajuan" className="hover:text-accent transition-colors">Pengajuan</Link>
          <span aria-hidden="true" className="mx-1.5">/</span>
          <span className="font-mono">{submission.id.slice(0, 8)}</span>
        </nav>

        <header className="surface rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-accent">{submission.sopCode}</span>
            <span className="text-sm muted">{SOP_LABEL[submission.sopCode] ?? ''}</span>
            <StateBadge code={submission.currentState} />
          </div>
          <h1 className="mt-3 font-mono text-sm">{submission.subjectType}</h1>
          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><dt className="muted">Dibuat</dt><dd className="mt-0.5">{new Date(submission.submittedAt).toLocaleString('id-ID')}</dd></div>
            <div><dt className="muted">Diubah</dt><dd className="mt-0.5">{new Date(submission.updatedAt).toLocaleString('id-ID')}</dd></div>
            <div><dt className="muted">Pegawai</dt><dd className="mt-0.5 font-mono">{submission.submittedBy.slice(0, 8)}</dd></div>
            <div><dt className="muted">Unit</dt><dd className="mt-0.5 font-mono">{submission.unitId.slice(0, 8)}</dd></div>
          </dl>
          {chain ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs">
              <span className={'h-1.5 w-1.5 rounded-full ' + (chain.valid ? 'bg-ok' : 'bg-warn')} />
              <span className={chain.valid ? 'text-ok font-medium' : 'text-warn font-medium'}>
                {chain.valid ? 'Rantai audit valid' : 'Rantai audit terputus di ' + chain.brokenAt}
              </span>
              <span className="muted">({chain.entries} entri)</span>
            </div>
          ) : null}
        </header>

        <TransitionForm id={submission.id} states={submission.availableStates} />

        <section aria-label="Payload" className="surface rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold">Payload</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-line/30 p-3 font-mono text-[11px] leading-relaxed">
            {JSON.stringify(submission.payload, null, 2)}
          </pre>
        </section>

        <section aria-label="Linimasa audit" className="surface rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold">Linimasa Audit</h2>
          <ol className="mt-4 space-y-3">
            {submission.stateHistory.map((entry, index) => (
              <li key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  {index < submission.stateHistory.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
                </div>
                <div className="flex-1 pb-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-medium">{entry.action}</span>
                    {entry.fromState ? <><StateBadge code={entry.fromState} /><span className="muted">→</span></> : null}
                    {entry.toState ? <StateBadge code={entry.toState} /> : null}
                  </div>
                  <p className="mt-1 text-[11px] muted">
                    {entry.basis} · {new Date(entry.createdAt).toLocaleString('id-ID')}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] muted">hash {entry.ownHash.slice(0, 16)}...</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
