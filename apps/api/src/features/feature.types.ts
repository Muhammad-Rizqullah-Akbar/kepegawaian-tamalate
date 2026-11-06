export type FeatureGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type FeatureStatus = 'planned' | 'in_progress' | 'ready' | 'deferred';

export interface FeatureDef {
  readonly code: string;
  readonly title: string;
  readonly group: FeatureGroup;
  readonly subjectType: string;
  readonly kernels: readonly string[];
  readonly status: FeatureStatus;
}

export const GROUP_LABELS: Readonly<Record<FeatureGroup, string>> = {
  A: 'Fondasi',
  B: 'Register',
  C: 'Persuratan dan Naskah',
  D: 'Pengendalian Surat Masuk',
  E: 'Pensiun',
  F: 'Kenaikan Gaji Berkala',
  G: 'Kenaikan Pangkat',
  H: 'Pembinaan Pegawai',
  I: 'Permohonan Cuti',
  J: 'Pengarsipan Surat',
  K: 'Modularitas dan Administrasi',
  L: 'Lintas',
};
