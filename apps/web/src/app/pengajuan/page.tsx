import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { StateBadge } from '@/components/StateBadge';
import { tryFetchApi } from '@/lib/api';
import { SOP_LABEL, type SubmissionList } from '@/lib/submissions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pengajuan' };

export default async function SubmissionsPage(): Promise<ReactNode> {
  const data = await tryFetchApi<SubmissionList>('/api/v1/submissions?pageSize=50');
  const items = data?.items ?? [];

  return (
    <AppShell active="/pengajuan">
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Alur Kerja</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Pengajuan</h1>
            <p className="mt-2 max-w-2xl text-sm muted leading-relaxed">
              {items.length} pengajuan tercatat. Setiap transisi menulis satu baris audit berantai.
            </p>
          </div>
          <Link
            href="/pengajuan/baru"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accentfg transition-opacity hover:opacity-90"
          >
            Buat Pengajuan
          </Link>
        </header>

        {items.length === 0 ? (
          <div className="surface rounded-xl p-8 text-center">
            <p className="text-sm font-medium">Belum ada pengajuan</p>
            <p className="mt-1 text-xs muted">Mulai dari tombol Buat Pengajuan di atas.</p>
          </div>
        ) : (
          <div className="surface rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-line/30 text-left text-xs muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">SOP</th>
                  <th className="px-4 py-2.5 font-medium">Subject</th>
                  <th className="px-4 py-2.5 font-medium">State</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Dibuat</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-line/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-accent">{s.sopCode}</div>
                      <div className="text-[11px] muted truncate max-w-[14rem]">{SOP_LABEL[s.sopCode] ?? s.sopCode}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.subjectType}</td>
                    <td className="px-4 py-3"><StateBadge code={s.currentState} /></td>
                    <td className="px-4 py-3 text-[11px] muted hidden sm:table-cell">
                      {new Date(s.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={'/pengajuan/' + s.id} className="text-xs text-accent hover:underline">Detail</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
