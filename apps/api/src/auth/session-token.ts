import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SessionClaims {
  readonly sub: string;
  readonly nip: string;
  readonly nama: string;
  readonly positionCode: string;
  readonly exp: number;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('base64url');
}

export function issueToken(claims: SessionClaims, secret: string): string {
  const payload = b64url(JSON.stringify(claims));
  return payload + '.' + sign(payload, secret);
}

export function verifyToken(token: string, secret: string, now = Date.now()): SessionClaims | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const payload = parts[0];
  const signature = parts[1];
  if (!payload || !signature) return null;

  const expected = sign(payload, secret);
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  let claims: SessionClaims;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionClaims;
  } catch {
    return null;
  }

  if (typeof claims.exp !== 'number' || claims.exp * 1000 <= now) return null;
  if (typeof claims.sub !== 'string' || typeof claims.positionCode !== 'string') return null;
  return claims;
}
