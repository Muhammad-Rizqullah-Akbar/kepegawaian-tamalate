"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { SOP_LABEL, SOP_SUBJECT } from '@/lib/submissions';

const DEMO_PERSON = '11111111-1111-1111-1111-111111111111';
const DEMO_UNIT = '22222222-2222-2222-2222-222222222222';

export default function NewSubmissionPage(): ReactNode {
  const router = useRouter();
  const [sopCode, setSopCode] = useState<string>('SOP-05');
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(
      { jenisCuti: 'tahunan', tanggalMulai: '2026-12-01', tanggalSelesai: '2026-12-05', alasan: 'keperluan keluarga' },
      null,
      2,
    ),
  );
  const [submittedBy, setSubmittedBy] = useState<string>(DEMO_PERSON);
  const [unitId, setUnitId] = useState<string>(DEMO_UNIT);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      const res = await fetch('/api/v1/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sopCode,
          subjectType: SOP_SUBJECT[sopCode],
          submittedBy,
          unitId,
          payload,
        }),
      });
      const body = (await res.json().catch(() => null)) as { data?: { id: string }; error?: { code: string; message: string } } | null;
      if (!res.ok) {
        setError(body?.error?.message ?? 'Gagal membuat pengajuan (HTTP ' + res.status + ')');
        return;
      }
      router.push('/pengajuan/' + body?.data?.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payload bukan JSON yang sah');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell active="/pengajuan">
      <div className="max-w-3xl space-y-6">
        <nav aria-label="Breadcrumb" className="text-xs muted">
          <Link href="/pengajuan" className="hover:text-accent transition-colors">Pengajuan</Link>
          <span aria-hidden="true" className="mx-1.5">/</span>
          <span>Baru</span>
        </nav>

        <header>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Pengajuan Baru</h1>
          <p className="mt-2 text-sm muted leading-relaxed">
            Pilih SOP, isi payload, lalu kirim. Sistem memilih versi workflow aktif dan menulis satu baris audit berantai.
          </p>
        </header>

        <form onSubmit={onSubmit} className="surface rounded-xl p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium muted">SOP</span>
              <select
                value={sopCode}
                onChange={(e) => setSopCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm focus-visible:border-accent"
              >
                {Object.entries(SOP_LABEL).map(([code, label]) => (
                  <option key={code} value={code}>{code} - {label}</option>
                ))}
              </select>
              <span className="mt-1 block font-mono text-[11px] muted">subjectType: {SOP_SUBJECT[sopCode]}</span>
            </label>
            <label className="block">
              <span className="text-xs font-medium muted">Pegawai (UUID)</span>
              <input
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs focus-visible:border-accent"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium muted">Unit Kerja (UUID)</span>
              <input
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs focus-visible:border-accent"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium muted">Payload (JSON)</span>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={12}
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs leading-relaxed focus-visible:border-accent"
            />
          </label>

          {error ? (
            <div role="alert" className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">{error}</div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accentfg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
            <Link href="/pengajuan" className="text-sm muted hover:text-fg transition-colors">Batal</Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
