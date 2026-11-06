import { AppShell } from '@/components/AppShell';

interface RegisterBook {
  code: string;
  title: string;
  subjectType: string;
  description: string;
  status: 'aktif' | 'ditunda';
}

const BOOKS: RegisterBook[] = [
  { code: 'B1', title: 'Buku Agenda Surat Masuk', subjectType: 'register.incoming_agenda', description: 'Registrasi surat masuk dengan nomor pengirim, bukan nomor naskah internal.', status: 'aktif' },
  { code: 'B2', title: 'Buku Agenda Surat Keluar', subjectType: 'register.outgoing_agenda', description: 'Registrasi surat keluar dengan nomor naskah K4.', status: 'aktif' },
  { code: 'B3', title: 'Buku Ekspedisi', subjectType: 'register.expedition', description: 'Pengiriman dan tanda terima dokumen ke pihak eksternal.', status: 'ditunda' },
  { code: 'B4', title: 'Buku Penjagaan KGB', subjectType: 'register.kgb_watch', description: 'Sumber data deteksi BUP untuk pengajuan KGB.', status: 'aktif' },
  { code: 'B5', title: 'Buku Pencatatan Dokumen', subjectType: 'register.document_log', description: 'Log dokumen yang masuk ke sistem, tanpa duplikasi metadata.', status: 'aktif' },
  { code: 'B6', title: 'Buku Register Usulan', subjectType: 'register.proposal', description: 'Register usulan mengikuti 17 kolom Format KGB.', status: 'aktif' },
  { code: 'B7', title: 'Buku Agenda Cetak Format Fisik', subjectType: 'register.print_view', description: 'Cetak meniru fisik dengan AST berversi, bukan template statis.', status: 'aktif' },
];

export default function RegisterPage() {
  return (
    <AppShell title="Register" subtitle="Tujuh buku register resmi kecamatan">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BOOKS.map((b) => (
          <article key={b.code} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{b.title}</h3>
              <span className={b.status === 'aktif' ? 'rounded bg-green-500/10 px-2 py-0.5 text-[10px] uppercase text-green-500' : 'rounded bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase text-amber-500'}>
                {b.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{b.description}</p>
            <p className="mt-3 font-mono text-[10px] text-[var(--muted)]">{b.subjectType}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
