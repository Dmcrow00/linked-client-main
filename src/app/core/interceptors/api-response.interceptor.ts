import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  timestamp: string;
}

// El backend Spring envuelve las respuestas en ApiResponse. Se desenvuelve acá para que los
// servicios y componentes trabajen directamente con el contenido de data.
function esApiResponse(body: unknown): body is ApiResponse<unknown> {
  return !!body && typeof body === 'object' && 'success' in body && 'timestamp' in body;
}

@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse && esApiResponse(event.body)) {
          return event.clone({ body: event.body.data ?? null });
        }
        return event;
      })
    );
  }
}
