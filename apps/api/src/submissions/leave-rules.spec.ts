import { describe, expect, it } from 'vitest';
import { rangesOverlap, validateLeaveDates } from './leave-rules';

describe('validateLeaveDates', () => {
  it('menolak tanggal kosong', () => {
    const r = validateLeaveDates({ jenisCuti: 'tahunan' });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('LEAVE_OVERLAP');
  });

  it('menolak tanggal selesai mendahului mulai', () => {
    const r = validateLeaveDates({
      jenisCuti: 'tahunan',
      tanggalMulai: '2026-12-10',
      tanggalSelesai: '2026-12-01',
    });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('LEAVE_OVERLAP');
  });

  it('menerima cuti tahunan lima hari', () => {
    const r = validateLeaveDates({
      jenisCuti: 'tahunan',
      tanggalMulai: '2026-12-01',
      tanggalSelesai: '2026-12-05',
    });
    expect(r.ok).toBe(true);
  });

  it('menolak tiga belas hari untuk kuota tahunan dua belas', () => {
    const r = validateLeaveDates({
      jenisCuti: 'tahunan',
      tanggalMulai: '2027-01-01',
      tanggalSelesai: '2027-01-13',
    });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('LEAVE_QUOTA_EXCEEDED');
  });

  it('menerima cuti besar sembilan puluh hari tepat batas', () => {
    const r = validateLeaveDates({
      jenisCuti: 'besar',
      tanggalMulai: '2027-01-01',
      tanggalSelesai: '2027-03-31',
    });
    expect(r.ok).toBe(true);
  });
});

describe('rangesOverlap', () => {
  it('mendeteksi irisan dua rentang', () => {
    expect(rangesOverlap(new Date('2026-12-01'), new Date('2026-12-05'), new Date('2026-12-04'), new Date('2026-12-08'))).toBe(true);
  });

  it('menerima rentang bersambung tanpa irisan', () => {
    expect(rangesOverlap(new Date('2026-12-01'), new Date('2026-12-05'), new Date('2026-12-06'), new Date('2026-12-08'))).toBe(false);
  });

  it('menerima rentang terpisah jauh', () => {
    expect(rangesOverlap(new Date('2026-01-01'), new Date('2026-01-03'), new Date('2026-06-01'), new Date('2026-06-03'))).toBe(false);
  });
});
