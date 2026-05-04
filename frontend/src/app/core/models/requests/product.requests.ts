/**
 * Solicitud para crear un nuevo producto.
 */
export interface CreateProductRequest {
  name: string;           // requerido
  description?: string;   // opcional
  salePrice: number;      // requerido, positivo
  costPrice?: number;     // opcional, >= 0
  categoryId: string;     // requerido
  unitId: string;         // requerido
  minStock?: number;      // opcional, >= 0
  maxStock?: number;      // opcional, >= 0
  barcode?: string;       // opcional, único
}

/**
 * Solicitud para actualizar parcialmente un producto.
 * Todos los campos son opcionales.
 * NO incluir: stock (se gestiona vía Movimientos), mainImageUrl (se gestiona vía ProductImageService).
 */
export interface UpdateProductRequest {
  name?: string;           // opcional
  description?: string;    // opcional
  salePrice?: number;      // opcional, positivo si se proporciona
  costPrice?: number;      // opcional, >= 0 si se proporciona
  categoryId?: string;     // opcional
  unitId?: string;         // opcional
  minStock?: number;       // opcional, >= 0 si se proporciona
  maxStock?: number;       // opcional, >= 0 si se proporciona
  barcode?: string;        // opcional, único si se proporciona
}
