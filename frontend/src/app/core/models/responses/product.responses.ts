import type { CategoryDto } from './category.responses';

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
  sku: string;
  isActive: boolean;
  category: CategoryDto | null;
  images: ProductImageDto[];
  createdAt: string; // ISO-8601 datetime
}

/**
 * Datos resumidos de un producto (para listados paginados).
 */
export type ProductSummaryDto = ProductDto;

/**
 * Datos completos de un producto (GET /{id}).
 * Incluye timestamps y version para control concurrente.
 */
export interface ProductDetail extends ProductSummaryDto {
  updatedAt: string; // ISO-8601 datetime
  version: number;   // para optimistic locking
}
