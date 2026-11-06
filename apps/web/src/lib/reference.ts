export interface PersonView {
  readonly id: string;
  readonly nip: string;
  readonly nama: string;
  readonly jabatan: string | null;
  readonly unitKerja: string | null;
}

export interface PositionView {
  readonly id: string;
  readonly code: string;
  readonly nama: string;
  readonly level: string;
}
