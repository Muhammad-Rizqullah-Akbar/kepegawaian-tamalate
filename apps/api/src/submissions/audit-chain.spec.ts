import { describe, expect, it } from 'vitest';
import { computeHash, GENESIS_HASH, type AuditSeed } from './audit-chain';

function seed(over: Partial<AuditSeed> = {}): AuditSeed {
  return {
    prevHash: GENESIS_HASH,
    subjectType: 'leave.request',
    subjectId: '11111111-1111-1111-1111-111111111111',
    action: 'CREATE',
    actorPersonId: '22222222-2222-2222-2222-222222222222',
    basis: 'PENGAJUAN_AWAL',
    fromState: null,
    toState: 'DRAFT',
    at: '2026-11-05T15:00:00.000Z',
    ...over,
  };
}

describe('audit-chain', () => {
  it('genesis adalah enam puluh empat nol', () => {
    expect(GENESIS_HASH).toBe('0'.repeat(64));
    expect(GENESIS_HASH).toHaveLength(64);
  });

  it('hash deterministik untuk input identik', () => {
    expect(computeHash(seed())).toBe(computeHash(seed()));
  });

  it('mengubah satu field mengubah hash', () => {
    const a = computeHash(seed());
    const b = computeHash(seed({ basis: 'BASIS_LAIN' }));
    expect(a).not.toBe(b);
  });

  it('mengubah prevHash memutus rantai', () => {
    const a = computeHash(seed());
    const b = computeHash(seed({ prevHash: 'a'.repeat(64) }));
    expect(a).not.toBe(b);
  });

  it('hash selalu heksadesimal enam puluh empat karakter', () => {
    const h = computeHash(seed());
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});
