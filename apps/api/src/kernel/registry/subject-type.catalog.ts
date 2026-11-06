export type Sensitivity = 'public' | 'internal' | 'restricted' | 'secret';

export interface SubjectTypeDef {
  readonly code: string;
  readonly group: string;
  readonly featureCodes: readonly string[];
  readonly sensitivity: Sensitivity;
}

export const SUBJECT_TYPES: readonly SubjectTypeDef[] = [
  { code: 'session', group: 'A', featureCodes: ['A1'], sensitivity: 'secret' },
  { code: 'capability_grant', group: 'A', featureCodes: ['A2'], sensitivity: 'restricted' },
  { code: 'employee.master', group: 'A', featureCodes: ['A3'], sensitivity: 'restricted' },
  { code: 'employee.assignment', group: 'A', featureCodes: ['A4'], sensitivity: 'restricted' },
  { code: 'position.assignment', group: 'A', featureCodes: ['A5'], sensitivity: 'internal' },
  { code: 'position.delegation', group: 'A', featureCodes: ['A6'], sensitivity: 'internal' },
  { code: 'registry.parameter', group: 'A', featureCodes: ['A7'], sensitivity: 'internal' },
  { code: 'registry.calendar', group: 'A', featureCodes: ['A8'], sensitivity: 'public' },
  { code: 'audit.entry', group: 'A', featureCodes: ['A9'], sensitivity: 'restricted' },
  { code: 'notification.message', group: 'A', featureCodes: ['A10'], sensitivity: 'internal' },
  { code: 'inbox.position', group: 'A', featureCodes: ['A11'], sensitivity: 'internal' },
  { code: 'register.incoming_agenda', group: 'B', featureCodes: ['B1'], sensitivity: 'internal' },
  { code: 'register.outgoing_agenda', group: 'B', featureCodes: ['B2'], sensitivity: 'internal' },
  { code: 'register.expedition', group: 'B', featureCodes: ['B3'], sensitivity: 'internal' },
  { code: 'register.kgb_watch', group: 'B', featureCodes: ['B4'], sensitivity: 'internal' },
  { code: 'register.document_log', group: 'B', featureCodes: ['B5'], sensitivity: 'internal' },
  { code: 'register.proposal', group: 'B', featureCodes: ['B6'], sensitivity: 'internal' },
  { code: 'register.print_view', group: 'B', featureCodes: ['B7'], sensitivity: 'internal' },
  { code: 'template.version', group: 'C', featureCodes: ['C1'], sensitivity: 'internal' },
  { code: 'numbering.scheme', group: 'C', featureCodes: ['C2'], sensitivity: 'internal' },
  { code: 'render.job', group: 'C', featureCodes: ['C3'], sensitivity: 'internal' },
  { code: 'render.print_isolation', group: 'C', featureCodes: ['C4'], sensitivity: 'internal' },
  { code: 'signature.specimen', group: 'C', featureCodes: ['C5'], sensitivity: 'secret' },
  { code: 'signature.initial', group: 'C', featureCodes: ['C6'], sensitivity: 'secret' },
  { code: 'signature.certificate', group: 'C', featureCodes: ['C7'], sensitivity: 'restricted' },
  { code: 'mail.incoming', group: 'D', featureCodes: ['D1','D2','D6','D8'], sensitivity: 'internal' },
  { code: 'registry.disposition_target', group: 'D', featureCodes: ['D3'], sensitivity: 'internal' },
  { code: 'mail.disposition', group: 'D', featureCodes: ['D4','D6'], sensitivity: 'internal' },
  { code: 'mail.disposition_recipient', group: 'D', featureCodes: ['D5'], sensitivity: 'internal' },
  { code: 'mail.follow_up', group: 'D', featureCodes: ['D7'], sensitivity: 'internal' },
  { code: 'pension.candidate', group: 'E', featureCodes: ['E1'], sensitivity: 'restricted' },
  { code: 'pension.case', group: 'E', featureCodes: ['E2','E3'], sensitivity: 'restricted' },
  { code: 'pension.dispatch', group: 'E', featureCodes: ['E4'], sensitivity: 'internal' },
  { code: 'pension.archive', group: 'E', featureCodes: ['E5'], sensitivity: 'internal' },
  { code: 'kgb.request', group: 'F', featureCodes: ['F1','F2','F3','F4','F5','F6'], sensitivity: 'internal' },
  { code: 'promotion.request', group: 'G', featureCodes: ['G1','G2','G3','G4','G5'], sensitivity: 'internal' },
  { code: 'coaching.case', group: 'H', featureCodes: ['H1','H2','H3','H4','H5'], sensitivity: 'restricted' },
  { code: 'leave.request', group: 'I', featureCodes: ['I1','I2','I3','I4','I5','I6'], sensitivity: 'internal' },
  { code: 'archive.batch', group: 'J', featureCodes: ['J1','J2','J3','J4'], sensitivity: 'internal' },
  { code: 'admin.feature', group: 'K', featureCodes: ['K1','K2','K3','K4','K5','K6'], sensitivity: 'internal' },
  { code: 'cross.attendance', group: 'L', featureCodes: ['L1','L2','L3','L4','L5'], sensitivity: 'internal' },
];

export const SUBJECT_TYPE_INDEX: ReadonlyMap<string, SubjectTypeDef> = new Map(
  SUBJECT_TYPES.map((t) => [t.code, t]),
);
