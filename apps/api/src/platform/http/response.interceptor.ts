import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export interface ApiEnvelope<T> {
  readonly data: T;
  readonly meta: { readonly at: string };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>> {
    return next.handle().pipe(
      map((data: T): ApiEnvelope<T> => ({ data, meta: { at: new Date().toISOString() } })),
    );
  }
}
