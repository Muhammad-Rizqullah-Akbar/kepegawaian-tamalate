import { describe, expect, it } from 'vitest';
import { issueToken, verifyToken, type SessionClaims } from './session-token';

const SECRET = 'uji-rahasia-minimal-enam-belas-karakter';

function baseClaims(over: Partial<SessionClaims> = {}): SessionClaims {
  return {
    sub: '11111111-1111-1111-1111-111111111111',
    nip: '197001012000031001',
    nama: 'Camat Tamalate',
    positionCode: 'CAMAT',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...over,
  };
}

describe('session-token', () => {
  it('roundtrip token sah mengembalikan klaim identik', () => {
    const claims = baseClaims();
    const token = issueToken(claims, SECRET);
    const parsed = verifyToken(token, SECRET);
    expect(parsed).not.toBeNull();
    expect(parsed?.sub).toBe(claims.sub);
    expect(parsed?.positionCode).toBe('CAMAT');
    expect(parsed?.nip).toBe(claims.nip);
  });

  it('menolak token dengan tanda tangan diubah', () => {
    const token = issueToken(baseClaims(), SECRET);
    const [payload] = token.split('.');
    const forged = payload + '.tandatangan-palsu-yang-panjangnya-sama-xx';
    expect(verifyToken(forged, SECRET)).toBeNull();
  });

  it('menolak token yang ditandatangani kunci lain', () => {
    const token = issueToken(baseClaims(), SECRET);
    expect(verifyToken(token, 'kunci-lain-yang-juga-cukup-panjang')).toBeNull();
  });

  it('menolak token kedaluwarsa', () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    const token = issueToken(baseClaims({ exp: past }), SECRET);
    expect(verifyToken(token, SECRET)).toBeNull();
  });

  it('menolak bentuk token cacat', () => {
    expect(verifyToken('', SECRET)).toBeNull();
    expect(verifyToken('tanpa-titik', SECRET)).toBeNull();
    expect(verifyToken('a.b.c', SECRET)).toBeNull();
  });
});
