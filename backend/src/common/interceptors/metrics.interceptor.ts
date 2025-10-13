import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

const requestCounters: Record<string, number> = {};

export function getRequestMetrics() {
  return { ...requestCounters };
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const routePath =
      req.route && typeof (req.route as { path?: string }).path === 'string'
        ? (req.route as { path: string }).path
        : req.url;
    const route = `${req.method} ${routePath}`;
    requestCounters[route] = (requestCounters[route] || 0) + 1;
    return next.handle();
  }
}
