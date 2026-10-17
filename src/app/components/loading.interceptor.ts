import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/** Muestra el overlay de carga mientras haya algún pedido en curso. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.inicio();
  return next(req).pipe(finalize(() => loadingService.fin()));
};
