import { describe, expect, it } from 'vitest';
import { AUTHORITY_MATRIX } from './authority-matrix';

describe('AUTHORITY_MATRIX', () => {
  it('memiliki entri', () => {
    expect(AUTHORITY_MATRIX.length).toBeGreaterThan(10);
  });

  it('setiap entri punya sopCode dan toState tidak kosong', () => {
    for (const r of AUTHORITY_MATRIX) {
      expect(r.sopCode.length).toBeGreaterThan(0);
      expect(r.toState.length).toBeGreaterThan(0);
    }
  });

  it('tidak ada pasangan sopCode dan toState yang duplikat', () => {
    const keys = AUTHORITY_MATRIX.map((r) => r.sopCode + '::' + r.toState);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('hanya memakai position_code yang dikenal', () => {
    const known = new Set(['CAMAT', 'SEKCAM', 'KASUBAG', 'KASI', 'STAF']);
    for (const r of AUTHORITY_MATRIX) {
      for (const c of r.allowedPositionCodes) {
        expect(known.has(c)).toBe(true);
      }
    }
  });

  it('state tanda tangan Camat hanya boleh CAMAT', () => {
    const signed = AUTHORITY_MATRIX.filter((r) => r.toState === 'SIGNED_CAMAT');
    expect(signed.length).toBeGreaterThan(0);
    for (const r of signed) {
      expect(r.allowedPositionCodes).toEqual(['CAMAT']);
    }
  });

  it('state paraf Sekcam tidak memberi akses ke CAMAT', () => {
    const paraf = AUTHORITY_MATRIX.filter((r) => r.toState === 'PARAF_SEKCAM');
    expect(paraf.length).toBeGreaterThan(0);
    for (const r of paraf) {
      expect(r.allowedPositionCodes).not.toContain('CAMAT');
    }
  });
});
