import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../models/requests/category.requests';
import type {
  CategoryDto,
  CategorySummaryDto,
  CategoryDetail,
} from '../models/responses/category.responses';
import type { ApiResponse, PagedResponse } from '../models/api.models';

/**
 * Servicio HTTP puro para categorías.
 * Solo maneja comunicación con la API — sin estado, sin signals.
 * 
 * Los métodos retornan Observables tipados que otros servicios (StateService)
 * pueden consumir y transformar en estado reactivo.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private api = inject(ApiService);

  /**
   * Obtener lista paginada de categorías (listado ligero).
   * GET /api/categories?page={page}&size={size}&sortBy=createdAt&direction=DESC
   * Retorna: PagedResponse<CategorySummaryDto>
   */
  getAll(page = 0, size = 10) {
    return this.api.get<ApiResponse<PagedResponse<CategorySummaryDto>>>(
      `/categories?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`
    );
  }

  /**
   * Obtener una categoría por ID (detalle completo).
   * GET /api/categories/{id}
   * Retorna: CategoryDetail (con version, timestamps)
   */
  getById(id: string) {
    return this.api.get<ApiResponse<CategoryDetail>>(`/categories/${id}`);
  }

  /**
   * Crear una nueva categoría.
   * POST /api/categories
   * Entrada: CreateCategoryRequest
   * Retorna: CategoryDto (básico, sin version/timestamps)
   * HTTP: 201 Created en éxito
   */
  create(request: CreateCategoryRequest) {
    return this.api.post<ApiResponse<CategoryDto>>(`/categories`, request);
  }

  /**
   * Actualizar parcialmente una categoría.
   * PATCH /api/categories/{id}
   * Entrada: UpdateCategoryRequest (campos opcionales)
   * Retorna: CategoryDto (básico, sin version/timestamps)
   * Solo los campos enviados en el request se actualizan
   */
  update(id: string, request: UpdateCategoryRequest) {
    return this.api.patch<ApiResponse<CategoryDto>>(`/categories/${id}`, request);
  }

  /**
   * Eliminar (soft-delete) una categoría.
   * DELETE /api/categories/{id}
   * HTTP: 204 No Content en éxito
   * HTTP: 409 Conflict si la categoría tiene productos asignados
   */
  delete(id: string) {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
