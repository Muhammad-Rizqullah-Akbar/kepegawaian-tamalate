import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DomainError } from './domain-error';
import { ErrorCode } from './error-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly log = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL;
    let message = 'Kesalahan internal';
    let detail: Record<string, unknown> | undefined;

    if (exception instanceof DomainError) {
      status = exception.status;
      code = exception.code;
      message = exception.message;
      detail = exception.detail;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string }).message ?? exception.message;
      code = status === 404 ? ErrorCode.NOT_FOUND : status === 403 ? ErrorCode.FORBIDDEN
        : status === 401 ? ErrorCode.UNAUTHENTICATED : status === 409 ? ErrorCode.CONFLICT
        : status === 429 ? ErrorCode.RATE_LIMITED : ErrorCode.VALIDATION_FAILED;
    } else {
      this.log.error('Tidak tertangani', exception instanceof Error ? exception.stack : String(exception));
    }

    reply.status(status).send({
      error: { code, message, ...(detail ? { detail } : {}) },
      meta: { requestId: request?.id ?? null, path: request?.url ?? null, at: new Date().toISOString() },
    });
  }
}
