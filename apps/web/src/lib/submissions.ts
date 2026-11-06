export interface AuditView {
  readonly id: string;
  readonly action: string;
  readonly actorPersonId: string;
  readonly onBehalfOfPersonId: string | null;
  readonly basis: string;
  readonly fromState: string | null;
  readonly toState: string | null;
  readonly ownHash: string;
  readonly createdAt: string;
}

export interface SubmissionView {
  readonly id: string;
  readonly subjectType: string;
  readonly sopCode: string;
  readonly versionId: string;
  readonly currentState: string;
  readonly payload: Record<string, unknown>;
  readonly submittedBy: string;
  readonly unitId: string;
  readonly submittedAt: string;
  readonly updatedAt: string;
  readonly closedAt: string | null;
  readonly availableStates: readonly string[];
  readonly stateHistory: readonly AuditView[];
}

export interface SubmissionList {
  readonly items: readonly SubmissionView[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface ChainReport {
  readonly valid: boolean;
  readonly entries: number;
  readonly brokenAt: string | null;
}

export const SOP_LABEL: Readonly<Record<string, string>> = {
  'SOP-01': 'Pengajuan Pensiun PNS',
  'SOP-02': 'Pengurusan Kenaikan Gaji Berkala',
  'SOP-03': 'Pengusulan Kenaikan Pangkat',
  'SOP-04': 'Pembinaan Pegawai',
  'SOP-05': 'Permohonan Cuti',
  'SOP-06': 'Pengarsipan Surat',
};

export const SOP_SUBJECT: Readonly<Record<string, string>> = {
  'SOP-01': 'pension.case',
  'SOP-02': 'kgb.request',
  'SOP-03': 'promotion.request',
  'SOP-04': 'coaching.case',
  'SOP-05': 'leave.request',
  'SOP-06': 'archive.batch',
};
