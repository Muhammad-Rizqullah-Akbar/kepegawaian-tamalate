"use client";

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import type { PersonView, PositionView } from '@/lib/reference';

export interface FieldDef {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'date' | 'number' | 'textarea' | 'select';
  readonly required?: boolean;
  readonly options?: readonly { value: string; label: string }[];
  readonly placeholder?: string;
}

const UNIT_DEFAULT = '22222222-2222-2222-2222-222222222222';

export function CreateSubmissionForm({
  sopCode,
  subjectType,
  persons,
  fields,
}: {
  sopCode: string;
  subjectType: string;
  persons: readonly PersonView[];
  fields: readonly FieldDef[];
}): ReactNode {
  const router = useRouter();
  const [submittedBy, setSubmittedBy] = useState<string>(persons[0]?.id ?? '');
  const [unitId, setUnitId] = useState<string>(UNIT_DEFAULT);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = f.type === 'select' ? (f.options?.[0]?.value ?? '') : '';
    return initial;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, value: string): void {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const [key, raw] of Object.entries(values)) {
        if (raw === '') continue;
        payload[key] = raw;
      }
      const res = await fetch('/api/v1/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sopCode, subjectType, submittedBy, unitId, payload }),
      });
      const body = (await res.json().catch(() => null)) as { data?: { id: string }; error?: { message: string } } | null;
      if (!res.ok) {
        setError(body?.error?.message ?? 'Gagal membuat pengajuan (HTTP ' + res.status + ')');
        return;
      }
      const id = body?.data?.id;
      if (id) router.push('/pengajuan/' + id);
      else router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memanggil API');
    } finally {
      setBusy(false);
    }
  }

  if (persons.length === 0) {
    return (
      <div className="surface rounded-xl p-4 text-sm muted">
        Data pegawai belum tersedia. Jalankan seed terlebih dahulu.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Buat Pengajuan {sopCode}</h2>
        <span className="font-mono text-[11px] muted">{subjectType}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium muted">Pegawai Pengaju</span>
          <select
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm focus-visible:border-accent"
          >
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}{p.jabatan ? ' (' + p.jabatan + ')' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium muted">Unit Kerja (UUID)</span>
          <input
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs focus-visible:border-accent"
          />
        </label>

        {fields.map((f) => (
          <label key={f.key} className={'block ' + (f.type === 'textarea' ? 'sm:col-span-2' : '')}>
            <span className="text-xs font-medium muted">{f.label}{f.required ? ' *' : ''}</span>
            {f.type === 'select' ? (
              <select
                value={values[f.key] ?? ''}
                onChange={(e) => setField(f.key, e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm focus-visible:border-accent"
              >
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                value={values[f.key] ?? ''}
                onChange={(e) => setField(f.key, e.target.value)}
                rows={3}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm focus-visible:border-accent"
              />
            ) : (
              <input
                type={f.type}
                value={values[f.key] ?? ''}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm focus-visible:border-accent"
              />
            )}
          </label>
        ))}
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">{error}</div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accentfg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? 'Mengirim...' : 'Kirim Pengajuan'}
      </button>
    </form>
  );
}
