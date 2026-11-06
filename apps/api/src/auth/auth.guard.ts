import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DomainError } from '../platform/http/domain-error';
import { ErrorCode } from '../platform/http/error-codes';
import type { SessionClaims } from './session-token';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; session?: SessionClaims }>();
    const header = request.headers.authorization ?? request.headers.Authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new DomainError(ErrorCode.UNAUTHENTICATED, 'Header Authorization Bearer wajib', 401);
    }
    const claims = this.auth.verify(header.slice(7).trim());
    if (!claims) {
      throw new DomainError(ErrorCode.UNAUTHENTICATED, 'Token tidak sah atau kedaluwarsa', 401);
    }
    request.session = claims;
    return true;
  }
}
