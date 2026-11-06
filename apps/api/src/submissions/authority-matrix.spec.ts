import { describe, expect, it } from 'vitest';
import { isAllowed, lookupRule } from './authority-matrix';

describe('authority-matrix', () => {
  it('Kasubbag berwenang memvalidasi cuti', () => {
    expect(isAllowed('SOP-05', 'VALIDATED', 'KASUBAG')).toBe(true);
  });

  it('Staf tidak berwenang memvalidasi cuti', () => {
    expect(isAllowed('SOP-05', 'VALIDATED', 'STAF')).toBe(false);
  });

  it('Sekcam berwenang memaraf cuti', () => {
    expect(isAllowed('SOP-05', 'PARAF_SEKCAM', 'SEKCAM')).toBe(true);
  });

  it('Camat tidak berwenang memaraf cuti', () => {
    expect(isAllowed('SOP-05', 'PARAF_SEKCAM', 'CAMAT')).toBe(false);
  });

  it('Camat berwenang menyetujui cuti', () => {
    expect(isAllowed('SOP-05', 'APPROVED_CAMAT', 'CAMAT')).toBe(true);
  });

  it('hanya Camat yang menandatangani pensiun', () => {
    expect(isAllowed('SOP-01', 'SIGNED_CAMAT', 'CAMAT')).toBe(true);
    expect(isAllowed('SOP-01', 'SIGNED_CAMAT', 'SEKCAM')).toBe(false);
    expect(isAllowed('SOP-01', 'SIGNED_CAMAT', 'KASUBAG')).toBe(false);
  });

  it('menolak state yang tidak ada di matriks', () => {
    expect(isAllowed('SOP-05', 'STATE_NGAWUR', 'CAMAT')).toBe(false);
    expect(lookupRule('SOP-05', 'STATE_NGAWUR')).toBeNull();
  });
});
