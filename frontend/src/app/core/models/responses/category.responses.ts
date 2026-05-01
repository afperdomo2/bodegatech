/**
 * Datos básicos de una categoría (POST/PATCH response).
 */
export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

/**
 * Datos resumidos de una categoría (para listados paginados).
 */
export type CategorySummaryDto = CategoryDto;

/**
 * Datos completos de una categoría (GET /{id}).
 * Incluye timestamps y version para control concurrente.
 */
export interface CategoryDetail extends CategorySummaryDto {
  createdAt: string; // ISO-8601 datetime
  updatedAt: string; // ISO-8601 datetime
  version: number;   // para optimistic locking
}
