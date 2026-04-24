/**
 * Modelos para las respuestas estandarizadas de la API.
 * Basados en RFC 9457 (ProblemDetail) para errores y ApiResponse para éxito.
 */

/**
 * Respuesta exitosa de la API.
 * Envuelve todos los datos devueltos por endpoints exitosos (2xx).
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Respuesta paginada de la API.
 * Se devuelve dentro del campo 'data' de ApiResponse<PagedResponse<T>>.
 */
export interface PagedResponse<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLast: boolean;
}

/**
 * RFC 9457 ProblemDetail — respuesta de error estandarizada.
 * Usada por el backend para todos los errores HTTP.
 */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  // Campos opcionales según el tipo de error
  errors?: Record<string, string>; // 400 - validación por campo
  categoryName?: string;             // 409 - categoría en uso
  productCount?: number;             // 409 - cantidad de productos
  [key: string]: unknown;            // Otros campos personalizados
}

/**
 * Error normalizado que genera el interceptor.
 * Utilizado por los servicios de estado y componentes para manejar errores consistentemente.
 */
export interface AppError {
  status: number;
  message: string;           // del campo 'detail' de ProblemDetail
  fieldErrors?: Record<string, string>; // errores de validación por campo (400)
  categoryName?: string;     // nombre de categoría en conflicto (409)
  productCount?: number;     // cantidad de productos en conflicto (409)
}
