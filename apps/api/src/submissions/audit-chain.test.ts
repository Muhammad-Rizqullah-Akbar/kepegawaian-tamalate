import { describe, expect, it } from 'vitest';
import { computeHash, GENESIS_HASH, type AuditSeed } from './audit-chain';

const base: AuditSeed = {
  prevHash: GENESIS_HASH,
  subjectType: 'leave.request',
  subjectId: '11111111-1111-1111-1111-111111111111',
  action: 'CREATE',
  actorPersonId: '22222222-2222-2222-2222-222222222222',
  basis: 'SOP-05',
  fromState: null,
  toState: 'DRAFT',
  at: '2026-11-05T00:00:00.000Z',
};

describe('computeHash', () => {
  it('deterministik untuk seed identik', () => {
    expect(computeHash(base)).toBe(computeHash({ ...base }));
  });

  it('menghasilkan 64 karakter hex', () => {
    expect(computeHash(base)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('GENESIS_HASH adalah 64 nol', () => {
    expect(GENESIS_HASH).toHaveLength(64);
    expect(GENESIS_HASH).toBe('0'.repeat(64));
  });

  it('perubahan prevHash mengubah hash', () => {
    expect(computeHash({ ...base, prevHash: 'a'.repeat(64) })).not.toBe(computeHash(base));
  });

  it('perubahan toState mengubah hash', () => {
    expect(computeHash({ ...base, toState: 'VALIDATED' })).not.toBe(computeHash(base));
  });

  it('null dan string kosong pada fromState menghasilkan hash sama', () => {
    expect(computeHash({ ...base, fromState: null })).toBe(computeHash({ ...base, fromState: '' }));
  });

  it('null dan string kosong pada toState menghasilkan hash sama', () => {
    expect(computeHash({ ...base, toState: null })).toBe(computeHash({ ...base, toState: '' }));
  });

  it('rantai tiga entri konsisten bila prevHash dirantai benar', () => {
    const h1 = computeHash(base);
    const h2 = computeHash({ ...base, prevHash: h1, action: 'TRANSITION', fromState: 'DRAFT', toState: 'VALIDATED' });
    const h3 = computeHash({ ...base, prevHash: h2, action: 'TRANSITION', fromState: 'VALIDATED', toState: 'PARAF_SEKCAM' });
    expect(new Set([h1, h2, h3]).size).toBe(3);
    expect(h2).not.toBe(h1);
    expect(h3).not.toBe(h2);
  });
});
