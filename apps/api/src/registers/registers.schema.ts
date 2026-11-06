import { z } from 'zod';

export interface BookDef {
  readonly code: string;
  readonly title: string;
  readonly subjectType: string;
  readonly active: boolean;
}

export const BOOKS: readonly BookDef[] = [
  { code: 'B1', title: 'Buku Agenda Surat Masuk', subjectType: 'register.incoming_agenda', active: true },
  { code: 'B2', title: 'Buku Agenda Surat Keluar', subjectType: 'register.outgoing_agenda', active: true },
  { code: 'B3', title: 'Buku Ekspedisi', subjectType: 'register.expedition', active: false },
  { code: 'B4', title: 'Buku Penjagaan KGB', subjectType: 'register.kgb_watch', active: true },
  { code: 'B5', title: 'Buku Pencatatan Dokumen', subjectType: 'register.document_log', active: true },
  { code: 'B6', title: 'Buku Register Usulan', subjectType: 'register.proposal', active: true },
  { code: 'B7', title: 'Buku Agenda Cetak Format Fisik', subjectType: 'register.print_view', active: true },
];

export function findBook(code: string): BookDef | null {
  return BOOKS.find((b) => b.code === code.toUpperCase()) ?? null;
}

export const CreateEntryBody = z.object({
  entryNo: z.string().min(1).max(64),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(3).max(240),
  payload: z.record(z.unknown()).default({}),
});

export type CreateEntryBody = z.infer<typeof CreateEntryBody>;
