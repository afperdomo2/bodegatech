import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../core/models/category.models';
import type { ApiResponse, PagedResponse } from '../../../../core/models/api.models';

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
   * Obtener lista paginada de categorías.
   * GET /api/categories?page={page}&size={size}&sortBy=createdAt&direction=DESC
   */
  getAll(page = 0, size = 10) {
    return this.api.get<ApiResponse<PagedResponse<CategoryDto>>>(
      `/categories?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`
    );
  }

  /**
   * Obtener una categoría por ID.
   * GET /api/categories/{id}
   */
  getById(id: string) {
    return this.api.get<ApiResponse<CategoryDto>>(`/categories/${id}`);
  }

  /**
   * Crear una nueva categoría.
   * POST /api/categories
   * Retorna 201 Created en éxito
   */
  create(request: CreateCategoryRequest) {
    return this.api.post<ApiResponse<CategoryDto>>(`/categories`, request);
  }

  /**
   * Actualizar parcialmente una categoría.
   * PATCH /api/categories/{id}
   * Solo los campos enviados en el request se actualizan
   */
  update(id: string, request: UpdateCategoryRequest) {
    return this.api.patch<ApiResponse<CategoryDto>>(`/categories/${id}`, request);
  }

  /**
   * Eliminar (soft-delete) una categoría.
   * DELETE /api/categories/{id}
   * Retorna 204 No Content en éxito
   * Retorna 409 Conflict si la categoría tiene productos asignados
   */
  delete(id: string) {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
