"use client";

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

const DEMO_ACTOR = '11111111-1111-1111-1111-111111111111';

export function TransitionForm({ id, states }: { id: string; states: readonly string[] }): ReactNode {
  const router = useRouter();
  const [target, setTarget] = useState<string>(states[0] ?? '');
  const [basis, setBasis] = useState<string>('TRANSISI_MANUAL');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function go(): Promise<void> {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/submissions/' + id + '/transition', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ toState: target, actorPersonId: DEMO_ACTOR, basis }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message: string } } | null;
      if (!res.ok) {
        setError(body?.error?.message ?? 'Transisi ditolak (HTTP ' + res.status + ')');
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memanggil API');
    } finally {
      setBusy(false);
    }
  }

  if (states.length === 0) return null;

  return (
    <div className="surface rounded-xl p-4 sm:p-5 space-y-3">
      <h2 className="text-sm font-semibold">Transisi Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs focus-visible:border-accent"
        >
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          value={basis}
          onChange={(e) => setBasis(e.target.value)}
          className="rounded-lg border border-line bg-card px-3 py-2 text-xs focus-visible:border-accent"
          placeholder="Dasar transisi"
        />
        <button
          type="button"
          onClick={go}
          disabled={busy}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accentfg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Memproses...' : 'Jalankan'}
        </button>
      </div>
      {error ? <div role="alert" className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">{error}</div> : null}
    </div>
  );
}
