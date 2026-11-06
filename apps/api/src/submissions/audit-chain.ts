import { createHash } from 'node:crypto';

export interface AuditSeed {
  readonly prevHash: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly action: string;
  readonly actorPersonId: string;
  readonly basis: string;
  readonly fromState: string | null;
  readonly toState: string | null;
  readonly at: string;
}

export const GENESIS_HASH = '0'.repeat(64);

export function computeHash(seed: AuditSeed): string {
  const canonical = [
    seed.prevHash,
    seed.subjectType,
    seed.subjectId,
    seed.action,
    seed.actorPersonId,
    seed.basis,
    seed.fromState ?? '',
    seed.toState ?? '',
    seed.at,
  ].join('|');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}
