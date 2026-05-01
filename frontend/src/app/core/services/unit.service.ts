import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import type {
  CreateMeasurementUnitRequest,
  UpdateMeasurementUnitRequest,
} from '../models/requests/unit.requests';
import type {
  MeasurementUnitDto,
  MeasurementUnitSummaryDto,
  MeasurementUnitDetail,
} from '../models/responses/unit.responses';
import type { ApiResponse, PagedResponse } from '../models/api.models';
import type { UnitType } from '../constants/unit-type.constants';

/**
 * Servicio HTTP puro para unidades de medida.
 * Solo maneja comunicación con la API — sin estado, sin signals.
 *
 * Los métodos retornan Observables tipados que otros servicios (StateService)
 * pueden consumir y transformar en estado reactivo.
 */
@Injectable({
  providedIn: 'root',
})
export class UnitService {
  private api = inject(ApiService);

  /**
   * Obtener lista paginada de unidades (listado ligero).
   * GET /api/units?page={page}&size={size}&sortBy=createdAt&direction=DESC&isBase={isBase}&type={type}
   * Retorna: PagedResponse<MeasurementUnitSummaryDto>
   */
  getAll(page = 0, size = 10, isBase?: boolean, type?: UnitType) {
    let url = `/units?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`;
    if (isBase !== undefined) {
      url += `&isBase=${isBase}`;
    }
    if (type) {
      url += `&type=${type}`;
    }
    return this.api.get<ApiResponse<PagedResponse<MeasurementUnitSummaryDto>>>(url);
  }

  /**
   * Obtener unidades base de un tipo específico (listado).
   * GET /api/units?isBase=true&type={type}
   * Retorna: PagedResponse<MeasurementUnitSummaryDto>
   */
  getBaseUnitsOfType(type: UnitType) {
    return this.api.get<ApiResponse<PagedResponse<MeasurementUnitSummaryDto>>>(
      `/units?isBase=true&type=${type}&size=100`
    );
  }

  /**
   * Obtener una unidad por ID (detalle completo).
   * GET /api/units/{id}
   * Retorna: MeasurementUnitDetail (con version, timestamps)
   */
  getById(id: string) {
    return this.api.get<ApiResponse<MeasurementUnitDetail>>(`/units/${id}`);
  }

  /**
   * Crear una nueva unidad de medida.
   * POST /api/units
   * Entrada: CreateMeasurementUnitRequest
   * Retorna: MeasurementUnitDto (básico, sin version/timestamps)
   * HTTP: 201 Created en éxito
   */
  create(request: CreateMeasurementUnitRequest) {
    return this.api.post<ApiResponse<MeasurementUnitDto>>(`/units`, request);
  }

  /**
   * Actualizar parcialmente una unidad de medida.
   * PATCH /api/units/{id}
   * Entrada: UpdateMeasurementUnitRequest (campos opcionales)
   * Retorna: MeasurementUnitDto (básico, sin version/timestamps)
   * Solo los campos enviados en el request se actualizan
   */
  update(id: string, request: UpdateMeasurementUnitRequest) {
    return this.api.patch<ApiResponse<MeasurementUnitDto>>(`/units/${id}`, request);
  }

  /**
   * Eliminar (soft-delete) una unidad de medida.
   * DELETE /api/units/{id}
   * HTTP: 204 No Content en éxito
   * HTTP: 409 Conflict si la unidad tiene factores de conversión asociados
   */
  delete(id: string) {
    return this.api.delete<void>(`/units/${id}`);
  }
}
