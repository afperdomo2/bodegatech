// Category requests (entrada de usuario)
export interface CreateCategoryRequest {
  name: string;          // requerido
  description?: string;  // opcional
}

/**
 * Solicitud para actualizar parcialmente una categoría existente.
 * Todos los campos son opcionales.
 */
export interface UpdateCategoryRequest {
  name?: string;         // opcional
  description?: string;  // opcional
  isActive?: boolean;    // opcional
}
