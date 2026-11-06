import { Injectable } from '@nestjs/common';
import { PrismaService } from '../platform/prisma/prisma.service';
import { DomainError } from '../platform/http/domain-error';
import { ErrorCode } from '../platform/http/error-codes';
import { issueToken, verifyToken, type SessionClaims } from './session-token';

const TTL_SECONDS = 8 * 60 * 60;

function secret(): string {
  const value = process.env.JWT_SIGNING_KEY;
  if (!value || value === 'CHANGE_ME_PER_ENV' || value.length < 16) {
    throw new DomainError(ErrorCode.INTERNAL, 'JWT_SIGNING_KEY belum dikonfigurasi', 500);
  }
  return value;
}

export interface LoginResult {
  readonly token: string;
  readonly claims: SessionClaims;
  readonly expiresAt: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(nip: string): Promise<LoginResult> {
    const person = await this.prisma.person.findUnique({
      where: { nip },
      include: {
        assignments: {
          where: { validTo: null },
          include: { position: true },
          orderBy: { validFrom: 'desc' },
          take: 1,
        },
      },
    });

    if (!person) {
      throw new DomainError(ErrorCode.UNAUTHENTICATED, 'NIP tidak terdaftar', 401);
    }
    const assignment = person.assignments[0];
    if (!assignment) {
      throw new DomainError(ErrorCode.UNAUTHENTICATED, 'Pegawai tanpa penugasan aktif', 401);
    }

    const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
    const claims: SessionClaims = {
      sub: person.id,
      nip: person.nip,
      nama: person.nama,
      positionCode: assignment.position.code,
      exp,
    };

    return {
      token: issueToken(claims, secret()),
      claims,
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  }

  verify(token: string): SessionClaims | null {
    return verifyToken(token, secret());
  }
}
