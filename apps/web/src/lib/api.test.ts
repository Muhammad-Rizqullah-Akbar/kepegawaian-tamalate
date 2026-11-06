import { describe, it, expect } from 'vitest';
import { ApiFailure } from './api';

describe('ApiFailure contract', () => {
  it('menyimpan kode, pesan, dan status HTTP dengan benar', () => {
    const err = new ApiFailure('PORT_CONFLICT', 'Port bentrok terdeteksi', 409);
    expect(err.code).toBe('PORT_CONFLICT');
    expect(err.message).toBe('Port bentrok terdeteksi');
    expect(err.status).toBe(409);
    expect(err.name).toBe('ApiFailure');
  });
});
