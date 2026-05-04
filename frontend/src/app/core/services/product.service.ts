import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import type {
  CreateProductRequest,
  UpdateProductRequest,
} from '../models/requests/product.requests';
import type {
  ProductDto,
  ProductSummaryDto,
  ProductDetail,
} from '../models/responses/product.responses';
import type { ApiResponse, PagedResponse } from '../models/api.models';

/**
 * Servicio HTTP puro para productos.
 * Solo maneja comunicación con la API — sin estado, sin signals.
 * 
 * Los métodos retornan Observables tipados que otros servicios (StateService)
 * pueden consumir y transformar en estado reactivo.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private api = inject(ApiService);

  /**
   * Obtener lista paginada de productos (listado ligero).
   * GET /api/products?page={page}&size={size}&sortBy=createdAt&direction=DESC[&isActive=true/false]
   * Retorna: PagedResponse<ProductSummaryDto>
   * 
   * @param page página (default 0)
   * @param size tamaño de página (default 10)
   * @param isActive filtro opcional: true=activos, false=inactivos, null/undefined=todos
   */
  getAll(page = 0, size = 10, isActive?: boolean | null) {
    let url = `/products?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`;
    if (isActive !== null && isActive !== undefined) {
      url += `&isActive=${isActive}`;
    }
    return this.api.get<ApiResponse<PagedResponse<ProductSummaryDto>>>(url);
  }

  /**
   * Obtener un producto por ID (detalle completo).
   * GET /api/products/{id}
   * Retorna: ProductDetail (con costPrice, version, timestamps)
   */
  getById(id: string) {
    return this.api.get<ApiResponse<ProductDetail>>(`/products/${id}`);
  }

  /**
   * Crear un nuevo producto.
   * POST /api/products
   * Entrada: CreateProductRequest
   * Retorna: ProductDto (básico, sin costPrice/version/timestamps)
   * HTTP: 201 Created en éxito
   */
  create(request: CreateProductRequest) {
    return this.api.post<ApiResponse<ProductDto>>(`/products`, request);
  }

  /**
   * Actualizar parcialmente un producto.
   * PATCH /api/products/{id}
   * Entrada: UpdateProductRequest (campos opcionales)
   * Retorna: ProductDto (básico, sin costPrice/version/timestamps)
   * Solo los campos enviados en el request se actualizan
   * 
   * Nota: stock NO se actualiza vía CRUD — se gestiona vía Movimientos de Inventario.
   * mainImageUrl NO se actualiza vía CRUD — se gestiona vía ProductImageService.
   */
  update(id: string, request: UpdateProductRequest) {
    return this.api.patch<ApiResponse<ProductDto>>(`/products/${id}`, request);
  }

  /**
   * Eliminar (soft-delete) un producto.
   * DELETE /api/products/{id}
   * HTTP: 204 No Content en éxito
   */
  delete(id: string) {
    return this.api.delete<void>(`/products/${id}`);
  }
}
