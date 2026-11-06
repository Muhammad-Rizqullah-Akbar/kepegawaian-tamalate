/**
 * Matriks kewenangan per transisi, diturunkan dari kolom Pelaksana di enam SOP
 * resmi. Nilai adalah daftar position_code yang boleh MENULIS transisi ke
 * state tersebut. Daftar kosong berarti semua jabatan yang login boleh.
 */
export interface AuthorityRule {
  readonly sopCode: string;
  readonly toState: string;
  readonly allowedPositionCodes: readonly string[];
}

export const AUTHORITY_MATRIX: readonly AuthorityRule[] = [
  // SOP-01 Pensiun
  { sopCode: 'SOP-01', toState: 'DRAFT', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-01', toState: 'VERIFIED', allowedPositionCodes: ['KASUBAG'] },
  { sopCode: 'SOP-01', toState: 'PARAF_SEKCAM', allowedPositionCodes: ['SEKCAM'] },
  { sopCode: 'SOP-01', toState: 'SIGNED_CAMAT', allowedPositionCodes: ['CAMAT'] },
  { sopCode: 'SOP-01', toState: 'AGENDA_KELUAR', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-01', toState: 'EXPEDITED', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-01', toState: 'SENT_EXTERNAL', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-01', toState: 'RETURNED_EXTERNAL', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-01', toState: 'ARCHIVED', allowedPositionCodes: ['STAF', 'KASUBAG'] },

  // SOP-02 KGB
  { sopCode: 'SOP-02', toState: 'COLLECTING', allowedPositionCodes: ['STAF', 'KASI', 'KASUBAG'] },
  { sopCode: 'SOP-02', toState: 'CHECKED', allowedPositionCodes: ['KASUBAG', 'SEKCAM'] },
  { sopCode: 'SOP-02', toState: 'COMPLETED_REQ', allowedPositionCodes: ['KASUBAG', 'SEKCAM'] },
  { sopCode: 'SOP-02', toState: 'PARAF_SEKCAM', allowedPositionCodes: ['SEKCAM'] },
  { sopCode: 'SOP-02', toState: 'SIGNED_CAMAT', allowedPositionCodes: ['CAMAT'] },
  { sopCode: 'SOP-02', toState: 'AGENDA_KELUAR', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-02', toState: 'EXPEDITED', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-02', toState: 'RECEIPTED', allowedPositionCodes: ['STAF', 'KASUBAG'] },

  // SOP-03 Pangkat
  { sopCode: 'SOP-03', toState: 'DRAFT', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-03', toState: 'LEGALISIR', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-03', toState: 'VERIFIED', allowedPositionCodes: ['KASUBAG'] },
  { sopCode: 'SOP-03', toState: 'PARAF_SEKCAM', allowedPositionCodes: ['SEKCAM', 'KASI'] },
  { sopCode: 'SOP-03', toState: 'SIGNED_CAMAT', allowedPositionCodes: ['CAMAT'] },
  { sopCode: 'SOP-03', toState: 'SENT_EXTERNAL', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-03', toState: 'SORTED', allowedPositionCodes: ['STAF', 'KASUBAG'] },

  // SOP-04 Pembinaan
  { sopCode: 'SOP-04', toState: 'ATTENDANCE', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-04', toState: 'REPORTED', allowedPositionCodes: ['KASUBAG'] },
  { sopCode: 'SOP-04', toState: 'COORDINATED', allowedPositionCodes: ['SEKCAM'] },
  { sopCode: 'SOP-04', toState: 'VERIFIED_CAMAT', allowedPositionCodes: ['CAMAT'] },
  { sopCode: 'SOP-04', toState: 'REPORTED_BKPSDM', allowedPositionCodes: ['STAF', 'KASUBAG'] },

  // SOP-05 Cuti
  { sopCode: 'SOP-05', toState: 'VALIDATED', allowedPositionCodes: ['KASUBAG'] },
  { sopCode: 'SOP-05', toState: 'PARAF_SEKCAM', allowedPositionCodes: ['SEKCAM'] },
  { sopCode: 'SOP-05', toState: 'APPROVED_CAMAT', allowedPositionCodes: ['CAMAT'] },
  { sopCode: 'SOP-05', toState: 'SENT_EXTERNAL', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-05', toState: 'RETURNED_EXTERNAL', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-05', toState: 'RECEIPTED', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-05', toState: 'ARCHIVED', allowedPositionCodes: ['STAF', 'KASUBAG'] },

  // SOP-06 Arsip
  { sopCode: 'SOP-06', toState: 'CLASSIFIED', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-06', toState: 'NUMBERED', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-06', toState: 'ACTIVE', allowedPositionCodes: ['STAF', 'KASUBAG'] },
  { sopCode: 'SOP-06', toState: 'INACTIVE', allowedPositionCodes: ['KASUBAG', 'SEKCAM'] },
  { sopCode: 'SOP-06', toState: 'VITAL', allowedPositionCodes: ['KASUBAG', 'SEKCAM'] },
];

const INDEX = new Map<string, AuthorityRule>(AUTHORITY_MATRIX.map((r) => [r.sopCode + ':' + r.toState, r]));

export function lookupRule(sopCode: string, toState: string): AuthorityRule | null {
  return INDEX.get(sopCode + ':' + toState) ?? null;
}

export function isAllowed(sopCode: string, toState: string, positionCode: string): boolean {
  const rule = lookupRule(sopCode, toState);
  if (!rule) return false;
  return rule.allowedPositionCodes.includes(positionCode);
}
