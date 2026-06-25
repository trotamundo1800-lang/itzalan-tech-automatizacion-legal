import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
  HttpException,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];
    const authorization = headers['authorization'] ? 'Bearer [redacted]' : 'None';

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - startTime;

        this.logger.log(
          `[${method}] ${url} - Status: ${statusCode} - Duration: ${duration}ms - IP: ${ip} - User-Agent: ${userAgent}`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const status = error instanceof HttpException ? error.getStatus() : 500;
        const message = error?.message || 'Internal Server Error';

        this.logger.error(
          `[${method}] ${url} - Status: ${status} - Error: ${message} - Duration: ${duration}ms - IP: ${ip}`,
        );

        return throwError(() => error);
      }),
    );
  }
}
