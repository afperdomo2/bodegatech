import type { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import type { AppError, ProblemDetail } from '../models/api.models';

/**
 * Interceptor funcional que normaliza todas las respuestas de error HTTP.
 * 
 * Convierte RFC 9457 ProblemDetail (usado por el backend) a AppError (usado por el frontend).
 * De este modo, los servicios y componentes manejan errores de manera consistente sin
 * conocer los detalles de la estructura de respuesta del backend.
 * 
 * Errores capturados:
 * - 400: Validación de DTOs. El ProblemDetail incluye { errors: { fieldName: message } }
 * - 404: Recurso no encontrado
 * - 409: Conflicto de negocio (ej: categoría en uso, nombre duplicado)
 * - 500: Error interno del servidor
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError = normalizeError(error);
      return throwError(() => appError);
    })
  );
};

/**
 * Convierte un HttpErrorResponse en AppError normalizado.
 */
function normalizeError(error: HttpErrorResponse): AppError {
  const problemDetail = error.error as ProblemDetail;

  const appError: AppError = {
    status: error.status,
    message: problemDetail?.detail || error.message || 'Error desconocido',
  };

  // 400 - Errores de validación por campo
  if (error.status === 400 && problemDetail?.errors) {
    appError.fieldErrors = problemDetail.errors;
  }

  // 409 - Categoría en uso (campos adicionales)
  if (error.status === 409) {
    if (problemDetail?.categoryName) {
      appError.categoryName = problemDetail.categoryName;
    }
    if (problemDetail?.productCount !== undefined) {
      appError.productCount = problemDetail.productCount;
    }
  }

  return appError;
}
