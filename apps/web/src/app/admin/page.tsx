import { AppShell } from '@/components/AppShell';

const ITEMS = [
  { code: 'K1', title: 'Manajemen Modul', desc: 'Aktifkan atau matikan modul tanpa deploy, dikendalikan manifest fitur.' },
  { code: 'K2', title: 'Parameter Dinamis', desc: 'Registry parameter bertipe dengan validasi skema per kunci.' },
  { code: 'K3', title: 'Kalender Hari Kerja', desc: 'Hari kerja per unit, dipakai guard.leave.quota dan SLA.' },
  { code: 'K4', title: 'Policy Pack', desc: 'BUP dan aturan lain sebagai data berversi, bukan kode.' },
  { code: 'K5', title: 'Template Berversi', desc: 'Template surat dengan valid_from dan valid_to.' },
  { code: 'K6', title: 'Jejak Audit', desc: 'Rantai hash SHA-256 terverifikasi melalui verifier independen.' },
];

export default function AdminPage() {
  return (
    <AppShell title="Administrasi" subtitle="Kelompok K, modularitas dan konfigurasi sistem">
      <section className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((i) => (
          <article key={i.code} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{i.title}</h3>
              <span className="font-mono text-[10px] text-[var(--muted)]">{i.code}</span>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{i.desc}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
