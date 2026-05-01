/**
 * Solicitud para crear un nuevo producto.
 */
export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  isActive?: boolean;
}

/**
 * Solicitud para actualizar parcialmente un producto.
 * Todos los campos son opcionales.
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  sku?: string;
  isActive?: boolean;
}
