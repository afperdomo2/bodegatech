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
  MeasurementUnitRelatedDto,
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
   * GET /api/units?page={page}&size={size}&sortBy=createdAt&direction=DESC[&isActive=true/false][&isBase={isBase}][&type={type}]
   * Retorna: PagedResponse<MeasurementUnitSummaryDto>
   *
   * @param page página (default 0)
   * @param size tamaño de página (default 10)
   * @param isActive filtro opcional: true=activos, false=inactivos, null/undefined=todos
   * @param isBase filtro opcional: true=unidades base, false=unidades derivadas, undefined=todas
   * @param type filtro opcional por tipo de unidad
   */
  getAll(page = 0, size = 10, isActive?: boolean | null, isBase?: boolean, type?: UnitType) {
    let url = `/units?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`;
    if (isActive !== null && isActive !== undefined) {
      url += `&isActive=${isActive}`;
    }
    if (isBase !== undefined) {
      url += `&isBase=${isBase}`;
    }
    if (type) {
      url += `&type=${type}`;
    }
    return this.api.get<ApiResponse<PagedResponse<MeasurementUnitSummaryDto>>>(url);
  }

  getBaseUnitsOfType(type: UnitType) {
    return this.api.get<ApiResponse<PagedResponse<MeasurementUnitSummaryDto>>>(
      `/units?isBase=true&type=${type}&size=100`
    );
  }

  getById(id: string) {
    return this.api.get<ApiResponse<MeasurementUnitDetail>>(`/units/${id}`);
  }

  create(request: CreateMeasurementUnitRequest) {
    return this.api.post<ApiResponse<MeasurementUnitDto>>(`/units`, request);
  }

  update(id: string, request: UpdateMeasurementUnitRequest) {
    return this.api.patch<ApiResponse<MeasurementUnitDto>>(`/units/${id}`, request);
  }

  delete(id: string) {
    return this.api.delete<void>(`/units/${id}`);
  }

  getRelated(baseUnitId: string) {
    return this.api.get<ApiResponse<MeasurementUnitRelatedDto[]>>(`/units/${baseUnitId}/related`);
  }
}
