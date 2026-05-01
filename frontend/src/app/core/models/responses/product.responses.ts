/**
 * Imagen de un producto.
 */
export interface ProductImageDto {
  id: string;
  url: string;
  alt: string | null;
}

/**
 * Datos básicos de un producto (POST/PATCH response).
 */
export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  createdAt: string; // ISO-8601 datetime
}

/**
 * Datos resumidos de un producto (para listados paginados).
 * Type alias de ProductDto — mismo conjunto de campos.
 */
export type ProductSummaryDto = ProductDto;

/**
 * Datos completos de un producto (GET /{id}).
 * Incluye timestamps, version para control concurrente, e imágenes.
 */
export interface ProductDetail extends ProductSummaryDto {
  updatedAt: string; // ISO-8601 datetime
  version: number;   // para optimistic locking
  images: ProductImageDto[];
}
