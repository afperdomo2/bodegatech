/**
 * Imagen de un producto.
 */
export interface ProductImageDto {
  id: string;
  fileKey: string;        // clave en S3
  url: string;            // URL pública
  createdAt: string;      // ISO-8601 datetime
}

/**
 * Datos básicos de un producto (POST/PATCH response).
 * NO incluye costPrice (información sensible).
 */
export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  salePrice: number;
  minStock: number;
  maxStock: number | null;
  sku: string;
  categoryId: string;
  categoryName: string;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
  mainImageUrl: string | null;
  barcode: string | null;
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
 * Incluye costPrice, timestamps, version para control concurrente, e imágenes.
 */
export interface ProductDetail extends ProductSummaryDto {
  costPrice: number;
  updatedAt: string;                        // ISO-8601 datetime
  version: number;                          // para optimistic locking
  images: ProductImageDto[];                // imágenes del producto
}
