import { AppShell } from '@/components/AppShell';

interface Person {
  id: string;
  nip: string;
  nama: string;
  jabatan: string | null;
  unitKerja: string | null;
}

async function loadPersons(): Promise<Person[]> {
  const base = process.env.API_URL_INTERNAL ?? 'http://127.0.0.1:4000';
  try {
    const res = await fetch(`${base}/api/v1/reference/persons`, { cache: 'no-store' });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { items?: Person[] } };
    return body.data?.items ?? [];
  } catch {
    return [];
  }
}

export default async function PegawaiPage() {
  const rows = await loadPersons();
  return (
    <AppShell title="Pegawai" subtitle="Data pokok pegawai, riwayat jabatan, penugasan, dan delegasi">
      <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <h2 className="text-sm font-semibold">Direktori Pegawai</h2>
          <span className="text-xs text-[var(--muted)]">{rows.length} pegawai</span>
        </header>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--muted)]">Belum ada pegawai. Jalankan seed referensi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-2">NIP</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Jabatan</th>
                  <th className="px-4 py-2">Unit Kerja</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-2 font-mono text-xs">{p.nip}</td>
                    <td className="px-4 py-2">{p.nama}</td>
                    <td className="px-4 py-2">{p.jabatan ?? '-'}</td>
                    <td className="px-4 py-2">{p.unitKerja ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-semibold">A3 Data Pokok Pegawai</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">NIP unik, field sensitif dijaga guard.employee.field_sensitivity.</p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-semibold">A4 Riwayat Jabatan</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Assignment berversi dengan valid_from dan valid_to, bukan kolom tunggal.</p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-semibold">A5 Penugasan Pejabat</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Position assignment menyimpan legal_basis sebagai dasar SK.</p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-semibold">A6 Delegasi Plt dan Plh</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Delegasi memuat delegate, on_behalf_of, scope_position, dan rentang tanggal.</p>
        </article>
      </section>
    </AppShell>
  );
}
