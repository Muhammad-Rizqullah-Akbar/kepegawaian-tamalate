export interface LeavePayload {
  readonly tanggalMulai?: string;
  readonly tanggalSelesai?: string;
  readonly jenisCuti?: string;
}

export interface LeaveCheck {
  readonly ok: boolean;
  readonly code?: 'LEAVE_QUOTA_EXCEEDED' | 'LEAVE_OVERLAP';
  readonly message?: string;
}

const QUOTA_PER_TYPE: Readonly<Record<string, number>> = {
  tahunan: 12,
  besar: 90,
  sakit: 365,
  melahirkan: 90,
  alasan_penting: 30,
};

export function validateLeaveDates(payload: LeavePayload): LeaveCheck {
  const { tanggalMulai, tanggalSelesai, jenisCuti } = payload;
  if (!tanggalMulai || !tanggalSelesai) {
    return { ok: false, code: 'LEAVE_OVERLAP', message: 'Tanggal mulai dan selesai wajib diisi' };
  }
  const start = new Date(tanggalMulai);
  const end = new Date(tanggalSelesai);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, code: 'LEAVE_OVERLAP', message: 'Format tanggal tidak valid' };
  }
  if (end < start) {
    return { ok: false, code: 'LEAVE_OVERLAP', message: 'Tanggal selesai mendahului tanggal mulai' };
  }
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const quota = QUOTA_PER_TYPE[jenisCuti ?? 'tahunan'] ?? 12;
  if (days > quota) {
    return { ok: false, code: 'LEAVE_QUOTA_EXCEEDED', message: 'Durasi ' + days + ' hari melebihi kuota ' + quota + ' hari' };
  }
  return { ok: true };
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}
