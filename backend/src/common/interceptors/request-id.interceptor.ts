import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { requestId?: string }>();
    let requestId: string | undefined = req.headers['x-request-id'] as
      | string
      | undefined;
    if (!requestId) {
      requestId = uuidv4();
      req.headers['x-request-id'] = requestId;
    }
    req.requestId = requestId;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        res.setHeader('x-request-id', requestId);
      }),
    );
  }
}
