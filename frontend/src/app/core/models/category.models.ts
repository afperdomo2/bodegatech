/**
 * Datos completos de una categoría (respuesta del backend).
 */
export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string; // ISO-8601 datetime
  updatedAt: string; // ISO-8601 datetime
  version: number;   // para optimistic locking
}

/**
 * Solicitud para crear una nueva categoría.
 * Usado en POST /api/categories
 */
export interface CreateCategoryRequest {
  name: string;          // requerido
  description?: string;  // opcional
}

/**
 * Solicitud para actualizar parcialmente una categoría existente.
 * Usado en PATCH /api/categories/{id}
 * Todos los campos son opcionales.
 */
export interface UpdateCategoryRequest {
  name?: string;         // opcional
  description?: string;  // opcional
  isActive?: boolean;    // opcional
}
